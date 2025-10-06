// src/components/common/Camera/FirstPersonCameraControls.tsx
import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

type FirstPersonCameraControlsProps = {
  /** Speed multiplier for look sensitivity */
  lookSpeed?: number;
  /** The base position for the camera (e.g., from axis node) */
  basePosition?: [number, number, number];
};

/**
 * Drag-based camera look controls for first-person view
 * 
 * Allows the user to look around by clicking and dragging the mouse,
 * simulating the rotation of the camera in a first-person perspective.
 * 
 * @param {FirstPersonCameraControlsProps} props - Configuration for drag-look controls
 * @returns {null} This component doesn't render anything visible
 */
const FirstPersonCameraControls = ({
  lookSpeed = 0.002,
  basePosition = [0, 0, 0],
}: FirstPersonCameraControlsProps = {}) => {
  const { camera, gl } = useThree();
  const isDragging = useRef(false);
  const prevMouse = useRef([0, 0]);
  const yaw = useRef(0);
  const pitch = useRef(0);

  // Head-bob/lean offset state
  const offset = useRef<[number, number, number]>([0, 0, 0]); // [x, y, z]
  const maxOffset = 0.2; // Maximum lean/peek distance in any direction
  const moveSpeed = 0.01; // How fast the offset changes per frame
  const keys = useRef<{ [key: string]: boolean }>({});
  
  // Store the base position in a ref so it can be updated if the prop changes
  const basePosRef = useRef<[number, number, number]>(basePosition);
  // Update ref if prop changes
  useEffect(() => {
    basePosRef.current = basePosition;
  }, [basePosition]);

  useEffect(() => {
    const initialFov = 'fov' in camera ? camera.fov : undefined;

    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      prevMouse.current = [e.clientX, e.clientY];
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const [prevX, prevY] = prevMouse.current;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevMouse.current = [e.clientX, e.clientY];

      yaw.current -= dx * lookSpeed;
      pitch.current -= dy * lookSpeed;
      
      // Limit pitch to avoid camera flipping
      pitch.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch.current));
    };

    // Zoom handler: adjust FOV for perspective camera
    const onWheel = (e: WheelEvent) => {
      if ('fov' in camera) {
        camera.fov = Math.max(20, Math.min(90, camera.fov + e.deltaY * 0.05));
        camera.updateProjectionMatrix();
      }
    };

    // Keyboard controls for lean/peek
    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Add event listeners
    gl.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    gl.domElement.addEventListener('wheel', onWheel);

    // Cleanup function to remove event listeners when unmounted
    return () => {
      gl.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      gl.domElement.removeEventListener('wheel', onWheel);

      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);

      if (initialFov !== undefined && 'fov' in camera) {
        camera.fov = initialFov;
        camera.updateProjectionMatrix();
      }
    };
  }, [ gl, lookSpeed, camera ]);

  // Update camera rotation and position on each frame
  useFrame(() => {
    // Set rotation order to YXZ to allow for proper first-person controls
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw.current;
    camera.rotation.x = pitch.current;

    // Handle lean/peek offset (limit to Z only)
    let [x, y, z] = offset.current;
    // Only allow Z movement (forward/backward)
    if (keys.current['KeyW'] || keys.current['ArrowUp']) z -= moveSpeed;
    if (keys.current['KeyS'] || keys.current['ArrowDown']) z += moveSpeed;
    // Clamp offset
    x = 0; // No X movement
    y = 0; // No vertical lean for now
    z = Math.max(-maxOffset, Math.min(maxOffset, z));
    offset.current = [x, y, z];
    // Apply offset relative to base position
    const [bx, by, bz] = basePosRef.current;
    camera.position.set(bx + x, by + y, bz + z);
  });

  return null;
};

export default FirstPersonCameraControls;