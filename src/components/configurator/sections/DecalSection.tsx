import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setSelectedDecal, clearAllDecals } from '@store/actions/configuratorSlice';
import { Box, Typography, Paper, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import decals from '@utils/staticData/DecalsData.json'

const DecalSection = () => {
  const dispatch = useDispatch();
  const selectedDecal = useSelector((state: RootState) => state.configurator.selectedDecal);
  const [selectedSponsor, setSelectedSponsor] = useState<string>('All');

  // Extract unique sponsors from decals data
  const sponsors = useMemo(() => Array.from(new Set(decals.map((d: any) => d.sponsor))).filter(Boolean), []);

  const removeAllDecals = () => {
    dispatch(clearAllDecals());
  }

  const filteredDecals = selectedSponsor === 'All' ? decals : decals.filter(d => d.sponsor === selectedSponsor);

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Select a sponsor or manufacturer logo to apply to your vehicle. Click on the car to place the decal.
      </Typography>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
        <Button variant="outlined" onClick={removeAllDecals}>Clear all</Button>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="sponsor-filter-label">Filter by Sponsor</InputLabel>
          <Select
            labelId="sponsor-filter-label"
            value={selectedSponsor}
            label="Filter by Sponsor"
            onChange={e => setSelectedSponsor(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            {sponsors.map(sponsor => (
              <MenuItem key={sponsor} value={sponsor}>{sponsor}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filteredDecals.map((decal) => (
          <Paper 
            key={decal.id} 
            sx={{ 
              p: 2, 
              bgcolor: '#444',
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              border: selectedDecal?.id === decal.id ? '2px solid white' : 'none',
              '&:hover': { bgcolor: '#555' }
            }}
            onClick={() => dispatch(setSelectedDecal(decal))}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                width: decal.width, 
                height: 48, 
                borderRadius: '4px', 
                bgcolor: '#222', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mr: 2,
                overflow: 'hidden',
                position: 'relative'
              }}>
                <img 
                  src={decal.image} 
                  alt={decal.name}
                  style={{
                    objectFit: 'contain',
                    width: '100%',
                    height: '100%'
                  }}
                />
              </Box>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{decal.name}</Typography>
                <Typography variant="body2" sx={{ color: '#bbb' }}>{decal.description}</Typography>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default DecalSection;