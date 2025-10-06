import styled from '@emotion/styled';
import { Button } from '@mui/material';

export const ConfiguratorContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  position: relative;
`;

export const CanvasWrapper = styled.div`
  flex: 1;
  position: relative;
  background-color: #ffffff;
  
  // Ensure the Canvas has a higher z-index
  & > canvas {
    position: relative;
    z-index: 1;
  }
  
  @media (max-width: 768px) {
    height: 100%;
    width: 100%;
  }
`;

export const ApprovalButton = styled(Button)(() => ({
  backgroundColor: 'rgba(28, 28, 30, 0.75)', // common background color
  color: '#fff',
  padding: '10px 20px',
  borderRadius: '5px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  transition: 'all 0.2s ease',
}));

export const ApprovalButtonContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  justify-content: flex-end;
  padding: 8px;
  
  & > button {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
    }
  }
  
  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
  }
`;