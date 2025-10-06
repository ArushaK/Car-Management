import styled from '@emotion/styled';
import { Box } from '@mui/material';

// Base container for tool popups
export const ToolPopupContainer = styled.div`
  position: absolute;
  width: 300px;
  background-color: #1a1a1a;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  color: white;
  overflow: hidden;
  animation: fadeIn 0.2s ease-out;
  border: 1px solid #383838;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// Header section of tools
export const ToolHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #2a2a2a;
  border-bottom: 1px solid #383838;
`;

// Tool title with icon
export const ToolTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Close button
export const CloseButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: white;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

// Content area
export const ToolContent = styled.div`
  padding: 16px;
`;

// Container for action buttons
export const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
`;

// Action button
export const ActionButton = styled.button<{ primary?: boolean }>`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  background-color: ${(props: { primary?: boolean }) => props.primary ? '#2196F3' : '#333'};
  color: ${(props: { primary?: boolean }) => props.primary ? 'white' : '#ddd'};
  opacity: ${(props: { disabled?: boolean }) => props.disabled ? '0.5' : '1'};
  cursor: ${(props: { disabled?: boolean }) => props.disabled ? 'not-allowed' : 'pointer'};
  
  &:hover {
    background-color: ${(props: { primary?: boolean }) => props.primary ? '#1976D2' : '#444'};
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

// Material preview box
export const MaterialPreview = styled.div`
  width: 100%;
  height: 64px;
  border-radius: 4px;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

// Material option container
export const MaterialOption = styled(Box)<{ isSelected?: boolean }>`
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  border: 2px solid ${props => props.isSelected ? '#2196F3' : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

// Color grid for preset/recent colors
export const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
`;

// Individual color swatch
export const ColorSwatch = styled.div<{ selected?: boolean; color: string }>`
  width: 100%;
  padding-bottom: 100%;
  position: relative;
  cursor: pointer;
  background-color: ${props => props.color || '#fff'};
  border-radius: 6px;
  border: ${props => props.selected ? '2px solid #fff' : '2px solid rgba(255,255,255,0.15)'};
  box-shadow: 0 1px 4px rgba(0,0,0,0.12);
  transition: transform 0.18s, border 0.18s;
  &:hover {
    transform: scale(1.08);
    border: 2px solid #2196F3;
    z-index: 1;
  }
`;

// Color preview box (for custom tab)
export const ColorPreview = styled.div<{ color: string }>`
  width: 44px;
  height: 44px;
  background-color: ${props => props.color};
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
  border: 2px solid rgba(255,255,255,0.18);
`;

// Input container for hex/rgb
export const InputRow = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.07);
  border-radius: 4px;
  padding: 4px 8px;
  margin-bottom: 4px;
`;

export const HexInput = styled.input<{ error?: boolean }>`
  width: 100%;
  border: none;
  outline: none;
  font-size: 13px;
  padding: 2px 3px;
  font-family: monospace;
  color: ${props => props.error ? '#ff4d4f' : 'rgba(255,255,255,0.92)'};
  background: transparent;
  transition: color 0.15s;

  &::placeholder {
    color: rgba(255,255,255,0.35);
  }
`;

export const RgbInput = styled.input`
  width: 100%;
  border: none;
  outline: none;
  font-size: 12px;
  padding: 1px 2px;
  color: rgba(255,255,255,0.92);
  background: transparent;
  font-family: monospace;
  transition: color 0.15s;

  &::placeholder {
    color: rgba(255,255,255,0.35);
  }

  /* Hide arrows for number input in Chrome, Safari, Edge, Opera */
  &[type='number']::-webkit-outer-spin-button,
  &[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Hide arrows for number input in Firefox */
  &[type='number'] {
    -moz-appearance: textfield;
  }
`;

// RGB input cell
export const RgbCell = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.07);
  border-radius: 4px;
  padding: 4px;
`;

// Color picker wrapper
export const PickerWrapper = styled.div`
  .react-colorful {
    width: 100% !important;
    height: 120px !important;
  }
  .react-colorful__saturation {
    border-radius: 8px;
    margin-bottom: 10px;
  }
  .react-colorful__hue {
    height: 12px;
    border-radius: 8px;
  }
  .react-colorful__pointer {
    width: 18px;
    height: 18px;
    border: 2px solid #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.18);
  }
`
