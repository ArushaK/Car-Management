import { useRef, useMemo } from 'react';
import { Group } from 'three';
import { useGLTF } from '@react-three/drei';
import { usePerformanceMonitor } from '@hooks/usePerformanceMonitor';
import { useDecalManager } from '../CarModel/useDecalManager';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { usePaintFinish } from '@/hooks/usePaintFinish';

interface DriverModelProps {
  modelPath: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

/**
 * Component for rendering a 3D driver model
 */
const DriverModel = ({
  modelPath,
  position = [2, 0, 0], // Position driver next to the car by default
  rotation = [0, -Math.PI / 4, 0], // Rotate slightly to face the camera
  scale = 1,
}: DriverModelProps) => {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(modelPath);
  const visibilityMode = useSelector((state: RootState) => state.visibility.mode);
  const isVisible = visibilityMode === 'driver' || visibilityMode === 'both';

  const bodyColor = useSelector((state: RootState) => state.carColor.driverColor);
  usePaintFinish(scene, bodyColor, 'leather');

  // Extract meshes from the driver model for decal placement
  const outerMeshes = useMemo(() => {
    const meshes: any[] = [];
    scene.traverse((node: any) => {
      if (node.isMesh && node.visible && node.geometry) {
        meshes.push(node);
      }
    });
    return meshes;
  }, [scene]);

  usePerformanceMonitor(groupRef as React.RefObject<Group>, scene);
  
  // Add decal manager hook to enable decal placement on driver
  useDecalManager({ outerMeshes, parentModel: 'driver' });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
      name="Driver_model"
      visible={isVisible}
    >
      <primitive object={scene} />
    </group>
  );
};

export default DriverModel;