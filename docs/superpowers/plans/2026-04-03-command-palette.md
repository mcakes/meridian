# Command Palette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pluggable, keyboard-driven command palette that consuming apps fill with commands — supporting simple actions, async context-aware argument steps, custom renderers, and frequency-based ranking.

**Architecture:** Three layers — `CommandPaletteProvider` (context: registry, hotkey, frequency), `CommandPalette` (UI overlay with Radix Dialog), `useCommandPalette` (public hook). Commands are registered/unregistered by consuming components. Arg stepping walks through async resolvers that depend on prior selections.

**Tech Stack:** React 19, Radix Dialog, existing `fuzzyMatch` from `@/lib/format`, Meridian CSS custom properties, vitest for testing.

**Spec:** `docs/superpowers/specs/2026-04-03-command-palette-design.md`

---

## File Structure

```
src/components/command-palette/
  types.ts                     — All type definitions (Command, ArgDefinition, ArgOption, etc.)
  scoring.ts                   — Search ranking logic (fuzzy + frequency scoring)
  CommandPaletteProvider.tsx    — React context, registry, hotkey listener, frequency tracking
  useCommandPalette.ts          — Public hook (re-exports context consumer)
  CommandPalette.tsx            — UI overlay (input, results list, arg stepping, breadcrumbs)
  CommandPaletteItem.tsx        — Single result row (standard layout or custom renderer)

src/components/command-palette/__tests__/
  scoring.test.ts              — Scoring logic tests
  registry.test.ts             — Registration/unregistration tests
  arg-stepping.test.ts         — Arg state machine tests
```

Existing files modified:
- `src/components/index.ts` — Add barrel exports

---

### Task 1: Types

**Files:**
- Create: `src/components/command-palette/types.ts`

- [ ] **Step 1: Create the types file**

```ts
// src/components/command-palette/types.ts
import type { ReactNode } from 'react';

export interface Command {
  id: string;
  label: string;
  description?: string;
  category?: string;
  icon?: ReactNode;
  /** Display-only shortcut hint, e.g. "⌘T". Does not register a listener. */
  shortcut?: string;
  /** Additional terms included in fuzzy search beyond label/description. */
  keywords?: string[];
  /** Argument definitions. If present, palette enters arg-stepping mode on selection. */
  args?: ArgDefinition[];
  /** Called when the command is executed. Receives collected args if any. */
  execute: (args?: Record<string, string>) => void;
  /** Custom renderer for this command in the results list. */
  renderItem?: (props: ItemRenderProps) => ReactNode;
}

export interface ArgDefinition {
  name: string;
  label: string;
  /** Resolves available options. Receives args collected so far. */
  resolve: (context: Record<string, string>) => Promise<ArgOption[]>;
}

export interface ArgOption {
  label: string;
  value: string;
  description?: string;
}

export interface ItemRenderProps {
  command: Command;
  active: boolean;
  matchRanges: { start: number; end: number }[];
}

export interface FrequencyEntry {
  count: number;
  lastUsed: number;
}

export type FrequencyMap = Map<string, FrequencyEntry>;

export interface CommandPaletteContextValue {
  commands: Command[];
  open: () => void;
  close: () => void;
  isOpen: boolean;
  registerCommands: (commands: Command[]) => () => void;
  frequency: FrequencyMap;
  recordExecution: (commandId: string) => void;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep command-palette || echo "clean"`
Expected: "clean" (no errors)

- [ ] **Step 3: Commit**

```bash
git add src/components/command-palette/types.ts
git commit -m "feat(command-palette): add type definitions"
```

---

### Task 2: Scoring Logic

**Files:**
- Create: `src/components/command-palette/scoring.ts`
- Create: `src/components/command-palette/__tests__/scoring.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/components/command-palette/__tests__/scoring.test.ts
import { describe, it, expect } from 'vitest';
import { scoreCommand, rankCommands } from '../scoring';
import type { Command, FrequencyMap } from '../types';

function makeCommand(overrides: Partial<Command> & { id: string; label: string }): Command {
  return { execute: () => {}, ...overrides };
}

describe('scoreCommand', () => {
  it('returns null for no fuzzy match', () => {
    const cmd = makeCommand({ id: 'a', label: 'Toggle Theme' });
    const result = scoreCommand(cmd, 'zzz', new Map());
    expect(result).toBeNull();
  });

  it('scores exact substring higher than sequential match', () => {
    const cmd1 = makeCommand({ id: 'a', label: 'Toggle Theme' });
    const cmd2 = makeCommand({ id: 'b', label: 'Test Helpers' });
    const freq: FrequencyMap = new Map();
    const r1 = scoreCommand(cmd1, 'the', freq);
    const r2 = scoreCommand(cmd2, 'the', freq);
    expect(r1).not.toBeNull();
    expect(r2).not.toBeNull();
    // "Toggle Theme" has "the" as substring at index 7
    // "Test Helpers" has "the" — but actually "Test Helpers" does not contain "the"
    // as substring; t-h-e is sequential across "TesT HElpers" — no, "Test Helpers"
    // lower is "test helpers" which contains "the" — no, "test helpers" does not
    // contain substring "the". "t","e","s","t"," ","h","e","l"... no substring "the".
    // So r2 would be a sequential match with gap penalty.
    // r1 substring score = 100 - 7 = 93. r2 sequential ~50 - gaps.
    expect(r1!.score).toBeGreaterThan(r2!.score);
  });

  it('boosts score based on frequency (log dampened)', () => {
    const cmd = makeCommand({ id: 'a', label: 'Toggle Theme' });
    const noFreq: FrequencyMap = new Map();
    const withFreq: FrequencyMap = new Map([
      ['a', { count: 10, lastUsed: Date.now() }],
    ]);
    const r1 = scoreCommand(cmd, 'tog', noFreq);
    const r2 = scoreCommand(cmd, 'tog', withFreq);
    expect(r2!.score).toBeGreaterThan(r1!.score);
  });

  it('matches against keywords', () => {
    const cmd = makeCommand({
      id: 'a',
      label: 'Toggle Theme',
      keywords: ['dark', 'light', 'mode'],
    });
    const result = scoreCommand(cmd, 'dark', new Map());
    expect(result).not.toBeNull();
  });

  it('matches against description', () => {
    const cmd = makeCommand({
      id: 'a',
      label: 'Toggle Theme',
      description: 'Switch between dark and light mode',
    });
    const result = scoreCommand(cmd, 'switch', new Map());
    expect(result).not.toBeNull();
  });
});

describe('rankCommands', () => {
  it('returns commands sorted by score descending', () => {
    const cmds = [
      makeCommand({ id: 'a', label: 'Zebra Action' }),
      makeCommand({ id: 'b', label: 'Toggle Theme' }),
      makeCommand({ id: 'c', label: 'Theme Settings' }),
    ];
    const ranked = rankCommands(cmds, 'theme', new Map());
    expect(ranked.length).toBe(2); // "Zebra Action" doesn't match
    expect(ranked[0]!.command.id).toBe('c'); // "Theme" at start = higher substring score
    expect(ranked[1]!.command.id).toBe('b');
  });

  it('respects maxResults', () => {
    const cmds = Array.from({ length: 20 }, (_, i) =>
      makeCommand({ id: `cmd-${i}`, label: `Command ${i}` }),
    );
    const ranked = rankCommands(cmds, 'command', new Map(), 5);
    expect(ranked.length).toBe(5);
  });

  it('uses lastUsed as tiebreaker', () => {
    const cmds = [
      makeCommand({ id: 'a', label: 'Toggle Alpha' }),
      makeCommand({ id: 'b', label: 'Toggle Beta' }),
    ];
    const freq: FrequencyMap = new Map([
      ['a', { count: 1, lastUsed: 1000 }],
      ['b', { count: 1, lastUsed: 2000 }],
    ]);
    const ranked = rankCommands(cmds, 'toggle', freq);
    // Same fuzzy score, same frequency count, but b used more recently
    expect(ranked[0]!.command.id).toBe('b');
  });

  it('returns recents when query is empty', () => {
    const cmds = [
      makeCommand({ id: 'a', label: 'Alpha' }),
      makeCommand({ id: 'b', label: 'Beta' }),
      makeCommand({ id: 'c', label: 'Gamma' }),
    ];
    const freq: FrequencyMap = new Map([
      ['b', { count: 3, lastUsed: 2000 }],
      ['a', { count: 1, lastUsed: 1000 }],
    ]);
    const ranked = rankCommands(cmds, '', freq, 10);
    // Only commands with frequency data, ordered by lastUsed desc
    expect(ranked.length).toBe(2);
    expect(ranked[0]!.command.id).toBe('b');
    expect(ranked[1]!.command.id).toBe('a');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/command-palette/__tests__/scoring.test.ts 2>&1`
Expected: FAIL — module `../scoring` not found

- [ ] **Step 3: Implement scoring module**

```ts
// src/components/command-palette/scoring.ts
import { fuzzyMatch } from '@/lib/format';
import type { Command, FrequencyMap } from './types';

export interface ScoredCommand {
  command: Command;
  score: number;
  matchRanges: { start: number; end: number }[];
}

export function scoreCommand(
  command: Command,
  query: string,
  frequency: FrequencyMap,
): ScoredCommand | null {
  // Try matching label first (highest priority)
  let best = fuzzyMatch(command.label, query);
  let bestRanges = best?.ranges ?? [];

  // Try keywords
  if (command.keywords) {
    for (const kw of command.keywords) {
      const result = fuzzyMatch(kw, query);
      if (result && (!best || result.score > best.score)) {
        best = result;
        bestRanges = []; // keyword match — no label ranges to highlight
      }
    }
  }

  // Try description
  if (command.description) {
    const result = fuzzyMatch(command.description, query);
    if (result && (!best || result.score > best.score)) {
      best = result;
      bestRanges = []; // description match — no label ranges to highlight
    }
  }

  if (!best || best.score <= 0) return null;

  // Apply frequency boost: 0.1 * log(count + 1)
  const entry = frequency.get(command.id);
  const freqBoost = entry ? 0.1 * Math.log(entry.count + 1) : 0;

  return {
    command,
    score: best.score + freqBoost,
    matchRanges: bestRanges,
  };
}

export function rankCommands(
  commands: Command[],
  query: string,
  frequency: FrequencyMap,
  maxResults = 12,
): ScoredCommand[] {
  // Empty query → show recents ordered by lastUsed
  if (!query) {
    return commands
      .filter((cmd) => frequency.has(cmd.id))
      .map((cmd) => ({
        command: cmd,
        score: 0,
        matchRanges: [],
      }))
      .sort((a, b) => {
        const aLast = frequency.get(a.command.id)?.lastUsed ?? 0;
        const bLast = frequency.get(b.command.id)?.lastUsed ?? 0;
        return bLast - aLast;
      })
      .slice(0, maxResults);
  }

  const scored: ScoredCommand[] = [];
  for (const cmd of commands) {
    const result = scoreCommand(cmd, query, frequency);
    if (result) scored.push(result);
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Tiebreaker: lastUsed
    const aLast = frequency.get(a.command.id)?.lastUsed ?? 0;
    const bLast = frequency.get(b.command.id)?.lastUsed ?? 0;
    return bLast - aLast;
  });

  return scored.slice(0, maxResults);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/command-palette/__tests__/scoring.test.ts 2>&1`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/command-palette/scoring.ts src/components/command-palette/__tests__/scoring.test.ts
git commit -m "feat(command-palette): add scoring and ranking logic with tests"
```

---

### Task 3: Provider and Hook (Registry + Frequency + Hotkey)

**Files:**
- Create: `src/components/command-palette/CommandPaletteProvider.tsx`
- Create: `src/components/command-palette/useCommandPalette.ts`
- Create: `src/components/command-palette/__tests__/registry.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/components/command-palette/__tests__/registry.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from 'vitest/utils';

// We can't use renderHook without @testing-library/react.
// Test the registry logic directly by extracting it into a testable function.
// The provider uses a reducer internally — we test that reducer.
import {
  registryReducer,
  type RegistryAction,
} from '../CommandPaletteProvider';
import type { Command } from '../types';

function makeCommand(id: string): Command {
  return { id, label: `Command ${id}`, execute: () => {} };
}

describe('registryReducer', () => {
  it('adds commands', () => {
    const state: Command[] = [];
    const result = registryReducer(state, {
      type: 'register',
      commands: [makeCommand('a'), makeCommand('b')],
    });
    expect(result).toHaveLength(2);
    expect(result[0]!.id).toBe('a');
  });

  it('removes commands by id', () => {
    const state = [makeCommand('a'), makeCommand('b'), makeCommand('c')];
    const result = registryReducer(state, {
      type: 'unregister',
      ids: ['a', 'c'],
    });
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe('b');
  });

  it('replaces commands with the same id on re-register', () => {
    const original = makeCommand('a');
    original.label = 'Original';
    const updated = makeCommand('a');
    updated.label = 'Updated';

    const state = [original];
    const result = registryReducer(state, {
      type: 'register',
      commands: [updated],
    });
    expect(result).toHaveLength(1);
    expect(result[0]!.label).toBe('Updated');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/command-palette/__tests__/registry.test.ts 2>&1`
Expected: FAIL — module not found

- [ ] **Step 3: Implement the provider**

```tsx
// src/components/command-palette/CommandPaletteProvider.tsx
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
import type {
  Command,
  CommandPaletteContextValue,
  FrequencyEntry,
  FrequencyMap,
} from './types';

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

// --- Hotkey parsing ---

function parseHotkey(hotkey: string): { key: string; mod: boolean } {
  const parts = hotkey.toLowerCase().split('+');
  const mod = parts.includes('mod');
  const key = parts.filter((p) => p !== 'mod')[0] ?? '';
  return { key, mod };
}

function matchesHotkey(
  e: KeyboardEvent,
  parsed: { key: string; mod: boolean },
): boolean {
  if (parsed.mod && !(e.metaKey || e.ctrlKey)) return false;
  return e.key.toLowerCase() === parsed.key;
}

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

  // Hotkey listener
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
```

- [ ] **Step 4: Implement the hook**

```ts
// src/components/command-palette/useCommandPalette.ts
import { useContext } from 'react';
import {
  CommandPaletteContext,
} from './CommandPaletteProvider';
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/components/command-palette/__tests__/registry.test.ts 2>&1`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/command-palette/CommandPaletteProvider.tsx src/components/command-palette/useCommandPalette.ts src/components/command-palette/__tests__/registry.test.ts
git commit -m "feat(command-palette): add provider, hook, and registry with tests"
```

---

### Task 4: Arg Stepping State Machine

**Files:**
- Create: `src/components/command-palette/__tests__/arg-stepping.test.ts`

The arg stepping logic will live inside `CommandPalette.tsx`, but the state transitions are testable as a pure reducer. We'll define and test the reducer here, then use it in the UI component (Task 5).

- [ ] **Step 1: Write the failing tests**

```ts
// src/components/command-palette/__tests__/arg-stepping.test.ts
import { describe, it, expect } from 'vitest';
import { argStepReducer, type ArgStepState, type ArgStepAction } from '../CommandPalette';

describe('argStepReducer', () => {
  const initialState: ArgStepState = {
    phase: 'search',
    selectedCommand: null,
    argIndex: 0,
    collectedArgs: {},
    resolvedOptions: null,
    resolveError: null,
    loading: false,
  };

  it('transitions to stepping when a command with args is selected', () => {
    const state = argStepReducer(initialState, {
      type: 'select-command',
      command: {
        id: 'test',
        label: 'Test',
        args: [
          { name: 'a', label: 'A', resolve: async () => [] },
        ],
        execute: () => {},
      },
    });
    expect(state.phase).toBe('stepping');
    expect(state.argIndex).toBe(0);
    expect(state.selectedCommand?.id).toBe('test');
  });

  it('stays in search when a command without args is selected', () => {
    const state = argStepReducer(initialState, {
      type: 'select-command',
      command: {
        id: 'test',
        label: 'Test',
        execute: () => {},
      },
    });
    // No args → should not enter stepping; component handles execute + close
    expect(state.phase).toBe('search');
  });

  it('advances arg index and accumulates collected args', () => {
    const stepping: ArgStepState = {
      phase: 'stepping',
      selectedCommand: {
        id: 'test',
        label: 'Test',
        args: [
          { name: 'a', label: 'A', resolve: async () => [] },
          { name: 'b', label: 'B', resolve: async () => [] },
        ],
        execute: () => {},
      },
      argIndex: 0,
      collectedArgs: {},
      resolvedOptions: null,
      resolveError: null,
      loading: false,
    };

    const state = argStepReducer(stepping, {
      type: 'select-arg',
      name: 'a',
      value: 'val-a',
    });
    expect(state.argIndex).toBe(1);
    expect(state.collectedArgs).toEqual({ a: 'val-a' });
    expect(state.resolvedOptions).toBeNull();
    expect(state.loading).toBe(false);
  });

  it('goes back one step on backspace', () => {
    const stepping: ArgStepState = {
      phase: 'stepping',
      selectedCommand: {
        id: 'test',
        label: 'Test',
        args: [
          { name: 'a', label: 'A', resolve: async () => [] },
          { name: 'b', label: 'B', resolve: async () => [] },
        ],
        execute: () => {},
      },
      argIndex: 1,
      collectedArgs: { a: 'val-a' },
      resolvedOptions: null,
      resolveError: null,
      loading: false,
    };

    const state = argStepReducer(stepping, { type: 'go-back' });
    expect(state.argIndex).toBe(0);
    expect(state.collectedArgs).toEqual({});
  });

  it('returns to search on go-back from first arg', () => {
    const stepping: ArgStepState = {
      phase: 'stepping',
      selectedCommand: {
        id: 'test',
        label: 'Test',
        args: [
          { name: 'a', label: 'A', resolve: async () => [] },
        ],
        execute: () => {},
      },
      argIndex: 0,
      collectedArgs: {},
      resolvedOptions: null,
      resolveError: null,
      loading: false,
    };

    const state = argStepReducer(stepping, { type: 'go-back' });
    expect(state.phase).toBe('search');
    expect(state.selectedCommand).toBeNull();
  });

  it('sets loading state on resolve-start', () => {
    const stepping: ArgStepState = {
      phase: 'stepping',
      selectedCommand: null,
      argIndex: 0,
      collectedArgs: {},
      resolvedOptions: null,
      resolveError: null,
      loading: false,
    };

    const state = argStepReducer(stepping, { type: 'resolve-start' });
    expect(state.loading).toBe(true);
    expect(state.resolveError).toBeNull();
  });

  it('sets resolved options on resolve-success', () => {
    const options = [{ label: 'X', value: 'x' }];
    const stepping: ArgStepState = {
      phase: 'stepping',
      selectedCommand: null,
      argIndex: 0,
      collectedArgs: {},
      resolvedOptions: null,
      resolveError: null,
      loading: true,
    };

    const state = argStepReducer(stepping, { type: 'resolve-success', options });
    expect(state.loading).toBe(false);
    expect(state.resolvedOptions).toEqual(options);
  });

  it('sets error on resolve-error', () => {
    const stepping: ArgStepState = {
      phase: 'stepping',
      selectedCommand: null,
      argIndex: 0,
      collectedArgs: {},
      resolvedOptions: null,
      resolveError: null,
      loading: true,
    };

    const state = argStepReducer(stepping, {
      type: 'resolve-error',
      error: 'Network error',
    });
    expect(state.loading).toBe(false);
    expect(state.resolveError).toBe('Network error');
  });

  it('resets fully on reset action', () => {
    const stepping: ArgStepState = {
      phase: 'stepping',
      selectedCommand: { id: 'x', label: 'X', execute: () => {} },
      argIndex: 2,
      collectedArgs: { a: '1', b: '2' },
      resolvedOptions: [{ label: 'Y', value: 'y' }],
      resolveError: null,
      loading: false,
    };

    const state = argStepReducer(stepping, { type: 'reset' });
    expect(state).toEqual(initialState);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/command-palette/__tests__/arg-stepping.test.ts 2>&1`
Expected: FAIL — module not found

- [ ] **Step 3: Create CommandPalette.tsx with the reducer (UI shell comes in Task 5)**

```tsx
// src/components/command-palette/CommandPalette.tsx
import { useReducer } from 'react';
import type { ArgOption, Command } from './types';

// --- Arg stepping reducer (exported for testing) ---

export interface ArgStepState {
  phase: 'search' | 'stepping';
  selectedCommand: Command | null;
  argIndex: number;
  collectedArgs: Record<string, string>;
  resolvedOptions: ArgOption[] | null;
  resolveError: string | null;
  loading: boolean;
}

export type ArgStepAction =
  | { type: 'select-command'; command: Command }
  | { type: 'select-arg'; name: string; value: string }
  | { type: 'go-back' }
  | { type: 'resolve-start' }
  | { type: 'resolve-success'; options: ArgOption[] }
  | { type: 'resolve-error'; error: string }
  | { type: 'reset' };

const initialArgStepState: ArgStepState = {
  phase: 'search',
  selectedCommand: null,
  argIndex: 0,
  collectedArgs: {},
  resolvedOptions: null,
  resolveError: null,
  loading: false,
};

export function argStepReducer(
  state: ArgStepState,
  action: ArgStepAction,
): ArgStepState {
  switch (action.type) {
    case 'select-command': {
      if (!action.command.args || action.command.args.length === 0) {
        return state; // No args — component handles execute directly
      }
      return {
        ...state,
        phase: 'stepping',
        selectedCommand: action.command,
        argIndex: 0,
        collectedArgs: {},
        resolvedOptions: null,
        resolveError: null,
        loading: false,
      };
    }
    case 'select-arg': {
      const newArgs = { ...state.collectedArgs, [action.name]: action.value };
      return {
        ...state,
        argIndex: state.argIndex + 1,
        collectedArgs: newArgs,
        resolvedOptions: null,
        resolveError: null,
        loading: false,
      };
    }
    case 'go-back': {
      if (state.argIndex === 0) {
        return { ...initialArgStepState };
      }
      const prevArgName = state.selectedCommand?.args?.[state.argIndex - 1]?.name;
      const newArgs = { ...state.collectedArgs };
      if (prevArgName) delete newArgs[prevArgName];
      return {
        ...state,
        argIndex: state.argIndex - 1,
        collectedArgs: newArgs,
        resolvedOptions: null,
        resolveError: null,
        loading: false,
      };
    }
    case 'resolve-start':
      return { ...state, loading: true, resolveError: null };
    case 'resolve-success':
      return { ...state, loading: false, resolvedOptions: action.options };
    case 'resolve-error':
      return { ...state, loading: false, resolveError: action.error };
    case 'reset':
      return { ...initialArgStepState };
  }
}

// Full UI component will be added in Task 5.
// Placeholder export so TypeScript is happy.
export function CommandPalette(_props: { maxResults?: number }) {
  return null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/command-palette/__tests__/arg-stepping.test.ts 2>&1`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/command-palette/CommandPalette.tsx src/components/command-palette/__tests__/arg-stepping.test.ts
git commit -m "feat(command-palette): add arg stepping state machine with tests"
```

---

### Task 5: CommandPaletteItem Component

**Files:**
- Create: `src/components/command-palette/CommandPaletteItem.tsx`

- [ ] **Step 1: Create the result item component**

This component renders a single row in the results list — standard layout (icon + label + description + category + shortcut) or a custom renderer if the command provides one.

```tsx
// src/components/command-palette/CommandPaletteItem.tsx
import type { Command, ItemRenderProps } from './types';

interface HighlightedTextProps {
  text: string;
  ranges: { start: number; end: number }[];
}

function HighlightedText({ text, ranges }: HighlightedTextProps) {
  if (ranges.length === 0) return <span>{text}</span>;

  const parts: React.ReactNode[] = [];
  let cursor = 0;

  for (const range of ranges) {
    if (cursor < range.start) {
      parts.push(<span key={`p-${cursor}`}>{text.slice(cursor, range.start)}</span>);
    }
    parts.push(
      <mark
        key={`m-${range.start}`}
        style={{
          background: 'color-mix(in srgb, var(--color-info) 20%, transparent)',
          color: 'var(--color-info)',
          borderRadius: 1,
        }}
      >
        {text.slice(range.start, range.end)}
      </mark>,
    );
    cursor = range.end;
  }

  if (cursor < text.length) {
    parts.push(<span key="end">{text.slice(cursor)}</span>);
  }

  return <>{parts}</>;
}

interface CommandPaletteItemProps {
  command: Command;
  active: boolean;
  matchRanges: { start: number; end: number }[];
  onSelect: () => void;
  onHover: () => void;
}

export function CommandPaletteItem({
  command,
  active,
  matchRanges,
  onSelect,
  onHover,
}: CommandPaletteItemProps) {
  // Custom renderer
  if (command.renderItem) {
    const renderProps: ItemRenderProps = { command, active, matchRanges };
    return (
      <div
        onMouseDown={(e) => { e.preventDefault(); onSelect(); }}
        onMouseEnter={onHover}
        style={{
          cursor: 'pointer',
          backgroundColor: active ? 'var(--bg-highlight)' : 'transparent',
        }}
      >
        {command.renderItem(renderProps)}
      </div>
    );
  }

  // Standard layout
  return (
    <div
      onMouseDown={(e) => { e.preventDefault(); onSelect(); }}
      onMouseEnter={onHover}
      style={{
        padding: '8px 16px',
        cursor: 'pointer',
        backgroundColor: active ? 'var(--bg-highlight)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 13,
      }}
    >
      {command.icon && (
        <span style={{ width: 20, textAlign: 'center', flexShrink: 0 }}>
          {command.icon}
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
          <HighlightedText text={command.label} ranges={matchRanges} />
        </div>
        {command.description && (
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              marginTop: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {command.description}
          </div>
        )}
      </div>
      {command.category && (
        <span
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            background: 'color-mix(in srgb, var(--text-muted) 10%, transparent)',
            padding: '2px 6px',
            borderRadius: 2,
            flexShrink: 0,
          }}
        >
          {command.category}
        </span>
      )}
      {command.shortcut && (
        <span
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            fontFamily: 'monospace',
            flexShrink: 0,
          }}
        >
          {command.shortcut}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep command-palette || echo "clean"`
Expected: "clean"

- [ ] **Step 3: Commit**

```bash
git add src/components/command-palette/CommandPaletteItem.tsx
git commit -m "feat(command-palette): add result item component with standard and custom renderers"
```

---

### Task 6: CommandPalette UI Component

**Files:**
- Modify: `src/components/command-palette/CommandPalette.tsx` — replace placeholder with full implementation

- [ ] **Step 1: Replace the placeholder CommandPalette with the full UI**

Replace the entire contents of `src/components/command-palette/CommandPalette.tsx` with:

```tsx
// src/components/command-palette/CommandPalette.tsx
import { useContext, useEffect, useReducer, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { CommandPaletteContext } from './CommandPaletteProvider';
import { rankCommands } from './scoring';
import { CommandPaletteItem } from './CommandPaletteItem';
import type { ArgOption, Command } from './types';

// --- Arg stepping reducer ---

export interface ArgStepState {
  phase: 'search' | 'stepping';
  selectedCommand: Command | null;
  argIndex: number;
  collectedArgs: Record<string, string>;
  resolvedOptions: ArgOption[] | null;
  resolveError: string | null;
  loading: boolean;
}

export type ArgStepAction =
  | { type: 'select-command'; command: Command }
  | { type: 'select-arg'; name: string; value: string }
  | { type: 'go-back' }
  | { type: 'resolve-start' }
  | { type: 'resolve-success'; options: ArgOption[] }
  | { type: 'resolve-error'; error: string }
  | { type: 'reset' };

const initialArgStepState: ArgStepState = {
  phase: 'search',
  selectedCommand: null,
  argIndex: 0,
  collectedArgs: {},
  resolvedOptions: null,
  resolveError: null,
  loading: false,
};

export function argStepReducer(
  state: ArgStepState,
  action: ArgStepAction,
): ArgStepState {
  switch (action.type) {
    case 'select-command': {
      if (!action.command.args || action.command.args.length === 0) {
        return state;
      }
      return {
        ...state,
        phase: 'stepping',
        selectedCommand: action.command,
        argIndex: 0,
        collectedArgs: {},
        resolvedOptions: null,
        resolveError: null,
        loading: false,
      };
    }
    case 'select-arg': {
      const newArgs = { ...state.collectedArgs, [action.name]: action.value };
      return {
        ...state,
        argIndex: state.argIndex + 1,
        collectedArgs: newArgs,
        resolvedOptions: null,
        resolveError: null,
        loading: false,
      };
    }
    case 'go-back': {
      if (state.argIndex === 0) {
        return { ...initialArgStepState };
      }
      const prevArgName = state.selectedCommand?.args?.[state.argIndex - 1]?.name;
      const newArgs = { ...state.collectedArgs };
      if (prevArgName) delete newArgs[prevArgName];
      return {
        ...state,
        argIndex: state.argIndex - 1,
        collectedArgs: newArgs,
        resolvedOptions: null,
        resolveError: null,
        loading: false,
      };
    }
    case 'resolve-start':
      return { ...state, loading: true, resolveError: null };
    case 'resolve-success':
      return { ...state, loading: false, resolvedOptions: action.options };
    case 'resolve-error':
      return { ...state, loading: false, resolveError: action.error };
    case 'reset':
      return { ...initialArgStepState };
  }
}

// --- Skeleton rows for loading state ---

function SkeletonRows() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 120 + i * 30,
              height: 14,
              borderRadius: 2,
              background: 'var(--bg-highlight)',
              opacity: 0.5,
            }}
          />
        </div>
      ))}
    </>
  );
}

// --- Breadcrumbs ---

interface BreadcrumbsProps {
  commandLabel: string;
  args: { name: string }[];
  collectedArgs: Record<string, string>;
  currentArgIndex: number;
}

function Breadcrumbs({ commandLabel, args, collectedArgs, currentArgIndex }: BreadcrumbsProps) {
  const chipStyle = {
    fontSize: 11,
    color: 'color-mix(in srgb, var(--color-info) 70%, transparent)',
    background: 'color-mix(in srgb, var(--color-info) 10%, transparent)',
    padding: '2px 8px',
    borderRadius: 2,
  };
  const separatorStyle = {
    fontSize: 11,
    color: 'var(--text-muted)',
  };
  const pendingStyle = {
    fontSize: 11,
    color: 'var(--text-muted)',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <span style={chipStyle}>{commandLabel}</span>
      {args.slice(0, currentArgIndex).map((arg, i) => (
        <span key={i} style={{ display: 'contents' }}>
          <span style={separatorStyle}>›</span>
          <span style={chipStyle}>{collectedArgs[arg.name]}</span>
        </span>
      ))}
      {currentArgIndex < args.length && (
        <>
          <span style={separatorStyle}>›</span>
          <span style={pendingStyle}>{args[currentArgIndex]!.name}</span>
        </>
      )}
    </div>
  );
}

// --- Main component ---

interface CommandPaletteProps {
  maxResults?: number;
}

export function CommandPalette({ maxResults = 12 }: CommandPaletteProps) {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) return null;

  const { commands, isOpen, close, frequency, recordExecution } = ctx;
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [argStep, dispatchArgStep] = useReducer(argStepReducer, initialArgStepState);
  const [argQuery, setArgQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when palette opens/closes
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      dispatchArgStep({ type: 'reset' });
      setArgQuery('');
    }
  }, [isOpen]);

  // Resolve args when entering a new step
  useEffect(() => {
    if (argStep.phase !== 'stepping' || !argStep.selectedCommand?.args) return;
    const argDef = argStep.selectedCommand.args[argStep.argIndex];
    if (!argDef) return;

    dispatchArgStep({ type: 'resolve-start' });
    let cancelled = false;

    argDef
      .resolve(argStep.collectedArgs)
      .then((options) => {
        if (!cancelled) {
          dispatchArgStep({ type: 'resolve-success', options });
          setArgQuery('');
          setActiveIndex(0);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          dispatchArgStep({
            type: 'resolve-error',
            error: err instanceof Error ? err.message : 'Failed to load options',
          });
        }
      });

    return () => { cancelled = true; };
  }, [argStep.phase, argStep.argIndex, argStep.collectedArgs, argStep.selectedCommand]);

  // Compute visible results
  const searchResults = argStep.phase === 'search'
    ? rankCommands(commands, query, frequency, maxResults)
    : [];

  // Filter resolved arg options by argQuery
  const filteredArgOptions = argStep.resolvedOptions
    ? argStep.resolvedOptions.filter(
        (opt) =>
          !argQuery ||
          opt.label.toLowerCase().includes(argQuery.toLowerCase()) ||
          (opt.description?.toLowerCase().includes(argQuery.toLowerCase()) ?? false),
      )
    : [];

  const visibleCount =
    argStep.phase === 'search' ? searchResults.length : filteredArgOptions.length;

  // Clamp active index
  useEffect(() => {
    setActiveIndex((i) => Math.min(Math.max(i, 0), Math.max(visibleCount - 1, 0)));
  }, [visibleCount]);

  function handleSelect(command: Command) {
    if (command.args && command.args.length > 0) {
      dispatchArgStep({ type: 'select-command', command });
      setArgQuery('');
      setActiveIndex(0);
    } else {
      command.execute();
      recordExecution(command.id);
      close();
    }
  }

  function handleArgSelect(option: ArgOption) {
    if (!argStep.selectedCommand?.args) return;
    const argDef = argStep.selectedCommand.args[argStep.argIndex];
    if (!argDef) return;

    const newArgs = { ...argStep.collectedArgs, [argDef.name]: option.value };

    // Check if this is the last arg
    if (argStep.argIndex + 1 >= argStep.selectedCommand.args.length) {
      argStep.selectedCommand.execute(newArgs);
      recordExecution(argStep.selectedCommand.id);
      close();
    } else {
      dispatchArgStep({ type: 'select-arg', name: argDef.name, value: option.value });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, visibleCount - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (argStep.phase === 'search') {
        const item = searchResults[activeIndex];
        if (item) handleSelect(item.command);
      } else if (argStep.phase === 'stepping') {
        if (argStep.resolveError) {
          // Retry resolve
          const argDef = argStep.selectedCommand?.args?.[argStep.argIndex];
          if (argDef) {
            dispatchArgStep({ type: 'resolve-start' });
            argDef
              .resolve(argStep.collectedArgs)
              .then((options) => dispatchArgStep({ type: 'resolve-success', options }))
              .catch((err) =>
                dispatchArgStep({
                  type: 'resolve-error',
                  error: err instanceof Error ? err.message : 'Failed to load options',
                }),
              );
          }
        } else {
          const option = filteredArgOptions[activeIndex];
          if (option) handleArgSelect(option);
        }
      }
    } else if (e.key === 'Backspace') {
      if (argStep.phase === 'stepping' && argQuery === '') {
        e.preventDefault();
        dispatchArgStep({ type: 'go-back' });
        setQuery('');
        setActiveIndex(0);
      }
    }
  }

  const isStepping = argStep.phase === 'stepping';
  const currentArgDef = isStepping
    ? argStep.selectedCommand?.args?.[argStep.argIndex]
    : null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) close(); }}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
          }}
        />
        <Dialog.Content
          aria-label="Command palette"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
          style={{
            position: 'fixed',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            maxWidth: 520,
            width: '100%',
            background: 'var(--bg-surface)',
            borderRadius: 6,
            border: '1px solid var(--border-default)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}
        >
          {/* Input area */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {/* Breadcrumbs (arg stepping only) */}
            {isStepping && argStep.selectedCommand?.args && (
              <Breadcrumbs
                commandLabel={argStep.selectedCommand.label}
                args={argStep.selectedCommand.args}
                collectedArgs={argStep.collectedArgs}
                currentArgIndex={argStep.argIndex}
              />
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>⌘</span>
              <input
                ref={inputRef}
                type="text"
                value={isStepping ? argQuery : query}
                onChange={(e) => {
                  if (isStepping) {
                    setArgQuery(e.target.value);
                  } else {
                    setQuery(e.target.value);
                  }
                  setActiveIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder={
                  isStepping && currentArgDef
                    ? `Select ${currentArgDef.label}…`
                    : 'Type a command…'
                }
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  fontFamily: 'Inter, sans-serif',
                }}
              />
            </div>
          </div>

          {/* Results area */}
          <div style={{ maxHeight: 320, overflowY: 'auto', padding: '4px 0' }}>
            {argStep.phase === 'search' ? (
              // Search results
              searchResults.length === 0 ? (
                <div
                  style={{
                    padding: '12px 16px',
                    color: 'var(--text-muted)',
                    fontSize: 13,
                  }}
                >
                  {query ? 'No matching commands' : 'Type to search commands…'}
                </div>
              ) : (
                searchResults.map((result, i) => (
                  <CommandPaletteItem
                    key={result.command.id}
                    command={result.command}
                    active={i === activeIndex}
                    matchRanges={result.matchRanges}
                    onSelect={() => handleSelect(result.command)}
                    onHover={() => setActiveIndex(i)}
                  />
                ))
              )
            ) : (
              // Arg stepping
              <>
                {argStep.loading && <SkeletonRows />}
                {argStep.resolveError && (
                  <div
                    style={{
                      padding: '12px 16px',
                      color: 'var(--color-negative)',
                      fontSize: 13,
                    }}
                  >
                    {argStep.resolveError}
                    <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
                      ↵ retry · ⌫ back
                    </span>
                  </div>
                )}
                {!argStep.loading &&
                  !argStep.resolveError &&
                  filteredArgOptions.map((option, i) => (
                    <div
                      key={option.value}
                      onMouseDown={(e) => { e.preventDefault(); handleArgSelect(option); }}
                      onMouseEnter={() => setActiveIndex(i)}
                      style={{
                        padding: '8px 16px',
                        cursor: 'pointer',
                        backgroundColor:
                          i === activeIndex ? 'var(--bg-highlight)' : 'transparent',
                        fontSize: 13,
                      }}
                    >
                      <div
                        style={{
                          color:
                            i === activeIndex
                              ? 'var(--text-primary)'
                              : 'var(--text-secondary)',
                        }}
                      >
                        {option.label}
                      </div>
                      {option.description && (
                        <div
                          style={{
                            fontSize: 11,
                            color: 'var(--text-muted)',
                            marginTop: 1,
                          }}
                        >
                          {option.description}
                        </div>
                      )}
                    </div>
                  ))}
                {!argStep.loading &&
                  !argStep.resolveError &&
                  filteredArgOptions.length === 0 &&
                  argStep.resolvedOptions !== null && (
                    <div
                      style={{
                        padding: '12px 16px',
                        color: 'var(--text-muted)',
                        fontSize: 13,
                      }}
                    >
                      No matching options
                    </div>
                  )}
              </>
            )}
          </div>

          {/* Footer hints */}
          <div
            style={{
              padding: '6px 16px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end',
            }}
          >
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>↑↓ navigate</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>↵ select</span>
            {isStepping && (
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>⌫ back</span>
            )}
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>esc close</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep command-palette || echo "clean"`
Expected: "clean"

- [ ] **Step 3: Run all command-palette tests**

Run: `npx vitest run src/components/command-palette/ 2>&1`
Expected: All tests PASS (scoring, registry, arg-stepping)

- [ ] **Step 4: Commit**

```bash
git add src/components/command-palette/CommandPalette.tsx
git commit -m "feat(command-palette): implement full UI overlay with search and arg stepping"
```

---

### Task 7: Barrel Exports

**Files:**
- Modify: `src/components/index.ts`

- [ ] **Step 1: Add command palette exports to the barrel file**

Add the following at the end of `src/components/index.ts`:

```ts
// Command Palette
export { CommandPaletteProvider } from './command-palette/CommandPaletteProvider';
export { CommandPalette } from './command-palette/CommandPalette';
export { useCommandPalette } from './command-palette/useCommandPalette';
export type {
  Command,
  ArgDefinition,
  ArgOption,
  ItemRenderProps,
  FrequencyMap,
} from './command-palette/types';
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep command-palette || echo "clean"`
Expected: "clean"

- [ ] **Step 3: Verify build succeeds**

Run: `npm run build 2>&1 | tail -5`
Expected: Build completes without errors

- [ ] **Step 4: Commit**

```bash
git add src/components/index.ts
git commit -m "feat(command-palette): add barrel exports"
```

---

### Task 8: Integration in Demo App

**Files:**
- Modify: `src/demo/App.tsx` — wrap with provider, add palette, register demo commands

- [ ] **Step 1: Read the current demo App**

Read `src/demo/App.tsx` to understand the current structure before modifying.

- [ ] **Step 2: Add CommandPaletteProvider and CommandPalette to the demo app**

Wrap the existing demo content with `CommandPaletteProvider` and add `CommandPalette` inside it. Register a few demo commands that exercise different features:

- A simple action: "Toggle Theme" (no args)
- A command with args: "Jump to Panel" with one arg that resolves panel names from the workspace
- A command with multiple async args: "Load Vol Surface" with underlying → source → date

The exact code depends on the current `src/demo/App.tsx` structure (read in Step 1), so adapt accordingly. The key changes:

```tsx
import { CommandPaletteProvider, CommandPalette, useCommandPalette } from '@/components';

// Wrap existing content:
<CommandPaletteProvider hotkey="mod+k">
  <CommandPalette />
  {/* existing demo app content */}
  <DemoCommands />  {/* new component that registers commands */}
</CommandPaletteProvider>
```

Create a `DemoCommands` component that uses `useCommandPalette().registerCommands()` in a `useEffect` to register the demo commands listed above. This component renders nothing — it just registers commands.

- [ ] **Step 3: Verify the dev server starts and palette opens with Cmd+K**

Run: `npm run dev` (manual verification — open browser, press Cmd+K, confirm palette appears and demo commands are listed)

- [ ] **Step 4: Commit**

```bash
git add src/demo/App.tsx
git commit -m "feat(command-palette): integrate into demo app with sample commands"
```

---

### Task 9: Documentation Page

**Files:**
- Create: `src/site/pages/components/CommandPalettePage.tsx`
- Modify: `src/site/router.tsx` — add route

- [ ] **Step 1: Read the existing component page pattern**

Read one existing component page (e.g. `src/site/pages/components/InputsPage.tsx`) to understand the documentation page structure, then follow the same pattern.

- [ ] **Step 2: Create the documentation page**

Create `src/site/pages/components/CommandPalettePage.tsx` following the established page pattern. Include:

- Overview section explaining the pluggable architecture
- Live demo with a few registered commands (simple action + command with args)
- API reference showing the `Command` interface, `ArgDefinition`, provider props
- Code example showing integration pattern (provider + palette + useCommandPalette)

The exact code depends on the site page patterns discovered in Step 1.

- [ ] **Step 3: Add route to router**

Read `src/site/router.tsx`, then add a lazy-loaded route for the command palette page, following the existing pattern.

- [ ] **Step 4: Verify the page renders in the dev server**

Run: `npm run dev` (manual verification — navigate to the new page, confirm it renders correctly)

- [ ] **Step 5: Commit**

```bash
git add src/site/pages/components/CommandPalettePage.tsx src/site/router.tsx
git commit -m "docs: add command palette documentation page"
```

---

### Task 10: Final Verification

- [ ] **Step 1: Run all tests**

Run: `npx vitest run 2>&1`
Expected: All tests pass (existing + new command-palette tests)

- [ ] **Step 2: Run build**

Run: `npm run build 2>&1`
Expected: Build succeeds with no errors

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit 2>&1`
Expected: No type errors
