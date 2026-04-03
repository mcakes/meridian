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
          <span style={separatorStyle}>&rsaquo;</span>
          <span style={chipStyle}>{collectedArgs[arg.name]}</span>
        </span>
      ))}
      {currentArgIndex < args.length && (
        <>
          <span style={separatorStyle}>&rsaquo;</span>
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
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [argStep, dispatchArgStep] = useReducer(argStepReducer, initialArgStepState);
  const [argQuery, setArgQuery] = useState('');
  const [retryCounter, setRetryCounter] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = ctx?.commands ?? [];
  const isOpen = ctx?.isOpen ?? false;
  const close = ctx?.close ?? (() => {});
  const frequency = ctx?.frequency ?? new Map();
  const recordExecution = ctx?.recordExecution ?? (() => {});

  // Reset state when palette opens/closes
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      dispatchArgStep({ type: 'reset' });
      setArgQuery('');
    }
  }, [isOpen]);

  // Resolve args when entering a new step (also triggers on retry)
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
  }, [argStep.phase, argStep.argIndex, argStep.collectedArgs, argStep.selectedCommand, retryCounter]);

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

  if (!ctx) return null;

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
          // Retry by bumping counter — effect handles the actual resolve
          setRetryCounter((c) => c + 1);
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
  const resultsId = 'command-palette-results';

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
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>&#8984;</span>
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={visibleCount > 0}
                aria-controls={resultsId}
                aria-activedescendant={visibleCount > 0 ? `${resultsId}-${activeIndex}` : undefined}
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
                    ? `Select ${currentArgDef.label}\u2026`
                    : 'Type a command\u2026'
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
          <div id={resultsId} role="listbox" style={{ maxHeight: 320, overflowY: 'auto', padding: '4px 0' }}>
            {argStep.phase === 'search' ? (
              searchResults.length === 0 ? (
                <div
                  style={{
                    padding: '12px 16px',
                    color: 'var(--text-muted)',
                    fontSize: 13,
                  }}
                >
                  {query ? 'No matching commands' : 'Type to search commands\u2026'}
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
                      &#8629; retry &#183; &#9003; back
                    </span>
                  </div>
                )}
                {!argStep.loading &&
                  !argStep.resolveError &&
                  filteredArgOptions.map((option, i) => (
                    <div
                      key={option.value}
                      role="option"
                      aria-selected={i === activeIndex}
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
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>&#8593;&#8595; navigate</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>&#8629; select</span>
            {isStepping && (
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>&#9003; back</span>
            )}
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>esc close</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
