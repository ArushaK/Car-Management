import styled from '@emotion/styled';

export const ContextMenuContainer = styled.div`
  position: fixed;
  width: 220px;
  background-color: rgba(30, 30, 30, 0.85); /* Dark semi-transparent background */
  backdrop-filter: blur(5px); /* Creates a frosted glass effect */
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
  z-index: 1000;
  overflow: hidden;
  font-family: sans-serif;
  border: 1px solid rgba(100, 100, 100, 0.2); /* Subtle border */
  animation: fadeIn 0.15s ease-in-out;
  color: #e0e0e0; /* Light text for dark background */
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

export const ContextMenuTitle = styled.div`
  padding: 12px 16px;
  font-weight: 600;
  color: #ffffff;
  background-color: rgba(50, 50, 50, 0.7); /* Slightly lighter than container */
  font-size: 14px;
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  border-bottom: 1px solid rgba(100, 100, 100, 0.3);
`;

export const ContextMenuType = styled.span`
  font-size: 12px;
  color: #9e9e9e; /* Muted gray text */
  font-weight: normal;
  margin-top: 2px;
  text-transform: capitalize;
`;

export const ContextMenuDivider = styled.div`
  height: 1px;
  background-color: rgba(100, 100, 100, 0.3);
  margin: 0;
`;

export const ContextMenuItem = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  text-align: left;
  font-size: 13px;
  color: ${props => props.disabled ? 'rgba(150, 150, 150, 0.5)' : '#e0e0e0'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.disabled ? 'transparent' : 'rgba(80, 80, 80, 0.7)'};
    color: ${props => props.disabled ? 'rgba(150, 150, 150, 0.5)' : '#ffffff'};
  }
`;

export const ContextMenuItemIcon = styled.span`
  display: flex;
  align-items: center;
  margin-right: 10px;
  color: #9e9e9e;
  font-size: 16px;
`;

export const ContextMenuShortcut = styled.span`
  margin-left: auto;
  color: #757575;
  font-size: 11px;
  padding-left: 10px;
  font-family: monospace;
  letter-spacing: 0.5px;
`;
