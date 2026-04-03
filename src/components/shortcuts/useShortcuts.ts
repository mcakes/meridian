import { useContext } from 'react';
import { ShortcutContext } from './ShortcutProvider';
import type { ShortcutContextValue } from './types';

export function useShortcuts(): ShortcutContextValue {
  const ctx = useContext(ShortcutContext);
  if (!ctx) {
    throw new Error('useShortcuts must be used within a ShortcutProvider');
  }
  return ctx;
}
