import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HexColorPicker } from 'react-colorful';
import { Scene } from 'three';
import { Tab, Tabs } from '@mui/material';
import {
  ToolPopupContainer, ToolHeader, ToolTitle, CloseButton, ToolContent, ButtonsContainer, ActionButton,
  ColorGrid, ColorSwatch, ColorPreview, InputRow, HexInput, RgbInput, RgbCell, PickerWrapper
} from './MeshTools.styles';
import CloseIcon from '@mui/icons-material/Close';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import useDraggable from '@/hooks/useDraggable';
import { changeMeshColor } from '@/services/threeJS/meshService';
import { RootState } from '@/store';
import { setCarPartColor, CarPartColor } from '@/store/actions/carColorSlice';

// Preset colors
const presetColors = [
  '#FF4D4D', '#4DFFFF', '#B07CFF', '#FFD700', '#FF8C42',
  '#7C4DFF', '#FF0000', '#4DFF4D', '#336633', '#4DC3FF',
  '#FFFFFF', '#CCCCCC', '#1A472A', '#000066', '#800000'
];

// Recently used colors key in localStorage
const RECENT_COLORS_KEY = 'recentlyUsedColors';

// Get recently used colors from localStorage
const getRecentColors = (): string[] => {
  try {
    const colors = localStorage.getItem(RECENT_COLORS_KEY);
    return colors ? JSON.parse(colors) as string[] : [];
  } catch {
    return [];
  }
};

// Save recently used color
const saveRecentColor = (color: string): string[] => {
  try {
    const recentColors = getRecentColors();
    const updatedColors = [color, ...recentColors.filter((c: string) => c !== color)].slice(0, 5);
    localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(updatedColors));
    return updatedColors;
  } catch {
    return [];
  }
};

// Color conversion utilities
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
};

const rgbToHex = (r: number, g: number, b: number) => {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, n)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

interface ColorToolProps {
  sceneRef: Scene | null;
}

const ColorTool: React.FC<ColorToolProps> = ({ sceneRef }) => {
  const dispatch = useDispatch();
  const { position, meshId } = useSelector((state: RootState) => state.meshTools.colorTool);
  const selectedObject = useSelector((state: RootState) => state.selection);
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');
  const [color, setColor] = useState('#ffffff');
  const [inputValue, setInputValue] = useState('ffffff');
  const [inputError, setInputError] = useState(false);
  const [rgb, setRgb] = useState({ r: 255, g: 255, b: 255 });
  const [recentColors, setRecentColors] = useState<string[]>([]);

  // Use draggable hook
  const { elementRef, position: dragPosition } = useDraggable({
    id: meshId || 'color-tool',
    initialPosition: position ?? undefined,
    handle: '.popover-header',
    bounds: 'window',
    disabled: false,
  });

  // Load recent colors on mount
  useEffect(() => {
    setRecentColors(getRecentColors());
  }, []);

  // Sync all color values when color changes
  useEffect(() => {
    setInputValue(color.replace('#', ''));
    setRgb(hexToRgb(color));
    setInputError(false);
  }, [color]);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
  };

  const handleRgbChange = (component: 'r' | 'g' | 'b', value: string) => {
    const numValue = Math.max(0, Math.min(255, parseInt(value) || 0));
    const newRgb = { ...rgb, [component]: numValue };
    setRgb(newRgb);
    const newColor = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    handleColorChange(newColor);
  };

  const handleClose = () => {
    dispatch({ type: 'meshTools/hideColorTool' });
  };

  const handleApplyColor = () => {
    if (!selectedObject || !selectedObject.uuid || !sceneRef) return;
    
    const updatedColors = saveRecentColor(color);
    setRecentColors(updatedColors);

    // Save car part color to Redux and localStorage
    const partName = selectedObject.name || `Part ${selectedObject.uuid.substring(0, 6)}`;
    const partColor: CarPartColor = {
      id: `part-color-${Date.now()}`,
      name: partName,
      hex: color,
      partId: selectedObject.uuid
    };
    
    dispatch(setCarPartColor(partColor));

    // Apply color to the mesh
    changeMeshColor(selectedObject.uuid, color, sceneRef);
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
        background: 'rgba(30, 30, 30, 0.85)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <ToolHeader className="popover-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DragIndicatorIcon fontSize="small" style={{ cursor: 'grab', color: 'rgba(255,255,255,0.5)' }} />
          <ToolTitle>
            <ColorLensIcon fontSize="small" />
            Change Color
          </ToolTitle>
        </div>
        <CloseButton onClick={handleClose}>
          <CloseIcon fontSize="small" />
        </CloseButton>
      </ToolHeader>

      <ToolContent style={{ padding: '12px', width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            minHeight: 32,
            mb: 2,
            '.MuiTabs-indicator': {
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
            },
          }}
        >
          <Tab 
            value="preset" 
            label="Preset" 
            sx={{ 
              minHeight: 32,
              color: 'rgba(255, 255, 255, 0.6)',
              '&.Mui-selected': {
                color: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          />
          <Tab 
            value="custom" 
            label="Custom" 
            sx={{ 
              minHeight: 32,
              color: 'rgba(255, 255, 255, 0.6)',
              '&.Mui-selected': {
                color: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          />
        </Tabs>

        {activeTab === 'preset' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Recent Colors */}
            {recentColors.length > 0 && (
              <div>
                <div style={{ fontSize: 14,  color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
                  Recent Colors
                </div>
                <ColorGrid>
                  {recentColors.map((recentColor: string, index: number) => (
                    <ColorSwatch
                      key={index}
                      color={recentColor}
                      selected={color === recentColor}
                      onClick={() => handleColorChange(recentColor)}
                    />
                  ))}
                </ColorGrid>
              </div>
            )}

            {/* Preset Colors */}
            <div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
                Preset Colors
              </div>
              <ColorGrid>
                {presetColors.map((presetColor: string, index: number) => (
                  <ColorSwatch
                    key={index}
                    color={presetColor}
                    selected={color === presetColor}
                    onClick={() => handleColorChange(presetColor)}
                  />
                ))}
              </ColorGrid>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Color Preview and Inputs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
              <ColorPreview color={color} />
              <div style={{ flex: 1 }}>
                <InputRow>
                  <span style={{ color: 'rgba(255,255,255,0.6)', marginRight: 6 }}>#</span>
                  <HexInput
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase();
                      setInputValue(val);
                      const hexRegex = /^([0-9a-f]{3}|[0-9a-f]{6})$/;
                      if (hexRegex.test(val)) {
                        const newColor = '#' + val;
                        handleColorChange(newColor);
                        setInputError(false);
                      } else {
                        setInputError(true);
                      }
                    }}
                    maxLength={6}
                    error={inputError}
                    placeholder="ffffff"
                    aria-label="Hex color code"
                    autoComplete="off"
                  />
                </InputRow>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {(['r', 'g', 'b'] as const).map((component) => (
                    <RgbCell key={component}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginRight: 6, marginLeft: 6, textTransform: 'uppercase' }}>{component}</span>
                      <RgbInput
                        type="number"
                        value={rgb[component]}
                        onChange={(e) => handleRgbChange(component, e.target.value)}
                        min="0"
                        max="255"
                        placeholder={component}
                      />
                    </RgbCell>
                  ))}
                </div>
              </div>
            </div>
            {/* Color Picker */}
            <PickerWrapper>
              <HexColorPicker 
                color={color} 
                onChange={handleColorChange}
              />
            </PickerWrapper>
          </div>
        )}

        <ButtonsContainer style={{ gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
          <ActionButton 
            onClick={handleClose} 
            style={{ 
              // fontSize: 12,
              // padding: '6px 12px',
              minWidth: 'auto',
              background: 'transparent',
              // color: 'rgba(255, 255, 255, 0.7)',
              border: 'none',
            }}
          >
            Cancel
          </ActionButton>
          <ActionButton 
            primary
            onClick={handleApplyColor}
            style={{ 
              // fontSize: 12,
              // padding: '6px 14px',
              minWidth: 'auto',
              borderRadius: '4px',
              // backgroundColor: 'rgba(255, 255, 255, 0.15)',
            }}
          >
            Apply
          </ActionButton>
        </ButtonsContainer>
      </ToolContent>
    </ToolPopupContainer>
  );
};

export default ColorTool;
