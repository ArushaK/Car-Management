import { useEffect, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

type OrbitCameraControlsProps = {
  controlsConfig: {
    enablePan?: boolean;
    enableZoom?: boolean;
    enableRotate?: boolean;
    target?: THREE.Vector3;
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
  },
  setOrbitRef:any
};

/**
 * Orbit camera controls for standard 3D navigation
 *
 * This component provides orbit-style camera controls that allow
 * the user to rotate around, zoom, and pan the scene.
 *
 * @param {OrbitCameraControlsProps} props - Configuration for orbit controls
 * @returns {JSX.Element} The orbit controls component
 */
const OrbitCameraControls = ({
  controlsConfig,
  setOrbitRef
}: OrbitCameraControlsProps) => {
  const controlsRef = useRef<any>(null);
  const panStep = 0.5; // Adjust for sensitivity

  useEffect(() => {
    setOrbitRef(controlsRef)
  }, [controlsRef])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!controlsRef.current) return;

      const controls = controlsRef.current;
      const panOffset = new THREE.Vector3();

      switch (event.key) {
        case 'ArrowUp':
          panOffset.set(0, -panStep, 0);
          break;
        case 'ArrowDown':
          panOffset.set(0, panStep, 0);
          break;
        case 'ArrowLeft':
          panOffset.set(-panStep, 0, 0);
          break;
        case 'ArrowRight':
          panOffset.set(panStep, 0, 0);
          break;
        default:
          return;
      }

      // Convert panOffset from world space to camera space
      panOffset.applyMatrix3(new THREE.Matrix3().setFromMatrix4(controls.object.matrix));
      controls.target.add(panOffset);
      controls.object.position.add(panOffset);
      controls.update();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <OrbitControls
      makeDefault
      ref={controlsRef}
      enablePan={controlsConfig.enablePan}
      enableZoom={controlsConfig.enableZoom}
      enableRotate={controlsConfig.enableRotate}
      target={controlsConfig.target}
      minDistance={controlsConfig.minDistance}
      maxDistance={controlsConfig.maxDistance}
      minPolarAngle={controlsConfig.minPolarAngle}
      maxPolarAngle={controlsConfig.maxPolarAngle}
      zoomSpeed={controlsConfig.zoomSpeed}
      rotateSpeed={controlsConfig.rotateSpeed}
      dampingFactor={controlsConfig.dampingFactor}
      enableDamping={controlsConfig.enableDamping}
      mouseButtons={controlsConfig.mouseButtons}
    />
  );
};

export default OrbitCameraControls;
