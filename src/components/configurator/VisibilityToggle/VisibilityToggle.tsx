import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tooltip, Zoom, Fade, Box, IconButton } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { styled } from '@mui/material/styles';
import { RootState } from '@/store';
import { setVisibilityMode } from '@/store/actions/visibilitySlice';

const ViewSwitcherContainer = styled(Box)`
  position: fixed;
  top: 84px;
  right: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  z-index: 60;
  background-color: rgba(28, 28, 30, 0.75);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 6px 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const ViewButton = styled(IconButton)<{ isActive: boolean }>`
  background-color: ${props => props.isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  color: white;
  padding: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)'};
  }

  &:disabled {
    pointer-events: none;
  }
`;

const VisibilityToggle: React.FC = () => {
  const dispatch = useDispatch();
  const visibilityMode = useSelector((state: RootState) => state.visibility.mode);

  return (
    <Fade in={true}>
      <ViewSwitcherContainer>
        <Tooltip title="Show Car Only" placement="bottom" slots={{transition: Zoom}}>
          <ViewButton 
            isActive={visibilityMode === 'car'}
            onClick={() => dispatch(setVisibilityMode('car'))}
            aria-label="Show car only"
          >
            <DirectionsCarIcon />
          </ViewButton>
        </Tooltip>

        <Tooltip title="Show Driver Only" placement="bottom" slots={{transition: Zoom}}>
          <ViewButton 
            isActive={visibilityMode === 'driver'}
            onClick={() => dispatch(setVisibilityMode('driver'))}
            aria-label="Show driver only"
          >
            <PersonIcon />
          </ViewButton>
        </Tooltip>

        <Tooltip title="Show Both" placement="bottom" slots={{transition: Zoom}}>
          <ViewButton 
            isActive={visibilityMode === 'both'}
            onClick={() => dispatch(setVisibilityMode('both'))}
            aria-label="Show both car and driver"
          >
            <CompareArrowsIcon />
          </ViewButton>
        </Tooltip>
      </ViewSwitcherContainer>
    </Fade>
  );
};

export default VisibilityToggle; 