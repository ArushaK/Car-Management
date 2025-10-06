import styled from '@emotion/styled';
import { Box, IconButton } from '@mui/material';

export const ViewSwitcherContainer = styled(Box)`
  position: fixed;
  top: 24px;
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

export const ViewButton = styled(IconButton)<{ isActive: boolean }>`
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