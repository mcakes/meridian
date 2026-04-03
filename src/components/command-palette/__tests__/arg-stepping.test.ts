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
