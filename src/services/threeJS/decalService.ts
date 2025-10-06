import * as THREE from 'three';
import store from '@/store';
import { clearSelectedObject } from '@/store/actions/selectionSlice';
import { removePlacedDecal } from '@/store/actions/configuratorSlice';

export const removeDecal = (uuid: string, scene: THREE.Scene): void => {
    const object = scene.getObjectByProperty('uuid', uuid);
  
    // Type guard: check if it's a Mesh before accessing geometry/material
    if (object && object instanceof THREE.Mesh) {
      object.geometry?.dispose?.();
      if (Array.isArray(object.material)) {
        object.material.forEach(m => m.dispose?.());
      } else {
        object.material?.dispose?.();
      }
  
      object.parent?.remove(object);
      store.dispatch(removePlacedDecal(uuid));
      store.dispatch(clearSelectedObject());
    }
  };
  

export const rotateDecal = (
  uuid: string, scene: THREE.Scene, angleInDegrees: number,
): void => {
  if (scene) {
    const decalMesh = scene.getObjectByProperty('uuid', uuid) as THREE.Mesh;
    if (decalMesh) {
      const rotationQuat = new THREE.Quaternion();
      const angleInRadians = THREE.MathUtils.degToRad(angleInDegrees);

      // Get world normal from userData
      const worldNormal = decalMesh.geometry.userData.worldNormal.clone();
      worldNormal.applyQuaternion(decalMesh.quaternion).normalize();

      // this is specifically for the number mesh
      // Check for worldPosition in userData
      const worldPosition = decalMesh.geometry.userData.worldPos;
      if (worldPosition) {
        // Rotate around the pivot (worldPosition) with the world normal
        const pivot = new THREE.Vector3().copy(worldPosition);

        // Convert pivot to local space of the mesh's parent
        decalMesh.parent?.worldToLocal(pivot);

        // Translate to pivot, rotate, then translate back
        decalMesh.position.sub(pivot);
        rotationQuat.setFromAxisAngle(worldNormal, angleInRadians);
        decalMesh.applyQuaternion(rotationQuat);
        decalMesh.position.applyQuaternion(rotationQuat);
        decalMesh.position.add(pivot);
      } else {
        // Fallback: rotate around mesh's origin
        rotationQuat.setFromAxisAngle(worldNormal, angleInRadians);
        decalMesh.applyQuaternion(rotationQuat);
      }

      decalMesh.updateMatrixWorld();
    }
  }
};



export const resizeDecal = (
  uuid: string,
  scene: THREE.Scene,
  newScale: { x: number, y: number, z: number }
): void => {
  
  // Find the object by UUID (could be either a group or mesh)
  const targetObject = scene.getObjectByProperty('uuid', uuid);
  
  if (targetObject) {
    // Determine if we have a mesh directly or need to find it in a group
    let decalMesh: THREE.Object3D | null = null;
    let decalGroup: THREE.Object3D | null = null;
    
    if (targetObject.name.startsWith('DecalMesh_')) {
      // Direct mesh
      decalMesh = targetObject;
    } else if (targetObject.name.startsWith('DecalGroup_')) {
      // Group containing the mesh
      decalGroup = targetObject;
      // Find the mesh inside the group
      targetObject.traverse(child => {
        if (child.name.startsWith('DecalMesh_')) {
          decalMesh = child;
        }
      });
    }
    
    if (decalMesh) {
      
      // Apply new scale to the mesh
      decalMesh.scale.set(newScale.x, newScale.y, newScale.z);
      decalMesh.updateMatrix();
    
      // Handle z-index adjustments on the group if it exists
      if (decalGroup) {
        // Store the original position of the group
        const originalPosition = decalGroup.position.clone();
        
        // Adjust Z position based on scale - larger decals should appear on top (higher z-index)
        // This ensures proper layering when decals overlap
        const zIndexFactor = Math.max(newScale.x, newScale.y, newScale.z) * 0.01;
        decalGroup.position.z = originalPosition.z + zIndexFactor;
        
        decalGroup.updateMatrix();
      }
    } else {
      console.error('Could not find sponsorship logo mesh in the target object');
    }
  }
};
