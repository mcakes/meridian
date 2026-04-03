// src/components/command-palette/useCommandPalette.ts
import { useContext } from 'react';
import { CommandPaletteContext } from './CommandPaletteProvider';
import type { CommandPaletteContextValue } from './types';

export function useCommandPalette(): CommandPaletteContextValue {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error(
      'useCommandPalette must be used within a CommandPaletteProvider',
    );
  }
  return ctx;
}
