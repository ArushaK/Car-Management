import React, { MouseEvent } from 'react';
import { Scene } from 'three';

import { ContextMenuOption } from './ContextMenu';

// Import Material UI icons
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import StyleIcon from '@mui/icons-material/Style';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

import { removeDecal } from '@/services/threeJS/decalService';

import store from '@/store';
import { showRotateTool, showResizeTool, startDragging } from '@/store/actions/decalToolsSlice';
import { showColorTool, showMaterialTool } from '@/store/actions/meshToolsSlice';
import { setRotateMode, setScaleMode } from '@/store/actions/configuratorSlice';
// Define handler functions for different context menu actions
export const contextMenuHandlers = {
  // Decal-specific actions
  removeDecal: (uuid: string | null, scene: Scene | null) => {
    if (!uuid || !scene) return;
    
    removeDecal(uuid, scene);
  },

  rotateDecal: (uuid: string | null, event: MouseEvent | null) => {
    if (!uuid) return;
    if (event) {
      const { clientX, clientY } = event;
      store.dispatch(showRotateTool({ position: { x: clientX, y: clientY }, decalId: uuid }));
    }    
    // Implement your decal editing logic here
    // e.g., dispatch(openDecalEditor(uuid))
  },

  resizeDecal: (uuid: string | null, event: MouseEvent | null) => {
    if (!uuid || !event) return;
    const { clientX, clientY } = event;

    store.dispatch(showResizeTool({ 
      position: { x: clientX, y: clientY },
      decalId: uuid
    }));
  },

    dragAndMoveDecal: (uuid: string | null) => {
    if (!uuid) return;
    store.dispatch(startDragging({ decalId: uuid }));
  },

  // Mesh-specific actions
  changeMaterialColor: (uuid: string | null, event: MouseEvent | null) => {
    if (!uuid || !event) return;
    const { clientX, clientY } = event;
    store.dispatch(showColorTool({ 
      position: { x: clientX, y: clientY },
      meshId: uuid
    }));
  },

  changeMaterial: (uuid: string | null, event: MouseEvent | null) => {
    if (!uuid || !event) return;
    const { clientX, clientY } = event;
    store.dispatch(showMaterialTool({ 
      position: { x: clientX, y: clientY },
      meshId: uuid
    }));
  },

  // General actions
  inspectObject: (uuid: string | null) => {
    if (!uuid) return;
    console.log(`Inspecting object with uuid: ${uuid}`);
    // Implement your inspection logic here
    // e.g., dispatch(showObjectDetails(uuid))
  },
};

// Define context menu options
// Icons as Material UI components
const icons: Record<string, React.ReactNode> = {
  remove: <DeleteOutlineIcon fontSize="small" />,
  rotate: <RotateRightIcon fontSize="small" />,
  resize: <OpenWithIcon fontSize="small" />,
  drag: <DragIndicatorIcon fontSize="small" />,
  color: <ColorLensIcon fontSize="small" />,
  material: <StyleIcon fontSize="small" />,
  inspect: <VisibilityIcon fontSize="small" />,
};

export const getContextMenuOptions = (
  selectedUuid: string | null,
  scene: Scene | null,
  event: MouseEvent | null,
): ContextMenuOption[] => [
  // Decal options
  {
    id: 'remove-decal',
    label: 'Remove Logo',
    icon: icons.remove,
    shortcut: 'Del',
    action: () => contextMenuHandlers.removeDecal(selectedUuid, scene),
    isVisible: (type) => type === 'decal' || type === 'numberDecal',
  },
  {
    id: 'drag-and-move-decal',
    label: 'Drag and Move',
    icon: icons.drag,
    shortcut: 'D',
    action: () => contextMenuHandlers.dragAndMoveDecal(selectedUuid),
    isVisible: (type) => type === 'decal',
  },
  {
    id: 'rotate-decal',
    label: 'Rotate Logo',
    icon: icons.rotate,
    shortcut: 'R',
    action: () => contextMenuHandlers.rotateDecal(selectedUuid, event),
    isVisible: (type) => type === 'decal' || type === 'numberDecal',
  },
  {
    id: 'resize-decal',
    label: 'Resize Logo',
    icon: icons.resize,
    shortcut: 'S',
    action: () => contextMenuHandlers.resizeDecal(selectedUuid, event),
    isVisible: (type) => type === 'decal',
  },
  
  // Mesh options
  {
    id: 'change-color',
    label: 'Change Color',
    icon: icons.color,
    shortcut: 'C',
    action: () => contextMenuHandlers.changeMaterialColor(selectedUuid, event),
    isVisible: (type) => type === 'mesh',
  },
  {
    id: 'change-material',
    label: 'Change Material',
    icon: icons.material,
    shortcut: 'M',
    action: () => contextMenuHandlers.changeMaterial(selectedUuid, event),
    // isVisible: (type) => type === 'mesh',
    isVisible: () => false, //temperorly disabled
  },
  
  // General options available for all object types
  // {
  //   id: 'inspect',
  //   label: 'Inspect Object',
  //   icon: icons.inspect,
  //   shortcut: 'I',
  //   action: () => contextMenuHandlers.inspectObject(selectedUuid),
  //   isVisible: () => true, // Available for all types
  // },
];
