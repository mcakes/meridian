import type { ReactNode } from 'react';

export type SidebarSide = 'left' | 'right';

export interface SidebarState {
  left: SidebarSideState;
  right: SidebarSideState;
  paletteLocations: Record<string, SidebarSide>;
  paletteHeights: Record<string, number | null>;
}

export interface SidebarSideState {
  expanded: boolean;
  width: number;
  paletteOrder: string[];
  expandedPalettes: string[];
}

export interface PaletteDefinition {
  id: string;
  title: string;
  icon: ReactNode;
  defaultExpanded: boolean;
}

export type TogglePosition = 'top' | 'bottom' | 'hidden';

export interface SidebarProps {
  side: SidebarSide;
  defaultExpanded?: boolean;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  togglePosition?: TogglePosition;
  children: ReactNode;
}

export interface PaletteProps {
  id: string;
  title: string;
  icon: ReactNode;
  defaultExpanded?: boolean;
  children: ReactNode;
}
