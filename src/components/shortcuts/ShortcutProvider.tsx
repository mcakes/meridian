// src/components/shortcuts/ShortcutProvider.tsx
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { RebindResult, Shortcut, ShortcutContextValue } from './types';
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

export function getEffectiveKey(
  shortcut: Shortcut,
  overrides: Map<string, string>,
): string {
  return overrides.get(shortcut.id) ?? shortcut.key;
}

export function checkRebindConflict(
  shortcuts: Shortcut[],
  overrides: Map<string, string>,
  shortcutId: string,
  newKey: string,
): string | null {
  const normalisedNew = normaliseKey(newKey);
  for (const s of shortcuts) {
    if (s.id === shortcutId) continue;
    const effective = getEffectiveKey(s, overrides);
    if (normaliseKey(effective) === normalisedNew) {
      return s.id;
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
  initialOverrides?: Map<string, string>;
  onBindingChange?: (overrides: Map<string, string>) => void;
}

export function ShortcutProvider({
  children,
  initialOverrides,
  onBindingChange,
}: ShortcutProviderProps) {
  const [shortcuts, dispatch] = useReducer(registryReducer, []);
  const [isOpen, setIsOpen] = useState(false);
  const [overrides, setOverrides] = useState<Map<string, string>>(
    () => initialOverrides ?? new Map(),
  );
  const onBindingChangeRef = useRef(onBindingChange);
  onBindingChangeRef.current = onBindingChange;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;
        const effectiveKey = getEffectiveKey(shortcut, overrides);
        const parsed = parseHotkey(effectiveKey);
        if (!matchesHotkey(e, parsed)) continue;
        if (isInputFocused() && !hasNonShiftModifier(effectiveKey)) continue;
        e.preventDefault();
        shortcut.execute();
        return;
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, overrides]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const register = useCallback((incoming: Shortcut[]) => {
    dispatch({ type: 'register', shortcuts: incoming });
    const ids = incoming.map((s) => s.id);
    return () => dispatch({ type: 'unregister', ids });
  }, []);

  const rebind = useCallback(
    (shortcutId: string, newKey: string): RebindResult => {
      const conflict = checkRebindConflict(shortcuts, overrides, shortcutId, newKey);
      if (conflict) {
        return { ok: false, conflictsWith: conflict };
      }
      const next = new Map(overrides);
      next.set(shortcutId, newKey);
      setOverrides(next);
      onBindingChangeRef.current?.(next);
      return { ok: true };
    },
    [shortcuts, overrides],
  );

  const resetBinding = useCallback(
    (shortcutId: string) => {
      const next = new Map(overrides);
      next.delete(shortcutId);
      setOverrides(next);
      onBindingChangeRef.current?.(next);
    },
    [overrides],
  );

  const resetAllBindings = useCallback(() => {
    const next = new Map<string, string>();
    setOverrides(next);
    onBindingChangeRef.current?.(next);
  }, []);

  const value = useMemo<ShortcutContextValue>(
    () => ({
      shortcuts,
      register,
      open,
      close,
      isOpen,
      overrides,
      rebind,
      resetBinding,
      resetAllBindings,
    }),
    [shortcuts, register, open, close, isOpen, overrides, rebind, resetBinding, resetAllBindings],
  );

  return (
    <ShortcutContext.Provider value={value}>
      {children}
    </ShortcutContext.Provider>
  );
}
