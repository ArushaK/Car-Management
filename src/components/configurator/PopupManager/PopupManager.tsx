import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { Box, IconButton, Typography, useTheme, useMediaQuery, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { closePopup, setPopoverPosition, setActivePopover, Popover as PopoverType } from '@/store/actions/configuratorSlice';
import useDraggable from '@/hooks/useDraggable';

// Import all the section components
import { 
  ModelSection, 
  ColorSection, 
  WheelsSection, 
  InteriorSection,
  DecalSection,  
  EnvironmentSection,
  ConfigurationSummarySection
} from '@/components/configurator/sections';
import { Scene } from 'three';

// Popover component for each individual popover
interface PopoverProps {
  popover: PopoverType;
  isActive: boolean;
  sceneRef: Scene | null;
}

const Popover: React.FC<PopoverProps> = ({ popover, isActive, sceneRef }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Draggable functionality
  const { elementRef, position } = useDraggable({
    id: popover.id,
    initialPosition: popover.position,
    onPositionChange: (id, newPosition) => {
      dispatch(setPopoverPosition({ id, position: newPosition }));
    },
    disabled: isMobile, // Disable dragging on mobile
  });
  
  // When this popover is clicked, set it as active
  const handleActivate = () => {
    dispatch(setActivePopover(popover.id));
  };
  
  // Function to render the appropriate content based on section
  const renderSectionContent = () => {
    switch (popover.type) {
      case 'model':
        return <ModelSection />;
      case 'color':
        return <ColorSection />;
      case 'wheels':
        return <WheelsSection />;
      case 'interior':
        return <InteriorSection />;
      case 'decal':
        return <DecalSection />;
      case 'environment':
        return <EnvironmentSection />;
      case 'configuration':
        return <ConfigurationSummarySection sceneRef={sceneRef}/>;
      default:
        return <Box>Section not found</Box>;
    }
  };

  // Get section title
  const getSectionTitle = () => {
    switch (popover.type) {
      case 'model': return 'Model Configuration';
      case 'color': return 'Paint Scheme';
      case 'wheels': return 'Wheels & Tires';
      case 'interior': return 'Interior Options';
      case 'decal': return 'Sponsor Logos';
      case 'environment': return 'Environment Settings';
      case 'configuration': return 'Approval Submission';
      default: return 'Configuration';
    }
  };
  
  return (
    <Paper
      ref={elementRef}
      elevation={3}
      onClick={handleActivate}
      sx={{
        position: 'fixed',
        top: isMobile ? 'auto' : `${position.y}px`,
        left: isMobile ? 0 : `${position.x}px`,
        bottom: isMobile ? 0 : 'auto',
        width: isMobile ? '100%' : '360px',
        maxHeight: isMobile ? '80vh' : 'calc(100vh - 150px)',
        borderRadius: isMobile ? '16px 16px 0 0' : '10px',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease, transform 0.1s ease',
        zIndex: popover.zIndex,
        cursor: 'default',
        backgroundColor: 'rgba(28, 28, 30, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        boxShadow: isActive 
          ? '0 12px 28px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.1)'
          : '0 4px 20px rgba(0,0,0,0.16), 0 0 0 1px rgba(255,255,255,0.05)',
        transform: isActive ? 'scale(1)' : 'scale(0.98)',
        opacity: isActive ? 1 : 0.9,
        '&:hover': {
          opacity: 1,
          boxShadow: '0 12px 28px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.1)',
          transform: 'scale(1)',
        },
        '&.dragging': {
          opacity: 0.85,
          transition: 'none',
          cursor: 'grabbing',
        },
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Draggable header with title */}
      <Box
        className="popover-header"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(38, 38, 40, 0.9)',
          padding: '10px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          cursor: 'grab',
          userSelect: 'none',
          borderTopLeftRadius: '10px',
          borderTopRightRadius: '10px',
          '&:active': {
            cursor: 'grabbing',
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {!isMobile && (
            <DragIndicatorIcon 
              sx={{ 
                mr: 1, 
                fontSize: '20px', 
                color: 'rgba(255, 255, 255, 0.4)',
                cursor: 'grab',
                '&:hover': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }} 
            />
          )}
          <Typography 
            variant="body1" 
            fontWeight="medium"
            sx={{ 
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            {getSectionTitle()}
          </Typography>
        </Box>
        
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            dispatch(closePopup(popover.id));
          }}
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            padding: '4px',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'rgba(255, 255, 255, 0.9)',
            }
          }}
          aria-label="Close configuration panel"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      
      {/* Content */}
      <Box
        sx={{
          padding: { xs: '16px', sm: '18px' },
          overflowY: 'auto',
          maxHeight: isMobile ? 'calc(80vh - 48px)' : 'calc(100vh - 72px)',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
            },
          },
        }}
      >
        {renderSectionContent()}
      </Box>
    </Paper>
  );
};

interface PopupManagerProps {
  sceneRef: Scene | null;
}

// Main PopupManager component
const PopupManager= ({ sceneRef }: PopupManagerProps) => {
  const openPopovers = useSelector((state: RootState) => state.configurator.openPopovers);
  const activePopover = useSelector((state: RootState) => state.configurator.activePopover);
  
  // If no popovers are open, don't render anything
  if (openPopovers.length === 0) return null;
  
  return (
    <>
      {openPopovers.map((popover) => (
        <Popover 
          key={popover.id} 
          popover={popover} 
          isActive={popover.id === activePopover}
          sceneRef={sceneRef}
        />
      ))}
    </>
  );
};

export default PopupManager; 