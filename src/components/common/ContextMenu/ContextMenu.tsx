import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import * as S from './ContextMenu.styles';
import { SelectedMeshInfo } from '@/store/actions/selectionSlice';

export type ContextMenuOption = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string; // Keyboard shortcut display text
  action: () => void;
  isDisabled?: boolean;
  isVisible?: (selectedType: string | null) => boolean;
};

type ContextMenuProps = {
  options: ContextMenuOption[];
};

const ContextMenu: React.FC<ContextMenuProps> = ({ options }) => {
  const selection = useSelector((state: RootState) => state.selection);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<ContextMenuOption[]>([]);

  // Filter options based on selection type
  useEffect(() => {
    if (selection.type) {
      const visibleOptions = options.filter(option => 
        !option.isVisible || option.isVisible(selection.type)
      );
      setFilteredOptions(visibleOptions);
    } else {
      setFilteredOptions([]);
    }
  }, [selection.type, options]);

  // Set up event listeners for context menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (selection.uuid) {
        e.preventDefault();
        setPosition({ x: e.clientX, y: e.clientY });
        setIsVisible(true);
      }
    };

    const handleClick = () => {
      setIsVisible(false);
    };

    // Only add listeners if there's a selection
    if (selection.uuid) {
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('click', handleClick);
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
    };
  }, [selection.uuid]);

  // Hide menu if no selection
  useEffect(() => {
    if (!selection.uuid) {
      setIsVisible(false);
    }
  }, [selection.uuid]);

  const getMeshName = (selection: SelectedMeshInfo) => {
    if (selection.type !== 'decal' && selection.type !== 'numberDecal') return selection.name;
    if (!selection.name) return "No Name";

    const parts = selection.name.split('_');
    if (parts.length > 1) {
      return parts[1];
    }
    return selection.name;
  }

  if (!isVisible || filteredOptions.length === 0) {
    return null;
  }

  return (
    <S.ContextMenuContainer 
      style={{ 
        left: position.x, 
        top: position.y 
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <S.ContextMenuTitle>
        {getMeshName(selection) || 'Selected Object'}
        <S.ContextMenuType>{selection.type}</S.ContextMenuType>
      </S.ContextMenuTitle>
      
      <S.ContextMenuDivider />
      
      {filteredOptions.map((option) => (
        <S.ContextMenuItem
          key={option.id}
          onClick={() => {
            if (!option.isDisabled) {
              option.action();
              setIsVisible(false);
            }
          }}
          disabled={option.isDisabled}
        >
          {option.icon && <S.ContextMenuItemIcon>{option.icon}</S.ContextMenuItemIcon>}
          <span>{option.label}</span>
          {option.shortcut && <S.ContextMenuShortcut>{option.shortcut}</S.ContextMenuShortcut>}
        </S.ContextMenuItem>
      ))}
    </S.ContextMenuContainer>
  );
};

export default ContextMenu;
