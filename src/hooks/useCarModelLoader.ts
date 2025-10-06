import { useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export interface WheelDetail {
  wheelName: string;
  wheelNode: THREE.Object3D;
}

export interface TireDetail {
  tireName: string;
  tireNode: THREE.Object3D;
}

export function useCarModelLoader(modelPath: string) {
  const { scene } = useGLTF(modelPath);
  const [outerMeshes, setOuterMeshes] = useState<THREE.Mesh[]>([]);
  const [wheelDetails, setWheelDetails] = useState<WheelDetail[]>([]);
  const [tireDetails, setTireDetails] = useState<TireDetail[]>([]);

  useEffect(() => {
    const meshes: THREE.Mesh[] = [];
    const wheels: WheelDetail[] = [];
    const tires: TireDetail[] = [];

    scene.traverse((child: any) => {
      if (child.name.includes('grp-left_front_rim') ||
        child.name.includes('grp-right_front_rim') ||
        child.name.includes('grp-right_rear_rim') ||
        child.name.includes('grp-left_rear_rim')) {
        wheels.push({ wheelName: child.name, wheelNode: child });
      }
      if (child.name.includes('left_front_tire') ||
        child.name.includes('left_rear_tire') ||
        child.name.includes('right_rear_tire') ||
        child.name.includes('right_front_tire')) {
        tires.push({ tireName: child.name, tireNode: child });
      }
      if (child.isMesh && child.visible && child.geometry) {
        meshes.push(child);
      }
    });
    scene.userData.wheelDetails = wheels;
    scene.userData.tireDetails = tires;
    setOuterMeshes(meshes);
    setWheelDetails(wheels);
    setTireDetails(tires);
  }, [scene]);

  return { scene, outerMeshes, wheelDetails, tireDetails };
}
