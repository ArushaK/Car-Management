import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import RotateTool from './RotateTool';
import ResizeTool from './ResizeTool';
import { Scene } from 'three';

const DecalToolsContainer: React.FC<{ sceneRef?: Scene | null }> = ({sceneRef}) => {
  const { isRotateToolOpen, isResizeToolOpen } = useSelector(
    (state: RootState) => state.decalTools
  );

  return (
    <>
      {isRotateToolOpen && <RotateTool sceneRef={sceneRef}/>}
      {isResizeToolOpen && <ResizeTool sceneRef={sceneRef}/>}
    </>
  );
};

export default DecalToolsContainer;
