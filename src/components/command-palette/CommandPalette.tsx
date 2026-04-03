// src/components/command-palette/CommandPalette.tsx
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

// Placeholder — full UI component will replace this in Task 6.
export function CommandPalette(_props: { maxResults?: number }) {
  return null;
}
