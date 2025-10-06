import { WheelProps } from '@/utils/constants/WheelProps';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PopoverPosition {
  x: number;
  y: number;
}

export interface Popover {
  id: string;
  type: string;
  position: PopoverPosition;
  zIndex: number;
}

export interface DecalObject {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  width?: number; // Optional width property for images
}

export interface DecalObjectWithTransform extends Partial<DecalObject> {
  uuid: string; // Unique ID for scene reference
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  normal?: [number, number, number]; // Surface normal vector for orientation
  isCarDecal?: boolean; // Flag indicating if it's a car decal (true) or driver decal (false)
}

export interface ConfigState {
  isDrawerOpen: boolean;
  activeSection: string;
  openPopovers: Popover[]; // Changed from single popup to array of popovers
  activePopover: string | null; // Active/focused popover ID
  selectedModel: string | null;
  selectedColor: string | null;
  selectedWheels: WheelProps | null;
  selectedInterior: string | null;
  selectedDecal: DecalObject | null;
  placedDecals: DecalObjectWithTransform[];
  selectedPerformance: string | null;
  selectedEnvironment: string | null;
  selectedNascarTrack: string | null; // NEW: selected NASCAR track
  environmentMode: 'standard' | 'nascar'; // NEW: track mode state
  clearDecalsFlag: boolean; // Flag to track when decals should be cleared
  menuBarPosition: PopoverPosition; // Position of the floating menu bar
  isLoading: boolean; // Loading state for async operations
  isRotateMode: boolean; // Flag to track if rotate mode is active
  isScaleMode: boolean; // Flag to track if scale mode is activeS
  isInEditMode: boolean; // Flag to track if edit mode is active
  isDecalResized: boolean; // Flag to track if decal is resized
}

export type ConfiguratorModel = 'car' | 'driver';

const initialState: ConfigState = {
  isDrawerOpen: false,
  activeSection: '',
  openPopovers: [],
  activePopover: null,
  selectedModel: null,
  selectedColor: null,
  selectedWheels: null,
  selectedInterior: null,
  selectedDecal: null,
  placedDecals: [],
  selectedPerformance: null,
  selectedEnvironment: null,
  selectedNascarTrack: null, // NEW: selected NASCAR track
  environmentMode: 'standard', // NEW: track mode state
  clearDecalsFlag: false,
  menuBarPosition: { x: window.innerWidth / 2 - 165, y: window.innerHeight - 80 }, // Default centered at bottom
  isLoading: false, // Initialize loading state
  isRotateMode: false, // Initialize rotate mode state
  isScaleMode: true, // Initialize scale mode state
  isInEditMode: false, // Initialize edit mode state
  isDecalResized: false // Initialize decal resized state
};

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    toggleDrawer: (state, action: PayloadAction<boolean | undefined>) => {
      state.isDrawerOpen = action.payload !== undefined ? action.payload : !state.isDrawerOpen;
    },
    setActiveSection: (state, action: PayloadAction<string>) => {
      state.activeSection = action.payload;
    },
    // Popover actions
    openPopup: (state, action: PayloadAction<string>) => {
      // Check if this popover is already open
      const existingIndex = state.openPopovers.findIndex(p => p.type === action.payload);
      
      if (existingIndex >= 0) {
        // If already open, just set it as active
        state.activePopover = state.openPopovers[existingIndex].id;
      } else {
        // Create a new popover with a unique ID
        const newId = `${action.payload}-${Date.now()}`;
        const highestZIndex = state.openPopovers.reduce((max, p) => Math.max(max, p.zIndex), 0);
        
        // Add new popover
        state.openPopovers.push({
          id: newId,
          type: action.payload,
          position: { x: 24, y: 125 }, // Default position
          zIndex: highestZIndex + 1
        });
        
        // Set as active
        state.activePopover = newId;
      }
    },
    closePopup: (state, action: PayloadAction<string | undefined>) => {
      if (action.payload) {
        // Close specific popover by ID
        state.openPopovers = state.openPopovers.filter(p => p.id !== action.payload);
        
        // If this was the active popover, set active to null or the last one
        if (state.activePopover === action.payload) {
          const lastPopover = state.openPopovers[state.openPopovers.length - 1];
          state.activePopover = lastPopover ? lastPopover.id : null;
        }
      } else {
        // For backward compatibility: close the active popover if no ID provided
        if (state.activePopover) {
          state.openPopovers = state.openPopovers.filter(p => p.id !== state.activePopover);
          const lastPopover = state.openPopovers[state.openPopovers.length - 1];
          state.activePopover = lastPopover ? lastPopover.id : null;
        }
      }
    },
    setPopoverPosition: (state, action: PayloadAction<{id: string, position: PopoverPosition}>) => {
      const { id, position } = action.payload;
      const popoverIndex = state.openPopovers.findIndex(p => p.id === id);
      
      if (popoverIndex >= 0) {
        state.openPopovers[popoverIndex].position = position;
      }
    },
    setMenuBarPosition: (state, action: PayloadAction<PopoverPosition>) => {
      state.menuBarPosition = action.payload;
    },
    setActivePopover: (state, action: PayloadAction<string>) => {
      const popoverIndex = state.openPopovers.findIndex(p => p.id === action.payload);
      
      if (popoverIndex >= 0) {
        state.activePopover = action.payload;
        
        // Bring to front by increasing z-index
        const highestZIndex = state.openPopovers.reduce((max, p) => Math.max(max, p.zIndex), 0);
        state.openPopovers[popoverIndex].zIndex = highestZIndex + 1;
      }
    },
    setSelectedModel: (state, action: PayloadAction<string | null>) => {
      state.selectedModel = action.payload;
    },
    setSelectedColor: (state, action: PayloadAction<string | null>) => {
      state.selectedColor = action.payload;
    },
    setSelectedWheels: (state, action: PayloadAction<WheelProps | null>) => {
      state.selectedWheels = action.payload;
    },
    setSelectedInterior: (state, action: PayloadAction<string | null>) => {
      state.selectedInterior = action.payload;
    },
    setSelectedDecal: (state, action: PayloadAction<DecalObject | null>) => {
      state.selectedDecal = action.payload;
    },
    addPlacedDecal: (state, action: PayloadAction<DecalObjectWithTransform>) => {
      state.placedDecals.push(action.payload);
    },
    removePlacedDecal: (state, action: PayloadAction<string>) => {
      state.placedDecals = state.placedDecals.filter(d => d.uuid !== action.payload);
    },
    updatePlacedDecal: (state, action: PayloadAction<DecalObjectWithTransform>) => {
      const index = state.placedDecals.findIndex(d => d.uuid === action.payload.uuid);
      if (index !== -1) {
        state.placedDecals[index] = action.payload;
      }
    },
    clearPlacedDecals: (state) => {
      state.placedDecals = [];
    },    
    setSelectedPerformance: (state, action: PayloadAction<string | null>) => {
      state.selectedPerformance = action.payload;
    },
    setSelectedEnvironment: (state, action: PayloadAction<string | null>) => {
      state.selectedEnvironment = action.payload;
    },
    setSelectedNascarTrack: (state, action: PayloadAction<string | null>) => {
      state.selectedNascarTrack = action.payload;
    },
    setEnvironmentMode: (state, action: PayloadAction<'standard' | 'nascar'>) => {
      state.environmentMode = action.payload;
    },
    clearAllDecals: (state) => {
      // Toggle the flag to trigger decal clearing in the component
      state.clearDecalsFlag = !state.clearDecalsFlag;
    },
    resetConfigurator: (state) => {
      return {...initialState, clearDecalsFlag: !state.clearDecalsFlag}; // Reset to initial state and toggle the flag
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setEditMode: (state, action: PayloadAction<boolean>) => {
      state.isInEditMode = action.payload;
      // // When exiting edit mode, ensure other modes are reset
      // if (!action.payload) {
      //   state.isRotateMode = false;
      //   state.isScaleMode = false;
      // }
    },
    setRotateMode: (state, action: PayloadAction<boolean>) => {
      state.isRotateMode = action.payload;
    },
    setScaleMode: (state, action: PayloadAction<boolean>) => {
      state.isScaleMode = action.payload;
    },
    setDecalResized: (state, action: PayloadAction<boolean>) => {
      state.isDecalResized = action.payload;
    },
  },
});

// Export actions
export const {
  toggleDrawer,
  setActiveSection,
  openPopup,
  closePopup,
  setPopoverPosition,
  setMenuBarPosition,
  setActivePopover,
  setSelectedModel,
  setSelectedColor,
  setSelectedWheels,
  setSelectedInterior,
  setSelectedDecal,
  addPlacedDecal,
  removePlacedDecal,
  updatePlacedDecal,
  clearPlacedDecals,
  setSelectedPerformance,
  setSelectedEnvironment,
  setSelectedNascarTrack,
  setEnvironmentMode,
  clearAllDecals,
  resetConfigurator,
  setLoading,
  setEditMode,
  setRotateMode,
  setScaleMode,
  setDecalResized
} = configSlice.actions;

export default configSlice.reducer;