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
