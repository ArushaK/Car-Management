import { RootState } from "@/store";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import * as THREE from "three";

const DecalHighlighter = () => {
    const { scene } = useThree();
    const selection = useSelector((state: RootState) => state.selection);
    const isInEditMode = useSelector((state: RootState) => state.configurator.isInEditMode);
    const boxHelperRef = useRef<THREE.BoxHelper | null>(null);
    const handleGroupRef = useRef<THREE.Group | null>(null);
    const previousDecalRef = useRef<THREE.Object3D | null>(null);

    useEffect(() => {
        if (
            (selection.type === "decal" || selection.type === "numberDecal") &&
            selection.uuid &&
            !isInEditMode // Prevent showing in edit mode
        ) {
            const selectedDecal = scene.getObjectByProperty("uuid", selection.uuid);

            if (previousDecalRef.current && previousDecalRef.current !== selectedDecal) {
                removeBoundingBox();
            }

            if (selectedDecal && selectedDecal instanceof THREE.Mesh) {
                showBoundingBox(selectedDecal);
                previousDecalRef.current = selectedDecal;
            }
        } else {
            removeBoundingBox();
        }

        return () => removeBoundingBox();
    }, [selection, scene, isInEditMode]);

    const createCornerHandle = (position: THREE.Vector3, color: number = 0xffffff) => {
        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const material = new THREE.MeshBasicMaterial({ 
            color,
            transparent: true,
            opacity: 0.8,
            depthTest: false
        });
        const handle = new THREE.Mesh(geometry, material);
        handle.position.copy(position);
        return handle;
    };

    const showBoundingBox = (mesh: THREE.Mesh) => {
        removeBoundingBox(); // remove any existing one

        // Create bounding box
        const boxHelper = new THREE.BoxHelper(mesh, 0xffa500); // orange color
        boxHelper.material.depthTest = false; // keep it on top
        boxHelper.material.transparent = true;
        boxHelper.material.opacity = 1;

        // Get the bounding box dimensions
        const boundingBox = new THREE.Box3().setFromObject(mesh);
        const size = new THREE.Vector3();
        boundingBox.getSize(size);

        // Create corner handles group
        const handleGroup = new THREE.Group();
        
        // Add corner handles at each corner of the bounding box
        const corners = [
            new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z),
            new THREE.Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.min.z),
            new THREE.Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.min.z),
            new THREE.Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.min.z),
            new THREE.Vector3(boundingBox.min.x, boundingBox.min.y, boundingBox.max.z),
            new THREE.Vector3(boundingBox.max.x, boundingBox.min.y, boundingBox.max.z),
            new THREE.Vector3(boundingBox.min.x, boundingBox.max.y, boundingBox.max.z),
            new THREE.Vector3(boundingBox.max.x, boundingBox.max.y, boundingBox.max.z),
        ];

        corners.forEach(position => {
            const handle = createCornerHandle(position);
            handle.userData.isScaleHandle = true;
            handleGroup.add(handle);
        });

        scene.add(boxHelper);
        scene.add(handleGroup);
        
        boxHelperRef.current = boxHelper;
        handleGroupRef.current = handleGroup;
    };

    const removeBoundingBox = () => {
        if (boxHelperRef.current) {
            scene.remove(boxHelperRef.current);
            boxHelperRef.current.geometry.dispose();
            (boxHelperRef.current.material as THREE.Material).dispose();
            boxHelperRef.current = null;
        }
        if (handleGroupRef.current) {
            scene.remove(handleGroupRef.current);
            handleGroupRef.current = null;
        }
    };

    return null;
};

export default DecalHighlighter;
