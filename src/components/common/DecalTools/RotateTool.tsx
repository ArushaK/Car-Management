import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { AppDispatch } from '@/store';
import { updateRotation, hideTools, applyChanges, applyRotationChanges } from '@/store/actions/decalToolsSlice';
import * as S from './DecalTools.styles';
import CloseIcon from '@mui/icons-material/Close';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import { Scene } from 'three';
import { clearSelectedObject } from '@/store/actions/selectionSlice';

interface RotateToolProps {
  className?: string;
  sceneRef?: Scene | null;
}

const RotateTool: React.FC<RotateToolProps> = ({ className, sceneRef }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { rotation, position, targetDecalId } = useSelector((state: RootState) => state.decalTools);
  const selection = useSelector((state: RootState) => state.selection);
  const [localRotation, setLocalRotation] = useState<number | string>(rotation);

  useEffect(() => {
    setLocalRotation(rotation);
  }, [rotation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty value for backspace
    if (value === '') {
      setLocalRotation('');
      return;
    }
    const newRotation = parseFloat(value);
    
    if (!isNaN(newRotation)) {
      setLocalRotation(newRotation);
      dispatch(updateRotation(newRotation));
    }
  };

  const handleCancel = () => {
    dispatch(hideTools());
  };

  const handleApply = () => {
    // Use the selection.uuid if available, otherwise use targetDecalId
    const uuid = selection?.uuid || targetDecalId;
    
    if (uuid && sceneRef) {
      // Use the new thunk action for rotation
      dispatch(applyRotationChanges({ scene: sceneRef, uuid }))
        .then(() => {
          // Clear selection and hide tools after successful update
          dispatch(clearSelectedObject());
          dispatch(hideTools());
        });
    } else {
      dispatch(applyChanges());
    }
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
          <RotateRightIcon fontSize="small" />
          Rotate Logo
        </S.ToolTitle>
        <S.CloseButton onClick={handleCancel}>
          <CloseIcon fontSize="small" />
        </S.CloseButton>
      </S.ToolHeader>

      <S.ToolContent>
        <S.SliderContainer>
          <S.SliderRow>
            <S.SliderLabel>Angle</S.SliderLabel>
            <S.SliderControl>
              <S.ValueInput
                type="number"
                min="0"
                max="360"
                value={localRotation}
                onChange={handleInputChange}
                style={{ width: '80px' }} // Adjust width to suit 5-digit input
              />
            </S.SliderControl>
          </S.SliderRow>
        </S.SliderContainer>

        <S.ButtonsContainer>
          <S.ActionButton onClick={handleCancel}>Cancel</S.ActionButton>
          <S.ActionButton primary onClick={handleApply}>Apply</S.ActionButton>
        </S.ButtonsContainer>
      </S.ToolContent>
    </S.ToolPopupContainer>
  );
};

export default RotateTool;
