import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { 
  setSelectedColor, 
  setSelectedWheels, 
  resetConfigurator,
  removePlacedDecal,
} from '../../../store/actions/configuratorSlice';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Grid,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Chip,
  Avatar
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SplitscreenIcon from '@mui/icons-material/Splitscreen';
import { GiCarWheel } from "react-icons/gi";
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import GroupsIcon from '@mui/icons-material/Groups';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { setCarColor, setDriverColor, setCarPaintFinish, DefaultColor, removeCarPartColor } from '@/store/actions/carColorSlice';
import { Scene } from 'three';
import { removeDecal } from '@/services/threeJS/decalService';
import { showNotification } from '@/store/actions/notificationSlice';
import { parseDecalName } from '@/utils/helpers/decalHelpers';
import { Team, Driver } from '../TeamInfo/types';
import { changeMeshColor } from '@/services/threeJS/meshService';

// Styled components
const SummaryContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const SectionHeading = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1.5),
}));

const SummaryItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: alpha('#333', 0.5),
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.2s ease',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  '&:hover': {
    backgroundColor: alpha('#383838', 0.6),
  }
}));

const ColorSwatch = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'colorHex'
})<{ colorHex: string }>(({ theme, colorHex }) => ({
  width: 36,
  height: 36,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: colorHex || '#ccc',
  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  border: colorHex === '#FFFFFF' || colorHex === '#FFF' || colorHex === '#ffffff' || colorHex === '#fff' 
    ? '1px solid #e0e0e0' 
    : 'none',
}));

const NoConfigurationAlert = styled(Alert)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.info.main, 0.1),
  color: theme.palette.info.light,
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));

const ActionButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1.5),
  paddingTop: theme.spacing(1.5),
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
}));

const ColorRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1, 0),
  borderBottom: '1px solid rgba(255,255,255,0.05)',
  '&:last-child': {
    borderBottom: 'none'
  }
}));

// Add a ColorSwatchComponent for car part colors
const ColorSwatchComponent = styled(Box)<{ colorHex: string }>(({ colorHex, theme }) => ({
  width: 32,
  height: 32,
  borderRadius: '50%',
  backgroundColor: colorHex,
  border: '2px solid #fff',
  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  display: 'inline-block',
}));

// Helper function to get color name from hex value - move this outside of the main component
const getColorName = (hex: string, availableColors: DefaultColor[]): string => {
  const color = availableColors.find(color => color.hex.toLowerCase() === hex?.toLowerCase());
  return color ? color.name : 'Custom Color';
};

const ColorSection = ({ 
  title, 
  color, 
  paintFinish, 
  onReset,
  availableColors 
}: { 
  title: string;
  color: string;
  paintFinish: string | null;
  onReset: () => void;
  availableColors: DefaultColor[];
}) => (
  <ColorRow>
    <ColorSwatch colorHex={color} />
    <Box sx={{ flex: 1 }}>
      <Typography variant="subtitle2">{title}</Typography>
      <Typography variant="body2" color="textSecondary">
        {getColorName(color, availableColors)}
      </Typography>
      {paintFinish && <Typography variant="body2" color="textSecondary">
        Finish: {paintFinish}
      </Typography>}
    </Box>
    <Tooltip title={`Reset ${title} Color`}>
      <IconButton onClick={onReset} size="small">
        <RefreshIcon />
      </IconButton>
    </Tooltip>
  </ColorRow>
);

// Styled Dialog components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: alpha('#000', 0.95), // Darker color, almost black
    backdropFilter: 'blur(10px)',
    borderRadius: theme.shape.borderRadius * 2,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  padding: theme.spacing(2.5, 3),
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(1.5, 3),
  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
}));

interface ConfigurationSummaryProps {
  sceneRef: Scene | null;
}

export interface configurationComment {
  stage: 'Team Owner' | 'Marketing Director' | 'Track Manager' | 'Sponsors' | 'NASCAR';
  status: 'pending' | 'approved' | 'rejected';
  comment: string;
  timestamp: number;
}

export interface SavedConfiguration {
  id: string;
  name: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
  approvalStage?: 'Team Owner' | 'Marketing Director' | 'Track Manager' | 'Sponsors' | 'NASCAR';
  comments?: configurationComment[];
  team: Team;
  driver: Driver;
  configuration: {
    carColor: string;
    driverColor: string;
    carPaintFinish: string;
    selectedWheels: any;
    placedDecals: any[];
    carPartColors?: any[]; // Add carPartColors to the saved configuration
  };
}

const ConfigurationSummarySection = ( { sceneRef }: ConfigurationSummaryProps ) => {
  const dispatch = useDispatch();
  const [openDialog, setOpenDialog] = useState(false);
  const [configName, setConfigName] = useState('');
  const [nameError, setNameError] = useState('');

  const teamData = useSelector((state: RootState) => state.teamSelection.selectedTeamData);
  const driverData = useSelector((state: RootState) => state.teamSelection.selectedDriverData);
  
  const { 
    selectedWheels,
    placedDecals
  } = useSelector((state: RootState) => state.configurator);
  const { 
    carColor, 
    driverColor, 
    carPaintFinish, 
    availableDefaultColors,
    carPartColors, // Add car part colors from Redux state
  } = useSelector((state: RootState) => state.carColor);

  const handleResetCarColor = () => {
    const color = availableDefaultColors[0];
    if (!color) return;
    dispatch(setCarColor(color.hex));
    dispatch(setCarPaintFinish('metallic'));
  };

  const handleResetDriverColor = () => {
    const color = availableDefaultColors[0];
    if (!color) return;
    dispatch(setDriverColor(color.hex));
  };

  const handleResetWheels = () => {
    dispatch(setSelectedWheels(null));
  };

  const handleRemoveDecal = (decalId: string) => {
    if(!sceneRef) return;
    removeDecal(decalId, sceneRef);
    dispatch(removePlacedDecal(decalId));
  };

  // Add handler to remove car part color
  const handleRemoveCarPartColor = (partId: string) => {
    dispatch(removeCarPartColor(partId));
    
    // Also reset the mesh color if scene is available
    if (sceneRef) {
      const color = availableDefaultColors[0];
      const object = sceneRef.getObjectByProperty('uuid', partId);
      changeMeshColor(object?.uuid ?? null, color.hex, sceneRef);
    
      if (object) {
        dispatch(showNotification({
          message: 'Part color reset to default',
          severity: 'success'
        }));
      }
    }
  };

  const handleResetAll = () => {
    handleResetCarColor();
    handleResetDriverColor();
    dispatch(resetConfigurator());
  };

  const handleOpenDialog = () => {
    setConfigName('');
    setNameError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveConfiguration = () => {
    if (!configName.trim()) {
      setNameError('Configuration name is required');
      return;
    }

    if (!teamData || !driverData) {
      dispatch(showNotification({
        message: 'Error: Team or driver data not found',
        severity: 'error'
      }));
      return;
    }

    try {
      const configData: SavedConfiguration = {
        id: `config-${Date.now()}`,
        name: configName.trim(),
        timestamp: Date.now(),
        status: 'pending',
        approvalStage: 'Team Owner',
        team: teamData,
        driver: driverData,
        configuration: {
          carColor,
          driverColor,
          carPaintFinish,
          selectedWheels,
          placedDecals: [...placedDecals],
          carPartColors: [...carPartColors], // Add car part colors to saved configuration
        }
      };

      // Get existing configurations from localStorage
      const existingConfigs = localStorage.getItem('savedConfigurations');
      const configs = existingConfigs ? JSON.parse(existingConfigs) : [];
      
      // Add new configuration
      configs.push(configData);
      
      // Save back to localStorage
      localStorage.setItem('savedConfigurations', JSON.stringify(configs));
      
      // Close dialog
      setOpenDialog(false);
      
      dispatch(showNotification({
        message: 'Configuration sent for approval successfully!',
        severity: 'success'
      }));
    } catch (error) {
      console.error('Error saving configuration:', error);
      dispatch(showNotification({
        message: 'Error saving configuration',
        severity: 'error'
      }));
    }
  };

  const formatPosition = (position: [number, number, number]) => {
    return `X: ${position[0].toFixed(2)}, Y: ${position[1].toFixed(2)}, Z: ${position[2].toFixed(2)}`;
  };

  const hasAnyConfiguration = carColor || driverColor || selectedWheels || 
    (placedDecals && placedDecals.length > 0) || 
    (carPartColors && carPartColors.length > 0);

  return (
    <SummaryContainer>
      <SectionHeading variant="h6">
        Configuration Summary
      </SectionHeading>
      
      {!hasAnyConfiguration && (
        <NoConfigurationAlert severity="info" icon={<InfoOutlinedIcon />}>
          You haven't made any customizations yet. Explore the color, wheels, and logos options to start customizing your vehicle.
        </NoConfigurationAlert>
      )}

      {/* Team and Driver Info */}
      <SummaryItem elevation={1}>
        <SectionHeading variant="subtitle1">
          <GroupsIcon />
          Team Information
        </SectionHeading>
        {teamData && driverData ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: "space-between" }}>
              <Avatar
                src={teamData.logo}
                alt={teamData.name}
                sx={{ width: 32, height: 32 }}
              />
              <Box>
                <Typography variant="body1">
                  {teamData.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Driver: {driverData.name}
                </Typography>
              </Box>
            </Box>
            {teamData.manufacturer && (
              <Chip
                avatar={<Avatar alt={teamData.manufacturer.name} src={teamData.manufacturer.logo} />}
                label={teamData.manufacturer.name}
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        ) : (
          <Alert severity="info" sx={{ mt: 1 }}>
            No team selected
          </Alert>
        )}
      </SummaryItem>

      {/* Color summary */}
      {(carColor || driverColor) && (
        <SummaryItem elevation={1}>
          <SectionHeading variant="subtitle1">
            <SplitscreenIcon />
            Paint Colors
          </SectionHeading>
          
          {carColor && (
            <ColorSection
              title="Car Color"
              color={carColor}
              paintFinish={carPaintFinish}
              onReset={handleResetCarColor}
              availableColors={availableDefaultColors}
            />
          )}
          
          {driverColor && (
            <ColorSection
              title="Driver Color"
              color={driverColor}
              paintFinish={null}
              onReset={handleResetDriverColor}
              availableColors={availableDefaultColors}
            />
          )}
        </SummaryItem>
      )}

      {/* Car Part Colors - New Section */}
      {carPartColors && carPartColors.length > 0 && (
        <SummaryItem elevation={1}>
          <SectionHeading variant="subtitle1">
            <ColorLensIcon />
            Custom Part Colors ({carPartColors.length})
          </SectionHeading>
          
          <List dense>
            {carPartColors.map(partColor => (
              <ListItem 
                key={partColor.id} 
                sx={{ 
                  px: 1,
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <ColorSwatchComponent colorHex={partColor.hex} sx={{ mr: 2 }} />
                  <ListItemText 
                    primary={partColor.name}
                    secondary={partColor.hex}
                  />
                  <Box sx={{ ml: 'auto' }}>
                    <Tooltip title="Remove Part Color">
                      <IconButton 
                        edge="end" 
                        onClick={() => handleRemoveCarPartColor(partColor.partId)} 
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        </SummaryItem>
      )}

      {/* Wheels summary */}
      {selectedWheels && (
        <SummaryItem elevation={1}>
          <SectionHeading variant="subtitle1">
            <DirectionsCarIcon />
            Wheels
          </SectionHeading>
          
          <Grid container spacing={2} alignItems="center" justifyContent="space-between">
            <Grid>
              <GiCarWheel size={24}/>
            </Grid>
            <Grid>
              <Typography variant="body1">{selectedWheels.name}</Typography>
              <Typography variant="body2" color="textSecondary">{selectedWheels.finish_name}</Typography>
            </Grid>
            <Grid>
              <Tooltip title="Reset Wheels">
                <IconButton onClick={handleResetWheels} size="small">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </SummaryItem>
      )}

      {/* Decals summary */}
      {placedDecals && placedDecals.length > 0 && (
        <SummaryItem elevation={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <SectionHeading variant="subtitle1" sx={{ mb: 0 }}>
              <LocationOnIcon />
              Applied Logos ({placedDecals.length})
            </SectionHeading>
          </Box>
          
          <List dense>
            {placedDecals.map(decal => (
              <ListItem 
                key={`${decal.uuid}`} 
                sx={{ 
                  px: 1,
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <ListItemText 
                  primary={parseDecalName(decal.name)}
                  secondary={
                    <>
                      <Typography variant="body2" color="textSecondary" component='span'>
                        Position: {formatPosition(decal.position)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" component='span'>
                        Scale: X: {decal.scale[0].toFixed(2)}, Y: {decal.scale[1].toFixed(2)}, Z: {decal.scale[2].toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" component='span'>
                        Rotation: X: {decal.rotation[0].toFixed(2)}, Y: {decal.rotation[1].toFixed(2)}, Z: {decal.rotation[2].toFixed(2)}
                      </Typography>
                    </>
                  } 
                />
                <Box sx={{ ml: 'auto' }}>
                  <Tooltip title="Remove Logo">
                    <IconButton edge="end" onClick={() => handleRemoveDecal(decal.uuid)} size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItem>
            ))}
          </List>
        </SummaryItem>
      )}

      {hasAnyConfiguration && (
        <ActionButtonContainer>
          <Button 
            variant="contained" 
            color="error" 
            startIcon={<RefreshIcon />}
            onClick={handleResetAll}
            sx={{ mr: 1 }}
          >
            Reset All
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<SendIcon />}
            onClick={handleOpenDialog}
          >
            Send for Approval
          </Button>
        </ActionButtonContainer>
      )}

      {/* Configuration Name Dialog */}
      <StyledDialog open={openDialog} onClose={handleCloseDialog}>
        <StyledDialogTitle>Save Configuration for Approval</StyledDialogTitle>
        <StyledDialogContent>
          <DialogContentText>
            Please enter a name for this configuration to send it for approval.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="configName"
            label="Configuration Name"
            type="text"
            fullWidth
            variant="outlined"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            error={!!nameError}
            helperText={nameError}
            sx={{ mt: 2 }}
          />
        </StyledDialogContent>
        <StyledDialogActions>
          <Button onClick={handleCloseDialog} color="error">
            Cancel
          </Button>
          <Button onClick={handleSaveConfiguration} color="primary">
            Save & Send
          </Button>
        </StyledDialogActions>
      </StyledDialog>
    </SummaryContainer>
  );
};

export default ConfigurationSummarySection;
