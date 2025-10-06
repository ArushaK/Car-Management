import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setViewMode, setDriverRotationMode } from '@/store/actions/cameraViewSlice';
import { Tooltip, Zoom, Fade } from '@mui/material';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import * as S from './ViewSwitcher.styles';

const ViewSwitcher: React.FC = () => {
  const dispatch = useDispatch();
  const viewMode = useSelector((state: RootState) => state.cameraView.viewMode);
  const isDriverRotationMode = useSelector((state: RootState) => state.cameraView.isDriverRotationMode);
  
  return (
    <Fade in={true}>
      <S.ViewSwitcherContainer>
        <Tooltip title="Regular View" placement="bottom" slots={{transition : Zoom}}>
          <S.ViewButton 
            isActive={viewMode === 'regular' && !isDriverRotationMode}
            onClick={() => !isDriverRotationMode && dispatch(setViewMode('regular'))}
            aria-label="Regular view"
            disabled={isDriverRotationMode}
            style={{ opacity: isDriverRotationMode ? 0.5 : 1 }}
          >
            <ViewInArIcon />
          </S.ViewButton>
        </Tooltip>
        
        <Tooltip title="Driver Cam" placement="bottom" slots={{ transition: Zoom }}>
          <S.ViewButton 
            isActive={viewMode === 'driver' && !isDriverRotationMode}
            onClick={() => !isDriverRotationMode && dispatch(setViewMode('driver'))}
            aria-label="Driver Cam"
            disabled={isDriverRotationMode}
            style={{ opacity: isDriverRotationMode ? 0.5 : 1 }}
          >
            <DriveEtaIcon />
          </S.ViewButton>
        </Tooltip>

        <Tooltip title="Driver Rotation" placement="bottom" slots={{ transition: Zoom }}>
          <S.ViewButton 
            isActive={isDriverRotationMode}
            onClick={() => dispatch(setDriverRotationMode(!isDriverRotationMode))}
            aria-label="Driver Rotation"
          >
            <RotateRightIcon />
          </S.ViewButton>
        </Tooltip>
      </S.ViewSwitcherContainer>
    </Fade>
  );
};

export default ViewSwitcher; 