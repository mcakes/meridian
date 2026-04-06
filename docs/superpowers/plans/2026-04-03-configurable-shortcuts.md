# Configurable Shortcuts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make keyboard shortcuts rebindable via the ShortcutOverlay with click-to-record, conflict detection, per-shortcut and global reset, and persistence support.

**Architecture:** Add an overrides layer to the existing ShortcutProvider (Map<id, newKey>). The keydown listener resolves effective keys via overrides. The ShortcutOverlay gains recording mode with conflict blocking. New `keyboardEventToCombo` utility converts live KeyboardEvents to combo strings.

**Tech Stack:** React 19, existing shortcuts system, vitest for testing.

**Spec:** `docs/superpowers/specs/2026-04-03-configurable-shortcuts-design.md`

---

## File Structure

```
Modified:
  src/components/shortcuts/types.ts           — add overrides, rebind, resetBinding, resetAllBindings to context
  src/components/shortcuts/hotkeys.ts          — add keyboardEventToCombo utility
  src/components/shortcuts/ShortcutProvider.tsx — overrides state, new props, new methods, effective key in listener
  src/components/shortcuts/KeyBadge.tsx         — add onClick, recording props
  src/components/shortcuts/ShortcutOverlay.tsx  — recording mode, conflict display, reset buttons

New:
  src/components/shortcuts/__tests__/overrides.test.ts — rebind, reset, conflict tests
```

---

### Task 1: keyboardEventToCombo Utility

**Files:**
- Modify: `src/components/shortcuts/hotkeys.ts`
- Modify: `src/components/shortcuts/__tests__/hotkeys.test.ts`

- [ ] **Step 1: Write the failing tests**

Add to the end of `src/components/shortcuts/__tests__/hotkeys.test.ts`:

```ts
describe('keyboardEventToCombo', () => {
  it('builds mod+k from metaKey + k', () => {
    const e = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
    expect(keyboardEventToCombo(e)).toBe('mod+k');
  });

  it('builds mod+shift+t from metaKey + shiftKey + t', () => {
    const e = new KeyboardEvent('keydown', { key: 't', metaKey: true, shiftKey: true });
    expect(keyboardEventToCombo(e)).toBe('mod+shift+t');
  });

  it('builds alt+d from altKey + d', () => {
    const e = new KeyboardEvent('keydown', { key: 'd', altKey: true });
    expect(keyboardEventToCombo(e)).toBe('alt+d');
  });

  it('builds plain key for no modifiers', () => {
    const e = new KeyboardEvent('keydown', { key: 'a' });
    expect(keyboardEventToCombo(e)).toBe('a');
  });

  it('returns null for modifier-only keypress (Meta)', () => {
    const e = new KeyboardEvent('keydown', { key: 'Meta', metaKey: true });
    expect(keyboardEventToCombo(e)).toBeNull();
  });

  it('returns null for modifier-only keypress (Shift)', () => {
    const e = new KeyboardEvent('keydown', { key: 'Shift', shiftKey: true });
    expect(keyboardEventToCombo(e)).toBeNull();
  });

  it('returns null for modifier-only keypress (Control)', () => {
    const e = new KeyboardEvent('keydown', { key: 'Control', ctrlKey: true });
    expect(keyboardEventToCombo(e)).toBeNull();
  });

  it('lowercases the key', () => {
    const e = new KeyboardEvent('keydown', { key: 'K', metaKey: true });
    expect(keyboardEventToCombo(e)).toBe('mod+k');
  });

  it('handles special characters like ?', () => {
    const e = new KeyboardEvent('keydown', { key: '?', shiftKey: true });
    expect(keyboardEventToCombo(e)).toBe('?');
  });
});
```

Also add the import at the top of the file:

```ts
import {
  parseHotkey,
  matchesHotkey,
  normaliseKey,
  formatKeyForDisplay,
  keyboardEventToCombo,
} from '../hotkeys';
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/shortcuts/__tests__/hotkeys.test.ts 2>&1`
Expected: FAIL — `keyboardEventToCombo` is not exported

- [ ] **Step 3: Implement keyboardEventToCombo**

Add to the end of `src/components/shortcuts/hotkeys.ts`:

```ts
const MODIFIER_KEYS = new Set(['Meta', 'Control', 'Alt', 'Shift']);

/**
 * Converts a live KeyboardEvent into a combo string (e.g. "mod+shift+t").
 * Returns null if the event is a modifier-only keypress.
 */
export function keyboardEventToCombo(e: KeyboardEvent): string | null {
  if (MODIFIER_KEYS.has(e.key)) return null;

  const parts: string[] = [];
  if (e.metaKey || e.ctrlKey) parts.push('mod');
  if (e.shiftKey) parts.push('shift');
  if (e.altKey) parts.push('alt');

  const key = e.key.toLowerCase();

  // If shift is the only modifier and the key is a shifted character (like ?),
  // don't include shift — the key itself encodes it
  if (parts.length === 1 && parts[0] === 'shift' && key.length === 1 && /[^a-z0-9]/.test(key)) {
    return key;
  }

  parts.push(key);
  return parts.join('+');
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/shortcuts/__tests__/hotkeys.test.ts 2>&1`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/shortcuts/hotkeys.ts src/components/shortcuts/__tests__/hotkeys.test.ts
git commit -m "feat(shortcuts): add keyboardEventToCombo utility for recording"
```

---

### Task 2: Updated Types

**Files:**
- Modify: `src/components/shortcuts/types.ts`

- [ ] **Step 1: Update ShortcutContextValue**

Replace the entire contents of `src/components/shortcuts/types.ts` with:

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

export type RebindResult =
  | { ok: true }
  | { ok: false; conflictsWith: string };

export interface ShortcutContextValue {
  shortcuts: Shortcut[];
  register: (shortcuts: Shortcut[]) => () => void;
  open: () => void;
  close: () => void;
  isOpen: boolean;
  overrides: Map<string, string>;
  rebind: (shortcutId: string, newKey: string) => RebindResult;
  resetBinding: (shortcutId: string) => void;
  resetAllBindings: () => void;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | grep shortcuts || echo "clean"`
Expected: Errors in ShortcutProvider (it doesn't provide the new fields yet) — this is expected and will be fixed in Task 3.

- [ ] **Step 3: Commit**

```bash
git add src/components/shortcuts/types.ts
git commit -m "feat(shortcuts): add overrides and rebind types to ShortcutContextValue"
```

---

### Task 3: Provider Overrides

**Files:**
- Modify: `src/components/shortcuts/ShortcutProvider.tsx`
- Create: `src/components/shortcuts/__tests__/overrides.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/components/shortcuts/__tests__/overrides.test.ts
import { describe, it, expect } from 'vitest';
import {
  getEffectiveKey,
  checkRebindConflict,
} from '../ShortcutProvider';
import type { Shortcut } from '../types';

function makeShortcut(id: string, key: string): Shortcut {
  return { id, key, label: `Shortcut ${id}`, execute: () => {} };
}

describe('getEffectiveKey', () => {
  it('returns override when present', () => {
    const overrides = new Map([['a', 'mod+j']]);
    expect(getEffectiveKey(makeShortcut('a', 'mod+k'), overrides)).toBe('mod+j');
  });

  it('returns original key when no override', () => {
    const overrides = new Map<string, string>();
    expect(getEffectiveKey(makeShortcut('a', 'mod+k'), overrides)).toBe('mod+k');
  });
});

describe('checkRebindConflict', () => {
  it('returns null when no conflict', () => {
    const shortcuts = [makeShortcut('a', 'mod+k'), makeShortcut('b', 'mod+d')];
    const overrides = new Map<string, string>();
    const result = checkRebindConflict(shortcuts, overrides, 'a', 'mod+j');
    expect(result).toBeNull();
  });

  it('detects conflict with another shortcut effective key', () => {
    const shortcuts = [makeShortcut('a', 'mod+k'), makeShortcut('b', 'mod+d')];
    const overrides = new Map<string, string>();
    const result = checkRebindConflict(shortcuts, overrides, 'a', 'mod+d');
    expect(result).toBe('b');
  });

  it('detects conflict with an overridden shortcut', () => {
    const shortcuts = [makeShortcut('a', 'mod+k'), makeShortcut('b', 'mod+d')];
    const overrides = new Map([['b', 'mod+j']]);
    const result = checkRebindConflict(shortcuts, overrides, 'a', 'mod+j');
    expect(result).toBe('b');
  });

  it('does not conflict with self', () => {
    const shortcuts = [makeShortcut('a', 'mod+k')];
    const overrides = new Map<string, string>();
    const result = checkRebindConflict(shortcuts, overrides, 'a', 'mod+k');
    expect(result).toBeNull();
  });

  it('normalises keys for comparison', () => {
    const shortcuts = [makeShortcut('a', 'mod+k'), makeShortcut('b', 'shift+mod+t')];
    const overrides = new Map<string, string>();
    const result = checkRebindConflict(shortcuts, overrides, 'a', 'mod+shift+t');
    expect(result).toBe('b');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/shortcuts/__tests__/overrides.test.ts 2>&1`
Expected: FAIL — `getEffectiveKey` and `checkRebindConflict` not exported

- [ ] **Step 3: Update ShortcutProvider with overrides support**

Replace the entire contents of `src/components/shortcuts/ShortcutProvider.tsx` with:

```tsx
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

// --- Registry reducer ---

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

// --- Collision detection ---

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

// --- Effective key helpers (exported for testing) ---

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

  // Global keydown listener using effective keys
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/shortcuts/ 2>&1`
Expected: All tests PASS (hotkeys, registry, overrides)

- [ ] **Step 5: Run all tests**

Run: `npx vitest run 2>&1`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/shortcuts/ShortcutProvider.tsx src/components/shortcuts/__tests__/overrides.test.ts
git commit -m "feat(shortcuts): add overrides layer to provider with rebind and reset"
```

---

### Task 4: Interactive KeyBadge

**Files:**
- Modify: `src/components/shortcuts/KeyBadge.tsx`

- [ ] **Step 1: Update KeyBadge with onClick and recording states**

Replace the entire contents of `src/components/shortcuts/KeyBadge.tsx` with:

```tsx
// src/components/shortcuts/KeyBadge.tsx
import { formatKeyForDisplay } from './hotkeys';

const isMac =
  typeof navigator !== 'undefined' &&
  /mac/i.test((navigator as any).userAgentData?.platform ?? navigator.platform ?? '');

interface KeyBadgeProps {
  hotkey: string;
  muted?: boolean;
  onClick?: () => void;
  recording?: boolean;
}

export function KeyBadge({ hotkey, muted = false, onClick, recording = false }: KeyBadgeProps) {
  if (recording) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '1px 8px',
          fontSize: 11,
          fontFamily: 'monospace',
          lineHeight: '18px',
          color: 'var(--text-muted)',
          border: '1px solid var(--color-info)',
          borderRadius: 2,
          animation: 'pulse-border 1.5s ease-in-out infinite',
        }}
      >
        Press keys…
      </span>
    );
  }

  const parts = formatKeyForDisplay(hotkey, isMac);

  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex',
        gap: 3,
        cursor: onClick ? 'pointer' : undefined,
        borderRadius: 2,
        padding: '0 2px',
        transition: 'background-color 150ms ease',
      }}
      onMouseEnter={(e) => {
        if (onClick) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-highlight)';
      }}
      onMouseLeave={(e) => {
        if (onClick) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
      }}
    >
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
git commit -m "feat(shortcuts): add onClick and recording states to KeyBadge"
```

---

### Task 5: ShortcutOverlay Recording Mode

**Files:**
- Modify: `src/components/shortcuts/ShortcutOverlay.tsx`

- [ ] **Step 1: Replace the entire contents of ShortcutOverlay.tsx**

```tsx
// src/components/shortcuts/ShortcutOverlay.tsx
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ShortcutContext } from './ShortcutProvider';
import { getEffectiveKey } from './ShortcutProvider';
import { KeyBadge } from './KeyBadge';
import { keyboardEventToCombo } from './hotkeys';
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
  const overrides = ctx?.overrides ?? new Map();
  const rebind = ctx?.rebind;
  const resetBinding = ctx?.resetBinding;
  const resetAllBindings = ctx?.resetAllBindings;

  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [conflictLabel, setConflictLabel] = useState<string | null>(null);
  const recordingRef = useRef<string | null>(null);
  recordingRef.current = recordingId;

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
          if (ctx?.isOpen) {
            close();
          } else {
            open();
          }
        },
      },
    ]);
  }, [hotkey, register, open, close, ctx?.isOpen]);

  // Reset recording state when overlay closes
  useEffect(() => {
    if (!isOpen) {
      setRecordingId(null);
      setConflictLabel(null);
    }
  }, [isOpen]);

  // Recording keydown handler
  useEffect(() => {
    if (!recordingId || !rebind) return;

    function handleKeyDown(e: KeyboardEvent) {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'Escape') {
        setRecordingId(null);
        setConflictLabel(null);
        return;
      }

      const combo = keyboardEventToCombo(e);
      if (!combo) return; // modifier-only, keep listening

      const result = rebind(recordingRef.current!, combo);
      if (result.ok) {
        setRecordingId(null);
        setConflictLabel(null);
      } else {
        const conflicting = shortcuts.find((s) => s.id === result.conflictsWith);
        setConflictLabel(conflicting?.label ?? result.conflictsWith);
      }
    }

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [recordingId, rebind, shortcuts]);

  if (!ctx) return null;

  const groups = groupByCategory(shortcuts);
  const sorted = sortedCategories(groups);

  const startRecording = useCallback((id: string) => {
    setRecordingId(id);
    setConflictLabel(null);
  }, []);

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
                const isRecording = recordingId === shortcut.id;
                const effectiveKey = getEffectiveKey(shortcut, overrides);
                const isOverridden = overrides.has(shortcut.id);
                const dimmed = recordingId !== null && !isRecording;

                return (
                  <div key={shortcut.id}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 20px',
                        fontSize: 13,
                        opacity: dimmed ? 0.3 : 1,
                        transition: 'opacity 150ms ease',
                      }}
                    >
                      <span style={{ color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                        {shortcut.label}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <KeyBadge
                          hotkey={effectiveKey}
                          muted={disabled}
                          recording={isRecording}
                          onClick={disabled || dimmed ? undefined : () => startRecording(shortcut.id)}
                        />
                        {isOverridden && !isRecording && resetBinding && (
                          <span
                            onClick={() => resetBinding(shortcut.id)}
                            style={{
                              cursor: 'pointer',
                              fontSize: 13,
                              color: 'var(--text-muted)',
                              lineHeight: 1,
                              padding: '0 2px',
                              transition: 'color 150ms ease',
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                            }}
                          >
                            ×
                          </span>
                        )}
                      </span>
                    </div>
                    {isRecording && conflictLabel && (
                      <div
                        style={{
                          padding: '2px 20px 4px 20px',
                          fontSize: 11,
                          color: 'var(--color-negative)',
                        }}
                      >
                        Already used by {conflictLabel}
                      </div>
                    )}
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

          {/* Reset all button */}
          {overrides.size > 0 && resetAllBindings && (
            <div style={{ padding: '8px 20px 4px', borderTop: '1px solid var(--border-subtle)' }}>
              <span
                onClick={resetAllBindings}
                style={{
                  cursor: 'pointer',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  transition: 'color 150ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                }}
              >
                Reset all to defaults
              </span>
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
git commit -m "feat(shortcuts): add recording mode, conflict display, and reset to overlay"
```

---

### Task 6: CSS Keyframe for Pulse Animation

**Files:**
- Modify: `src/tokens/index.css`

The KeyBadge recording state uses a `pulse-border` animation. This needs a CSS keyframe.

- [ ] **Step 1: Read `src/tokens/index.css` to find where to add the keyframe**

Read the file to understand its structure before modifying.

- [ ] **Step 2: Add the keyframe**

Add at the end of `src/tokens/index.css`:

```css
@keyframes pulse-border {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -3`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/tokens/index.css
git commit -m "feat(shortcuts): add pulse-border keyframe for recording state"
```

---

### Task 7: Final Verification

- [ ] **Step 1: Run all tests**

Run: `npx vitest run 2>&1`
Expected: All tests pass

- [ ] **Step 2: Run build**

Run: `npm run build 2>&1`
Expected: Build succeeds

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit 2>&1`
Expected: No type errors
