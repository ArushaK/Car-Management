import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type VisibilityMode = 'car' | 'driver' | 'both';

interface VisibilityState {
  mode: VisibilityMode;
}

const initialState: VisibilityState = {
  mode: 'both', // Default to showing both car and driver
};

const visibilitySlice = createSlice({
  name: 'visibility',
  initialState,
  reducers: {
    setVisibilityMode: (state, action: PayloadAction<VisibilityMode>) => {
      state.mode = action.payload;
    },
  },
});

export const { setVisibilityMode } = visibilitySlice.actions;
export default visibilitySlice.reducer; 