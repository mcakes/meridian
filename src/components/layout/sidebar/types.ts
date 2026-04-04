import type { ReactNode } from 'react';

export type SidebarSide = 'left' | 'right';

export interface SidebarState {
  left: SidebarSideState;
  right: SidebarSideState;
  paletteLocations: Record<string, SidebarSide>;
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

export interface SidebarProps {
  side: SidebarSide;
  defaultExpanded?: boolean;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  children: ReactNode;
}

export interface PaletteProps {
  id: string;
  title: string;
  icon: ReactNode;
  defaultExpanded?: boolean;
  children: ReactNode;
}
