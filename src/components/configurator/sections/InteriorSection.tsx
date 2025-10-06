import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setSelectedInterior } from '../../../store/actions/configuratorSlice';
import { Box, Typography, Paper } from '@mui/material';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';

// Interior options
const interiors = [
  { id: 'standard', name: 'Standard Interior', description: 'Comfortable and practical.', price: 0 },
  { id: 'premium', name: 'Premium Interior', description: 'Luxury materials and finish.', price: 3500 },
  { id: 'racing', name: 'Racing Interior', description: 'Performance-focused with racing seats.', price: 5000 },
  { id: 'luxury', name: 'Luxury Package', description: 'Premium leather with ambient lighting.', price: 7500 },
];

const InteriorSection: React.FC = () => {
  const dispatch = useDispatch();
  const selectedInterior = useSelector((state: RootState) => state.configurator.selectedInterior);
  
  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Choose the interior that provides the comfort and style you desire for your racing experience.
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {interiors.map((interior) => (
          <Paper 
            key={interior.id} 
            sx={{ 
              p: 2, 
              bgcolor: '#444',
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              border: selectedInterior === interior.id ? '2px solid white' : 'none',
              '&:hover': { bgcolor: '#555' }
            }}
            onClick={() => dispatch(setSelectedInterior(interior.id))}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: '50%', 
                bgcolor: '#555', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mr: 2
              }}>
                <AirlineSeatReclineNormalIcon />
              </Box>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{interior.name}</Typography>
                <Typography variant="body2" sx={{ color: '#bbb' }}>{interior.description}</Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography>
                {interior.price === 0 ? '+$0' : `+$${interior.price.toLocaleString()}`}
              </Typography>
              <Typography variant="caption" sx={{ color: '#bbb' }}>includes tax</Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default InteriorSection; 