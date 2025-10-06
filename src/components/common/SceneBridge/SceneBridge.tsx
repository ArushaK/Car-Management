// src/components/common/SceneBridge.tsx
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';

type SceneBridgeProps = {
  onSceneReady: (scene: THREE.Scene) => void;
};

const SceneBridge = ({ onSceneReady }: SceneBridgeProps) => {
  const { scene } = useThree();

  useEffect(() => {
    if (scene) {
      onSceneReady(scene);
    }
  }, [scene, onSceneReady]);

  return null;
};

export default SceneBridge;