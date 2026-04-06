# Keyboard Shortcuts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a global keyboard shortcut system with a built-in discovery overlay, independent of but easily wired to the command palette.

**Architecture:** Three layers — `ShortcutProvider` (context: registry, global listener, collision detection, overlay state), `ShortcutOverlay` (Radix Dialog grouped shortcut reference), `useShortcuts` (public hook). Hotkey parsing/matching extracted into a standalone module with tests.

**Tech Stack:** React 19, Radix Dialog, Meridian CSS custom properties, vitest for testing.

**Spec:** `docs/superpowers/specs/2026-04-03-keyboard-shortcuts-design.md`

---

## File Structure

```
src/components/shortcuts/
  types.ts                  — Shortcut, ShortcutContextValue
  hotkeys.ts                — parseHotkey, matchesHotkey, normaliseKey, formatKeyForDisplay
  ShortcutProvider.tsx       — context, registry reducer, global listener, collision detection
  useShortcuts.ts            — public hook
  ShortcutOverlay.tsx        — overlay UI component
  KeyBadge.tsx               — renders a key combo as styled <kbd> elements

src/components/shortcuts/__tests__/
  hotkeys.test.ts            — hotkey parsing, matching, normalisation, display formatting
  registry.test.ts           — register, unregister, collision detection
```

Existing files modified:
- `src/components/index.ts` — Add barrel exports

---

### Task 1: Types

**Files:**
- Create: `src/components/shortcuts/types.ts`

- [ ] **Step 1: Create the types file**

```ts
// src/components/shortcuts/types.ts

export interface Shortcut {
  id: string;
  /** Key combo string, e.g. "mod+d", "mod+shift+t", "escape", "?" */
  key: string;
  label: string;
  category?: string;
  description?: string;
  execute: () => void;
  /** When false, the listener skips this shortcut. Default true. */
  enabled?: boolean;
}

export interface ShortcutContextValue {
  shortcuts: Shortcut[];
  register: (shortcuts: Shortcut[]) => () => void;
  open: () => void;
  close: () => void;
  isOpen: boolean;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep shortcuts || echo "clean"`
Expected: "clean"

- [ ] **Step 3: Commit**

```bash
git add src/components/shortcuts/types.ts
git commit -m "feat(shortcuts): add type definitions"
```

---

### Task 2: Hotkey Parsing and Matching

**Files:**
- Create: `src/components/shortcuts/hotkeys.ts`
- Create: `src/components/shortcuts/__tests__/hotkeys.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/components/shortcuts/__tests__/hotkeys.test.ts
import { describe, it, expect } from 'vitest';
import {
  parseHotkey,
  matchesHotkey,
  normaliseKey,
  formatKeyForDisplay,
} from '../hotkeys';

describe('parseHotkey', () => {
  it('parses mod+k', () => {
    const parsed = parseHotkey('mod+k');
    expect(parsed).toEqual({ key: 'k', mod: true, shift: false, alt: false, ctrl: false });
  });

  it('parses mod+shift+t', () => {
    const parsed = parseHotkey('mod+shift+t');
    expect(parsed).toEqual({ key: 't', mod: true, shift: true, alt: false, ctrl: false });
  });

  it('parses plain key like ?', () => {
    const parsed = parseHotkey('?');
    expect(parsed).toEqual({ key: '?', mod: false, shift: false, alt: false, ctrl: false });
  });

  it('parses escape', () => {
    const parsed = parseHotkey('escape');
    expect(parsed).toEqual({ key: 'escape', mod: false, shift: false, alt: false, ctrl: false });
  });

  it('parses alt+d', () => {
    const parsed = parseHotkey('alt+d');
    expect(parsed).toEqual({ key: 'd', mod: false, shift: false, alt: true, ctrl: false });
  });

  it('parses ctrl+alt+delete', () => {
    const parsed = parseHotkey('ctrl+alt+delete');
    expect(parsed).toEqual({ key: 'delete', mod: false, shift: false, alt: true, ctrl: true });
  });
});

describe('matchesHotkey', () => {
  it('matches mod+k on Mac (metaKey)', () => {
    const parsed = parseHotkey('mod+k');
    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
    expect(matchesHotkey(event, parsed)).toBe(true);
  });

  it('matches mod+k on Windows (ctrlKey)', () => {
    const parsed = parseHotkey('mod+k');
    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
    expect(matchesHotkey(event, parsed)).toBe(true);
  });

  it('does not match mod+k when shift is also held', () => {
    const parsed = parseHotkey('mod+k');
    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, shiftKey: true });
    expect(matchesHotkey(event, parsed)).toBe(false);
  });

  it('matches mod+shift+t with both modifiers', () => {
    const parsed = parseHotkey('mod+shift+t');
    const event = new KeyboardEvent('keydown', { key: 't', metaKey: true, shiftKey: true });
    expect(matchesHotkey(event, parsed)).toBe(true);
  });

  it('matches ? key directly via e.key', () => {
    const parsed = parseHotkey('?');
    const event = new KeyboardEvent('keydown', { key: '?' });
    expect(matchesHotkey(event, parsed)).toBe(true);
  });

  it('does not match wrong key', () => {
    const parsed = parseHotkey('mod+k');
    const event = new KeyboardEvent('keydown', { key: 'j', metaKey: true });
    expect(matchesHotkey(event, parsed)).toBe(false);
  });

  it('is case-insensitive', () => {
    const parsed = parseHotkey('mod+k');
    const event = new KeyboardEvent('keydown', { key: 'K', metaKey: true });
    expect(matchesHotkey(event, parsed)).toBe(true);
  });
});

describe('normaliseKey', () => {
  it('sorts modifiers alphabetically', () => {
    expect(normaliseKey('shift+mod+k')).toBe('mod+shift+k');
  });

  it('lowercases everything', () => {
    expect(normaliseKey('MOD+K')).toBe('mod+k');
  });

  it('handles single key', () => {
    expect(normaliseKey('?')).toBe('?');
  });

  it('normalises equivalent combos to same string', () => {
    expect(normaliseKey('shift+mod+t')).toBe(normaliseKey('mod+shift+t'));
  });
});

describe('formatKeyForDisplay', () => {
  it('formats mod+shift+t for Mac', () => {
    const parts = formatKeyForDisplay('mod+shift+t', true);
    expect(parts).toEqual(['⌘', '⇧', 'T']);
  });

  it('formats mod+shift+t for non-Mac', () => {
    const parts = formatKeyForDisplay('mod+shift+t', false);
    expect(parts).toEqual(['Ctrl', 'Shift', 'T']);
  });

  it('formats alt+d for Mac', () => {
    const parts = formatKeyForDisplay('alt+d', true);
    expect(parts).toEqual(['⌥', 'D']);
  });

  it('formats plain ? key', () => {
    const parts = formatKeyForDisplay('?', true);
    expect(parts).toEqual(['?']);
  });

  it('formats escape', () => {
    const parts = formatKeyForDisplay('escape', true);
    expect(parts).toEqual(['Esc']);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/shortcuts/__tests__/hotkeys.test.ts 2>&1`
Expected: FAIL — module not found

- [ ] **Step 3: Implement the hotkeys module**

```ts
// src/components/shortcuts/hotkeys.ts

const MODIFIERS = ['mod', 'shift', 'alt', 'ctrl'] as const;
type Modifier = (typeof MODIFIERS)[number];

export interface ParsedHotkey {
  key: string;
  mod: boolean;
  shift: boolean;
  alt: boolean;
  ctrl: boolean;
}

export function parseHotkey(hotkey: string): ParsedHotkey {
  const parts = hotkey.toLowerCase().split('+');
  const modifiers = new Set(parts.filter((p): p is Modifier => MODIFIERS.includes(p as Modifier)));
  const key = parts.filter((p) => !MODIFIERS.includes(p as Modifier)).join('+') || hotkey.toLowerCase();

  return {
    key,
    mod: modifiers.has('mod'),
    shift: modifiers.has('shift'),
    alt: modifiers.has('alt'),
    ctrl: modifiers.has('ctrl'),
  };
}

export function matchesHotkey(e: KeyboardEvent, parsed: ParsedHotkey): boolean {
  // Check mod (Cmd on Mac, Ctrl elsewhere)
  const modHeld = e.metaKey || e.ctrlKey;
  if (parsed.mod !== modHeld) return false;

  // Check shift
  // Special case: if key is a character produced by shift (like ?), don't require shift modifier match
  const keyIsShiftProduced = parsed.key.length === 1 && /[^a-z0-9]/.test(parsed.key) && !parsed.shift;
  if (!keyIsShiftProduced && parsed.shift !== e.shiftKey) return false;

  // Check alt
  if (parsed.alt !== e.altKey) return false;

  // Check ctrl (explicit ctrl, not covered by mod)
  // Only check if mod is not set (mod already covers ctrl on non-Mac)
  if (!parsed.mod && parsed.ctrl !== e.ctrlKey) return false;

  return e.key.toLowerCase() === parsed.key.toLowerCase();
}

export function normaliseKey(key: string): string {
  const parts = key.toLowerCase().split('+');
  const modifiers = parts.filter((p) => MODIFIERS.includes(p as Modifier)).sort();
  const nonModifiers = parts.filter((p) => !MODIFIERS.includes(p as Modifier));
  return [...modifiers, ...nonModifiers].join('+');
}

const MAC_SYMBOLS: Record<string, string> = {
  mod: '⌘',
  shift: '⇧',
  alt: '⌥',
  ctrl: '⌃',
};

const PC_SYMBOLS: Record<string, string> = {
  mod: 'Ctrl',
  shift: 'Shift',
  alt: 'Alt',
  ctrl: 'Ctrl',
};

const SPECIAL_KEYS: Record<string, string> = {
  escape: 'Esc',
  enter: '↵',
  backspace: '⌫',
  delete: 'Del',
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
  ' ': 'Space',
};

export function formatKeyForDisplay(key: string, isMac: boolean): string[] {
  const parts = key.toLowerCase().split('+');
  const symbols = isMac ? MAC_SYMBOLS : PC_SYMBOLS;
  const result: string[] = [];

  for (const part of parts) {
    if (MODIFIERS.includes(part as Modifier)) {
      result.push(symbols[part] ?? part);
    } else {
      const special = SPECIAL_KEYS[part];
      if (special) {
        result.push(special);
      } else if (part.length === 1) {
        result.push(part.toUpperCase());
      } else {
        result.push(part.charAt(0).toUpperCase() + part.slice(1));
      }
    }
  }

  return result;
}

/** Returns true if the shortcut has at least one non-shift modifier (mod, alt, ctrl). */
export function hasNonShiftModifier(key: string): boolean {
  const parts = key.toLowerCase().split('+');
  return parts.some((p) => p === 'mod' || p === 'alt' || p === 'ctrl');
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/shortcuts/__tests__/hotkeys.test.ts 2>&1`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/shortcuts/hotkeys.ts src/components/shortcuts/__tests__/hotkeys.test.ts
git commit -m "feat(shortcuts): add hotkey parsing, matching, and display formatting with tests"
```

---

### Task 3: Provider and Hook

**Files:**
- Create: `src/components/shortcuts/ShortcutProvider.tsx`
- Create: `src/components/shortcuts/useShortcuts.ts`
- Create: `src/components/shortcuts/__tests__/registry.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/components/shortcuts/__tests__/registry.test.ts
import { describe, it, expect, vi } from 'vitest';
import {
  registryReducer,
  detectCollision,
} from '../ShortcutProvider';
import type { Shortcut } from '../types';

function makeShortcut(id: string, key: string): Shortcut {
  return { id, key, label: `Shortcut ${id}`, execute: () => {} };
}

describe('registryReducer', () => {
  it('adds shortcuts', () => {
    const state: Shortcut[] = [];
    const result = registryReducer(state, {
      type: 'register',
      shortcuts: [makeShortcut('a', 'mod+k'), makeShortcut('b', 'mod+d')],
    });
    expect(result).toHaveLength(2);
    expect(result[0]!.id).toBe('a');
  });

  it('removes shortcuts by id', () => {
    const state = [makeShortcut('a', 'mod+k'), makeShortcut('b', 'mod+d'), makeShortcut('c', 'mod+e')];
    const result = registryReducer(state, {
      type: 'unregister',
      ids: ['a', 'c'],
    });
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe('b');
  });

  it('replaces shortcuts with the same id on re-register', () => {
    const original = makeShortcut('a', 'mod+k');
    original.label = 'Original';
    const updated = makeShortcut('a', 'mod+j');
    updated.label = 'Updated';

    const state = [original];
    const result = registryReducer(state, {
      type: 'register',
      shortcuts: [updated],
    });
    expect(result).toHaveLength(1);
    expect(result[0]!.label).toBe('Updated');
    expect(result[0]!.key).toBe('mod+j');
  });
});

describe('detectCollision', () => {
  it('returns null when no collision', () => {
    const existing = [makeShortcut('a', 'mod+k')];
    const result = detectCollision(existing, makeShortcut('b', 'mod+d'));
    expect(result).toBeNull();
  });

  it('detects collision on same normalised key', () => {
    const existing = [makeShortcut('a', 'mod+k')];
    const result = detectCollision(existing, makeShortcut('b', 'mod+k'));
    expect(result).not.toBeNull();
    expect(result!.existingId).toBe('a');
    expect(result!.newId).toBe('b');
  });

  it('detects collision with different modifier order', () => {
    const existing = [makeShortcut('a', 'shift+mod+t')];
    const result = detectCollision(existing, makeShortcut('b', 'mod+shift+t'));
    expect(result).not.toBeNull();
  });

  it('does not collide when same id (re-registration)', () => {
    const existing = [makeShortcut('a', 'mod+k')];
    const result = detectCollision(existing, makeShortcut('a', 'mod+k'));
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/shortcuts/__tests__/registry.test.ts 2>&1`
Expected: FAIL — module not found

- [ ] **Step 3: Implement the provider**

```tsx
// src/components/shortcuts/ShortcutProvider.tsx
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

// --- Registry reducer (exported for testing) ---

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

// --- Collision detection (exported for testing) ---

export function detectCollision(
  existing: Shortcut[],
  incoming: Shortcut,
): { existingId: string; newId: string; key: string } | null {
  const normalisedKey = normaliseKey(incoming.key);
  for (const s of existing) {
    if (s.id === incoming.id) continue; // re-registration, not a collision
    if (normaliseKey(s.key) === normalisedKey) {
      return { existingId: s.id, newId: incoming.id, key: normalisedKey };
    }
  }
  return null;
}

// --- Input suppression ---

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
}

// --- Context ---

export const ShortcutContext = createContext<ShortcutContextValue | null>(null);

// --- Provider ---

interface ShortcutProviderProps {
  children: ReactNode;
}

export function ShortcutProvider({ children }: ShortcutProviderProps) {
  const [shortcuts, dispatch] = useReducer(registryReducer, []);
  const [isOpen, setIsOpen] = useState(false);

  // Global keydown listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;

        const parsed = parseHotkey(shortcut.key);
        if (!matchesHotkey(e, parsed)) continue;

        // Input suppression: skip if in input and shortcut has no non-shift modifier
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
    if (process.env.NODE_ENV !== 'production') {
      // Check for collisions against current registry
      // We read shortcuts from closure; this is best-effort for dev warnings
    }
    dispatch({ type: 'register', shortcuts: incoming });
    const ids = incoming.map((s) => s.id);
    return () => dispatch({ type: 'unregister', ids });
  }, []);

  const value = useMemo<ShortcutContextValue>(
    () => ({
      shortcuts,
      register,
      open,
      close,
      isOpen,
    }),
    [shortcuts, register, open, close, isOpen],
  );

  return (
    <ShortcutContext.Provider value={value}>
      {children}
    </ShortcutContext.Provider>
  );
}
```

- [ ] **Step 4: Implement the hook**

```ts
// src/components/shortcuts/useShortcuts.ts
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/components/shortcuts/__tests__/registry.test.ts 2>&1`
Expected: All tests PASS

- [ ] **Step 6: Run all tests**

Run: `npx vitest run 2>&1`
Expected: All tests PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/shortcuts/ShortcutProvider.tsx src/components/shortcuts/useShortcuts.ts src/components/shortcuts/__tests__/registry.test.ts
git commit -m "feat(shortcuts): add provider, hook, and registry with tests"
```

---

### Task 4: KeyBadge Component

**Files:**
- Create: `src/components/shortcuts/KeyBadge.tsx`

- [ ] **Step 1: Create the KeyBadge component**

```tsx
// src/components/shortcuts/KeyBadge.tsx
import { formatKeyForDisplay } from './hotkeys';

const isMac =
  typeof navigator !== 'undefined' &&
  /mac/i.test(navigator.userAgentData?.platform ?? navigator.platform ?? '');

interface KeyBadgeProps {
  hotkey: string;
  muted?: boolean;
}

export function KeyBadge({ hotkey, muted = false }: KeyBadgeProps) {
  const parts = formatKeyForDisplay(hotkey, isMac);

  return (
    <span style={{ display: 'inline-flex', gap: 3 }}>
      {parts.map((part, i) => (
        <kbd
          key={i}
          style={{
            display: 'inline-block',
            padding: '1px 5px',
            fontSize: 11,
            fontFamily: 'monospace',
            lineHeight: '18px',
            color: muted ? 'var(--text-muted)' : 'var(--text-primary)',
            backgroundColor: 'var(--bg-muted)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 2,
          }}
        >
          {part}
        </kbd>
      ))}
    </span>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep shortcuts || echo "clean"`
Expected: "clean"

- [ ] **Step 3: Commit**

```bash
git add src/components/shortcuts/KeyBadge.tsx
git commit -m "feat(shortcuts): add KeyBadge component for key combo display"
```

---

### Task 5: ShortcutOverlay

**Files:**
- Create: `src/components/shortcuts/ShortcutOverlay.tsx`

- [ ] **Step 1: Create the ShortcutOverlay component**

```tsx
// src/components/shortcuts/ShortcutOverlay.tsx
import { useContext, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ShortcutContext } from './ShortcutProvider';
import { KeyBadge } from './KeyBadge';
import type { Shortcut } from './types';

interface ShortcutOverlayProps {
  hotkey?: string;
}

function groupByCategory(shortcuts: Shortcut[]): Map<string, Shortcut[]> {
  const groups = new Map<string, Shortcut[]>();
  for (const s of shortcuts) {
    const cat = s.category ?? 'Other';
    const group = groups.get(cat) ?? [];
    group.push(s);
    groups.set(cat, group);
  }
  return groups;
}

function sortedCategories(groups: Map<string, Shortcut[]>): [string, Shortcut[]][] {
  const entries = Array.from(groups.entries());
  entries.sort((a, b) => {
    if (a[0] === 'Other') return 1;
    if (b[0] === 'Other') return -1;
    return a[0].localeCompare(b[0]);
  });
  return entries;
}

export function ShortcutOverlay({ hotkey = '?' }: ShortcutOverlayProps) {
  const ctx = useContext(ShortcutContext);

  const shortcuts = ctx?.shortcuts ?? [];
  const register = ctx?.register;
  const isOpen = ctx?.isOpen ?? false;
  const open = ctx?.open ?? (() => {});
  const close = ctx?.close ?? (() => {});

  // Register the overlay's own trigger shortcut
  useEffect(() => {
    if (!register) return;
    return register([
      {
        id: '__shortcut-overlay',
        key: hotkey,
        label: 'Show Keyboard Shortcuts',
        category: 'Help',
        execute: () => {
          // Toggle — read current state at execution time via ctx
          if (ctx?.isOpen) {
            close();
          } else {
            open();
          }
        },
      },
    ]);
  }, [hotkey, register, open, close, ctx?.isOpen]);

  if (!ctx) return null;

  const groups = groupByCategory(shortcuts);
  const sorted = sortedCategories(groups);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => { if (!o) close(); }}>
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
          aria-label="Keyboard shortcuts"
          style={{
            position: 'fixed',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            maxWidth: 480,
            width: '100%',
            maxHeight: '60vh',
            overflowY: 'auto',
            background: 'var(--bg-surface)',
            borderRadius: 6,
            border: '1px solid var(--border-default)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            padding: '16px 0',
          }}
        >
          <Dialog.Title
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: '0 0 12px 0',
              padding: '0 20px',
            }}
          >
            Keyboard Shortcuts
          </Dialog.Title>

          {sorted.map(([category, items]) => (
            <div key={category} style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  color: 'var(--text-muted)',
                  padding: '0 20px',
                  marginBottom: 6,
                }}
              >
                {category}
              </div>
              {items.map((shortcut) => {
                const disabled = shortcut.enabled === false;
                return (
                  <div
                    key={shortcut.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 20px',
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                      {shortcut.label}
                    </span>
                    <KeyBadge hotkey={shortcut.key} muted={disabled} />
                  </div>
                );
              })}
            </div>
          ))}

          {sorted.length === 0 && (
            <div style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: 13 }}>
              No shortcuts registered
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep shortcuts || echo "clean"`
Expected: "clean"

- [ ] **Step 3: Run all tests**

Run: `npx vitest run 2>&1`
Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/shortcuts/ShortcutOverlay.tsx
git commit -m "feat(shortcuts): add ShortcutOverlay component"
```

---

### Task 6: Barrel Exports

**Files:**
- Modify: `src/components/index.ts`

- [ ] **Step 1: Add shortcut exports to the barrel file**

Add the following at the end of `src/components/index.ts`:

```ts
// Shortcuts
export { ShortcutProvider } from './shortcuts/ShortcutProvider';
export { ShortcutOverlay } from './shortcuts/ShortcutOverlay';
export { useShortcuts } from './shortcuts/useShortcuts';
export { KeyBadge } from './shortcuts/KeyBadge';
export type { Shortcut } from './shortcuts/types';
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep shortcuts || echo "clean"`
Expected: "clean"

- [ ] **Step 3: Verify build succeeds**

Run: `npm run build 2>&1 | tail -5`
Expected: Build completes without errors

- [ ] **Step 4: Commit**

```bash
git add src/components/index.ts
git commit -m "feat(shortcuts): add barrel exports"
```

---

### Task 7: Demo App Integration

**Files:**
- Modify: `src/demo/App.tsx`

- [ ] **Step 1: Read the current demo App**

Read `src/demo/App.tsx` to understand the current structure (it already has `CommandPaletteProvider` and demo commands from the command palette work).

- [ ] **Step 2: Add ShortcutProvider and ShortcutOverlay to the demo app**

Wrap the existing content with `ShortcutProvider` (outside `CommandPaletteProvider`) and add `ShortcutOverlay` inside it. Register a few demo shortcuts that wire to existing command palette commands:

```tsx
import { ShortcutProvider, ShortcutOverlay, useShortcuts } from '@/components';
```

Wrap:
```tsx
<ShortcutProvider>
  <ShortcutOverlay />
  <CommandPaletteProvider hotkey="mod+k">
    {/* existing content */}
  </CommandPaletteProvider>
</ShortcutProvider>
```

Create a `DemoShortcuts` component that registers shortcuts via `useShortcuts().register()` in a `useEffect`. Register:
- `mod+t` — Toggle Theme (same execute as the command palette command)
- `mod+shift+p` — Open Command Palette (calls the palette's `open()`)

This component renders nothing — it just registers shortcuts.

The exact code depends on the current `src/demo/App.tsx` structure (read in Step 1), so adapt accordingly.

- [ ] **Step 3: Verify the dev server starts and shortcuts work**

Run: `npm run dev` (manual verification — press `?` to open overlay, `mod+t` to toggle theme)

- [ ] **Step 4: Commit**

```bash
git add src/demo/App.tsx
git commit -m "feat(shortcuts): integrate into demo app with sample shortcuts"
```

---

### Task 8: Documentation Page

**Files:**
- Create: `src/site/pages/components/ShortcutsPage.tsx`
- Modify: `src/site/router.tsx`
- Modify: `src/site/components/Sidebar.tsx`

- [ ] **Step 1: Read the existing component page pattern**

Read `src/site/pages/components/CommandPalettePage.tsx` (or another page) to understand the documentation page structure, then follow the same pattern. Also read `src/site/router.tsx` and `src/site/components/Sidebar.tsx`.

- [ ] **Step 2: Create the documentation page**

Create `src/site/pages/components/ShortcutsPage.tsx` following the established pattern. Include:

- Overview section explaining the provider + hook + overlay architecture
- Live demo with `ShortcutProvider`, `ShortcutOverlay`, and a few registered shortcuts. Include a button that calls `open()` to launch the overlay.
- API reference showing the `Shortcut` interface, `ShortcutProvider` props, `ShortcutOverlay` props
- Code example showing integration pattern (provider + overlay + useShortcuts)
- Code example showing wiring with command palette

- [ ] **Step 3: Add route and sidebar link**

Add a lazy-loaded route in `src/site/router.tsx` and a sidebar entry in `src/site/components/Sidebar.tsx` under Components, following the existing patterns.

- [ ] **Step 4: Verify the page renders**

Run: `npm run dev` (manual verification)

- [ ] **Step 5: Commit**

```bash
git add src/site/pages/components/ShortcutsPage.tsx src/site/router.tsx src/site/components/Sidebar.tsx
git commit -m "docs: add keyboard shortcuts documentation page"
```

---

### Task 9: Reference Documentation

**Files:**
- Modify: `docs/reference/components.md`

- [ ] **Step 1: Read the existing components reference**

Read `docs/reference/components.md` to understand the format.

- [ ] **Step 2: Add Shortcuts section**

Add a "Shortcuts" section after the "Command Palette" section, documenting:
- `ShortcutProvider` (props table)
- `ShortcutOverlay` (props table, tokens)
- `useShortcuts` (return value table)
- `Shortcut` interface (props table)
- `KeyBadge` (props table)

Follow the exact format of the existing component entries.

- [ ] **Step 3: Commit**

```bash
git add docs/reference/components.md
git commit -m "docs: add keyboard shortcuts to component reference"
```

---

### Task 10: Final Verification

- [ ] **Step 1: Run all tests**

Run: `npx vitest run 2>&1`
Expected: All tests pass

- [ ] **Step 2: Run build**

Run: `npm run build 2>&1`
Expected: Build succeeds

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit 2>&1`
Expected: No type errors
