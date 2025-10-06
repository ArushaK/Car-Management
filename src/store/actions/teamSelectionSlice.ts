import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Team, Driver } from '@/components/TeamSelection/types';

interface TeamSelectionState {
  selectedTeamId: string | null;
  selectedDriverId: string | null;
  selectedTeamData: Team | null;
  selectedDriverData: Driver | null;
}

const initialState: TeamSelectionState = {
  selectedTeamId: null,
  selectedDriverId: null,
  selectedTeamData: null,
  selectedDriverData: null,
};

const teamSelectionSlice = createSlice({
  name: 'teamSelection',
  initialState,
  reducers: {
    setSelectedTeamId(state, action: PayloadAction<string | null>) {
      state.selectedTeamId = action.payload;
    },
    setSelectedDriverId(state, action: PayloadAction<string | null>) {
      state.selectedDriverId = action.payload;
    },
    setSelectedTeamData(state, action: PayloadAction<Team | null>) {
      state.selectedTeamData = action.payload;
    },
    setSelectedDriverData(state, action: PayloadAction<Driver | null>) {
      state.selectedDriverData = action.payload;
    },
    clearTeamSelection(state) {
      state.selectedTeamId = null;
      state.selectedDriverId = null;
      state.selectedTeamData = null;
      state.selectedDriverData = null;
    },
  },
});

export const {
  setSelectedTeamId,
  setSelectedDriverId,
  setSelectedTeamData,
  setSelectedDriverData,
  clearTeamSelection,
} = teamSelectionSlice.actions;

export default teamSelectionSlice.reducer;