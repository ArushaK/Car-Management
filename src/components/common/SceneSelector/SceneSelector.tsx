import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useDispatch, useSelector } from "react-redux";
import {
    SelectedMeshInfo,
    setSelectedObject,
    clearSelectedObject,
} from "@/store/actions/selectionSlice";
import { startDragging } from "@/store/actions/decalToolsSlice";
import { RootState } from "@/store";
import { rotateDecal } from "@/services/threeJS/decalService";
import { setEditMode, setDecalResized } from "@/store/actions/configuratorSlice";

/**
 * SceneSelector handles raycasting logic on canvas pointer events.
 * It dispatches the selected mesh info to the global store for interaction handling.
 */
const SceneSelector = () => {
    const dispatch = useDispatch();
    const { camera, scene, gl } = useThree();
    const selection = useSelector((state: RootState) => state.selection);
    const isInEditMode = useSelector((state: RootState) => state.configurator.isInEditMode);
    const decalTools = useSelector((state: RootState) => state.decalTools);
    const decal = useSelector((state: RootState) => state.configurator.selectedDecal);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartTime, setDragStartTime] = useState(0);
    const dragThreshold = 200; // ms to consider a click as drag

    const raycaster = useRef(new THREE.Raycaster());
    const mouse = useRef(new THREE.Vector2());
    const selectedHandle = useRef<THREE.Mesh | null>(null);
    const initialScale = useRef(new THREE.Vector3());
    const initialMousePos = useRef(new THREE.Vector2());
    const selectedDecalRef = useRef<THREE.Mesh | null>(null);
    const decalCenter = useRef(new THREE.Vector2());
    const handleStartPos = useRef(new THREE.Vector2());

    const findDecalMesh = (uuid: string | null) => {
        if (!uuid) return null;
        const object = scene.getObjectByProperty("uuid", uuid);
        if (object instanceof THREE.Mesh && (object.name.includes("DecalMesh_"))) {
            return object;
        }
        return null;
    };

    const updateMousePosition = (event: PointerEvent) => {
        const rect = gl.domElement.getBoundingClientRect();
        mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const initializeDecalData = (decalMesh: THREE.Mesh) => {
        // Create a new userData object with all necessary properties
        const newUserData = {
            ...decalMesh.userData,
            prevScale: decalMesh.scale.clone(),
            initialScale: decalMesh.scale.clone(),
            isScaleHandle: decalMesh.userData.isScaleHandle || false
        };

        // Assign the new userData object
        decalMesh.userData = newUserData;
    };

    const getScreenPosition = (worldPos: THREE.Vector3): THREE.Vector2 => {
        const vector = worldPos.clone();
        vector.project(camera);
        return new THREE.Vector2(
            (vector.x + 1) * window.innerWidth / 2,
            (-vector.y + 1) * window.innerHeight / 2
        );
    };

    const handlePointerDown = (event: PointerEvent) => {
        if (isInEditMode) return;

        updateMousePosition(event);
        raycaster.current.setFromCamera(mouse.current, camera);

        const intersects = raycaster.current.intersectObjects(scene.children, true);
        const handleIntersect = intersects.find(intersect => 
            intersect.object instanceof THREE.Mesh && 
            intersect.object.userData.isScaleHandle
        );

        if (handleIntersect) {
            console.log("Handle intersected:", handleIntersect.object);
            event.stopPropagation();
            event.preventDefault();
            selectedHandle.current = handleIntersect.object as THREE.Mesh;
            
            // Store initial mouse position
            initialMousePos.current.set(event.clientX, event.clientY);
            handleStartPos.current.set(event.clientX, event.clientY);
            
            // Find and store the decal mesh
            const decalMesh = findDecalMesh(selection.uuid);
            if (decalMesh) {
                console.log("Found decal mesh:", decalMesh);
                selectedDecalRef.current = decalMesh;
                initialScale.current.copy(decalMesh.scale);
                
                // Calculate and store decal center in screen coordinates
                const decalWorldPos = new THREE.Vector3();
                decalMesh.getWorldPosition(decalWorldPos);
                const screenPos = getScreenPosition(decalWorldPos);
                decalCenter.current.copy(screenPos);
                
                // Initialize decal data if needed
                initializeDecalData(decalMesh);
            }
            
            setIsDragging(true);
            gl.domElement.style.cursor = 'nwse-resize';
        }
    };

    const handlePointerMove = (event: PointerEvent) => {
        if (!isDragging || !selectedHandle.current || !selectedDecalRef.current) return;

        event.preventDefault();
        event.stopPropagation();

        // Calculate vectors from center to start and current positions
        const startVector = new THREE.Vector2(
            handleStartPos.current.x - decalCenter.current.x,
            handleStartPos.current.y - decalCenter.current.y
        );
        const currentVector = new THREE.Vector2(
            event.clientX - decalCenter.current.x,
            event.clientY - decalCenter.current.y
        );

        // Calculate scale factor based on the ratio of vector lengths
        const startDistance = startVector.length();
        const currentDistance = currentVector.length();
        const scaleFactor = currentDistance / startDistance;

        console.log("Scaling with factor:", scaleFactor);

        // Apply new scale while maintaining aspect ratio
        const newScale = initialScale.current.clone().multiplyScalar(scaleFactor);
        
        // Ensure minimum scale
        newScale.x = Math.max(0.1, newScale.x);
        newScale.y = Math.max(0.1, newScale.y);
        newScale.z = Math.max(0.1, newScale.z);

        selectedDecalRef.current.scale.copy(newScale);

        // Calculate zIndexFactor based on scale change
        const zIndexFactor = Math.max(newScale.x, newScale.y, newScale.z) * 0.00002;

        // Find the axis most parallel to worldNormal
        const worldNormal = selectedDecalRef.current.geometry.userData.worldNormal;
        if (worldNormal) {
            const abs = {
                x: Math.abs(worldNormal.x),
                y: Math.abs(worldNormal.y),
                z: Math.abs(worldNormal.z)
            };
            const max = Math.max(abs.x, abs.y, abs.z);
            // Apply zIndexFactor to the axis most parallel to worldNormal
            if (abs.x === max) {
                selectedDecalRef.current.position.x += Math.sign(worldNormal.x) * zIndexFactor;
            } else if (abs.y === max) {
                selectedDecalRef.current.position.y += Math.sign(worldNormal.y) * zIndexFactor;
            } else if (abs.z === max) {
                selectedDecalRef.current.position.z += Math.sign(worldNormal.z) * zIndexFactor;
            }
        }

        // Store the current scale
        selectedDecalRef.current.userData.prevScale = newScale.clone();

        // Force update
        selectedDecalRef.current.updateMatrix();
        selectedDecalRef.current.updateMatrixWorld(true);
    };

    const handlePointerUp = (event: PointerEvent) => {
        if (selectedHandle.current) {
            event.preventDefault();
            event.stopPropagation();
            
            if (selectedDecalRef.current) {
                console.log("Finalizing scale");
                // Ensure the final scale is stored
                selectedDecalRef.current.userData.prevScale = selectedDecalRef.current.scale.clone();
                dispatch(setDecalResized(true));
            }
            
            selectedHandle.current = null;
            selectedDecalRef.current = null;
            setIsDragging(false);
            gl.domElement.style.cursor = 'default';
        }
    };

    useEffect(() => {
        const canvas = gl.domElement;
        
        // Add capture phase to ensure our handlers run first
        canvas.addEventListener('pointerdown', handlePointerDown, true);
        window.addEventListener('pointermove', handlePointerMove, true);
        window.addEventListener('pointerup', handlePointerUp, true);
        
        return () => {
            canvas.removeEventListener('pointerdown', handlePointerDown, true);
            window.removeEventListener('pointermove', handlePointerMove, true);
            window.removeEventListener('pointerup', handlePointerUp, true);
        };
    }, [isDragging, selection, isInEditMode]);

    useEffect(() => {
        if (isInEditMode || (decalTools && decalTools.isDragging) || (decal && decal.id)) return; // Stop selection when in edit mode
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onPointerDown = (event: MouseEvent) => {
            if (event.button !== 0) return; // Only handle left click
            
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);
        
            let selected: THREE.Object3D | null = null;
            
            if (intersects.find(i => i.object.name && i.object.name.includes("DecalMesh_" ))) { 
                selected = intersects.find(i => i.object.name && i.object.name.includes("DecalMesh_" ))?.object || null;
                setIsDragging(true);
                setDragStartTime(Date.now());
            }
            else if (intersects.find(i => i.object.name && i.object.name.includes("CarNumberMesh_"))) {
                selected = intersects.find(i => i.object.name && i.object.name.includes("CarNumberMesh_"))?.object || null;
            }
            else {
                selected = intersects.find(i => i.object.name && i.object.name !== "" )?.object || null;
            }
            
            let type: SelectedMeshInfo['type'] = null;

            if (selected) {
                if (selected.name.includes("DecalMesh_")) type = "decal";
                else if (selected.name.includes("CarNumberMesh_")) type = "numberDecal";
                else type = "mesh";

                // If it's a decal and we're starting to drag, don't select yet
                if (type === "decal" && isDragging) {
                    return;
                }

                // Calculate 2D screen position for UI placement
                let screenPosition = null;
                if (type === 'decal' || type === 'numberDecal') {
                    const vector = new THREE.Vector3();
                    selected.getWorldPosition(vector);
                    vector.project(camera);
                    // Convert NDC to screen coordinates
                    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
                    const y = (-(vector.y) * 0.5 + 0.5) * window.innerHeight;
                    screenPosition = { x, y };
                }

                const info: SelectedMeshInfo = {
                    uuid: selected?.uuid ?? null,
                    name: selected?.name ?? null,
                    userData: selected?.userData ?? null,
                    type,
                    screenPosition
                };

                dispatch(setSelectedObject(info));
            } else {
                dispatch(clearSelectedObject());
            }
        };

        const onContextMenu = (event: MouseEvent) => {
            event.preventDefault(); // Prevent default context menu
            
            // Clear any existing selection first
            dispatch(clearSelectedObject());
            
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);
        
            const decalIntersect = intersects.find(i => 
                i.object.name && 
                (i.object.name.includes("DecalMesh_") || i.object.name.includes("CarNumberMesh_"))
            );

            if (decalIntersect) {
                const selected = decalIntersect.object;
                const type = selected.name.includes('DecalMesh_') ? 'decal' : 'numberDecal';
                let screenPosition = {
                    x: event.clientX,
                    y: event.clientY};
                // Set the selected object
                dispatch(setSelectedObject({
                    uuid: selected.uuid,
                    name: selected.name,
                    type,
                    userData: selected.userData,
                    screenPosition
                }));

                // Enable edit mode to show DecalModeSwitcher only for decals
                if (type === 'decal') {
                    dispatch(setEditMode(true));
                }
            }
        };

        const onPointerMove = () => {
            if (!isDragging || !selection?.uuid) return;
            
            // If we've held down for long enough, start dragging
            if (Date.now() - dragStartTime > dragThreshold) {
                const selected = scene.getObjectByProperty('uuid', selection.uuid);
                if (selected && selection.type === 'decal') {
                    // Only start dragging if we have a valid UUID
                    if (selection.uuid) {
                        dispatch(startDragging({ decalId: selection.uuid }));
                        dispatch(clearSelectedObject()); // Clear selection when dragging starts
                        setIsDragging(false); // Reset dragging state
                    }
                }
            }
        };

        const onPointerUp = () => {
            setIsDragging(false);
            setDragStartTime(0);
        };

        window.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('contextmenu', onContextMenu);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);

        return () => {
            window.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('contextmenu', onContextMenu);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
    }, [camera, scene, dispatch, isInEditMode, decalTools, decal, isDragging, dragStartTime, selection]);

    // when you move out of edit mode clear selection
    useEffect(() => {
        if (!isInEditMode) {
            dispatch(clearSelectedObject());
        }
    }, [isInEditMode, dispatch]);

    useEffect(() => {
        if (!selection) return;
    
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.key === "a" || e.key === "s") && (selection.type === "decal" || selection.type === "numberDecal") && scene) {
                let rotateValue: number = 15; // Degrees
                if (e.key === "s") rotateValue *= -1;
    
                if (selection.uuid) {
                    rotateDecal(selection.uuid, scene, rotateValue);
                }
            }
        };
    
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [selection]); 

    return null;
};

export default SceneSelector;