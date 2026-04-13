import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setSelectedColor } from '@/store/actions/configuratorSlice';
import { setCarColor, setDriverColor, addCustomColor, removeCustomColor, removeDefaultColor, setCarPaintFinish } from '@/store/actions/carColorSlice';
import { showNotification } from '@/store/actions/notificationSlice';
import { 
  Box, 
  Typography, 
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Fade,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import PaletteIcon from '@mui/icons-material/Palette';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import { HexColorPicker } from 'react-colorful';
import { PaintFinish } from '@/store/actions/carColorSlice';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

// Default colors for reference only (actual values are stored in Redux)
// const defaultColors = [
//   { id: 'black', name: 'Midnight Black', hex: '#1A1A1A' },
//   { id: 'red', name: 'Racing Red', hex: '#E63946' },
//   { id: 'white', name: 'Pure White', hex: '#F8F9FA' },
//   { id: 'silver', name: 'Silver Metallic', hex: '#CED4DA' },
//   { id: 'blue', name: 'Electric Blue', hex: '#4361EE' },
//   { id: 'yellow', name: 'Solar Yellow', hex: '#FFD166' },
// ];

// Paint finish options
const paintFinishOptions: {id: PaintFinish, name: string, description: string}[] = [
  { id: 'glossy', name: 'Glossy', description: 'High shine finish with reflective surface' },
  { id: 'metallic', name: 'Metallic', description: 'Contains metal flakes for a sparkle effect' },
  { id: 'matte', name: 'Matte', description: 'Non-reflective finish with subtle texture' },
  { id: 'satin', name: 'Satin', description: 'Semi-gloss finish with smooth appearance' }
];

// Add new type for color target
type ColorTarget = 'car' | 'driver' | 'both';

// Styled components
const ColorOptionContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: theme.spacing(1.5),
  marginTop: theme.spacing(2),
}));

const ColorSwatch = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isSelected' && prop !== 'colorHex'
})<{ isSelected?: boolean; colorHex: string }>(({ theme, isSelected, colorHex }) => ({
  width: '100%',
  height: 64,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: colorHex,
  position: 'relative',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: colorHex === '#F8F9FA' ? '1px solid #E0E0E0' : 'none',
  boxShadow: isSelected 
    ? `0 0 0 2px ${theme.palette.primary.main}, 0 4px 10px rgba(0,0,0,0.15)` 
    : '0 2px 6px rgba(0,0,0,0.08)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: isSelected 
      ? `0 0 0 2px ${theme.palette.primary.main}, 0 6px 12px rgba(0,0,0,0.2)` 
      : '0 4px 10px rgba(0,0,0,0.12)',
  },
  '&::after': isSelected ? {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  } : {},
}));

const ColorLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  textAlign: 'center',
  marginTop: theme.spacing(0.75),
  fontWeight: 500,
  color: theme.palette.text.secondary,
}));

const ColorOption = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isSelected'
})<{ isSelected?: boolean }>(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  transition: 'all 0.2s ease',
}));

const CreateCustomButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  borderStyle: 'dashed',
  borderWidth: 1,
  borderColor: alpha(theme.palette.primary.main, 0.3),
  padding: theme.spacing(1),
  backgroundColor: alpha(theme.palette.primary.main, 0.03),
  color: theme.palette.primary.main,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: 64,
  minWidth: 'unset',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    borderColor: theme.palette.primary.main,
  }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  paddingBottom: theme.spacing(1),
  '& .MuiTypography-root': {
    fontWeight: 600,
  }
}));

const ColorSelectionPanel = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  backgroundColor: '#333333',
  color: '#FFFFFF',
  boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
}));

const PanelContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const FinishOptionContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: theme.spacing(1.5),
  marginTop: theme.spacing(2),
}));

const FinishSwatch = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isSelected' && prop !== 'finishType'
})<{ isSelected?: boolean; finishType: PaintFinish }>(({ theme, isSelected, finishType }) => {
  const finishColors = {
    glossy: 'linear-gradient(135deg, #2c7cb0 0%, #5b9ad1 100%)',
    metallic: 'linear-gradient(135deg, #9e9e9e 0%, #e0e0e0 100%)',
    matte: 'linear-gradient(135deg, #2b94c3 0%, #2b94c3 100%)',
    satin: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
  };

  return {
    width: '100%',
    height: 64,
    borderRadius: theme.shape.borderRadius,
    background: finishColors[finishType as keyof typeof finishColors],
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: isSelected 
      ? `0 0 0 2px ${theme.palette.primary.main}, 0 4px 10px rgba(0,0,0,0.15)` 
      : '0 2px 6px rgba(0,0,0,0.08)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: isSelected 
        ? `0 0 0 2px ${theme.palette.primary.main}, 0 6px 12px rgba(0,0,0,0.2)` 
        : '0 4px 10px rgba(0,0,0,0.12)',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background:
        finishType === 'glossy'
          ? 'linear-gradient(45deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 70%)'
        : finishType === 'metallic'
          ? 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'2\' cy=\'2\' r=\'1\' fill=\'rgba(255,255,255,0.3)\' /%3E%3C/svg%3E"), linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)'
        : finishType === 'matte'
          ? 'repeating-linear-gradient(45deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 3px)'
        : 'linear-gradient(45deg, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 70%)', // satin
      backgroundSize: finishType === 'metallic' ? '10px 10px, 100% 100%' : '100% 100%',
      borderRadius: theme.shape.borderRadius,
    },
    ...(isSelected && {
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 28,
        height: 28,
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 1,
      }
    })
  };
});

const ModeSelector = styled(ToggleButtonGroup)(({ theme }) => ({
  backgroundColor: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: theme.shape.borderRadius,
  width: '100%', // Make it full width
  '& .MuiToggleButton-root': {
    flex: 1, // Make buttons equal width
    color: 'rgba(255,255,255,0.7)',
    border: 'none',
    padding: theme.spacing(1, 1),
    '&.Mui-selected': {
      backgroundColor: 'rgba(255,255,255,0.1)',
      color: '#fff',
      '&:hover': {
        backgroundColor: 'rgba(255,255,255,0.15)',
      }
    },
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.07)',
    }
  }
}));

// Main component
const ColorSelector: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedColor } = useSelector((state: RootState) => state.configurator);
  const { 
    savedCustomColors, 
    availableDefaultColors, 
    carColor,
    driverColor,
    carPaintFinish
  } = useSelector((state: RootState) => state.carColor);
  
  const [customColor, setCustomColor] = useState('#4361EE');
  const [customColorName, setCustomColorName] = useState('My Custom Color');
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [colorToDelete, setColorToDelete] = useState<{id: string, isDefault: boolean, name: string} | null>(null);
  const [colorTarget, setColorTarget] = useState<ColorTarget>('both');

  // Helper function to find color ID by hex value
  const findColorId = (hexColor: string) => {
    const defaultColor = availableDefaultColors.find(c => c.hex.toLowerCase() === hexColor.toLowerCase());
    if (defaultColor) return defaultColor.id;
    
    const customColor = savedCustomColors.find(c => c.hex.toLowerCase() === hexColor.toLowerCase());
    if (customColor) return customColor.id;
    
    return null;
  };

  // Modified to handle color selection state based on target
  const getSelectedColorForTarget = () => {
    switch(colorTarget) {
      case 'car':
        return findColorId(carColor);
      case 'driver':
        return findColorId(driverColor);
      case 'both':
        // Only show selected if both colors are the same
        return carColor === driverColor ? findColorId(carColor) : null;
      default:
        return null;
    }
  };

  // Modified handleTargetChange to update selected color when switching targets
  const handleTargetChange = (
    _: React.MouseEvent<HTMLElement>,
    newTarget: ColorTarget | null
  ) => {
    if (newTarget !== null) {
      setColorTarget(newTarget);
      
      // Update selected color based on new target
      switch(newTarget) {
        case 'car':
          dispatch(setSelectedColor(findColorId(carColor) || ''));
          break;
        case 'driver':
          dispatch(setSelectedColor(findColorId(driverColor) || ''));
          break;
        case 'both':
          // Only set selected color if both are the same
          if (carColor === driverColor) {
            dispatch(setSelectedColor(findColorId(carColor) || ''));
          } else {
            dispatch(setSelectedColor(''));
          }
          break;
      }
    }
  };

  // Modified handleColorSelect to handle color application based on target
  const handleColorSelect = (colorId: string, colorHex: string) => {
    dispatch(setSelectedColor(colorId));
    
    // Apply color based on the current target mode
    switch(colorTarget) {
      case 'car':
        dispatch(setCarColor(colorHex));
        break;
      case 'driver':
        dispatch(setDriverColor(colorHex));
        break;
      case 'both':
        dispatch(setCarColor(colorHex));
        dispatch(setDriverColor(colorHex));
        break;
    }
  };

  // Modified handlePaintFinishSelect to handle finishes based on target
  const handlePaintFinishSelect = (finishType: PaintFinish) => {
    dispatch(setCarPaintFinish(finishType));
    
    dispatch(showNotification({
      message: `${finishType.charAt(0).toUpperCase() + finishType.slice(1)} finish applied to car`,
      severity: 'success'
    }));
  };

  // Handle deletion of a color
  const handleDeleteColor = (event: React.MouseEvent, colorId: string, isDefault: boolean) => {
    event.stopPropagation();
    
    const colorObj = isDefault 
      ? availableDefaultColors.find(color => color.id === colorId) 
      : savedCustomColors.find(color => color.id === colorId);
    
    if (colorObj) {
      setColorToDelete({
        id: colorId,
        isDefault,
        name: colorObj.name
      });
      setDeleteConfirmOpen(true);
    }
  };
  
  // Confirm and actually delete the color
  const confirmDeleteColor = () => {
    if (!colorToDelete) return;
    
    const { id, isDefault } = colorToDelete;
    
    if (isDefault) {
      dispatch(removeDefaultColor(id));
    } else {
      dispatch(removeCustomColor(id));
    }
    
    if (selectedColor === id) {
      const remainingColors = [...availableDefaultColors, ...savedCustomColors].filter(color => color.id !== id);
      if (remainingColors.length > 0) {
        handleColorSelect(remainingColors[0].id, remainingColors[0].hex);
      }
    }
    
    dispatch(showNotification({
      message: 'Color deleted successfully',
      severity: 'success'
    }));
    setDeleteConfirmOpen(false);
    setColorToDelete(null);
  };

  // Handle saving a custom color
  const handleSaveCustomColor = () => {
    if (!customColorName.trim()) {
      dispatch(showNotification({
        message: 'Please enter a name for your color',
        severity: 'error'
      }));
      return;
    }
    
    const newCustomColor = {
      id: `custom-${Date.now()}`,
      name: customColorName,
      hex: customColor
    };
    
    dispatch(addCustomColor(newCustomColor));
    handleColorSelect(newCustomColor.id, newCustomColor.hex);
    setColorDialogOpen(false);
    dispatch(showNotification({
      message: 'Custom color saved!',
      severity: 'success'
    }));
  };

  // Apply custom color without saving
  const handleApplyTemporary = () => {
    const tempId = `temp-${Date.now()}`;
    handleColorSelect(tempId, customColor);
    setColorDialogOpen(false);
    dispatch(showNotification({
      message: 'Color applied temporarily',
      severity: 'info'
    }));
  };

  // Add new function to check if colors need restoration
  const needsRestoration = () => {
    const defaultColor = availableDefaultColors[0]?.hex;

    switch(colorTarget) {
      case 'car':
        return carColor !== defaultColor || carPaintFinish !== 'metallic';
      case 'driver':
        return driverColor !== defaultColor;
      case 'both':
        return carColor !== defaultColor || 
               driverColor !== defaultColor || 
               carPaintFinish !== 'metallic';
      default:
        return false;
    }
  };

  // Modified restore defaults handler to work based on target
  const handleRestoreDefaults = () => {
    const defaultColor = availableDefaultColors[0];

    switch(colorTarget) {
      case 'car':
        if (defaultColor) {
          dispatch(setCarColor(defaultColor.hex));
          dispatch(setSelectedColor(defaultColor.id));
          dispatch(setCarPaintFinish('metallic'));
        }
        break;
      case 'driver':
        if (defaultColor) {
          dispatch(setDriverColor(defaultColor.hex));
          dispatch(setSelectedColor(defaultColor.id));
        }
        break;
      case 'both':
        if (defaultColor) {
          dispatch(setCarColor(defaultColor.hex));
          dispatch(setDriverColor(defaultColor.hex));
          dispatch(setSelectedColor(defaultColor.id));
          dispatch(setCarPaintFinish('metallic'));
        }
        break;
    }

    dispatch(showNotification({
      message: `Default colors restored for ${colorTarget === 'both' ? 'car & driver' : colorTarget}`,
      severity: 'success'
    }));
  };

  // Function to clear all custom colors
  const handleClearCustomColors = () => {
    const isCustomColorSelected = selectedColor && selectedColor.startsWith('custom-');
    
    savedCustomColors.forEach(color => {
      dispatch(removeCustomColor(color.id));
    });
    
    if (isCustomColorSelected && availableDefaultColors.length > 0) {
      handleColorSelect(availableDefaultColors[0].id, availableDefaultColors[0].hex);
    }
    
    dispatch(showNotification({
      message: 'All custom colors cleared',
      severity: 'success'
    }));
  };

  return (
    <ColorSelectionPanel elevation={4}>   
      <PanelContent>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 2,
          mb: 3 
        }}>
          <Box>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 0.5 }}>
              Color & Appearance
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
              Customize the colors of your car and driver separately or together.
            </Typography>
          </Box>

          {/* Modified Mode Selector */}
          <ModeSelector
            value={colorTarget}
            exclusive
            onChange={handleTargetChange}
            aria-label="color target"
            size="small"
          >
            <ToggleButton value="car" aria-label="car only">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, textTransform: 'none' }}>
                <DirectionsCarIcon />
                Car
              </Box>
            </ToggleButton>
            <ToggleButton value="driver" aria-label="driver only">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, textTransform: 'none' }}>
                <PersonIcon />
                Driver
              </Box>
            </ToggleButton>
            <ToggleButton value="both" aria-label="both car and driver">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, textTransform: 'none' }}>
                <CompareArrowsIcon />
                Both
              </Box>
            </ToggleButton>
          </ModeSelector>
        </Box>
        
        {/* Color Options */}
        <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1 }}>
          Paint Color for {colorTarget === 'both' ? 'Car & Driver' : colorTarget === 'car' ? 'Car' : 'Driver'}
        </Typography>
        <ColorOptionContainer>
          {availableDefaultColors.map((color) => (
            <ColorOption 
              key={color.id} 
              isSelected={color.id === getSelectedColorForTarget()}
              onClick={() => handleColorSelect(color.id, color.hex)}
            >
              <ColorSwatch 
                colorHex={color.hex} 
                isSelected={color.id === getSelectedColorForTarget()}
              >
                {selectedColor === color.id && (
                  <Box sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2, 
                  }}>
                  </Box>
                )}
                <IconButton
                  size="small"
                  onClick={(e) => handleDeleteColor(e, color.id, true)}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    bgcolor: 'rgba(0, 0, 0, 0.2)',
                    color: 'white',
                    padding: '2px',
                    '&:hover': {
                      bgcolor: 'rgba(255, 0, 0, 0.7)',
                    },
                    opacity: 0.8,
                    width: 20,
                    height: 20,
                    '& .MuiSvgIcon-root': {
                      fontSize: 14
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ColorSwatch>
              <ColorLabel>
                {color.name}
              </ColorLabel>
            </ColorOption>
          ))}
          
          {savedCustomColors.map((color) => (
            <ColorOption 
              key={color.id} 
              isSelected={color.id === getSelectedColorForTarget()}
              onClick={() => handleColorSelect(color.id, color.hex)}
            >
              <ColorSwatch 
                colorHex={color.hex} 
                isSelected={color.id === getSelectedColorForTarget()}
              >
                {selectedColor === color.id && (
                  <Box sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2, 
                  }}>
                  </Box>
                )}
                <IconButton
                  size="small"
                  onClick={(e) => handleDeleteColor(e, color.id, false)}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    bgcolor: 'rgba(0, 0, 0, 0.2)',
                    color: 'white',
                    padding: '2px',
                    '&:hover': {
                      bgcolor: 'rgba(255, 0, 0, 0.7)',
                    },
                    opacity: 0.8,
                    width: 20,
                    height: 20,
                    '& .MuiSvgIcon-root': {
                      fontSize: 14
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ColorSwatch>
              <ColorLabel>
                {color.name}
              </ColorLabel>
            </ColorOption>
          ))}
          
          <ColorOption>
            <CreateCustomButton onClick={() => setColorDialogOpen(true)}>
              <PaletteIcon sx={{ fontSize: 20, mb: 0.5 }} />
              <Typography variant="caption" fontWeight="medium">
                Custom
              </Typography>
            </CreateCustomButton>
          </ColorOption>
        </ColorOptionContainer>
        
        {/* Paint Finish Options - Only show for car or both */}
        {colorTarget !== 'driver' && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1 }}>
              Paint Finish for Car
            </Typography>
            <FinishOptionContainer>
              {paintFinishOptions.map((finish) => (
                <ColorOption 
                  key={finish.id} 
                  isSelected={carPaintFinish === finish.id}
                  onClick={() => handlePaintFinishSelect(finish.id)}
                >
                  <FinishSwatch 
                    finishType={finish.id} 
                    isSelected={carPaintFinish === finish.id}
                  />
                  <ColorLabel>
                    {finish.name}
                  </ColorLabel>
                </ColorOption>
              ))}
            </FinishOptionContainer>
          </Box>
        )}
        
        {/* Action buttons */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          {/* Restore defaults button - only show if current selection needs restoration */}
          {needsRestoration() && (
            <Button
              startIcon={<RestoreIcon />}
              onClick={handleRestoreDefaults}
              sx={{
                fontSize: '0.75rem',
                textTransform: 'none',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: alpha('#4361EE', 0.05),
                }
              }}
            >
              Restore {colorTarget === 'both' ? 'All' : colorTarget} to Default
            </Button>
          )}
          
          {/* Clear custom colors button - only show if there are custom colors */}
          {savedCustomColors.length > 0 && (
            <Button
              startIcon={<DeleteIcon />}
              onClick={handleClearCustomColors}
              sx={{
                fontSize: '0.75rem',
                textTransform: 'none',
                color: 'error.main',
                '&:hover': {
                  backgroundColor: alpha('#f44336', 0.05),
                }
              }}
            >
              Clear All Custom Colors
            </Button>
          )}
        </Box>
      </PanelContent>

      {/* Custom color dialog */}
      <Dialog 
        open={colorDialogOpen} 
        onClose={() => setColorDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        slots={{ transition: Fade }}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <StyledDialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Custom Color</Typography>
            <IconButton
              edge="end"
              onClick={() => setColorDialogOpen(false)}
              aria-label="close"
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </StyledDialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Box 
              sx={{ 
                width: '100%', 
                height: 100, 
                backgroundColor: customColor, 
                borderRadius: 1,
                mb: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }} 
            />
            
            <HexColorPicker 
              color={customColor} 
              onChange={setCustomColor} 
              style={{ width: '100%', marginBottom: 16 }} 
            />
            
            <TextField
              label="Color Name"
              value={customColorName}
              onChange={(e) => setCustomColorName(e.target.value)}
              fullWidth
              margin="dense"
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <Box 
                    sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: 0.5, 
                      backgroundColor: customColor,
                      marginRight: 1,
                      border: '1px solid #eee'
                    }} 
                  />
                ),
              }}
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={handleApplyTemporary}
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Apply Only
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveCustomColor}
            startIcon={<AddIcon />}
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Save Color
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>Delete Color</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete "{colorToDelete?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            variant="outlined" 
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={confirmDeleteColor}
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </ColorSelectionPanel>
  );
};

export default ColorSelector;