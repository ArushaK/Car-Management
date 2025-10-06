import { useEffect, useRef } from 'react';
import { GLTFLoader, DRACOLoader } from 'three/examples/jsm/Addons.js';
import * as THREE from 'three';
import { WheelDetail } from './useCarModelLoader';

export function useWheelManager(scene: any, wheelDetails: WheelDetail[], selectedWheel: any) {
  const sceneRef = useRef(scene);
  const wheelDetailsRef = useRef(wheelDetails);

  // Keep refs up to date
  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);
  useEffect(() => {
    wheelDetailsRef.current = wheelDetails;
  }, [wheelDetails]);

  useEffect(() => {
    if (selectedWheel && selectedWheel.model_url) {
      const loader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
      loader.setDRACOLoader(dracoLoader);
      loader.load(
        selectedWheel.model_url,
        (gltf) => {
          replaceWheels(gltf.scene);
        },
        undefined,
        (error) => {
          console.error('Error loading DRACO wheel model:', error);
        }
      );
      return () => {
        dracoLoader.dispose();
      };
    } else {
      loadDefaultWheels();
    }
    // Only run when selectedWheel.model_url changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWheel?.model_url]);

  function replaceWheels(wheelScene: THREE.Object3D) {
    const wheelRootNode = wheelScene.children[0];
    if (!wheelRootNode) return;
    const wheelDetails = wheelDetailsRef.current;
    const scene = sceneRef.current;
    if (wheelDetails.length === 0) {
      console.warn('No wheel details found for this car model');
      return;
    }
    wheelDetails.forEach((detail: WheelDetail) => {
      const originalWheel = detail.wheelNode;
      const currentWheel = scene.getObjectByName(detail.wheelName);
      if (originalWheel && currentWheel && currentWheel.parent) {
        const clonedWheel = wheelRootNode.clone(true);
        clonedWheel.name = detail.wheelName;
        clonedWheel.position.copy(originalWheel.position);
        clonedWheel.rotation.copy(originalWheel.rotation);
        clonedWheel.scale.set(originalWheel.scale.x * 0.019, originalWheel.scale.y * 0.016, originalWheel.scale.z * 0.016);
        if (detail.wheelName == 'grp-right_front_rim' || detail.wheelName == 'grp-right_rear_rim') {
          // clonedWheel.rotation.y += Math.PI;
        } else if (detail.wheelName == 'grp-left_front_rim' || detail.wheelName == 'grp-left_rear_rim') {
          clonedWheel.rotation.x += Math.PI;
        }
        const parent = currentWheel.parent;
        parent.remove(currentWheel);
        parent.add(clonedWheel);
      }
    });
  }

  function loadDefaultWheels() {
    const wheelDetails = wheelDetailsRef.current;
    const scene = sceneRef.current;
    if (wheelDetails.length === 0) {
      console.warn('No wheel details found for this car model');
      return;
    }
    wheelDetails.forEach((detail: WheelDetail) => {
      const originalWheel = detail.wheelNode;
      const currentWheel = scene.getObjectByName(detail.wheelName);
      if (currentWheel && currentWheel.parent) {
        const parent = currentWheel.parent;
        parent.remove(currentWheel);
        parent.add(originalWheel);
      }
    });
  }

  // const replaceTire = (tireScene: THREE.Object3D) => {
  //   const tireRootNode = tireScene.children[0];
  //   if (!tireRootNode) return;

  //   // @ts-ignore - Accessing custom property
  //   const tireDetails = scene.userData.tireDetails || [];
    
  //   if (tireDetails.length === 0) {
  //     console.warn('No tire details found for this car model');
  //     return;
  //   }

  //   tireDetails.forEach((detail: TireDetail) => {

  //     // const detail = tireDetails.find(x => x.tireName == 'left_rear_tire');

  //     const originalTire = detail.tireNode;
  //     const currentTire = scene.getObjectByName(detail.tireName);
  //     if (originalTire && currentTire && currentTire.parent) {
  //       const clonedTire = tireRootNode.clone(true);
  //       clonedTire.name = detail.tireName;
        
  //       // Copy transform from original wheel
  //       clonedTire.position.copy(originalTire.position);
  //       clonedTire.rotation.copy(originalTire.rotation);
  //       // clonedTire.scale.set(originalTire.scale.x * 1.2, originalTire.scale.y * 1.2, originalTire.scale.z * 1.2);
  //       // clonedTire.scale.set(originalTire.scale.x * 1.6, originalTire.scale.y * 1.7, originalTire.scale.z * 1.7);

  //       if (detail.tireName == 'right_front_tire' || detail.tireName == 'right_rear_tire') {
  //         // clonedWheel.rotation.y += Math.PI; 
  //       }
  //       else if (detail.tireName == 'left_front_tire' || detail.tireName == 'left_rear_tire') {
  //         clonedTire.rotation.y += Math.PI;
  //       }
        
  //       const parent = currentTire.parent;
  //       parent.remove(currentTire);
  //       parent.add(clonedTire);
  //     }
  //   });

  // }
}
