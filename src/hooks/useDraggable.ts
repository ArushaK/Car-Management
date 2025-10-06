import { useRef, useEffect, useState } from 'react';
import { PopoverPosition } from '@/store/actions/configuratorSlice';

interface UseDraggableProps {
  id: string;
  initialPosition?: PopoverPosition;
  onPositionChange?: (id: string, position: PopoverPosition) => void;
  bounds?: 'parent' | 'window' | null;
  handle?: string;
  disabled?: boolean;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  initialLeft: number;
  initialTop: number;
}

export const useDraggable = ({
  id,
  initialPosition = { x: 24, y: 24 },
  onPositionChange,
  bounds = 'window',
  handle = '.popover-header',
  disabled = false,
}: UseDraggableProps) => {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<PopoverPosition>(initialPosition);
  const dragState = useRef<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 0,
  });

  // Update position when initialPosition changes from props
  useEffect(() => {
    if (initialPosition && (initialPosition.x !== position.x || initialPosition.y !== position.y)) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  // Apply position to DOM directly
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    element.style.left = `${position.x}px`;
    element.style.top = `${position.y}px`;
  }, [position]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || disabled) return;

    const handleRef = handle ? element.querySelector(handle) : element;
    if (!handleRef) return;

    const onMouseDown = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      // Only handle left mouse button
      if (mouseEvent.button !== 0) return;
      
      // Prevent default text selection during drag
      mouseEvent.preventDefault();
      
      // Get current computed position
      const computedStyle = window.getComputedStyle(element);
      const left = parseInt(computedStyle.left, 10) || position.x;
      const top = parseInt(computedStyle.top, 10) || position.y;
      
      dragState.current = {
        isDragging: true,
        startX: mouseEvent.clientX,
        startY: mouseEvent.clientY,
        initialLeft: left,
        initialTop: top,
      };
      
      // Add active class for styling
      element.classList.add('dragging');
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      if (!dragState.current.isDragging) return;
      
      const { startX, startY, initialLeft, initialTop } = dragState.current;
      const deltaX = mouseEvent.clientX - startX;
      const deltaY = mouseEvent.clientY - startY;
      
      let newX = initialLeft + deltaX;
      let newY = initialTop + deltaY;
      
      // Apply bounds if specified
      if (bounds) {
        const rect = element.getBoundingClientRect();
        const boundingRect = bounds === 'parent' && element.parentElement 
          ? element.parentElement.getBoundingClientRect()
          : { 
              left: 0, 
              top: 0, 
              right: window.innerWidth, 
              bottom: window.innerHeight, 
              width: window.innerWidth, 
              height: window.innerHeight 
            };
        
        // Keep at least 40px visible on each side
        const minVisiblePart = 40;
        
        if (newX < boundingRect.left - rect.width + minVisiblePart) {
          newX = boundingRect.left - rect.width + minVisiblePart;
        }
        
        if (newX + minVisiblePart > boundingRect.right) {
          newX = boundingRect.right - minVisiblePart;
        }
        
        if (newY < boundingRect.top) {
          newY = boundingRect.top;
        }
        
        if (newY + minVisiblePart > boundingRect.bottom) {
          newY = boundingRect.bottom - minVisiblePart;
        }
      }
      
      // Apply position directly to DOM for immediate visual feedback
      element.style.left = `${newX}px`;
      element.style.top = `${newY}px`;
      element.style.transform = 'none';
    };

    const onMouseUp = () => {
      if (!dragState.current.isDragging) return;
      
      dragState.current.isDragging = false;
      element.classList.remove('dragging');
      
      // Get final position from element's current style
      const currentLeft = parseInt(element.style.left, 10);
      const currentTop = parseInt(element.style.top, 10);
      
      const finalPosition = {
        x: currentLeft,
        y: currentTop
      };
      
      // Update React state
      setPosition(finalPosition);
      
      // Notify position change
      if (onPositionChange) {
        onPositionChange(id, finalPosition);
      }
      
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    handleRef.addEventListener('mousedown', onMouseDown);

    return () => {
      handleRef.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [id, position, onPositionChange, bounds, handle, disabled]);

  return { elementRef, position, setPosition };
};

export default useDraggable; 