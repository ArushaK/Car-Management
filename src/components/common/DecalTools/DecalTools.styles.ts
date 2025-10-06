import styled from '@emotion/styled';

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

export const ToolHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #2a2a2a;
  border-bottom: 1px solid #383838;
`;

export const ToolTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

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

export const ToolContent = styled.div`
  padding: 16px;
`;

export const SliderContainer = styled.div`
  margin-bottom: 16px;
`;

export const SliderRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

export const SliderLabel = styled.label`
  width: 80px;
  font-size: 14px;
  color: #bbb;
`;

export const SliderControl = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const SliderInput = styled.input`
  flex: 1;
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: #444;
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #2196F3;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #2196F3;
    cursor: pointer;
    border: none;
  }
`;

export const ValueInput = styled.input`
  width: 50px;
  background-color: #333;
  border: 1px solid #444;
  color: white;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  text-align: center;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
`;

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
  
  &:hover {
    background-color: ${(props: { primary?: boolean }) => props.primary ? '#1976D2' : '#444'};
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

export const ResetButton = styled.button`
  background: none;
  border: none;
  color: #2196F3;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(33, 150, 243, 0.1);
  }
`;
