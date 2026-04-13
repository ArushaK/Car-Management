import { useEffect, useRef, useState } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { DecalGeometry } from 'three/examples/jsm/Addons.js';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { addPlacedDecal, clearPlacedDecals, setSelectedDecal, DecalObjectWithTransform, updatePlacedDecal, setDecalResized, ConfiguratorModel, setEditMode } from '../../../store/actions/configuratorSlice';
import { Object3D } from 'three';
import { stopDragging } from '@/store/actions/decalToolsSlice';

import { useThree } from '@react-three/fiber';
import CarNumbersData from '../../../utils/staticData/CarNumbersData.json';
import decalsData from '../../../utils/staticData/DecalsData.json';
import { clearSelectedObject, SelectedMeshInfo, setSelectedObject } from '@/store/actions/selectionSlice';

const hideDecals = (isLoading: boolean, scene: THREE.Scene) => {
  scene.traverse((child) => {
    if (child instanceof THREE.Group) {
      if (child.name.startsWith('DecalGroup_') || child.name.startsWith('CarNumberGroup_')) {
        if (isLoading) {
          child.visible = false;
        } else {
          child.visible = true;
        }
      }
    }
  })
}

export interface UseDecalManagerParams {
  outerMeshes: Object3D[],
  parentModel: ConfiguratorModel
}

export function useDecalManager({ outerMeshes, parentModel }: UseDecalManagerParams) {
  const dispatch = useDispatch();
  const { camera, gl, scene } = useThree();
  const decalMaterialRef = useRef<THREE.MeshPhongMaterial | null>(null);
  const decalMeshRef = useRef<THREE.Mesh | null>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const [decalGroups, setDecalGroups] = useState<THREE.Group[]>([]);
  const isLoading = useSelector((state: RootState) => state.configurator.isLoading);
  const { isDecalResized } = useSelector((state: RootState) => state.configurator);
  const selection = useSelector((state: RootState) => state.selection);

  // Note: Currently, meshes are being hidden using loading states. 
  // This approach may not be optimal for performance. Consider exploring 
  // alternative methods to handle loaders more efficiently.

  // Hide decals when loading environments
  hideDecals(isLoading, scene);

  const decals: THREE.Group[] = [];
  const intersection = {
    intersects: false,
    point: new THREE.Vector3(),
    normal: new THREE.Vector3()
  };
  const pos = new THREE.Vector3();
  // let orientation = new THREE.Euler();
  const size = new THREE.Vector3(1, 1, 1);

  const decalMap: Record<string, string> = decalsData.reduce((map, decal) => {
    map[decal.id] = decal.image;
    return map;
  }, {} as Record<string, string>);

  const decalTextures = useTexture(decalMap);

  const numberTextures: Record<number, THREE.Texture> = {};

  for (let i = 1; i <= 20; i++) {
    numberTextures[i] = useTexture(`/assets/carNumberImages/${i}.png`);
  }


  const decal = useSelector((state: RootState) => state.configurator.selectedDecal);
  const clearDecalsFlag = useSelector((state: RootState) => state.configurator.clearDecalsFlag);
  const driverData = useSelector((state: RootState) => state.teamSelection.selectedDriverData);
  const decalTools = useSelector((state: RootState) => state.decalTools);

  // Helper to get aspect ratio for decal material
  function getAspectRatioForDecalMaterial(material: THREE.MeshPhongMaterial) {
    if (material.map && material.map.image) {
      return material.map.image.width / material.map.image.height;
    }
    return 1; // Default to square if no image
  }

  // Create a decal material from texture
  function createDecalMaterial(texture: THREE.Texture) {
    texture.wrapS = THREE.RepeatWrapping;
    // texture.repeat.x = -1; // flip horizontally
    texture.needsUpdate = true;

    return new THREE.MeshPhongMaterial({
      specular: 0x444444,
      map: texture,
      normalMap: texture,
      normalScale: new THREE.Vector2(0.1, 0.1),
      shininess: 30,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      wireframe: false,
    });
  }

  // Calculate decal geometry from mouse position
  function calculateDecalGeometry(event: MouseEvent, targetMeshes: Object3D[], textureId?: string) {
    // Early return if we need a texture ID but don't have one
    if (textureId && (!decal || decal.id !== textureId)) {
      return null;
    }

    mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObjects(targetMeshes, true);

    if (intersects.length > 0) {

      const hit = intersects[0];
      const hitMesh = hit.object as THREE.Mesh;
      pos.copy(hit.point);
      const hitNormal = hit.face?.normal.clone().applyMatrix3(
        new THREE.Matrix3().getNormalMatrix(hitMesh.matrixWorld)
      ).normalize();

      if (!hitNormal) return;
      const orientation = new THREE.Euler().setFromQuaternion(
        new THREE.Quaternion().setFromRotationMatrix(
          new THREE.Matrix4().lookAt(
            pos.clone().add(hitNormal), // look from point to outward direction
            pos,
            new THREE.Vector3(0, 1, 0)
          )
        )
      );

      // Determine if this is a car decal or driver decal by checking the mesh parent hierarchy
      let isCarDecal = parentModel === 'car';

      const worldNormal = hitNormal.transformDirection(hitMesh.matrixWorld);
      const decalWidth = 0.2;
      let aspectRatio = 1;

      if (textureId) {
        // We're calculating for a specific texture
        const texture = decalTextures[textureId];
        if (texture) {
          if (decal && decal.name) texture.name = decal.name;
          aspectRatio = texture.image.width / texture.image.height;
        }
      } else if (decalMaterialRef.current) {
        // We're using the current material (dragging case)
        aspectRatio = getAspectRatioForDecalMaterial(decalMaterialRef.current);
      }

      size.set(decalWidth, decalWidth / aspectRatio, 0.1);

      const decalGeometry = new DecalGeometry(
        hitMesh,
        pos,
        orientation,
        size
      );

      // Store normal for later use
      decalGeometry.userData.worldNormal = worldNormal;
      decalGeometry.userData.size = size.clone();
      // Store isCarDecal flag in userData
      decalGeometry.userData.isCarDecal = isCarDecal;
      return decalGeometry;
    }

    intersection.intersects = false;
    return null;
  }

  function calculateResizedDecalGeometry(
    position: THREE.Vector3,
    targetMeshes: Object3D[],
    sizeOverride?: THREE.Vector3,
    extraRotation?: number // <-- Add this parameter for extra rotation
  ) {
    const rayOrigin = position.clone().add(new THREE.Vector3(0, 1, 0));
    const rayDir = position.clone().sub(rayOrigin).normalize();
    const raycaster = new THREE.Raycaster(rayOrigin, rayDir);
    const intersects = raycaster.intersectObjects(targetMeshes, true);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const hitMesh = hit.object as THREE.Mesh;
      pos.copy(hit.point);
      const hitNormal = hit.face?.normal
        .clone()
        .applyMatrix3(new THREE.Matrix3().getNormalMatrix(hitMesh.matrixWorld))
        .normalize();

      if (!hitNormal) return;
      let orientation = new THREE.Euler().setFromQuaternion(
        new THREE.Quaternion().setFromRotationMatrix(
          new THREE.Matrix4().lookAt(
            pos.clone().add(hitNormal), // look from point to outward direction
            pos,
            new THREE.Vector3(0, 1, 0)
          )
        )
      );

      // Apply extra rotation only to local Z axis if provided
      if (extraRotation) {
        orientation.z += extraRotation;
      }

      // Determine if this is a car decal or driver decal by checking the mesh parent hierarchy
      const isCarDecal = parentModel === 'car';
      const worldNormal = hitNormal.transformDirection(hitMesh.matrixWorld);
      let decalSize = sizeOverride;

      if (!decalSize) {
        const decalWidth = 0.2;
        let aspectRatio = 1;

        if (decalMaterialRef.current) {
          // We're using the current material (dragging case)
          aspectRatio = getAspectRatioForDecalMaterial(decalMaterialRef.current);
        }

        // size.set(decalWidth, decalWidth / aspectRatio, 0.1);
        decalSize = new THREE.Vector3(decalWidth, decalWidth / aspectRatio, 0.1);
      }

      const decalGeometry = new DecalGeometry(
        hitMesh,
        pos,
        orientation,
        decalSize
      );

      // Store normal for later use
      decalGeometry.userData.worldNormal = worldNormal;
      decalGeometry.userData.size = decalSize.clone();

      // Store isCarDecal flag in userData
      decalGeometry.userData.isCarDecal = isCarDecal;

      return decalGeometry;
    }

    intersection.intersects = false;
    return null;
  }

  // Create a decal mesh and add it to the scene
  function createDecalMesh(decalGeometry: THREE.BufferGeometry, material: THREE.MeshPhongMaterial, isNewDecal: Boolean) {
    // Shift geometry to center it around the origin (pivot point)

    if (isNewDecal) {
      decalGeometry.translate(-pos.x, -pos.y, -pos.z);
    }
    const decalMesh = new THREE.Mesh(decalGeometry, material);
    const textureName = material.map?.name;
    decalMesh.name = 'DecalMesh_' + textureName;
    decalMesh.position.copy(pos);
    decalMesh.renderOrder = 10;

    return decalMesh;
  }

  // Create a decal group with position and add mesh to it
  function createDecalGroup(decalMesh: THREE.Mesh) {
    const decalGroup = new THREE.Group();
    decalGroup.name = 'DecalGroup_' + (decals.length + 1);
    // decalGroup.position.copy(pos);
    // decalMesh.position.set(0, 0, 0);
    decalGroup.add(decalMesh);
    decalGroup.renderOrder = 10;

    return decalGroup;
  }

  // Create decal info object for store
  function createDecalInfo(decalMesh: THREE.Mesh): DecalObjectWithTransform {
    const decalPosition = decalMesh.position.clone() || new THREE.Vector3(0, 0, 0);
    const decalRotation = decalMesh.rotation.clone() || new THREE.Euler(0, 0, 0);
    const decalScale = decalMesh.scale.clone() || new THREE.Vector3(1, 1, 1);

    const worldNormal = decalMesh.geometry.userData?.worldNormal || new THREE.Vector3(0, 0, 1);
    const isCarDecal = decalMesh.geometry.userData?.isCarDecal || false;

    return {
      uuid: decalMesh.uuid,
      position: [decalPosition.x, decalPosition.y, decalPosition.z],
      rotation: [decalRotation.x, decalRotation.y, decalRotation.z],
      scale: [decalScale.x, decalScale.y, decalScale.z],
      normal: [worldNormal.x, worldNormal.y, worldNormal.z], // Store normal vector
      name: decalMesh.name,
      isCarDecal: isCarDecal, // Store whether it's a car decal or driver decal
    };
  }

  // Handle decal dragging
  useEffect(() => {
    if (decalTools.isDragging && decalTools.targetDecalId) {
      const targetDecalUuid = decalTools.targetDecalId;
      const targetDecal = scene.getObjectByProperty('uuid', targetDecalUuid);

      if (!targetDecal) {
        dispatch(stopDragging());
        return;
      }

      const decalMesh = targetDecal as THREE.Mesh;

      const preservedTransform = {
        size: decalMesh.scale.clone(),
        rotation: decalMesh.rotation.clone(),
        normal: (decalMesh.geometry.userData?.worldNormal as THREE.Vector3) || new THREE.Vector3(0, 0, 1),
      };

      const material = decalMesh.material as THREE.MeshPhongMaterial;

      const onPointerMove = (event: MouseEvent) => {
        if (decalMeshRef.current) scene.remove(decalMeshRef.current);

        const decalGeometry = calculateDecalGeometry(event, outerMeshes, undefined);

        if (decalGeometry) {
          const newMesh = createDecalMesh(decalGeometry, material, true);
          newMesh.rotation.copy(preservedTransform.rotation); // preserve
          newMesh.scale.copy(preservedTransform.size);        // preserve
          decalMeshRef.current = newMesh;
          scene.add(newMesh);
        }
      };

      const onMouseUp = () => {
        if (!decalMeshRef.current || !decalTools.targetDecalId) return;

        scene.remove(decalMeshRef.current); // Remove preview

        // Update original mesh
        const originalMesh = scene.getObjectByProperty('uuid', decalTools.targetDecalId) as THREE.Mesh;
        if (originalMesh && decalMeshRef.current) {
          originalMesh.position.copy(decalMeshRef.current.position);
          originalMesh.geometry.copy(decalMeshRef.current.geometry);

          const updatedInfo = createDecalInfo(originalMesh);
          dispatch(updatePlacedDecal(updatedInfo));
        }

        decalMeshRef.current = null;
        dispatch(stopDragging());
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          if (decalMeshRef.current) {
            scene.remove(decalMeshRef.current);
            decalMeshRef.current = null;
            dispatch(stopDragging());
          }
        }
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onMouseUp);
      window.addEventListener('keydown', handleKeyDown);
      // Clean up
      return () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onMouseUp);
        window.removeEventListener('keydown', handleKeyDown);
        if (decalMeshRef.current) {
          scene.remove(decalMeshRef.current);
          decalMeshRef.current = null;
        }
      };
    }
  }, [decalTools.isDragging, decalTools.targetDecalId, outerMeshes, camera, scene]);

  useEffect(() => {
    if (isDecalResized && selection && selection.type === 'decal' && selection.uuid) {
      const targetDecal = scene.getObjectByProperty('uuid', selection.uuid);

      if (!targetDecal) return;

      const decalMesh = targetDecal as THREE.Mesh;
      updateDecal(decalMesh);
    }
    // eslint-disable-next-line
  }, [isDecalResized]);


  const updateDecal = (decalMesh: THREE.Mesh) => {
    if ((decalMesh.geometry.userData.isCarDecal && parentModel == 'car') || (!decalMesh.geometry.userData.isCarDecal && parentModel == 'driver')) {
      dispatch(setDecalResized(false));

      const material = decalMesh.material as THREE.MeshPhongMaterial;

      // Get the current scale and position
      const currentScale = decalMesh.scale.clone();
      // Capture position and rotation
      const preservedTransform = {
        position: decalMesh.position.clone(),
        rotation: decalMesh.userData.currentAngle || 0,
        normal: (decalMesh.geometry.userData?.worldNormal as THREE.Vector3) || new THREE.Vector3(0, 0, 1),
      };

      // If the decal has a previous rotation stored, apply it as after rotattion and scaling we are resetting the rotation to 0,0,0
      if (decalMesh.userData.previousRotation) {
        preservedTransform.rotation += decalMesh.userData.previousRotation;
      }

      // Base size WITHOUT scale
      const baseSize = decalMesh.geometry.userData.size; // Or store original size in userData on creation
      const newSize = baseSize.clone().multiply(currentScale);

      // Recalculate geometry with new size
      const decalGeometry = calculateResizedDecalGeometry(
        preservedTransform.position,
        outerMeshes,
        newSize,
        preservedTransform.rotation
      );

      if (decalGeometry) {
        const newMesh = createDecalMesh(decalGeometry, material, true);
        newMesh.rotation.set(0, 0, 0); // Reset roattion to 0,0,0
        newMesh.userData.previousRotation = preservedTransform.rotation;
        newMesh.position.copy(decalMesh.position);
        newMesh.scale.set(1, 1, 1); // Reset scale since size is now in geometry

        const parent = decalMesh.parent;
        if (parent instanceof THREE.Group) {
          parent.remove(decalMesh);
          parent.add(newMesh);
        } else {
          scene.remove(decalMesh);
          scene.add(newMesh);
        }

        decalMeshRef.current = newMesh;
        const updatedInfo = createDecalInfo(newMesh);

        const info: SelectedMeshInfo = {
          uuid: newMesh?.uuid ?? null,
          name: newMesh?.name ?? null,
          userData: newMesh?.userData ?? null,
          type: selection.type,
          screenPosition: selection.screenPosition,
        };

        dispatch(setSelectedObject(info));
        dispatch(updatePlacedDecal(updatedInfo));
      }

      decalMeshRef.current = null;
    }
  }

  // Decal preview and ESC cancel
  useEffect(() => {
    if (decal && decal.id) {
      dispatch(setEditMode(false));
      dispatch(clearSelectedObject());
      const texture = decalTextures[decal.id];
      texture.name = decal.name;
      decalMaterialRef.current = createDecalMaterial(texture);

      const onPointerMove = (event: any) => {
        if (decalMeshRef.current) scene.remove(decalMeshRef.current);

        // Use the unified geometry calculation with the texture ID
        const decalGeometry = calculateDecalGeometry(event, outerMeshes, decal.id);

        if (decalGeometry && decalMaterialRef.current) {
          const mesh = createDecalMesh(decalGeometry, decalMaterialRef.current, true);
          scene.add(mesh);
          decalMeshRef.current = mesh;
        }
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          if (decalMeshRef.current) {
            scene.remove(decalMeshRef.current);
            decalMeshRef.current = null;
            dispatch(setSelectedDecal(null));
          }
        }
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('keydown', handleKeyDown);
        if (decalMeshRef.current) scene.remove(decalMeshRef.current);
      };
    }
    // eslint-disable-next-line
  }, [decal?.id]);

  // Remove all decals
  const removeDecals = () => {
    decalGroups.forEach(decal => scene.remove(decal));
    decals.length = 0;

    if (selection && selection.type === 'decal') { 
      dispatch(clearSelectedObject());
    }

    dispatch(setEditMode(false));
    dispatch(clearPlacedDecals());
    setDecalGroups([]);
  };

  // Listen for clearAllDecals action
  useEffect(() => {
    removeDecals();
    // eslint-disable-next-line
  }, [clearDecalsFlag]);

  // Place decal on click
  useEffect(() => {
    const onMouseClick = (event: MouseEvent) => {
      // Only proceed if we have a selected decal
      if (!decal || !decal.id) return;

      // Remove the preview mesh if it exists
      if (decalMeshRef.current) scene.remove(decalMeshRef.current);

      // Calculate geometry using the selected decal's texture
      const decalGeometry = calculateDecalGeometry(event, outerMeshes, decal.id);

      if (decalGeometry && decalMaterialRef.current) {
        // decalGeometry.center();
        const material = decalMaterialRef.current.clone();

        const decalMesh = createDecalMesh(decalGeometry, material, true);
        const decalGroup = createDecalGroup(decalMesh);

        scene.add(decalGroup);
        decals.push(decalGroup);

        const decalInfo = createDecalInfo(decalMesh);

        setDecalGroups(prev => [...prev, decalGroup]);
        dispatch(addPlacedDecal(decalInfo));
        dispatch(setSelectedDecal(null));
      }
    };
    gl.domElement.addEventListener('pointerup', onMouseClick);
    return () => gl.domElement.removeEventListener('pointerup', onMouseClick);
    // eslint-disable-next-line
  }, [camera, scene, gl.domElement, decal?.id, decalGroups]);

  useEffect(() => {
    if (driverData && parentModel == 'car' && outerMeshes && outerMeshes.length > 0 && outerMeshes.find(x => x.name === 'CAR_PAINT_Paint_0')) {
      const carNumber = driverData.number;
      const carNumberData = CarNumbersData.find((data) => data.id === carNumber);
      if (!carNumberData) return;
      var carNumberPoint = scene.getObjectByName('Car_Number_Point') as THREE.Object3D;

      if (!carNumberPoint) return;
      const decalGeometry = loadCarNumberGeometry(carNumberData, carNumberPoint);

      if (decalGeometry) {
        const texture = numberTextures[carNumberData.id];
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.x = -1; // flip horizontally
        texture.needsUpdate = true;
        texture.name = carNumberData.name;

        const material = new THREE.MeshPhongMaterial({
          specular: 0x444444,
          map: texture,
          normalMap: texture,
          normalScale: new THREE.Vector2(0.1, 0.1),
          shininess: 30,
          transparent: true,
          depthTest: true,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -4,
          wireframe: false,
        });

        const decalMesh = new THREE.Mesh(decalGeometry, material);
        const textureName = material.map?.name;

        decalMesh.name = 'CarNumberMesh_' + textureName;
        const decalGroup = new THREE.Group();

        decalGroup.name = 'CarNumberGroup_' + textureName;
        decalGroup.position.copy(pos);
        decalMesh.position.set(0, 0, 0);
        decalGroup.add(decalMesh);
        scene.add(decalGroup);
        decals.push(decalGroup);

        decalMesh.renderOrder = 10;
        decalGroup.renderOrder = 10;
      }
    }
  }, [driverData, outerMeshes]);

  function loadCarNumberGeometry(carNumberData: any, carNumberPoint: THREE.Object3D) {
    if (carNumberData && carNumberPoint) {
      const worldPos = new THREE.Vector3()
      carNumberPoint.getWorldPosition(worldPos)

      const rayOrigin = worldPos.clone().add(new THREE.Vector3(0, 1, 0))
      const rayDir = worldPos.clone().sub(rayOrigin).normalize()
      const raycaster = new THREE.Raycaster(rayOrigin, rayDir)

      const intersects = raycaster.intersectObjects(outerMeshes, true)
      if (intersects.length === 0) {
        console.warn('No mesh intersected at anchor point.')
        return
      }

      const hit = intersects[0]
      const hitMesh = hit.object as THREE.Mesh;
      const hitPoint = hit.point
      const hitNormal = hit.face?.normal.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(hitMesh.matrixWorld)).normalize()

      if (!hitNormal) { return; }
      const orientationCarNumber = new THREE.Euler().setFromQuaternion(
        new THREE.Quaternion().setFromRotationMatrix(
          new THREE.Matrix4().lookAt(
            new THREE.Vector3(0, 0, 0),
            hitNormal,
            new THREE.Vector3(1, 0, 0)
          )
        )
      )

      const worldNormal = hitNormal.transformDirection(hitMesh.matrixWorld);

      // // Change below to rotate the decal
      orientationCarNumber.y += Math.PI; // Rotate 180 degrees around Y axis
      orientationCarNumber.x += Math.PI; // Rotate 180 degrees around X axis
      // orientationCarNumber.z += Math.PI; // Rotate 180 degrees around Z axis

      const decalWidth = 1;
      const texture = numberTextures[carNumberData.id];
      const aspectRatio = texture.image.width / texture.image.height;
      size.set(decalWidth, decalWidth / aspectRatio, 1);

      const decalGeometry = new DecalGeometry(
        hitMesh,
        hitPoint,
        orientationCarNumber,
        size
      )

      decalGeometry.userData.worldNormal = worldNormal;
      decalGeometry.userData.worldPos = worldPos;
      return decalGeometry;
    }
  }

  // Expose API if needed
  return { removeDecals };
}
