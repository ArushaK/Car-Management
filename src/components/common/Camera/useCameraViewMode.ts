import { useThree } from '@react-three/fiber';
import { useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { Quaternion, Vector3 } from 'three';
import { RootState } from '@/store';

/**
 * Custom hook to manage camera view mode transitions and state
 */
export function useCameraViewMode(position: [number, number, number]) {
  const { scene, camera } = useThree();
  const viewMode = useSelector((state: RootState) => state.cameraView.viewMode);

  const prevViewMode = useRef(viewMode);
  const targetPosition = useRef(new Vector3(...position));
  const targetQuaternion = useRef(new Quaternion());
  const [shouldLerp, setShouldLerp] = useState(false);
  const lerpSpeed = 0.12;

  const lastOrbitPosition = useRef(new Vector3(...position));
  const lastOrbitRotation = useRef(new Quaternion());
  const inTransition = useRef(false);
  const [basePosition, setBasePosition] = useState<[number, number, number]>(position);

  useEffect(() => {
    if (!camera) return;
    if (prevViewMode.current === viewMode) return;

    if (viewMode === 'driver') {
      lastOrbitPosition.current.copy(camera.position);
      lastOrbitRotation.current.copy(camera.quaternion);

      const driverViewNode = scene.getObjectByName('Driver_view');
      if (driverViewNode) {
        const worldPosition = new Vector3();
        const getWorldQuaternion = new Quaternion();
        driverViewNode.getWorldPosition(worldPosition);
        driverViewNode.getWorldQuaternion(getWorldQuaternion);
        targetPosition.current.copy(worldPosition);
        targetQuaternion.current.copy(getWorldQuaternion);
        setBasePosition([
          worldPosition.x || 0,
          worldPosition.y || 0,
          worldPosition.z || 0
        ]);
        setShouldLerp(true);
        inTransition.current = true;
      }
    } else if (viewMode === 'regular') {
      targetPosition.current.copy(lastOrbitPosition.current);
      targetQuaternion.current.copy(lastOrbitRotation.current);
      setShouldLerp(true);
      inTransition.current = true;
    }
    prevViewMode.current = viewMode;
  }, [viewMode, camera, scene]);

  return {
    camera,
    shouldLerp,
    setShouldLerp,
    targetPosition,
    targetQuaternion,
    lerpSpeed,
    inTransition,
    viewMode,
    basePosition
  };
}
