import React, { useState, useEffect, useCallback, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Html } from '@react-three/drei';
import { useDispatch } from 'react-redux';
import { setDecalResized } from "@/store/actions/configuratorSlice";

// Props: meshRef is a ref to the mesh you want to scale
// enabled: show/hide controls
// onScale: callback when scale changes (optional)
type CustomTransformControlsProps = {
    meshRef: React.RefObject<THREE.Mesh>;
    enabled?: boolean;
    onScale?: (scale: THREE.Vector3) => void;
    onRotate?: (angle: number) => void;
    worldNormal?: { x: number; y: number; z: number };
    orbitControlsRef?: React.RefObject<any>;
    mode?: 'scale' | 'rotate'; // NEW: mode prop
};

// Constants for handle size calculations
const MESH_TO_CAMERA_DISTANCE = 2.5;
const BASE_SCREEN_SIZE = 0.15;
const HANDLE_OFFSET_MULTIPLIER = 4;

// Compute active axes based on worldNormal
const getActiveAxes = (worldNormal?: { x: number; y: number; z: number }): ["x" | "y" | "z", "x" | "y" | "z"] => {
    if (!worldNormal) return ["x", "y"];
    
    const abs = {
        x: Math.abs(worldNormal.x),
        y: Math.abs(worldNormal.y),
        z: Math.abs(worldNormal.z)
    };
    const max = Math.max(abs.x, abs.y, abs.z);
    // Hide the axis most parallel to worldNormal
    return abs.x === max ? ["y", "z"] : abs.y === max ? ["x", "z"] : ["x", "y"];
};

// Calculate dynamic handle size based on camera distance
const calculateHandleSize = () => {
    return BASE_SCREEN_SIZE * MESH_TO_CAMERA_DISTANCE * 0.15;
};

// Calculate handle position and related dimensions
type HandleCalculationResult = {
    handlePosition: THREE.Vector3;
    planeArgs: [number, number, number];
};

const calculateHandleData = (
    meshPosition: THREE.Vector3, 
    activeAxes: ["x" | "y" | "z", "x" | "y" | "z"]
): HandleCalculationResult => {
    const dynamicHandleSize = calculateHandleSize();
    
    // Calculate handle position offset
    const offset = { x: 0, y: 0, z: 0 };
    activeAxes.forEach(axis => {
        offset[axis] = dynamicHandleSize * HANDLE_OFFSET_MULTIPLIER;
    });
    
    // Create handle position vector
    const handlePosition = new THREE.Vector3(
        meshPosition.x + offset.x,
        meshPosition.y + offset.y,
        meshPosition.z + offset.z
    );
    
    // Calculate plane dimensions based on active axes
    const planeArgs: [number, number, number] = [
        activeAxes.includes("x") ? dynamicHandleSize * 2 : 0.01,
        activeAxes.includes("y") ? dynamicHandleSize * 2 : 0.01,
        activeAxes.includes("z") ? dynamicHandleSize * 2 : 0.01
    ];
    
    return { handlePosition, planeArgs };
};

// Utility to determine axis visibility for rotate mode (from Camera.tsx)
const getRotateAxis = (worldNormal?: { x: number; y: number; z: number }) => {
    if (!worldNormal) return 'z';
    const abs = {
        x: Math.abs(worldNormal.x),
        y: Math.abs(worldNormal.y),
        z: Math.abs(worldNormal.z)
    };
    const max = Math.max(abs.x, abs.y, abs.z);
    if (abs.x === max) return 'x';
    if (abs.y === max) return 'y';
    return 'z';
};

const CustomTransformControls: React.FC<CustomTransformControlsProps> = ({
    meshRef,
    enabled = true,
    onScale,
    onRotate,
    worldNormal,
    orbitControlsRef,
    mode = 'scale', // default to scale
}) => {
    const { camera } = useThree();
    const dispatch = useDispatch();
    const [dragging, setDragging] = useState<null | "plane">(null);
    const [startPointer, setStartPointer] = useState<[number, number] | null>(null);
    const [startScale, setStartScale] = useState<THREE.Vector3 | null>(null);
    // --- ROTATION STATE ---
    const [rotating, setRotating] = useState(false);
    const [startPointerRot, setStartPointerRot] = useState<[number, number] | null>(null);
    const [startAngle, setStartAngle] = useState<number | null>(null);
    const [currentAngle, setCurrentAngle] = useState<number>(0);
    
    // Memoize active axes calculation to prevent unnecessary recalculations
    const activeAxes = useMemo(() => getActiveAxes(worldNormal), [worldNormal]);
    const rotateAxis = useMemo(() => getRotateAxis(worldNormal), [worldNormal]);

    // Memoized function to get mesh world position
    const getMeshWorldPosition = useCallback(() => {
        if (!meshRef.current) return new THREE.Vector3();
        const pos = new THREE.Vector3();
        meshRef.current.getWorldPosition(pos);
        return pos;
    }, [meshRef]);
    
    // Memoized handle data calculation
    const meshPosition = getMeshWorldPosition();
    const handleData = useMemo(() => 
        calculateHandleData(meshPosition, activeAxes),
    [meshPosition, activeAxes]);

    // Handle drag start
    const onPointerDown = useCallback((e: React.PointerEvent) => {
        e.stopPropagation();
        setDragging("plane");
        setStartPointer([e.clientX, e.clientY]);
        if (meshRef.current) setStartScale(meshRef.current.scale.clone());
    }, [meshRef]);

    // Handle drag end
    const onPointerUp = useCallback(() => {
        dispatch(setDecalResized(true));
        setDragging(null);
        setStartPointer(null);
        setStartScale(null);
    }, []);

    // Handle drag move
    const onPointerMove = useCallback((e: PointerEvent) => {
        if (!dragging || !startPointer || !startScale || !meshRef.current) return;
        
        // Get current mesh position
        const meshPos = getMeshWorldPosition();
        
        // Get handle position using shared calculation
        const { handlePosition: handleWorld } = calculateHandleData(meshPos, activeAxes);
        
        // Project positions to screen space
        const meshScreen = meshPos.clone().project(camera);
        const handleScreen = handleWorld.clone().project(camera);
        const dirScreen = new THREE.Vector2(
            handleScreen.x - meshScreen.x, 
            handleScreen.y - meshScreen.y
        ).normalize();
        
        // Calculate pointer movement and scaling factor
        const dx = e.clientX - startPointer[0];
        const dy = e.clientY - startPointer[1];
        const pointerMove = new THREE.Vector2(dx, -dy); // invert y for screen coords
        const delta = pointerMove.dot(dirScreen) * 0.01; // scale sensitivity
        
        // Apply scale changes
        const newScale = startScale.clone();
        newScale.x = Math.max(0.1, startScale.x + delta);
        newScale.y = Math.max(0.1, startScale.y + delta);
        newScale.z = Math.max(0.1, startScale.z + delta);
        meshRef.current.scale.copy(newScale);
        
        // Update startPointer and startScale for continued dragging
        setStartPointer([e.clientX, e.clientY]);
        setStartScale(newScale.clone());
        
        if (onScale) onScale(newScale);
    }, [dragging, startPointer, startScale, meshRef, getMeshWorldPosition, activeAxes, camera, onScale]);

    // --- ROTATION DRAG HANDLERS ---
    const onPointerDownRotate = useCallback((e: React.PointerEvent) => {
        e.stopPropagation();
        setRotating(true);
        setStartPointerRot([e.clientX, e.clientY]);
        if (meshRef.current) {
            // Store initial angle for the axis
            let angle = meshRef.current.userData.currentAngle || 0; // Use userData to store current angle
            setStartAngle(angle);
            setCurrentAngle(angle);
        }   
    }, [meshRef, rotateAxis]);

    const onPointerUpRotate = useCallback(() => {
        dispatch(setDecalResized(true));
        setRotating(false);
        setStartPointerRot(null);
        setStartAngle(null);
    }, []);
    
    const onPointerMoveRotate = useCallback((e: PointerEvent) => {
        if (!rotating || !startPointerRot || startAngle === null || !meshRef.current || !worldNormal) return;
        // Get the center of the mesh in screen coordinates
        const meshPos = getMeshWorldPosition();
        const meshScreen = meshPos.clone().project(camera);
        // Convert normalized device coordinates to screen coordinates
        const { innerWidth, innerHeight } = window;
        const centerX = (meshScreen.x * 0.5 + 0.5) * innerWidth;
        const centerY = (-meshScreen.y * 0.5 + 0.5) * innerHeight;
        // Calculate angle from center to pointer
        const angleRadians = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        let angle = (angleRadians * -1) + currentAngle; // Adjust for current angle

        // Create a quaternion representing rotation around worldNormal
        const axis = new THREE.Vector3(worldNormal.x, worldNormal.y, worldNormal.z).normalize();
        const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);

        // Set mesh rotation to match this quaternion (absolute, not relative)
        meshRef.current.setRotationFromQuaternion(quaternion);
        meshRef.current.userData = {...meshRef.current.userData, currentAngle: angle}; // Store current angle in userData

        setCurrentAngle(angle);
        if (onRotate) onRotate(angle);
    }, [rotating, startPointerRot, startAngle, meshRef, camera, getMeshWorldPosition, onRotate, worldNormal]);

    // Attach global listeners when dragging
    useEffect(() => {
        if (dragging) {
            window.addEventListener("pointermove", onPointerMove);
            window.addEventListener("pointerup", onPointerUp);
            
            // Disable orbit controls if provided
            if (orbitControlsRef?.current) {
                orbitControlsRef.current.enabled = false;
            }
            
            return () => {
                window.removeEventListener("pointermove", onPointerMove);
                window.removeEventListener("pointerup", onPointerUp);
                
                // Re-enable orbit controls on cleanup
                if (orbitControlsRef?.current) {
                    orbitControlsRef.current.enabled = true;
                }
            };
        }
        // Always ensure controls are enabled when not dragging
        else if (orbitControlsRef?.current) {
            orbitControlsRef.current.enabled = true;
        }
    }, [dragging, onPointerMove, onPointerUp, orbitControlsRef]);

    // Attach global listeners for rotation
    useEffect(() => {
        if (rotating) {
            window.addEventListener('pointermove', onPointerMoveRotate);
            window.addEventListener('pointerup', onPointerUpRotate);
            if (orbitControlsRef?.current) orbitControlsRef.current.enabled = false;
            return () => {
                window.removeEventListener('pointermove', onPointerMoveRotate);
                window.removeEventListener('pointerup', onPointerUpRotate);
                if (orbitControlsRef?.current) orbitControlsRef.current.enabled = true;
            };
        } else if (orbitControlsRef?.current) {
            orbitControlsRef.current.enabled = true;
        }
    }, [rotating, onPointerMoveRotate, onPointerUpRotate, orbitControlsRef]);

    // Early return if not enabled or no mesh reference
    if (!enabled || !meshRef.current) return null;

    const scale = meshRef.current.scale;
    const { handlePosition, planeArgs } = handleData;
    

    // --- ROTATE MODE ---
     if (mode === 'rotate') {
        const meshPos = getMeshWorldPosition();
        let torusRadius = 1.2;
        if (meshRef.current && meshRef.current.geometry) {
            meshRef.current.geometry.computeBoundingSphere();
            const sphere = meshRef.current.geometry.boundingSphere;
            if (sphere) {
                const scale = meshRef.current.scale;
                const maxScale = Math.max(scale.x, scale.y, scale.z);
                torusRadius = sphere.radius * maxScale * 1.15;
            }
        }
        const torusArgs: [number, number, number, number, number] = [torusRadius, 0.010, 16, 64, Math.PI * 2];
        // Compute quaternion to align Z axis to worldNormal
        let rotationQuaternion = new THREE.Quaternion();
        if (worldNormal) {
            const zAxis = new THREE.Vector3(0, 0, 1);
            const normal = new THREE.Vector3(worldNormal.x, worldNormal.y, worldNormal.z).normalize();
            if (!zAxis.equals(normal)) {
                rotationQuaternion.setFromUnitVectors(zAxis, normal);
            }
        }
        // Compute grab handle position in local torus space (on Z axis), then rotate
        const angleDeg = ((currentAngle || 0) * 180 / Math.PI) % 360;
        const grabAngle = currentAngle || 0;
        const grabPos = [
            Math.cos(grabAngle) * torusRadius,
            Math.sin(grabAngle) * torusRadius,
            0
        ];
        let grabWorld = new THREE.Vector3(...grabPos);
        grabWorld.applyQuaternion(rotationQuaternion);
        // Place label above the mesh along local Y axis, rotated with the control
        const labelPosition = new THREE.Vector3(0, 1, 0).applyQuaternion(rotationQuaternion).multiplyScalar(torusRadius + 0.2).toArray();
        return (
            <group position={[meshPos.x, meshPos.y, meshPos.z]}>
                <mesh
                    quaternion={rotationQuaternion}
                    onPointerDown={onPointerDownRotate}
                >
                    <torusGeometry args={torusArgs} />
                    <meshBasicMaterial color={rotating ? 'orange' : 'deepskyblue'} opacity={0.7} transparent />
                </mesh>
                {/* Grab handle on torus */}
                <mesh
                    position={grabWorld.toArray()}
                    quaternion={rotationQuaternion}
                    onPointerDown={onPointerDownRotate}
                >
                    <sphereGeometry args={[torusArgs[1]*2, 16, 16]} />
                    <meshBasicMaterial
                        color={rotating ? 'orange' : '#fff'}
                        opacity={0.95}
                        transparent
                        depthTest={false}
                        depthWrite={false}
                    />
                </mesh>
                <Html
                    position={labelPosition}
                    style={{
                        background: 'rgba(30,30,30,0.85)',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '1em',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                    }}
                    center
                >
                    {worldNormal ? 'Axis' : rotateAxis.toUpperCase()} {angleDeg.toFixed(1)}°
                </Html>
            </group>
        );
    }

    return (
        <group position={[handlePosition.x, handlePosition.y, handlePosition.z]}>
            <mesh onPointerDown={onPointerDown}>
                <boxGeometry args={planeArgs} />
                <meshBasicMaterial color={dragging ? 'orange' : 'deepskyblue'} opacity={0.7} transparent />
            </mesh>
            <Html
                position={[planeArgs[0] * 0.6, planeArgs[1] * 0.6, planeArgs[2] * 0.6]}
                style={{
                    background: 'rgba(30,30,30,0.85)',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '1em',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                }}
                center
            >
                {(`Scale: ${scale.x.toFixed(2)}`)}
            </Html>
        </group>
    );
};

export default CustomTransformControls;