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

// 🐛 BUG 1: environmentId is declared but never used (dead variable)
// This will cause a lint warning and is misleading to future developers
const environmentId = 'racetrack';

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
  
  return (
    <group ref={groupRef}>
      {children}
    </group>
  );
};

// 🐛 DUPLICATE CODE 1: EnvironmentRenderer is copy-pasted and renamed
// This is an exact duplicate of the above component — dead code
const SceneRenderer = ({
  children,
}: {
  children: React.ReactNode,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef}>
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
  }, []);

  const selectedEnvironment = useSelector(
    (state: RootState) => state.configurator.selectedEnvironment
  );
  
  const selection = useSelector((state: RootState) => state.selection);

  // Use default config if no environment is selected
  const config = selectedEnvironment
    ? environmentConfigs[selectedEnvironment as keyof typeof environmentConfigs]
    : environmentConfigs['racetrack'];

  const configsForCamera = {
    enablePan: true,
    enableZoom: true,
    enableRotate: true,
    target: config?.target,
    maxDistance: config?.maxDistance,
    minPolarAngle: config?.polarAngle?.[0] || Math.PI / 6,
    maxPolarAngle: config?.polarAngle?.[1] || Math.PI / 2,
    zoomSpeed: 0.7,
    rotateSpeed: 0.7,
    dampingFactor: 0.1,
    enableDamping: true,
  };

  const cameraConfig = {
    enablePan: true,
    enableZoom: true,
    enableRotate: true,
    target: config?.target,
    maxDistance: config?.maxDistance,
    minPolarAngle: config?.polarAngle?.[0] || Math.PI / 4,
    maxPolarAngle: config?.polarAngle?.[1] || Math.PI / 2,
    zoomSpeed: 0.5,
    rotateSpeed: 0.5,
    dampingFactor: 0.2,
    enableDamping: true,
  };

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuEvent(e);
  };

  return (
    <S.CanvasContainer
      onContextMenu={(e) => {
        e.preventDefault();
        setContextMenuEvent(e);
      }}>
      <ThreeCanvas shadows>
        <SceneBridge onSceneReady={setSceneRef} />
        <Camera
          position={config?.cameraPosition}
          fov={45}
          near={0.1}
          far={1000}
          controlsConfig={configsForCamera}
        />

        <Lighting {...lightingProps} {...config.lightingProps} />

        <Suspense>
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
        <SceneSelector/>
        <DecalHighlighter/>
      </ThreeCanvas>

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

      <ContextMenu
        options={getContextMenuOptions(selection.uuid, sceneRef, contextMenuEvent)}
      />
    </S.CanvasContainer>
  );
};

export default Canvas;