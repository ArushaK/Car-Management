import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  IconButton,
  Typography,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, useTexture, Loader } from '@react-three/drei';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useMemo, useRef, Suspense } from 'react';
import { Group } from 'three';
import { DecalGeometry } from 'three/examples/jsm/Addons.js';

// Import car number textures
import CarNumbersData from '@/utils/staticData/CarNumbersData.json';
// Reuse existing styled components if needed
import { styled } from '@mui/material/styles';
import decals from '../../../utils/staticData/DecalsData.json';
import { PaintFinish } from '@/store/actions/carColorSlice';
import { usePaintFinish } from '@/hooks/usePaintFinish';
import { changeMeshColor } from '@/services/threeJS/meshService';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1, 3, 2),
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const CanvasContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '400px',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  position: 'relative',
}));

// Decal material creation with proper settings from the main app
const createDecalMaterial = (texture: THREE.Texture) => {
  if (!texture) return null;
  
  // Prepare the texture with proper settings
  texture.wrapS = THREE.RepeatWrapping;
  // texture.repeat.x = -1; // flip horizontally for correct orientation
  texture.needsUpdate = true;
  
  return new THREE.MeshPhongMaterial({
    specular: 0x444444,
    map: texture,
    transparent: true,
    opacity: 1,
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    side: THREE.DoubleSide,
  });
};

// Custom geometry for decals that uses the DecalGeometry technique
// This is a simplified version of THREE.DecalGeometry
const createDecalGeometry = (
  position: THREE.Vector3,
  normal: THREE.Vector3,
  size: THREE.Vector3,
  isDriver: boolean = false
): THREE.BufferGeometry => {
  const geometry = new THREE.PlaneGeometry(size.x, size.y);
  const matrix = new THREE.Matrix4();

  if (isDriver) {
    // Use lookAt matrix for better alignment with curved/organic driver models
    const lookAtMatrix = new THREE.Matrix4().lookAt(
      position.clone().add(normal), // from
      position,                     // to
      new THREE.Vector3(0, 1, 0)    // up vector
    );

    const quaternion = new THREE.Quaternion().setFromRotationMatrix(lookAtMatrix);
    matrix.makeRotationFromQuaternion(quaternion);
  } else {
    // Simple alignment using quaternion from default plane normal
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      normal.clone().normalize()
    );
    matrix.makeRotationFromQuaternion(quaternion);
  }

  // Set position and apply transformation
  matrix.setPosition(position);
  geometry.applyMatrix4(matrix);

  return geometry;
};


// Component to render a single decal
const Decal = ({ decal, textures, meshes }: { decal: any, textures: Record<string, THREE.Texture>, meshes: THREE.Mesh[] }) => {
  // Find parent mesh - usually the car body
  const bodyMesh = useMemo(() => 
    meshes.find(m => m.name.toLowerCase().includes('body') || m.name.toLowerCase().includes('car')), 
    [meshes]
  );
  
  if (!bodyMesh) return null;
  
  // Get the proper texture based on decal name
  const texture = textures[decal.name];
  
  if (!texture) return null;
  
  // Create material with proper settings
  const material = useMemo(() => createDecalMaterial(texture), [texture]);
  if (!material) return null;
  
  // Convert stored position to Vector3
  const position = new THREE.Vector3().fromArray(decal.position);
  
  // Convert stored rotation to Euler
  const rotation = new THREE.Euler().fromArray(decal.rotation);
  
  // Convert stored scale to Vector3
  const scale = new THREE.Vector3().fromArray(decal.scale);
  
  // Get stored normal vector if available, or calculate one based on rotation
  const normal = useMemo(() => {
    // If we have a stored normal vector from the original decal geometry, use it
    if (decal.normal) {
      return new THREE.Vector3().fromArray(decal.normal);
    }
    
    // Otherwise calculate a normal vector based on rotation
    const normalVector = new THREE.Vector3(0, 0, 1);
    const quaternion = new THREE.Quaternion().setFromEuler(rotation);
    normalVector.applyQuaternion(quaternion);
    return normalVector;
  }, [decal.normal, rotation]);
  
  // Get aspect ratio for size calculation but don't apply it to the scale
  // This matches how the configurator handles scale (directly applying it)
  const aspectRatio = useMemo(() => {
    if (!texture.image) return 1;
    return texture.image.width / texture.image.height;
  }, [texture]);
  
  // Decal size - we use this for geometry creation only
  // The actual scale is applied directly to the mesh like in configurator
  const decalSize = useMemo(() => {
    // Base size that matches how DecalGeometry uses it
    const baseSize = 0.2;
    return new THREE.Vector3(
      baseSize, 
      baseSize / aspectRatio, 
      0.1
    );
  }, [aspectRatio]);
  
  // Combine the approaches: use our orientation for positioning and conforming to surface
  return (
    <group position={position}>
      <mesh rotation={rotation} scale={scale}>
        {/* Use createDecalGeometry with stored or calculated normal */}
        <primitive attach="geometry" object={createDecalGeometry(
          new THREE.Vector3(0, 0, 0), // Local position (already moved by group)
          normal, // Use stored or calculated normal
          decalSize, // Base size without scale applied, scale is on the mesh itself
          false
        )} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
};

// Manager component for all decals
const DecalManager = ({ config, meshes }: { config: any, meshes: THREE.Mesh[] }) => {
  // Prepare texture URLs for all decals
  const textureUrls = useMemo(() => {
    if (!config || config.length === 0) return {};
    
    const result: Record<string, string> = {};
    
    config.forEach((decal: any) => {
      if (!decal.name) return;
      
      const nameToFind = decal.name.replace(/^DecalMesh_/, '');
      const matchingDecal = decals.find(d => d.name === nameToFind);
      const imagePath = matchingDecal?.image;
      
      if(imagePath){
        result[decal.name] = imagePath;
      } else {
        console.log("No Image Available")
      }
    });
    
    return result;
  }, [config]);
  
  // Load all textures at once
  const textures = useTexture(textureUrls);
  
  if (!config || config.length === 0) return null;
  
  return (
    <group>
      {config.map((decal: any, index: number) => (
        <Decal
          key={decal.id || `decal-${index}`}
          decal={decal}
          textures={textures}
          meshes={meshes}
        />
      ))}
    </group>
  );
};

interface ConfigPreviewCarProps {
  config: {
    carColor: string;
    carPaintFinish: PaintFinish;
    selectedWheels: any;
    placedDecals: any[];
    driverColor: string;
    carPartColors?: any[];
  };
  driverNumber?: number;
}

// Main component for rendering the car with all configurations
const ConfigPreviewCar = ({ config, driverNumber }: ConfigPreviewCarProps) => {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF('/assets/models/toyota_supra.glb');
  
  // Clone the scene to avoid modifying the original
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  
  // Extract all meshes for decal placement
  const [meshes, setMeshes] = useState<THREE.Mesh[]>([]);
  
  // Find and store all meshes when the scene is loaded
  useEffect(() => {
    if (!clonedScene) return;
    
    const extractedMeshes: THREE.Mesh[] = [];
    clonedScene.traverse((child: any) => {
      if (child.isMesh && child.visible && child.geometry) {
        extractedMeshes.push(child);
      }
    });
    
    setMeshes(extractedMeshes);
  }, [clonedScene]);
  
  // Apply car color and paint finish
  usePaintFinish(clonedScene, config.carColor, config.carPaintFinish);

  // Apply custom part colors if available
  useEffect(() => {
    if (!clonedScene || !config.carPartColors || config.carPartColors.length === 0) return;

    // Apply each car part color to the matching mesh
    config.carPartColors.forEach(partColor => {
      clonedScene.traverse((mesh: any) => {
        if (mesh.isMesh && mesh.visible && mesh.geometry) {
          if (mesh.name === partColor.name) {
            // If the mesh is found, apply the color
            changeMeshColor(mesh.uuid, partColor.hex, clonedScene as unknown as THREE.Scene);
          }
        }
      });
    });
  }, [clonedScene, config.carPartColors]);

  // Use the car number hook to add driver number to car
  useCarNumber(clonedScene, driverNumber || 1);

  const carConfig = config.placedDecals.filter(decal => decal.isCarDecal === true);
  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
      {carConfig && carConfig.length > 0 && meshes.length > 0 && (
        <DecalManager config={carConfig} meshes={meshes} />
      )}
      <DriverModel config={config}/>
    </group>
  );
};

// Driver model for preview
const DriverModel = ({ config }: { config: { driverColor: string, placedDecals?: any[] } }) => {
  const { scene } = useGLTF('/assets/models/racer.glb');
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const [driverMeshes, setDriverMeshes] = useState<THREE.Mesh[]>([]);
  
  // Driver position and rotation, matching the main configurator
  const driverPosition = new THREE.Vector3(2, 0, 0);
  const driverRotation = new THREE.Euler(0, -Math.PI / 4, 0);

  // Find and store all driver meshes when the scene is loaded
  useEffect(() => {
    if (!clonedScene) return;
    
    const extractedMeshes: THREE.Mesh[] = [];
    clonedScene.traverse((child: any) => {
      if (child.isMesh && child.visible && child.geometry) {
        extractedMeshes.push(child);
      }
    });
    
    setDriverMeshes(extractedMeshes);
  }, [clonedScene]);

  usePaintFinish(clonedScene, config.driverColor, 'leather');

  const driverDecals = config.placedDecals?.filter(decal => decal.isCarDecal === false);

  return (
    <group 
      position={driverPosition} 
      rotation={driverRotation} 
      scale={1}
    >
      <primitive object={clonedScene} />
      {driverDecals && driverDecals.length > 0 && driverMeshes.length > 0 && (
        <group>
          {driverDecals?.map((decal, index) => (
            <DriverDecal 
              key={`driver-decal-${index}`}
              decal={decal}
              meshes={driverMeshes}
              driverPosition={driverPosition}
              driverRotation={driverRotation}
            />
          ))}
        </group>
      )}
    </group>
  );
};

// Special component for driver decals with improved positioning
const DriverDecal = ({ 
  decal, 
  meshes,
  driverPosition,
  driverRotation
}: { 
  decal: any, 
  meshes: THREE.Mesh[],
  driverPosition: THREE.Vector3,
  driverRotation: THREE.Euler
}) => {
  // Find decal texture
  const decalName = decal.name.replace(/^DecalMesh_/, '');
  const matchingDecal = decals.find(d => d.name === decalName);
  const texture = useTexture(matchingDecal?.image || '');
  
  if (!texture || !matchingDecal) return null;
  
  // Create material with proper settings
  const material = useMemo(() => createDecalMaterial(texture), [texture]);
  if (!material) return null;
  
  // Convert stored position to Vector3
  const worldPosition = new THREE.Vector3().fromArray(decal.position);
  
  // Transform position from world space to driver's local space
  const localPosition = useMemo(() => {
    // Create a matrix to represent the driver's transform
    const driverMatrix = new THREE.Matrix4()
      .makeRotationFromEuler(driverRotation)
      .setPosition(driverPosition);
    
    // Create the inverse to transform from world to local
    const inverseDriverMatrix = driverMatrix.clone().invert();
    
    // Transform the world position to the driver's local space
    const localPos = worldPosition.clone().applyMatrix4(inverseDriverMatrix);
    
    return localPos;
  }, [worldPosition, driverPosition, driverRotation]);
  
  // Transform rotation to account for driver's rotation
  const adjustedRotation = useMemo(() => {
    // Create a quaternion for the decal's rotation
    const decalQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(decal.rotation[0], decal.rotation[1], decal.rotation[2])
    );
    
    // Create a quaternion for the driver's rotation
    const driverQuaternion = new THREE.Quaternion().setFromEuler(driverRotation);
    
    // Compute the inverse of the driver's rotation
    const inverseDriverQuaternion = driverQuaternion.clone().invert();
    
    // Apply the inverse driver rotation to the decal rotation
    // This effectively transforms the rotation from world space to driver-local space
    const localRotation = new THREE.Euler().setFromQuaternion(
      decalQuaternion.premultiply(inverseDriverQuaternion)
    );
    
    return localRotation;
  }, [decal.rotation, driverRotation]);
  
  // Convert stored scale to Vector3
  const scale = new THREE.Vector3().fromArray(decal.scale);
  
  // Get stored normal vector
  const normal = useMemo(() => {
    if (decal.normal) {
      const worldNormal = new THREE.Vector3().fromArray(decal.normal);
      
      // Transform normal from world space to local space
      // For normals, we only need to apply the rotation part of the transform
      const driverQuaternion = new THREE.Quaternion().setFromEuler(driverRotation);
      const inverseDriverQuaternion = driverQuaternion.clone().invert();
      
      return worldNormal.clone().applyQuaternion(inverseDriverQuaternion);
    }
    return new THREE.Vector3(0, 0, 1);
  }, [decal.normal, driverRotation]);
  
  // Calculate size based on texture aspect ratio
  const aspectRatio = useMemo(() => {
    if (!texture.image) return 1;
    return texture.image.width / texture.image.height;
  }, [texture]);
  
  const decalSize = useMemo(() => {
    const baseSize = 0.2;
    return new THREE.Vector3(
      baseSize, 
      baseSize / aspectRatio, 
      0.1
    );
  }, [aspectRatio]);
  
  return (
    <group position={localPosition}>
      <mesh rotation={adjustedRotation} scale={scale}>
        {/* Use the special driver decal geometry for proper orientation */}
        <primitive 
          attach="geometry" 
          object={createDecalGeometry(
            new THREE.Vector3(0, 0, 0), // Local position (already moved by group)
            normal,
            decalSize,
            true
          )} 
        />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
};


// Hook to handle car number placement, adapted from useDecalManager
const useCarNumber = (clonedScene: THREE.Group, driverNumber: number) => {
  const [numberMesh, setNumberMesh] = useState<THREE.Mesh | null>(null);
  const numberTextures: Record<number, THREE.Texture> = {};

  for (let i = 1; i <= 20; i++) {
    numberTextures[i] = useTexture(`/assets/carNumberImages/${i}.png`);
  }

  useEffect(() => {
    if (!clonedScene || !driverNumber) return;

    // Find car number point and body mesh
    let carNumberPoint: THREE.Object3D | null = null;
    const outerMeshes: THREE.Mesh[] = [];

    clonedScene.traverse((child: any) => {
      if (child.name === 'Car_Number_Point') {
        carNumberPoint = child;
      }
      if (child.isMesh && child.visible && child.geometry) {
        outerMeshes.push(child);
      }
    });

    if (!carNumberPoint || outerMeshes.length === 0) return;

    // Find the car number data
    const carNumberData = CarNumbersData.find((data) => data.id === driverNumber);
    if (!carNumberData) return;

    // Load the texture
    const texture = numberTextures[carNumberData.id as keyof typeof numberTextures];
    if (!texture) return;

    const carNumberObject = carNumberPoint as THREE.Object3D;

    // Get world position of number point
    const worldPos = new THREE.Vector3();
    carNumberObject.getWorldPosition(worldPos);

    // Create raycaster to find surface point
    const rayOrigin = worldPos.clone().add(new THREE.Vector3(0, 1, 0));
    const rayDir = worldPos.clone().sub(rayOrigin).normalize();
    const raycaster = new THREE.Raycaster(rayOrigin, rayDir);

    // Get intersection with car body
    const intersects = raycaster.intersectObjects(outerMeshes, true);
    if (intersects.length === 0) return;

    const hit = intersects[0];
    const hitMesh = hit.object as THREE.Mesh;
    const hitPoint = hit.point;
    const hitNormal = hit.face?.normal.clone()
      .applyMatrix3(new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld))
      .normalize();

    if (!hitNormal) return;

    // Create orientation for car number
    const orientationCarNumber = new THREE.Euler().setFromQuaternion(
      new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().lookAt(
          new THREE.Vector3(0, 0, 0),
          hitNormal,
          new THREE.Vector3(1, 0, 0)
        )
      )
    );

    // Apply rotations like in the main app
    orientationCarNumber.y += Math.PI; // Rotate 180 degrees around Y axis
    orientationCarNumber.x += Math.PI; // Rotate 180 degrees around X axis

    // Set up texture
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = -1; // flip horizontally
    texture.needsUpdate = true;

    // Create decal material
    const material = new THREE.MeshPhongMaterial({
      specular: 0x444444,
      map: texture,
      transparent: true,
      opacity: 1,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      side: THREE.DoubleSide,
    });

    // Calculate size for decal
    const decalWidth = 1;
    const aspectRatio = texture.image.width / texture.image.height;
    const size = new THREE.Vector3(decalWidth, decalWidth / aspectRatio, 0.1);

    // Create decal geometry using DecalGeometry
    const decalGeometry = new DecalGeometry(
      hitMesh,
      hitPoint,
      orientationCarNumber,
      size
    );

    // Create mesh with the decal
    const mesh = new THREE.Mesh(decalGeometry, material);
    mesh.renderOrder = 20;
    
    // Remove existing number mesh if any
    if (numberMesh) {
      clonedScene.remove(numberMesh);
    }
    
    // Add new number mesh
    clonedScene.add(mesh);
    setNumberMesh(mesh);

    return () => {
      if (mesh && mesh.parent) {
        mesh.parent.remove(mesh);
      }
    };
  }, [clonedScene, driverNumber]);

  return numberMesh;
};

interface CarPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  selectedConfig: any | null;
}

const CarPreviewDialog: React.FC<CarPreviewDialogProps> = ({
  open,
  onClose,
  selectedConfig
}) => {
  
  if (!selectedConfig) return null;
  
  const driverNumber = selectedConfig.driver.number
                      // (selectedConfig.driverData && selectedConfig.driverData.number) || 
                      // 1; // Default to 1 if no driver number is found
  
  // Camera configuration that matches the main canvas
  const cameraConfig = {
    enablePan: true,
    enableZoom: true,
    enableRotate: true,
    target: [0, 0, 0] as [number, number, number], // Explicitly type as tuple
    maxDistance: 10,
    minPolarAngle: Math.PI / 6, // Prevent camera from going below car
    maxPolarAngle: Math.PI / 2, // Prevent camera from going above car
    zoomSpeed: 0.7, // Slightly slower zoom for better control
    rotateSpeed: 0.7, // Slightly slower rotation for better control
    dampingFactor: 0.1, // Add smoothing to camera movements
    enableDamping: true, // Enable inertia for smoother camera movement
  };
  
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <StyledDialogTitle>
        <Typography variant="h6" component="div">Car Model Preview of {selectedConfig.name}</Typography>
        <IconButton aria-label="close" onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {selectedConfig.driver && (
            <><b>Driver: {selectedConfig.driver.name} (#{driverNumber})</b></>
          )}
        </Typography>
        
        <CanvasContainer>
          <Canvas shadows camera={{ position: [4, 2, 4], fov: 45 }}>
            <Suspense fallback={null}>
              {/* Lighting setup */}
              <ambientLight intensity={0.7} />
              <directionalLight 
                position={[5, 10, 5]} 
                intensity={1} 
                castShadow 
              />
              <spotLight 
                position={[-5, 10, 5]} 
                intensity={0.5} 
                angle={0.3} 
                penumbra={1} 
              />

              {/* The car with all configurations */}
              <ConfigPreviewCar config={selectedConfig.configuration} driverNumber={driverNumber} />
              
              {/* Circuit track environment */}
              <Environment 
                files="/assets/environments/racetrack.hdr" 
                background={true}
                ground={{
                  height: 10,
                  radius: 40,
                  scale: 10,
                }}
              />
            </Suspense>
            
            {/* Camera controls matching the main canvas */}
            <OrbitControls 
              {...cameraConfig}
              autoRotate={false}
              makeDefault
            />
          </Canvas>
          
          <Loader 
            containerStyles={{
              backgroundColor: "rgba(0, 0, 0, 0.2)",
            }}
            barStyles={{
              backgroundColor: "#A9A9A9",
              height: "3px",
              borderRadius: "4px",
            }}
          />
        </CanvasContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" sx={{textTransform: 'none'}}>
          Close
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default CarPreviewDialog; 