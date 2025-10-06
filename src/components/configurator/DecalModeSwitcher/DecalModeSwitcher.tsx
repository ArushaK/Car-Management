import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setEditMode, setRotateMode, setScaleMode } from '@/store/actions/configuratorSlice';
import { Tooltip, Zoom, Fade } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Scene } from 'three';
import { FaSyncAlt, FaExpandArrowsAlt } from 'react-icons/fa';
import useDraggable from '@/hooks/useDraggable';

import * as S from './DecalModeSwitcher.styles';
import { startDragging } from '@/store/actions/decalToolsSlice';

interface DecalModeSwitcherProps {
  sceneRef?: Scene | null;
}

type mode = 'rotate' | 'scale' | 'move'

const DecalModeSwitcher: React.FC<DecalModeSwitcherProps> = ({ sceneRef }) => {
  const dispatch = useDispatch();
  const [mode, setMode] = useState<mode>('scale');
  const { isInEditMode } = useSelector((state: RootState) => state.configurator);
  const selection = useSelector((state: RootState) => state.selection);

  // Use the screen position from selection state
  const screenPosition = selection.screenPosition;

  // Use draggable only in edit mode
  const { elementRef, position, setPosition } = useDraggable({
    id: 'decal-mode-switcher',
    initialPosition: screenPosition || { x: 100, y: 100 },
    disabled: !isInEditMode,
    bounds: 'window',
    handle: '.decal-switcher-drag-handle'
  });

  // Only show for decal selections
  if (!selection.uuid || selection.type !== 'decal' || !isInEditMode) {
    return null;
  }

  // Style for fixed positioning
  const containerStyle = screenPosition
    ? {
        position: 'fixed' as const,
        left: screenPosition.x,
        top: screenPosition.y,
        zIndex: 1000
      }
    : undefined;

  const enableMode = (mode: 'rotate' | 'scale' | 'move') => {
    setMode(mode);
    dispatch(setScaleMode(mode === 'scale'));
    dispatch(setRotateMode(mode === 'rotate'));

    // Update cursor style based on mode
    const canvas = document.querySelector('canvas');
    if (canvas) {
      if (mode === 'scale') {
        canvas.style.cursor = 'nwse-resize';
      } else if (mode === 'rotate') {
        canvas.style.cursor = 'grab';
      } else if (mode === 'move') {
        canvas.style.cursor = 'move';
      }
    }

    if (mode === 'move') {
      if (!selection.uuid) return;
      dispatch(startDragging({ decalId: selection.uuid }));
      dispatch(setEditMode(false));
    }
  }

  const handleEditMode = () => {
    // Reset cursor style
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.style.cursor = 'default';
    }
    dispatch(setEditMode(false));
  };

  return (
    <Fade in={true}>
      <S.DecalSwitcherContainer ref={elementRef} style={containerStyle}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <S.DragHandle className="decal-switcher-drag-handle" isInEditMode={true}>
            <DragIndicatorIcon fontSize="small" sx={{ color: '#bbb' }} />
          </S.DragHandle>
          <S.SwitcherSection>
            <S.SectionTitle>Decal Options</S.SectionTitle>
            <S.ButtonGroup>
              <Tooltip title="Close Editor" placement="bottom" slots={{ transition: Zoom }}>
                <S.DecalButton
                  isActive={false}
                  onClick={handleEditMode}
                  aria-label="Close editor"
                >
                  <EditIcon />
                </S.DecalButton>
              </Tooltip>
              <S.Separator />
              <Tooltip title="Rotate Decal" placement="bottom" slots={{ transition: Zoom }}>
                <S.DecalButton isActive={mode === 'rotate'} aria-label="Rotate decal" onClick={() => enableMode('rotate')}>
                  <FaSyncAlt size={18} />
                </S.DecalButton>
              </Tooltip>
              <Tooltip title="Scale Decal" placement="bottom" slots={{ transition: Zoom }}>
                <S.DecalButton isActive={mode === 'scale'} aria-label="Scale decal" onClick={() => enableMode('scale')}>
                  <FaExpandArrowsAlt size={18} />
                </S.DecalButton>
              </Tooltip>
              <Tooltip title="Move Decal" placement="bottom" slots={{ transition: Zoom }}>
                <S.DecalButton isActive={false} aria-label="Move decal" onClick={() => enableMode('move')}>
                  <OpenWithIcon fontSize="small" />
                </S.DecalButton>
              </Tooltip>
            </S.ButtonGroup>
          </S.SwitcherSection>
        </div>
      </S.DecalSwitcherContainer>
    </Fade>
  );
};

export default DecalModeSwitcher;
