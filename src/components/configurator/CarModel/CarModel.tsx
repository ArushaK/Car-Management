import { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { Group, Scene } from 'three';
import { useCarModelLoader } from '@hooks/useCarModelLoader';
import { usePerformanceMonitor } from '@hooks/usePerformanceMonitor';
import { usePaintFinish } from '@hooks/usePaintFinish';
// import { useWheelManager } from '@hooks/useWheelManager';
import { useDecalManager } from './useDecalManager';
import { useThree } from '@react-three/fiber';

interface CarModelProps {
  modelPath: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

/**
 * Component for rendering a 3D car model with configurable parts
 */
const CarModel = ({
  modelPath,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: CarModelProps) => {
  const groupRef = useRef<Group>(null);
  const { scene, outerMeshes } = useCarModelLoader(modelPath);
  const { scene: threeScene } = useThree();
  const bodyColor = useSelector((state: RootState) => state.carColor.carColor);
  // not used in this component, but might be needed for future use
  // const selectedWheel = useSelector((state: RootState) => state.configurator.selectedWheels);
  const paintFinish = useSelector((state: RootState) => state.carColor.carPaintFinish);
  const visibilityMode = useSelector((state: RootState) => state.visibility.mode);
  const isVisible = visibilityMode === 'car' || visibilityMode === 'both';

  usePerformanceMonitor(groupRef as React.RefObject<Group>, scene);
  usePaintFinish(scene, bodyColor, paintFinish);

  // Uncomment if wheel manager is needed in the future
  // useWheelManager(scene, wheelDetails, selectedWheel);

  useDecalManager({ outerMeshes, parentModel: 'car' });

  // Effect to handle visibility of car number and other car-specific elements
  useEffect(() => {
    // Update visibility for both the car scene and the main three.js scene
    const updateVisibility = (targetScene: Scene) => {
      targetScene.traverse((child: any) => {
        if (child.name && (
          child.name.includes('CarNumber') ||
          child.name.includes('Car_Number') ||
          child.name.startsWith('DecalGroup_') ||
          child.name.startsWith('DecalMesh_')
        )) {
          child.visible = isVisible;
        }
      });
    };

    if (threeScene) {
      updateVisibility(threeScene);
    }
  }, [threeScene, isVisible]);

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
      visible={isVisible}
    >
      <primitive object={scene} />
    </group>
  );
};

export default CarModel;