import { describe, it, expect } from 'vitest';
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
