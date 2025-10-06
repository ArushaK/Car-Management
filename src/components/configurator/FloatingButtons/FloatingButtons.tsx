import React, { useState, useEffect } from 'react';
import { RootState } from '@/store';
import { openPopup, setMenuBarPosition } from '@/store/actions/configuratorSlice';
import { Box, IconButton, Tooltip, Zoom, Fade } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PaletteIcon from '@mui/icons-material/Palette';
import PublicIcon from '@mui/icons-material/Public';
import { useDispatch, useSelector } from 'react-redux';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import useDraggable from '@/hooks/useDraggable';
// import { GiCarWheel } from 'react-icons/gi';
import { FaHandshake } from "react-icons/fa";
import { MdNoteAlt } from "react-icons/md";

// The threshold in pixels from edges to determine when to change orientation
const EDGE_THRESHOLD = 200;

interface FloatingButtonProps {
  icon: React.ReactNode;
  section: string;
  tooltip: string;
  isActive: boolean;
  isVertical: boolean;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ 
  icon, 
  section, 
  tooltip, 
  isActive,
  isVertical
}) => {
  const dispatch = useDispatch();
  
  const handleClick = () => {
    dispatch(openPopup(section));
  };
  
  return (
    <Tooltip 
      title={tooltip} 
      placement={isVertical ? "right" : "top"}
      arrow
      slots={{ transition: Zoom }}
      enterDelay={600}
      sx={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}
    >
      <IconButton
        onClick={handleClick}
        sx={{
          backgroundColor: isActive 
            ? 'rgba(60, 60, 67, 0.9)'
            : 'rgba(242, 242, 247, 0.9)',
          color: isActive 
            ? 'rgba(255, 255, 255, 0.95)'
            : 'rgba(0, 0, 0, 0.8)',
          '&:hover': {
            backgroundColor: isActive 
              ? 'rgba(80, 80, 87, 0.9)'
              : 'rgba(222, 222, 227, 0.9)',
            transform: isVertical ? 'translateX(-3px)' : 'translateY(-3px)',
          },
          width: { xs: '42px', sm: '44px' },
          height: { xs: '42px', sm: '44px' },
          margin: isVertical ? '6px 0' : '0 6px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
};

const FloatingButtons: React.FC = () => {
  const dispatch = useDispatch();
  const openPopovers = useSelector((state: RootState) => state.configurator.openPopovers);
  const [isVertical, setIsVertical] = useState(false);
  
  // Get menuBarPosition from Redux state if available, or use default
  const menuBarPosition = useSelector((state: RootState) => 
    state.configurator.menuBarPosition
  );
  
  // Use draggable hook
  const { elementRef, position } = useDraggable({
    id: 'floating-menu-bar',
    initialPosition: menuBarPosition,
    onPositionChange: (_, position) => {
      // Save position in Redux
      dispatch(setMenuBarPosition(position));
    },
    bounds: 'window',
    handle: '.drag-handle',
  });
  
  // Check if menu should be vertical based on position
  useEffect(() => {
    const checkOrientation = () => {
      if (!elementRef.current) return;
      
      const rect = elementRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      
      // If the menu is close to the left or right edge, make it vertical
      if (rect.left < EDGE_THRESHOLD || rect.right > windowWidth - EDGE_THRESHOLD) {
        setIsVertical(true);
      } else {
        // Otherwise keep it horizontal
        setIsVertical(false);
      }
    };

    checkOrientation();
    
    // Add resize listener to recalculate orientation when window size changes
    window.addEventListener('resize', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
    };
  }, [elementRef, position]);
  
  // Check which sections are already open
  const getActiveSection = (section: string) => {
    return openPopovers.some(popover => popover.type === section);
  };
  
  const buttons = [
    { icon: <DirectionsCarIcon />, section: 'model', tooltip: 'Model' },
    { icon: <PaletteIcon />, section: 'color', tooltip: 'Paint Scheme' },

    // Uncomment if wheel section is needed in the future
    // { icon: <GiCarWheel />, section: 'wheels', tooltip: 'Wheels' },
    
    // { icon: <AirlineSeatReclineNormalIcon />, section: 'interior', tooltip: 'Interior' },
    { icon: <FaHandshake />, section: 'decal', tooltip: 'Sponsor Logos' },
    { icon: <PublicIcon />, section: 'environment', tooltip: 'Environment' },
    { icon: <MdNoteAlt />, section: 'configuration', tooltip: 'Approval Submission' },
  ];
  
  return (
    <Fade in={true}>
      <Box 
        ref={elementRef}
        sx={{ 
          position: 'fixed',
          display: 'flex',
          flexDirection: isVertical ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 60,
          backgroundColor: 'rgba(28, 28, 30, 0.75)',
          backdropFilter: 'blur(20px)',
          borderRadius: '12px',
          padding: isVertical ? '8px 6px' : '6px 8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          transition: 'all 0.3s ease'
        }}
      >
        <Box 
          className="drag-handle"
          sx={{
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isVertical ? '8px 0' : '0 8px',
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              color: 'rgba(255, 255, 255, 0.9)',
            },
            '&:active': {
              cursor: 'grabbing',
            }
          }}
        >
          <DragIndicatorIcon 
            fontSize="small" 
            sx={{ 
              transform: isVertical ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}
          />
        </Box>
        
        {buttons.map((button) => (
          <FloatingButton 
            key={button.section} 
            icon={button.icon} 
            section={button.section} 
            tooltip={button.tooltip}
            isActive={getActiveSection(button.section)}
            isVertical={isVertical}
          />
        ))}
      </Box>
    </Fade>
  );
};

export default FloatingButtons; 