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
          // Toggle — we need to read current state at execution time
          // Using ctx ref would be stale, so the provider toggles via the open/close it gives us
          // Since this effect re-runs when ctx.isOpen changes, the closure is fresh
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
