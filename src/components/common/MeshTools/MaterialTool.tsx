import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Scene } from 'three';
import { Typography, Grid } from '@mui/material';
import { ToolPopupContainer, ToolHeader, ToolTitle, CloseButton, ToolContent, ButtonsContainer, ActionButton } from './MeshTools.styles';
import CloseIcon from '@mui/icons-material/Close';
import StyleIcon from '@mui/icons-material/Style';
import { MaterialPreview, MaterialOption } from './MeshTools.styles';
import useDraggable from '@/hooks/useDraggable';

interface MaterialToolProps {
  sceneRef?: Scene | null;
}

const materials = [
  { id: 'standard', name: 'Standard', preview: '#888888' },
  { id: 'metallic', name: 'Metallic', preview: '#a0a0a0' },
  { id: 'matte', name: 'Matte', preview: '#505050' },
  { id: 'glossy', name: 'Glossy', preview: '#c0c0c0' }
];

const MaterialTool: React.FC<MaterialToolProps> = ({ }) => {
  const dispatch = useDispatch();
  const { position, meshId } = useSelector((state: any) => state.meshTools.materialTool);
  const [selectedMaterial, setSelectedMaterial] = useState('');

  // Use draggable hook
  const { elementRef, position: dragPosition } = useDraggable({
    id: meshId || 'material-tool',
    initialPosition: position,
    handle: '.popover-header',
    bounds: 'window',
    disabled: false,
  });

  const handleClose = () => {
    dispatch({ type: 'meshTools/hideMaterialTool' });
  };

  const handleApplyMaterial = () => {
    // Implement material application logic here
    handleClose();
  };

  if (!dragPosition) return null;

  return (
    <ToolPopupContainer
      ref={elementRef}
      style={{
        left: dragPosition.x,
        top: dragPosition.y,
        position: 'absolute',
      }}
    >
      <ToolHeader className="popover-header">
        <ToolTitle>
          <StyleIcon fontSize="small" />
          Change Material
        </ToolTitle>
        <CloseButton onClick={handleClose}>
          <CloseIcon fontSize="small" />
        </CloseButton>
      </ToolHeader>

      <ToolContent>
        <Grid container spacing={2}>
          {materials.map((material) => (
            <Grid key={material.id}>
              <MaterialOption 
                isSelected={selectedMaterial === material.id}
                onClick={() => setSelectedMaterial(material.id)}
              >
                <MaterialPreview style={{ backgroundColor: material.preview }} />
                <Typography variant="caption">{material.name}</Typography>
              </MaterialOption>
            </Grid>
          ))}
        </Grid>

        <ButtonsContainer>
          <ActionButton onClick={handleClose}>Cancel</ActionButton>
          <ActionButton 
            primary 
            onClick={handleApplyMaterial}
            disabled={!selectedMaterial}
          >
            Apply Material
          </ActionButton>
        </ButtonsContainer>
      </ToolContent>
    </ToolPopupContainer>
  );
};

export default MaterialTool;
