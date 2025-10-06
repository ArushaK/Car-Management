import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { resizeDecal, rotateDecal } from '@/services/threeJS/decalService';
import { RootState } from '@/store';
import * as THREE from 'three';
import { updatePlacedDecal } from './configuratorSlice';

export interface DecalToolsState {
  isRotateToolOpen: boolean;
  isResizeToolOpen: boolean;
  isDragging: boolean;
  targetDecalId: string | null;
  position: { x: number, y: number } | null;
  rotation: number;
  scale: { x: number, y: number, z: number };
}

const initialState: DecalToolsState = {
  isRotateToolOpen: false,
  isResizeToolOpen: false,
  isDragging: false,
  targetDecalId: null,
  position: null,
  rotation: 0,
  scale: { x: 1, y: 1, z: 1 }
};

// Async thunk for applying rotation changes
export const applyRotationChanges = createAsyncThunk(
  'decalTools/applyRotationChanges',
  async (args: { scene: THREE.Scene, uuid: string }, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { rotation } = state.decalTools;
    const { scene, uuid } = args;
    
    if (uuid && scene) {
      const targetObject = scene.getObjectByProperty('uuid', uuid);
      
      if (targetObject) {
        // Apply the rotation operation
        rotateDecal(uuid, scene, -rotation); // Negative to match the UI direction
        
        // Get the updated rotation from the object after rotation is applied
        let rotationVector: THREE.Euler | undefined;
        
        if (targetObject instanceof THREE.Mesh) {
          rotationVector = targetObject.rotation.clone();
        } else if (targetObject instanceof THREE.Group) {
          // Find the mesh inside the group
          targetObject.traverse(child => {
            if (child instanceof THREE.Mesh) {
              rotationVector = child.rotation.clone();
            }
          });
        }
        
        if (rotationVector) {
          // Find the decal in the configurator state to update it
          const decalToUpdate = state.configurator.placedDecals.find(d => d.uuid === uuid);
          
          if (decalToUpdate) {
            // Create a new decal object with updated rotation
            const updatedDecal = {
              ...decalToUpdate,
              rotation: [rotationVector.x, rotationVector.y, rotationVector.z] as [number, number, number]
            };
            
            // Update the decal in the Redux store
            dispatch(updatePlacedDecal(updatedDecal));
          }
        }
        
        return true;
      }
    }
    
    return false;
  }
);

// Async thunk for applying scale changes
export const applyScaleChanges = createAsyncThunk(
  'decalTools/applyScaleChanges',
  async (scene: THREE.Scene, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { targetDecalId, scale } = state.decalTools;
    
    if (targetDecalId && scene) {
      const targetObject = scene.getObjectByProperty('uuid', targetDecalId);
      
      if (targetObject) {
        // Apply the resize operation
        resizeDecal(targetDecalId, scene, scale);
        
        // Find the decal in the configurator state to update it
        const decalToUpdate = state.configurator.placedDecals.find(d => d.uuid === targetDecalId);
        
        if (decalToUpdate) {
          // Create a new decal object with updated scale
          const updatedDecal = {
            ...decalToUpdate,
            scale: [scale.x, scale.y, scale.z] as [number, number, number]
          };
          
          // Update the decal in the Redux store
          dispatch(updatePlacedDecal(updatedDecal));
        }
        
        return true;
      } else {
        return false;
      }
    }
    
    return false;
  }
);

export const decalToolsSlice = createSlice({
  name: 'decalTools',
  initialState,
  reducers: {
    showRotateTool: (state, action: PayloadAction<{ position: { x: number, y: number }, decalId: string }>) => {
      state.isRotateToolOpen = true;
      state.isResizeToolOpen = false;
      state.isDragging = false;
      state.position = action.payload.position;
      state.targetDecalId = action.payload.decalId;
    },
    showResizeTool: (state, action: PayloadAction<{ position: { x: number, y: number }, decalId: string }>) => {
      state.isResizeToolOpen = true;
      state.isRotateToolOpen = false;
      state.isDragging = false;
      state.position = action.payload.position;
      state.targetDecalId = action.payload.decalId;
    },
    startDragging: (state, action: PayloadAction<{ decalId: string }>) => {
      state.isDragging = true;
      state.isRotateToolOpen = false;
      state.isResizeToolOpen = false;
      state.targetDecalId = action.payload.decalId;
    },
    stopDragging: (state) => {
      state.isDragging = false;
      state.targetDecalId = null;
    },
    updateRotation: (state, action: PayloadAction<number>) => {
      state.rotation = action.payload;
    },
    updateScale: (state, action: PayloadAction<{ x: number, y: number, z: number }>) => {
      state.scale = action.payload;
    },
    hideTools: (state) => {
      state.isRotateToolOpen = false;
      state.isResizeToolOpen = false;
      state.isDragging = false;
      state.targetDecalId = null;
      state.position = null;
    },
    applyChanges: (state) => {
      // This is just to trigger an action that can be listened to elsewhere
      state.isRotateToolOpen = false;
      state.isResizeToolOpen = false;
      state.isDragging = false;
      // state.position = null;
    },
    clearAll: (state) => {
      state.isRotateToolOpen = false;
      state.isResizeToolOpen = false;
      state.isDragging = false; 
      state.targetDecalId = null;
      state.position = null;
    }
  }
});

export const { 
  showRotateTool, 
  showResizeTool,
  startDragging,
  stopDragging,
  updateRotation, 
  updateScale, 
  hideTools,
  applyChanges,
  clearAll
} = decalToolsSlice.actions;

export default decalToolsSlice.reducer;
