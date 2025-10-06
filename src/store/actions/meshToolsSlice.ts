import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Position {
  x: number;
  y: number;
}

interface MeshToolsState {
  isColorToolOpen: boolean;
  isMaterialToolOpen: boolean;
  colorTool: {
    meshId: string | null;
    position: Position | null;
  };
  materialTool: {
    meshId: string | null;
    position: Position | null;
  };
}

const initialState: MeshToolsState = {
  isColorToolOpen: false,
  isMaterialToolOpen: false,
  colorTool: {
    meshId: null,
    position: null
  },
  materialTool: {
    meshId: null,
    position: null
  }
};

const meshToolsSlice = createSlice({
  name: 'meshTools',
  initialState,
  reducers: {
    showColorTool: (state, action: PayloadAction<{ position: Position; meshId: string }>) => {
      state.isColorToolOpen = true;
      state.colorTool = {
        meshId: action.payload.meshId,
        position: action.payload.position
      };
    },
    hideColorTool: (state) => {
      state.isColorToolOpen = false;
      state.colorTool = {
        meshId: null,
        position: null
      };
    },
    showMaterialTool: (state, action: PayloadAction<{ position: Position; meshId: string }>) => {
      state.isMaterialToolOpen = true;
      state.materialTool = {
        meshId: action.payload.meshId,
        position: action.payload.position
      };
    },
    hideMaterialTool: (state) => {
      state.isMaterialToolOpen = false;
      state.materialTool = {
        meshId: null,
        position: null
      };
    },
  },
});

export const {
  showColorTool,
  hideColorTool,
  showMaterialTool,
  hideMaterialTool,
} = meshToolsSlice.actions;

export default meshToolsSlice.reducer;
