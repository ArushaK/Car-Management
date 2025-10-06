import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import ColorTool from './ColorTool';
import MaterialTool from './MaterialTool';
import { Scene } from 'three';

const MeshToolsContainer: React.FC<{ sceneRef: Scene | null }> = ({sceneRef}) => {
  const { isColorToolOpen, isMaterialToolOpen } = useSelector(
    (state: RootState) => state.meshTools
  );

  return (
    <>
      {isColorToolOpen && <ColorTool sceneRef={sceneRef}/>}
      {isMaterialToolOpen && <MaterialTool sceneRef={sceneRef}/>}
    </>
  );
};

export default MeshToolsContainer;
