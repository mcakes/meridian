// src/components/command-palette/CommandPaletteProvider.tsx
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type {
  Command,
  CommandPaletteContextValue,
  FrequencyMap,
} from './types';
import { parseHotkey, matchesHotkey } from '../shortcuts/hotkeys';

// --- Registry reducer (exported for testing) ---

export type RegistryAction =
  | { type: 'register'; commands: Command[] }
  | { type: 'unregister'; ids: string[] };

export function registryReducer(
  state: Command[],
  action: RegistryAction,
): Command[] {
  switch (action.type) {
    case 'register': {
      const newIds = new Set(action.commands.map((c) => c.id));
      const filtered = state.filter((c) => !newIds.has(c.id));
      return [...filtered, ...action.commands];
    }
    case 'unregister': {
      const removeIds = new Set(action.ids);
      return state.filter((c) => !removeIds.has(c.id));
    }
  }
}

// --- Context ---

export const CommandPaletteContext =
  createContext<CommandPaletteContextValue | null>(null);

// --- Provider ---

interface CommandPaletteProviderProps {
  children: ReactNode;
  hotkey?: string;
  initialFrequency?: FrequencyMap;
}

export function CommandPaletteProvider({
  children,
  hotkey = 'mod+k',
  initialFrequency,
}: CommandPaletteProviderProps) {
  const [commands, dispatch] = useReducer(registryReducer, []);
  const [isOpen, setIsOpen] = useState(false);
  const [frequency, setFrequency] = useState<FrequencyMap>(
    () => initialFrequency ?? new Map(),
  );
  const parsedHotkey = useMemo(() => parseHotkey(hotkey), [hotkey]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (matchesHotkey(e, parsedHotkey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [parsedHotkey]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const registerCommands = useCallback((cmds: Command[]) => {
    dispatch({ type: 'register', commands: cmds });
    const ids = cmds.map((c) => c.id);
    return () => dispatch({ type: 'unregister', ids });
  }, []);

  const recordExecution = useCallback((commandId: string) => {
    setFrequency((prev) => {
      const next = new Map(prev);
      const entry = next.get(commandId);
      next.set(commandId, {
        count: (entry?.count ?? 0) + 1,
        lastUsed: Date.now(),
      });
      return next;
    });
  }, []);

  const value = useMemo<CommandPaletteContextValue>(
    () => ({
      commands,
      open,
      close,
      isOpen,
      registerCommands,
      frequency,
      recordExecution,
    }),
    [commands, open, close, isOpen, registerCommands, frequency, recordExecution],
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
    </CommandPaletteContext.Provider>
  );
}
