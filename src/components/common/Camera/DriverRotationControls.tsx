import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import * as THREE from 'three';

type DriverRotationControlsProps = {
  /** Speed multiplier for rotation sensitivity */
  rotateSpeed?: number;
};

/**
 * Controls for rotating the driver model independently
 * 
 * Allows the user to rotate the driver model by clicking and dragging the mouse,
 * while keeping the car and camera in place.
 * Only rotates around the Y axis (left/right).
 */
const DriverRotationControls = ({
  rotateSpeed = 0.005,
}: DriverRotationControlsProps = {}) => {
  const { scene } = useThree();
  const isDragging = useRef(false);
  const prevMouse = useRef([0, 0]);
  const driverModel = useRef<THREE.Group | null>(null);
  const initialRotation = useRef<THREE.Euler | null>(null);

  // Find the driver model in the scene
  useEffect(() => {
    const findDriverModel = () => {
      const model = scene.getObjectByName('Driver_model');
      if (model) {
        driverModel.current = model as THREE.Group;
        initialRotation.current = model.rotation.clone();
      }
    };
    findDriverModel();
  }, [scene]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!driverModel.current) return;
      isDragging.current = true;
      prevMouse.current = [e.clientX, e.clientY];
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !driverModel.current) return;

      const [prevX, _prevY] = prevMouse.current;
      const dx = e.clientX - prevX;
      prevMouse.current = [e.clientX, e.clientY];

      // Only rotate around Y axis (spin left/right)
      driverModel.current.rotation.y += dx * rotateSpeed;
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [rotateSpeed]);

  // Reset driver rotation when mode is disabled
  const isDriverRotationMode = useSelector((state: RootState) => state.cameraView.isDriverRotationMode);
  useEffect(() => {
    if (!isDriverRotationMode && driverModel.current && initialRotation.current) {
      driverModel.current.rotation.copy(initialRotation.current);
    }
  }, [isDriverRotationMode]);

  return null;
};

export default DriverRotationControls; 