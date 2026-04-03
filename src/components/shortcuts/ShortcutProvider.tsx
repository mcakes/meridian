import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { Shortcut, ShortcutContextValue } from './types';
import { hasNonShiftModifier, matchesHotkey, normaliseKey, parseHotkey } from './hotkeys';

export type RegistryAction =
  | { type: 'register'; shortcuts: Shortcut[] }
  | { type: 'unregister'; ids: string[] };

export function registryReducer(
  state: Shortcut[],
  action: RegistryAction,
): Shortcut[] {
  switch (action.type) {
    case 'register': {
      const newIds = new Set(action.shortcuts.map((s) => s.id));
      const filtered = state.filter((s) => !newIds.has(s.id));
      return [...filtered, ...action.shortcuts];
    }
    case 'unregister': {
      const removeIds = new Set(action.ids);
      return state.filter((s) => !removeIds.has(s.id));
    }
  }
}

export function detectCollision(
  existing: Shortcut[],
  incoming: Shortcut,
): { existingId: string; newId: string; key: string } | null {
  const normalisedKey = normaliseKey(incoming.key);
  for (const s of existing) {
    if (s.id === incoming.id) continue;
    if (normaliseKey(s.key) === normalisedKey) {
      return { existingId: s.id, newId: incoming.id, key: normalisedKey };
    }
  }
  return null;
}

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
}

export const ShortcutContext = createContext<ShortcutContextValue | null>(null);

interface ShortcutProviderProps {
  children: ReactNode;
}

export function ShortcutProvider({ children }: ShortcutProviderProps) {
  const [shortcuts, dispatch] = useReducer(registryReducer, []);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;
        const parsed = parseHotkey(shortcut.key);
        if (!matchesHotkey(e, parsed)) continue;
        if (isInputFocused() && !hasNonShiftModifier(shortcut.key)) continue;
        e.preventDefault();
        shortcut.execute();
        return;
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const register = useCallback((incoming: Shortcut[]) => {
    dispatch({ type: 'register', shortcuts: incoming });
    const ids = incoming.map((s) => s.id);
    return () => dispatch({ type: 'unregister', ids });
  }, []);

  const value = useMemo<ShortcutContextValue>(
    () => ({ shortcuts, register, open, close, isOpen }),
    [shortcuts, register, open, close, isOpen],
  );

  return (
    <ShortcutContext.Provider value={value}>
      {children}
    </ShortcutContext.Provider>
  );
}
