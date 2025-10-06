import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { AppDispatch } from '@/store';
import { updateScale, hideTools, applyChanges, applyScaleChanges } from '@/store/actions/decalToolsSlice';
import * as S from './DecalTools.styles';
import CloseIcon from '@mui/icons-material/Close';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import { Scene } from 'three';
import { clearSelectedObject } from '@/store/actions/selectionSlice';

interface ResizeToolProps {
  className?: string;
  sceneRef?: Scene | null;
}

const ResizeTool: React.FC<ResizeToolProps> = ({ className, sceneRef }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { scale, position } = useSelector((state: RootState) => state.decalTools);
  const [localScale, setLocalScale] = useState({ x: scale.x, y: scale.y, z: scale.z || scale.x });
  const [uniformScale, setUniformScale] = useState<string | number>(scale.x);

  useEffect(() => {
    setLocalScale(scale);
    setUniformScale(scale.x);
  }, [scale]);

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty value for backspace
    if (value === '') {
      setUniformScale('');
      return;
    }
    
    const newScaleValue = parseFloat(value);
    if (isNaN(newScaleValue)) return;

    setUniformScale(newScaleValue);
    setLocalScale({
      x: newScaleValue,
      y: newScaleValue,
      z: newScaleValue
    });
  };

  const handleInputBlur = () => {
    // If empty value, set to default scale of 1
    if (uniformScale === '') {
      const defaultScale = { x: 1, y: 1, z: 1 };
      setLocalScale(defaultScale);
      setUniformScale(1);
      dispatch(updateScale(defaultScale));
    } else {
      dispatch(updateScale(localScale));
    }
  };

  const handleReset = () => {
    const resetScale = { x: 1, y: 1, z: 1 };
    setLocalScale(resetScale);
    setUniformScale(1);
    dispatch(updateScale(resetScale));
    
    // Apply the changes immediately when Reset is clicked
    if (sceneRef) {
      dispatch(applyScaleChanges(sceneRef));
      
      // Clear the selection
      dispatch(clearSelectedObject());
      dispatch(hideTools());
    }
  };

  const handleCancel = () => {
    dispatch(hideTools());
  };

  const handleApply = () => {
    // If empty value, set to default scale of 1
    if (uniformScale === '') {
      const defaultScale = { x: 1, y: 1, z: 1 };
      setLocalScale(defaultScale);
      setUniformScale(1);
      dispatch(updateScale(defaultScale));
    }
    
    if (sceneRef) {
      dispatch(applyScaleChanges(sceneRef));
    }
    dispatch(clearSelectedObject());
    dispatch(applyChanges());
  };

  if (!position) return null;

  return (
    <S.ToolPopupContainer
      className={className}
      style={{
        left: position.x,
        top: position.y + 10,
      }}
    >
      <S.ToolHeader>
        <S.ToolTitle>
          <OpenWithIcon fontSize="small" />
          Resize Logo
        </S.ToolTitle>
        <S.CloseButton onClick={handleCancel}>
          <CloseIcon fontSize="small" />
        </S.CloseButton>
      </S.ToolHeader>

      <S.ToolContent>
        <S.SliderContainer>
          <S.SliderRow>
            <S.SliderLabel>Scale</S.SliderLabel>
            <S.SliderControl>
              <S.ValueInput
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={uniformScale}
                onChange={handleScaleChange}
                onBlur={handleInputBlur}
              />
            </S.SliderControl>
          </S.SliderRow>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center',
            margin: '12px 0'
          }}>
            <S.ResetButton onClick={handleReset}>
              {/* <RestartAltIcon fontSize="small" style={{ marginRight: 4 }} /> */}
              Reset to 1:1
            </S.ResetButton>
          </div>
        </S.SliderContainer>

        <S.ButtonsContainer>
          <S.ActionButton onClick={handleCancel}>Cancel</S.ActionButton>
          <S.ActionButton primary onClick={handleApply}>Apply</S.ActionButton>
        </S.ButtonsContainer>
      </S.ToolContent>
    </S.ToolPopupContainer>
  );
};

export default ResizeTool;
