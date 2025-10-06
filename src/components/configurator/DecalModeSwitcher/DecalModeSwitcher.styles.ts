import styled from '@emotion/styled';
import { Box, IconButton } from '@mui/material';

export const DecalSwitcherContainer = styled(Box)`
  /* Remove fixed positioning for dynamic placement */
  display: flex;
  flex-direction: column;
  z-index: 60;
  background-color: rgba(28, 28, 30, 0.75);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 6px 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

export const SwitcherSection = styled(Box)`
  display: flex;
  flex-direction: column;
`;

export const ButtonGroup = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SectionTitle = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export const DecalButton = styled(IconButton)<{ isActive?: boolean; color?: string }>`
  background: ${props =>
    props.isActive
      ? 'rgba(144, 202, 249, 0.18)'
      : props.color === 'error'
      ? 'rgba(244, 67, 54, 0.1)'
      : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => (props.isActive ? '#42a5f5' : props.color === 'error' ? '#f44336' : 'white')};
  padding: 8px;
  border: none;
  position: relative;
  transition: background 0.2s;

  &:hover {
    background: ${props => {
      if (props.isActive) return 'rgba(144, 202, 249, 0.28)';
      if (props.color === 'error') return 'rgba(244, 67, 54, 0.2)';
      return 'rgba(255, 255, 255, 0.1)';
    }};
  }
`;

export const Separator = styled('div')`
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.12);
  margin: 0 4px;
  border-radius: 1px;
`;

export const DragHandle = styled('div')<{
  isInEditMode: boolean;
}>`
  cursor: ${props => (props.isInEditMode ? 'grab' : 'default')};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  // margin-left: 4px;
  transition: background 0.2s;
`;
