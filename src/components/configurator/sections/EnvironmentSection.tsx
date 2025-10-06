import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setSelectedEnvironment, setSelectedNascarTrack, setEnvironmentMode } from '../../../store/actions/configuratorSlice';
import { Box, Typography, MenuItem, Select, FormControl, InputLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import SportsMotorsportsIcon from '@mui/icons-material/SportsMotorsports';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Tooltip from '@mui/material/Tooltip';
import tracks from '@/utils/staticData/CarTracks.json';
import type { SelectChangeEvent } from '@mui/material/Select';

const EnvironmentSection: React.FC = () => {
  const dispatch = useDispatch();
  const selectedNascarTrack = useSelector((state: RootState) => state.configurator.selectedNascarTrack);
  const environmentMode = useSelector((state: RootState) => state.configurator.environmentMode);

  // Handler for selecting a NASCAR track
  const handleTrackSelect = (event: SelectChangeEvent<string>) => {
    const track = event.target.value as string;
    dispatch(setSelectedNascarTrack(track));
    dispatch(setSelectedEnvironment('racetrack'));
  };

  // Set first track as default when switching to nascar mode
  useEffect(() => {
    if (environmentMode === 'nascar' && (!selectedNascarTrack || selectedNascarTrack === '')) {
      if (tracks.length > 0) {
        dispatch(setSelectedNascarTrack(tracks[0].name));
        dispatch(setSelectedEnvironment('racetrack'));
      }
    }
  }, [environmentMode, selectedNascarTrack ]);

  // Handler for radio button change
  const handleEnvironmentModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value as "standard" | "nascar";
      dispatch(setEnvironmentMode(value));
    if (value === 'standard') {
      dispatch(setSelectedEnvironment(null));
    } else if (value === 'nascar') {
      dispatch(setSelectedEnvironment('racetrack'));
    }
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Choose the environment to visualize your car in different settings.
      </Typography>

      <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
        <RadioGroup
          row
          name="environment-mode"
          value={environmentMode}
          onChange={handleEnvironmentModeChange}
        >
          <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
            <Tooltip title="Default lighting and environment" arrow>
              <FormControlLabel
                value="standard"
                control={<Radio />}
                sx={{ flex: 1, m: 0, p: 0 }}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RestartAltIcon />
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>Standard</Typography>
                  </Box>
                }
              />
            </Tooltip>
            <Tooltip title="Select from all NASCAR tracks" arrow>
              <FormControlLabel
                value="nascar"
                control={<Radio />}
                sx={{ flex: 1, m: 0, p: 0 }}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SportsMotorsportsIcon />
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>NASCAR Track</Typography>
                  </Box>
                }
              />
            </Tooltip>
          </Box>
        </RadioGroup>
      </FormControl>

      {environmentMode === 'nascar' && (
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="nascar-track-select-label">Select Track</InputLabel>
          <Select
            labelId="nascar-track-select-label"
            value={selectedNascarTrack || ''}
            label="Select Track"
            onChange={handleTrackSelect}
          >
            {tracks.map((track: any) => (
              <MenuItem key={track.name} value={track.name}>
                {track.name} {track.city ? `(${track.city}, ${track.state})` : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );
};

export default EnvironmentSection;