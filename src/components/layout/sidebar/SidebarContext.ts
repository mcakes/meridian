import { createContext, useContext } from 'react';
import type { SidebarState, SidebarSide, PaletteDefinition } from './types';
import type { SidebarAction } from './sidebarReducer';

export interface SidebarContextValue {
  state: SidebarState;
  dispatch: (action: SidebarAction) => void;
  registerPalette: (palette: PaletteDefinition, side: SidebarSide) => void;
  unregisterPalette: (id: string) => void;
  /** Palette metadata keyed by id — used by Sidebar to render collapsed icon strip */
  paletteRegistry: Map<string, PaletteDefinition>;
  /** Which sides have a Sidebar rendered */
  activeSides: Set<SidebarSide>;
  registerSide: (side: SidebarSide) => void;
  unregisterSide: (side: SidebarSide) => void;
}

export const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebarContext(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return ctx;
}
