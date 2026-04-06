// src/components/shortcuts/ShortcutOverlay.tsx
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ShortcutContext } from './ShortcutProvider';
import { getEffectiveKey } from './ShortcutProvider';
import { KeyBadge } from './KeyBadge';
import { keyboardEventToCombo } from './hotkeys';
import type { Shortcut } from './types';
import '../shared.css';

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

      const result = rebind!(recordingRef.current!, combo);
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

                const clickable = !disabled && !dimmed && !isRecording;

                return (
                  <div key={shortcut.id}>
                    <div
                      className={clickable ? 'm-row-interactive' : undefined}
                      onClick={clickable ? () => startRecording(shortcut.id) : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 20px',
                        fontSize: 13,
                        opacity: dimmed ? 0.3 : 1,
                        cursor: clickable ? 'pointer' : undefined,
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
                        />
                        {isOverridden && !isRecording && resetBinding && (
                          <span
                            className="m-link"
                            onClick={() => resetBinding(shortcut.id)}
                            style={{
                              fontSize: 13,
                              lineHeight: 1,
                              padding: '0 2px',
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
                className="m-link"
                onClick={resetAllBindings}
                style={{ fontSize: 11 }}
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
