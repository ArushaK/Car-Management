import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CameraViewMode = 'regular' | 'driver';

export interface CameraViewState {
    viewMode: CameraViewMode;
    isDriverRotationMode: boolean;
}

const initialState: CameraViewState = {
    viewMode: 'regular',
    isDriverRotationMode: false
}

export const cameraViewSlice = createSlice({
    name: 'cameraView',
    initialState,
    reducers: {
        setViewMode: (state, action: PayloadAction<CameraViewMode>) => {
            state.viewMode = action.payload;
        },
        toggleViewMode: (state) => {
            state.viewMode = state.viewMode === 'regular' ? 'driver' : 'regular';
        },
        setDriverRotationMode: (state, action: PayloadAction<boolean>) => {
            state.isDriverRotationMode = action.payload;
        }
    },
});

export const { setViewMode, toggleViewMode, setDriverRotationMode } = cameraViewSlice.actions;
export default cameraViewSlice.reducer;