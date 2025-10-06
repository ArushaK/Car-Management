import { useEffect } from 'react';
import { MeshStandardMaterial, MeshPhysicalMaterial } from 'three';
import { PaintFinish } from '@store/actions/carColorSlice';
import { changeMeshColor } from '@/services/threeJS/meshService';

export function usePaintFinish(scene: any, bodyColor: string, paintFinish: PaintFinish) {
  useEffect(() => {
    const applyMaterial = (material: MeshStandardMaterial | MeshPhysicalMaterial, finishType: PaintFinish) => {
      material.metalness = 0;
      material.roughness = 0.5;
      material.envMapIntensity = 1;
  
      switch (finishType) {
        case 'glossy':
          material.metalness = 0.1;
          material.roughness = 0.1;
          if (material instanceof MeshPhysicalMaterial) {
            material.clearcoat = 1;
            material.clearcoatRoughness = 0.1;
          }
          break;
        case 'metallic':
          material.metalness = 0.9;
          material.roughness = 0.3;
          material.envMapIntensity = 1.5;
          break;
        case 'matte':
          material.metalness = 0;
          material.roughness = 0.8;
          if (material instanceof MeshPhysicalMaterial) {
            material.clearcoat = 0;
          }
          break;
        case 'satin':
          material.metalness = 0.2;
          material.roughness = 0.5;
          if (material instanceof MeshPhysicalMaterial) {
            material.clearcoat = 0.5;
            material.clearcoatRoughness = 0.3;
          }
          break;
        case 'leather':
          material.metalness = 0.05;
          material.roughness = 0.7;
          material.envMapIntensity = 0.8;
          if (material instanceof MeshPhysicalMaterial) {
            material.clearcoat = 0;
          }
          // material.emissive.set(bodyColor);
          break;
      }
    };
  
    scene.traverse((child: any) => {
      if (!child.isMesh || !child.material) return;

      const name = child.name.toLowerCase();
      let finish = paintFinish;

      if (name.includes('leather')) {
        finish = 'leather';
      }

      if (name.includes('paint') || name.includes('leather')) {
        changeMeshColor(child.uuid, bodyColor, scene);
        applyMaterial(child.material, finish);
        child.material.needsUpdate = true;
      }
    });
  }, [scene, bodyColor, paintFinish]);
}
