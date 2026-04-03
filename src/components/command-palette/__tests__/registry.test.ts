// src/components/command-palette/__tests__/registry.test.ts
import { describe, it, expect } from 'vitest';
import {
  registryReducer,
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
