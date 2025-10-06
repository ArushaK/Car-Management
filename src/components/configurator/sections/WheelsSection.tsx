import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setSelectedWheels } from '../../../store/actions/configuratorSlice';
import { Box, Typography, Paper, Button } from '@mui/material';
import wheels from '../../../utils/staticData/WheelsData.json';
import { WheelProps } from '@/utils/constants/WheelProps';
import { GiCarWheel } from 'react-icons/gi';

// Wheels data
// const wheels = [
//   { id: 'velocity', name: 'Velocity Treads', description: 'Rugged durability for any terrain.', price: 0 },
//   { id: 'turbodrive', name: 'TurboDrive Treads', description: 'Unmatched speed and traction.', price: 2500 },
//   { id: 'aerojet', name: 'AeroJet Wheels', description: 'Streamlined performance and style.', price: 1900 },
//   { id: 'titanforge', name: 'Titan Forge Rims', description: 'Premium alloy with aggressive styling.', price: 3200 },
// ];

const WheelsSection: React.FC = () => {
  const dispatch = useDispatch();
  const selectedWheels = useSelector((state: RootState) => state.configurator.selectedWheels);

  const setDefaultWheels = () => {
      dispatch(setSelectedWheels(null));
    }
  
  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 2 }}>
        The wheels you choose affect both the performance and appearance of your vehicle. Select the perfect set for your driving style.
      </Typography>

      {
        selectedWheels && <Typography variant="body2" sx={{ mb: 2 }}>
          <Button variant="outlined" onClick={setDefaultWheels}>Reset Default Wheels</Button>
        </Typography>
      }

      <Paper sx={{ bgcolor: '#555', p: 2, mb: 3 }}>
        <Typography variant="body2">
          The manufacturer supplies a set of winter and summer tires with every new car.
          The vehicle is delivered with the appropriate seasonal tires.
        </Typography>
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {wheels.map((wheel: WheelProps) => (
          <Paper
            key={wheel.id}
            sx={{
              p: 2,
              bgcolor: '#444',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              border: selectedWheels && selectedWheels.id === wheel.id ? '2px solid white' : 'none',
              '&:hover': { bgcolor: '#555' }
            }}
            onClick={() => dispatch(setSelectedWheels(wheel))}
          >
            <Box sx={{ display: 'flex' }}>
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
                <GiCarWheel />
              </Box>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{wheel.name}</Typography>
                <Typography variant="body2" sx={{ color: '#bbb' }}>{wheel.caption}</Typography>
                <Typography variant="body2" sx={{ color: '#bbb' }}>{wheel.finish_name}</Typography>
              </Box>
            </Box>
            {/* <Box sx={{ textAlign: 'right' }}>
              <Typography>
                {wheel.price === 0 ? '+$0' : `+$${wheel.price.toLocaleString()}`}
              </Typography>
              <Typography variant="caption" sx={{ color: '#bbb' }}>includes tax</Typography>
            </Box> */}
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default WheelsSection; 