// selectionSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SelectedMeshInfo {
  uuid: string | null;
  name: string | null;
  userData: any | null;
  type: 'decal' | 'mesh' | 'group' | 'numberDecal' | null;
  screenPosition?: { x: number; y: number } | null; // 2D screen position for UI placement
}

const initialState: SelectedMeshInfo = {
  uuid: null,
  name: null,
  userData: null,
  type: null,
  screenPosition: null,
};

const selectionSlice = createSlice({
  name: "selection",
  initialState,
  reducers: {
    setSelectedObject: (_, action: PayloadAction<SelectedMeshInfo>) => {
      return action.payload; // replace state directly
    },
    clearSelectedObject: () => initialState,
  },
});

export type { SelectedMeshInfo };
export const { setSelectedObject, clearSelectedObject } = selectionSlice.actions;
export default selectionSlice.reducer;
