import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setSelectedModel } from '../../../store/actions/configuratorSlice';
import { Box, Typography, Paper } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

// Models data
const models = [
  { id: 'camaro', name: 'Chevrolet Camaro', variant: 'Standard', price: 0 },
  { id: 'corvette', name: 'Chevrolet Corvette', variant: 'Sport', price: 10000 },
];

const ModelSection: React.FC = () => {
  const dispatch = useDispatch();
  const selectedModel = useSelector((state: RootState) => state.configurator.selectedModel);
  
  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Choose the model that fits your racing style and preferences.
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {models.map((model) => (
          <Paper 
            key={model.id} 
            sx={{ 
              p: 2, 
              bgcolor: '#444',
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              border: selectedModel === model.id ? '2px solid white' : 'none',
              '&:hover': { bgcolor: '#555' },
            }}
            onClick={() => dispatch(setSelectedModel(model.id))}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DirectionsCarIcon sx={{ mr: 2 }} />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{model.name}</Typography>
                <Typography variant="body2" sx={{ color: '#bbb' }}>{model.variant}</Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6">
                {model.price === 0 ? '$0' : `$${model.price.toLocaleString()}`}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default ModelSection; 