import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { manufacturerColors } from '@/utils/constants/manufacturerColors';

// Define the paint finish options type
export type PaintFinish = 'glossy' | 'metallic' | 'matte' | 'satin' | 'leather';
export type CustomColor = { id: string; name: string; hex: string };
export type DefaultColor = { id: string; name: string; hex: string };
export type CarPartColor = { id: string; name: string; hex: string; partId: string; }

export interface CarColorState {
  carColor: string;
  driverColor: string;
  carPaintFinish: PaintFinish;
  savedCustomColors: CustomColor[];
  availableDefaultColors: DefaultColor[];
  currentManufacturer: string | null;
  carPartColors: CarPartColor[];
}

// Default colors (used when no manufacturer is selected)
const defaultColors = [
  { id: 'white', name: 'Pure White', hex: '#F8F9FA' },
  { id: 'black', name: 'Midnight Black', hex: '#1A1A1A' },
  { id: 'red', name: 'Racing Red', hex: '#E63946' },
  { id: 'silver', name: 'Silver Metallic', hex: '#CED4DA' },
  { id: 'blue', name: 'Electric Blue', hex: '#4361EE' },
  { id: 'yellow', name: 'Solar Yellow', hex: '#FFD166' },
];

const initialState: CarColorState = {
  carColor: defaultColors.find(color => color.id === 'white')?.hex || '#F8F9FA',
  driverColor: defaultColors.find(color => color.id === 'black')?.hex || '#1A1A1A',
  carPaintFinish: 'glossy',
  savedCustomColors: [],
  availableDefaultColors: [...defaultColors],
  currentManufacturer: null,
  carPartColors: [],
};

const carColorSlice = createSlice({
  name: 'carColor',
  initialState,
  reducers: {
    setCarColor: (state, action: PayloadAction<string>) => {
      state.carColor = action.payload;
    },
    setDriverColor: (state, action: PayloadAction<string>) => {
      state.driverColor = action.payload;
    },
    setCarPaintFinish: (state, action: PayloadAction<PaintFinish>) => {
      state.carPaintFinish = action.payload;
    },
    setSavedCustomColors: (state, action: PayloadAction<CustomColor[]>) => {
      state.savedCustomColors = action.payload;
    },
    addCustomColor: (state, action: PayloadAction<CustomColor>) => {
      state.savedCustomColors.push(action.payload);
    },
    removeCustomColor: (state, action: PayloadAction<string>) => {
      state.savedCustomColors = state.savedCustomColors.filter(color => color.id !== action.payload);
    },
    setAvailableDefaultColors: (state, action: PayloadAction<DefaultColor[]>) => {
      state.availableDefaultColors = action.payload;
    },
    removeDefaultColor: (state, action: PayloadAction<string>) => {
      state.availableDefaultColors = state.availableDefaultColors.filter(color => color.id !== action.payload);
    },
    restoreDefaultColors: (state) => {
      state.availableDefaultColors = [...defaultColors];
      
      if (defaultColors.length > 0) {
        state.carColor = defaultColors[0].hex;
        state.driverColor = defaultColors[0].hex;
      }
      
      state.carPaintFinish = 'glossy';
      state.savedCustomColors = [];
      state.carPartColors = [];
    },
    setManufacturer: (state, action: PayloadAction<string>) => {
      const manufacturer = action.payload;
      state.currentManufacturer = manufacturer;
      
      if (manufacturerColors[manufacturer]) {
        state.availableDefaultColors = [...manufacturerColors[manufacturer].colors];
        state.carPaintFinish = manufacturerColors[manufacturer].defaultFinish;
        if (manufacturerColors[manufacturer].colors.length > 0) {
          state.carColor = manufacturerColors[manufacturer].colors[0].hex;
          state.driverColor = manufacturerColors[manufacturer].colors[0].hex;
        }
      } else {
        state.availableDefaultColors = [...defaultColors];
        state.carPaintFinish = 'glossy';
        state.carColor = defaultColors[0].hex;
        state.driverColor = defaultColors[1].hex;
      }
    },
    setCarPartColor: (state, action: PayloadAction<CarPartColor>) => {
      const { partId } = action.payload;
      const existingIndex = state.carPartColors.findIndex(part => part.partId === partId);
      
      if (existingIndex !== -1) {
        // Update existing part color
        state.carPartColors[existingIndex] = action.payload;
      } else {
        // Add new part color
        state.carPartColors.push(action.payload);
      }
    },
    removeCarPartColor: (state, action: PayloadAction<string>) => {
      state.carPartColors = state.carPartColors.filter(part => part.partId !== action.payload);
    },
  },
});

export const { 
  setCarColor,
  setDriverColor,
  setCarPaintFinish,
  setSavedCustomColors,
  addCustomColor,
  removeCustomColor,
  setAvailableDefaultColors,
  removeDefaultColor,
  restoreDefaultColors,
  setManufacturer,
  setCarPartColor,
  removeCarPartColor,
} = carColorSlice.actions;

export default carColorSlice.reducer;
