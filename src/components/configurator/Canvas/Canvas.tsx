import { Environment, GizmoHelper, GizmoViewport, Loader, useProgress } from '@react-three/drei';
import { Canvas as ThreeCanvas } from '@react-three/fiber';
import { MouseEvent, Suspense, useEffect, useRef, useState } from 'react';
import * as S from './Canvas.styles';
import Camera from '@components/common/Camera';
import Lighting from '@components/common/Lighting';
import Platform from '@/components/common/Platform';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { environmentConfigs } from '@/utils/constants/environmentConfig';
import * as THREE from 'three';
import SceneSelector  from '@/components/common/SceneSelector';
import DecalHighlighter from '@/components/common/DecalHighlighter';
import ContextMenu from '@/components/common/ContextMenu';
import { getContextMenuOptions } from '@/components/common/ContextMenu/contextMenuConfig';
import SceneBridge from '@/components/common/SceneBridge';
import { setLoading } from '@/store/actions/configuratorSlice';

type CanvasProps = {
  children?: React.ReactNode;
  lightingProps?: React.ComponentProps<typeof Lighting>;
  sceneRef: THREE.Scene | null;
  setSceneRef: (scene: THREE.Scene | null) => void;
};

/**
 * EnvironmentRenderer component handles the proper loading and configuration 
 * of the 3D environment based on the selected environment
 */
const EnvironmentRenderer = ({
  children,
}: {
  children: React.ReactNode,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Apply environment-specific configurations when environment changes
  // useEffect(() => {
  //   if (!environmentId || !groupRef.current) return;

  //   const config = environmentConfigs[environmentId as keyof typeof environmentConfigs];
  //   if (config) {
  //     // Apply car position for this environment
  //     groupRef.current.position.set(
  //       config.carPosition[0], 
  //       config.carPosition[1], 
  //       config.carPosition[2]
  //     );
      
  //     // Then apply car rotation if configured
  //     if (config.carRotation) {
  //       groupRef.current.rotation.set(
  //         config.carRotation[0],
  //         config.carRotation[1],
  //         config.carRotation[2]
  //       );
  //     } else {
  //     groupRef.current.rotation.set(0, 0, 0);
  //     }
  //   }
  // }, [environmentId]);
  
  return (
    <group ref={groupRef}>
      {/* Wrap children (car model) in a group for positioning */}
      {children}
    </group>
  );
};



/**
 * Canvas component that wraps the Three.js canvas with necessary setup
 * including camera and lighting.
 * 
 */
const Canvas = ({
  children,
  lightingProps,
  sceneRef,
  setSceneRef,
}: CanvasProps) => {
  const dispatch = useDispatch();
  const [contextMenuEvent, setContextMenuEvent] = useState<MouseEvent | null>(null);
  const { active } = useProgress();

  useEffect(() => {
    dispatch(setLoading(active));
  }, [ active ]);

  const selectedEnvironment = useSelector(
    (state: RootState) => state.configurator.selectedEnvironment
  );
  
  // Get the current selection state for the context menu
  const selection = useSelector((state: RootState) => state.selection);

  // Use default config if no environment is selected
  const config = selectedEnvironment
    ? environmentConfigs[selectedEnvironment as keyof typeof environmentConfigs]
    : environmentConfigs.racetrack;

  const configsForCamera = {
    enablePan: true,
    enableZoom: true,
    enableRotate: true,
    target: config?.target,
    // minDistance: config?.minDistance,
    maxDistance: config?.maxDistance,
    minPolarAngle: config?.polarAngle?.[0] || Math.PI / 6, // Prevent camera from going below car
    maxPolarAngle: config?.polarAngle?.[1] || Math.PI / 2, // Prevent camera from going above car
    zoomSpeed: 0.7, // Slightly slower zoom for better control
    rotateSpeed: 0.7, // Slightly slower rotation for better control
    dampingFactor: 0.1, // Add smoothing to camera movements
    enableDamping: true, // Enable inertia for smoother camera movement
  };
  return (
    <S.CanvasContainer
      onContextMenu={(e) => {
        e.preventDefault();
        setContextMenuEvent(e);
      }}>
      <ThreeCanvas shadows>
        {/* SceneBridge runs useThree inside the canvas context */}
        <SceneBridge onSceneReady={setSceneRef} />
        <Camera
          position={config?.cameraPosition}
          fov={45}
          near={0.1}
          far={1000}
          controlsConfig={configsForCamera}
        />

        {/* Lighting with properties based on environment */}
        <Lighting {...lightingProps} {...config.lightingProps} />

        {/* Main Content with Suspense */}
        <Suspense>
          {/* Environment maps with ground projection for realism */}
          {selectedEnvironment ? (
            <Environment
              files={`/assets/environments/${selectedEnvironment}.hdr`}
              background={true}
              ground={{
                height: config.groundHeight || 10,
                radius: config.groundRadius || 40,
                scale: config.groundScale || 10,
              }}
            />
          ) : (
            <>
              <Environment preset="studio" />
              {/* Platform setup */}
              <Platform />
            </>
          )}

          {/* Scene content */}
          <EnvironmentRenderer>
            {children}
          </EnvironmentRenderer>
        </Suspense>

        <GizmoHelper alignment="bottom-left" margin={[80, 80]}>
          <GizmoViewport axisColors={['#9d4b4b', '#2f7f4f', '#3b5b9d']} labelColor="white" />
        </GizmoHelper>
        {/*This enables selection across canvas*/}
        <SceneSelector/>
        <DecalHighlighter/>
      </ThreeCanvas>
      {/* Loader for 3D assets */}
      <Loader
        containerStyles={{
          backgroundColor: "rgba(0, 0, 0, 0.2)", // light transparent overlay
          // backdropFilter: 'blur(2px)', // optional blur
        }}
        barStyles={{
          backgroundColor: "#A9A9A9",
          height: "3px",
          borderRadius: "4px",
        }}
      />

      {/* Global context menu */}
      <ContextMenu
        options={getContextMenuOptions(selection.uuid, sceneRef, contextMenuEvent)}
      />
    </S.CanvasContainer>
  );
};

export default Canvas;