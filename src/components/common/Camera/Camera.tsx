import { PerspectiveCamera, TransformControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useCameraViewMode } from './useCameraViewMode';
import OrbitCameraControls from './OrbitCameraControls';
import FirstPersonCameraControls from './FirstPersonCameraControls';
import DriverRotationControls from './DriverRotationControls';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useCallback, useEffect, useState } from 'react';
import { Mesh } from 'three';
import CustomTransformControls from '../CustomTransformControls/CustomTransformControls';

type CameraProps = {
  position?: [number, number, number];
  fov?: number;
  enableControls?: boolean;
  near?: number;
  far?: number;
  controlsConfig?: {
    enablePan?: boolean;
    enableZoom?: boolean;
    enableRotate?: boolean;
    target?: any;
    minDistance?: number;
    maxDistance?: number;
    minPolarAngle?: number;
    maxPolarAngle?: number;
    zoomSpeed?: number;
    rotateSpeed?: number;
    dampingFactor?: number;
    enableDamping?: boolean;
    mouseButtons?: {
      LEFT?: number;
      MIDDLE?: number;
      RIGHT?: number;
    };
  };
};

/**
 * Camera component for setting up the perspective camera and view controls
 *
 * This component handles:
 * 1. Setting up the main perspective camera
 * 2. Switching between regular (orbit) and driver (first-person) view modes
 * 3. Positioning the camera based on the selected view mode
 */
const Camera = ({
  position = [5, 2, 10],
  fov = 50,
  enableControls = true,
  controlsConfig = {}
}: CameraProps) => {
  const defaultControlsConfig = {
    enablePan: true,
    enableZoom: true,
    enableRotate: true,
    minDistance: 0.01,
    mouseButtons: {
      LEFT: 0,
      MIDDLE: 2
    }
  };

  const decalTools = useSelector((state: RootState) => state.decalTools);

  // Merge default controls config with the provided one
  const mergedControlsConfig = {
    ...defaultControlsConfig,
    ...controlsConfig,
    mouseButtons: {
      ...defaultControlsConfig.mouseButtons,
      ...controlsConfig.mouseButtons
    },
    // Disable all controls while dragging
    enablePan: !decalTools.isDragging && (controlsConfig.enablePan ?? defaultControlsConfig.enablePan),
    enableZoom: !decalTools.isDragging && (controlsConfig.enableZoom ?? defaultControlsConfig.enableZoom),
    enableRotate: !decalTools.isDragging && (controlsConfig.enableRotate ?? defaultControlsConfig.enableRotate)
  };

  const {
    camera,
    shouldLerp,
    setShouldLerp,
    targetPosition,
    targetQuaternion,
    lerpSpeed,
    inTransition,
    viewMode,
    basePosition
  } = useCameraViewMode(position);
  const { scene } = useThree();
  const [decalMesh, setDecalmesh] = useState<Mesh | null>(null)
  const [orbitRef, setOrbitRef] = useState<any>(null);
  const selectedObject = useSelector((state: RootState) => state.selection);
  const { isRotateMode, isScaleMode, isInEditMode } = useSelector((state: RootState) => state.configurator);
  const isDriverRotationMode = useSelector((state: RootState) => state.cameraView.isDriverRotationMode);

  const getCurrentMode = useCallback((): { mode?: 'rotate' | 'scale'; enabled: boolean } => {
    if(!isInEditMode) return { enabled: false }

    if (isRotateMode) {
      return {
        mode: 'rotate',
        enabled: true
      }
    } else if (isScaleMode){
      return {
        mode: 'scale',
        enabled: true
      }
    }else {
      return {
        enabled: false
      }
    }
  }, [isRotateMode, isScaleMode, isInEditMode]);

  useEffect(() => {
    if(selectedObject.type === 'decal'){
      const decal = scene.getObjectByProperty('uuid', selectedObject.uuid) as Mesh;
      setDecalmesh(decal);
    }else{
      setDecalmesh(null);
    }
  }, [selectedObject]);

  useFrame(() => {
    if (!shouldLerp || !camera) return;

    // Lerp position
    camera.position.lerp(targetPosition.current, lerpSpeed);

    // Slerp rotation
    camera.quaternion.slerp(targetQuaternion.current, lerpSpeed);

    camera.updateMatrixWorld();

    if (
      camera.position.distanceTo(targetPosition.current) < 0.01 &&
      camera.quaternion.angleTo(targetQuaternion.current) < 0.01
    ) {
      // Snap to final values
      camera.position.copy(targetPosition.current);
      camera.quaternion.copy(targetQuaternion.current);
      setShouldLerp(false);
      inTransition.current = false;
    }
  });

  // patch need to remove it asap
  const handleOnObjectChange = () => {
    if (currentMode.mode === 'scale' && decalMesh) {
      // Ensure userData is extensible
      if (!decalMesh.userData || Object.isFrozen(decalMesh.userData)) {
        decalMesh.userData = { ...decalMesh.userData };
      }
      // Store previous scale if not already stored
      if (!decalMesh.userData.prevScale) {
        decalMesh.userData.prevScale = decalMesh.scale.clone();
      }
      const prevScale = decalMesh.userData.prevScale;
      const currentScale = decalMesh.scale;

      // Check if scale has changed
      if (!prevScale.equals(currentScale)) {
        // Calculate zIndexFactor based on scale change
        const zIndexFactor = Math.max(currentScale.x, currentScale.y, currentScale.z) * 0.00002;

        // Find the axis most parallel to worldNormal
        const worldNormal = decalMesh.geometry.userData.worldNormal;
        if (worldNormal) {
          const abs = {
            x: Math.abs(worldNormal.x),
            y: Math.abs(worldNormal.y),
            z: Math.abs(worldNormal.z)
          };
          const max = Math.max(abs.x, abs.y, abs.z);
          // Apply zIndexFactor to the axis most parallel to worldNormal
          if (abs.x === max) {
            decalMesh.position.x += Math.sign(worldNormal.x) * zIndexFactor;
          } else if (abs.y === max) {
            decalMesh.position.y += Math.sign(worldNormal.y) * zIndexFactor;
          } else if (abs.z === max) {
            decalMesh.position.z += Math.sign(worldNormal.z) * zIndexFactor;
          }
        }

        // Update prevScale for next change
        decalMesh.userData.prevScale = currentScale.clone();
      }
    }
  }

  // Utility to determine axis visibility for TransformControls
  function getAxisVisibility(mode: 'rotate' | 'scale', worldNormal?: { x: number; y: number; z: number }) {
    if (!worldNormal) {
      return { showX: true, showY: true, showZ: true };
    }
    const abs = {
      x: Math.abs(worldNormal.x),
      y: Math.abs(worldNormal.y),
      z: Math.abs(worldNormal.z)
    };
    const max = Math.max(abs.x, abs.y, abs.z);
    if (mode === 'rotate') {
      // Only show the axis most aligned with worldNormal
      return {
        showX: abs.x === max,
        showY: abs.y === max,
        showZ: abs.z === max
      };
    } else {
      // scale mode: hide axis most parallel to worldNormal (i.e., the one with the largest abs value)
      return {
        showX: abs.x !== max,
        showY: abs.y !== max,
        showZ: abs.z !== max
      };
    }
  }

  // Store current mode once per render
  const currentMode = getCurrentMode();

  return (
    <>
      <PerspectiveCamera makeDefault position={position} fov={fov} />

      {enableControls && !inTransition.current && (
        <>
          {/* Show orbit controls in regular view mode */}
          {viewMode === 'regular' && !isDriverRotationMode && (
            <>
              {decalMesh && currentMode.enabled && (
                <CustomTransformControls
                  meshRef={{ current: decalMesh }}
                  enabled={currentMode.enabled}
                  worldNormal={decalMesh?.geometry.userData.worldNormal}
                  orbitControlsRef={orbitRef}
                  mode={currentMode.mode}
                />
              )}
              <OrbitCameraControls controlsConfig={mergedControlsConfig} setOrbitRef={setOrbitRef}/>
            </>
          )}

          {/* Show first-person controls in driver view mode */}
          {viewMode === 'driver' && !isDriverRotationMode && (
            <FirstPersonCameraControls lookSpeed={0.005} basePosition={basePosition} />
          )}

          {/* Show driver rotation controls when in driver rotation mode */}
          {isDriverRotationMode && (
            <DriverRotationControls rotateSpeed={0.005} />
          )}
        </>
      )}
    </>
  );
};

export default Camera;