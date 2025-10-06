import * as S from './Configurator.styles';
import { useGLTF } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedModel } from '@/store/actions/configuratorSlice';
import { setManufacturer } from '@/store/actions/carColorSlice';
import { RootState } from '@/store';

// Project components
import Canvas from './Canvas';
import CarModel from './CarModel';
import DriverModel from './DriverModel/DriverModel';
import PopupManager from './PopupManager';
import FloatingButtons from './FloatingButtons';
import ViewSwitcher from './ViewSwitcher';
import TeamInfo from './TeamInfo/TeamInfo';
import DecalToolsContainer from '../common/DecalTools/DecalToolsContainer';
import MeshToolsContainer from '../common/MeshTools/MeshToolsContainer';
import DecalModeSwitcher from './DecalModeSwitcher';
import { useState } from 'react';
import { Scene } from 'three';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import carModel from '/assets/models/toyota_supra.glb'
import racer from '/assets/models/racer.glb'
import VisibilityToggle from './VisibilityToggle/VisibilityToggle';

// ✅ Preload the models early
useGLTF.preload(carModel);
useGLTF.preload(racer);

/**
 * Configurator component renders a 3D scene with a car model.
 * Shows a loading animation while the model is loading.
 *
 * @component
 * @returns {JSX.Element} The rendered 3D scene with a car model.
 */
const Configurator = () => {
  const [sceneRef, setSceneRef] = useState<Scene | null>(null);
  const teamData = useSelector((state: RootState) => state.teamSelection.selectedTeamData);
  const driverData = useSelector((state: RootState) => state.teamSelection.selectedDriverData);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!teamData || !driverData) {
      navigate('/select-team');
      return;
    }
    // Set the initial car model based on manufacturer
    if (teamData.manufacturer) {
      dispatch(setSelectedModel(teamData.manufacturer.name.toLowerCase()));
      dispatch(setManufacturer(teamData.manufacturer.name));
    }
  }, [teamData, driverData, dispatch, navigate]);

  const handleNavigateToApproval = () => {
    navigate('/approval');
  };

  // If no team/driver data, don't render configurator
  if (!teamData || !driverData) {
    return null;
  }

  return (
    <>
      <S.ConfiguratorContainer>
        <S.CanvasWrapper>
          <Canvas
            sceneRef={sceneRef}
            setSceneRef={setSceneRef}
            >
            <CarModel
              modelPath={carModel}
              // scale={0.03}
            />
            <DriverModel
              modelPath={racer}
              position={[2, 0, 0]} // Position the driver next to the car
              // scale={0.03}
            />
          </Canvas>
        </S.CanvasWrapper>
      </S.ConfiguratorContainer>
      <TeamInfo teamData={teamData} driverData={driverData} />
      <FloatingButtons />
      <ViewSwitcher />
      <VisibilityToggle />
      <DecalModeSwitcher sceneRef={sceneRef} />
      <PopupManager sceneRef={sceneRef} />
      <DecalToolsContainer sceneRef={sceneRef} />
      <MeshToolsContainer sceneRef={sceneRef} />
      <S.ApprovalButtonContainer>
        <S.ApprovalButton
          variant="contained"
          startIcon={<AssignmentTurnedInIcon />}
          onClick={handleNavigateToApproval}
          size="medium"
        >
          View Approvals
        </S.ApprovalButton>
      </S.ApprovalButtonContainer>
    </>
  );
};

export default Configurator;