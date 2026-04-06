import { useEffect } from 'react';
import { Section } from '../../components/Section';
import { ComponentDemo } from '../../components/ComponentDemo';
import { Button } from '@/components/inputs/Button';
import { ShortcutProvider, ShortcutOverlay, useShortcuts, KeyBadge } from '@/components';
import type { Shortcut } from '@/components';

// ---- Demo shortcuts ----

const DEMO_SHORTCUTS: Shortcut[] = [
  {
    id: 'demo.new-order',
    key: 'mod+n',
    label: 'New Order',
    category: 'Trading',
    description: 'Open the order entry ticket',
    execute: () => alert('New Order opened'),
  },
  {
    id: 'demo.refresh',
    key: 'mod+r',
    label: 'Refresh Data',
    category: 'View',
    description: 'Force a full data refresh',
    execute: () => alert('Data refreshed'),
  },
  {
    id: 'demo.export',
    key: 'mod+shift+e',
    label: 'Export Blotter',
    category: 'Data',
    description: 'Download trade blotter as CSV',
    execute: () => alert('Blotter exported'),
  },
  {
    id: 'demo.toggle-sidebar',
    key: 'mod+\\',
    label: 'Toggle Sidebar',
    category: 'View',
    execute: () => alert('Sidebar toggled'),
  },
];

// ---- Launch button (consumes context) ----

function LaunchButton() {
  const { open, register } = useShortcuts();

  useEffect(() => {
    return register(DEMO_SHORTCUTS);
  }, [register]);

  return (
    <Button size="sm" onClick={open}>
      Show Keyboard Shortcuts
    </Button>
  );
}

// ---- Prop table ----

interface PropRow {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

const SHORTCUT_PROPS: PropRow[] = [
  { name: 'id', type: 'string', required: true, description: 'Unique identifier used for deduplication. Registering an id that already exists replaces the previous entry.' },
  { name: 'key', type: 'string', required: true, description: 'Key combo string, e.g. "mod+k", "mod+shift+t", "escape", "?". Use "mod" for ⌘/Ctrl.' },
  { name: 'label', type: 'string', required: true, description: 'Display text shown in the overlay.' },
  { name: 'execute', type: '() => void', required: true, description: 'Called when the key combo fires.' },
  { name: 'category', type: 'string', required: false, description: 'Group label shown as a section header in the overlay. Defaults to "Other".' },
  { name: 'description', type: 'string', required: false, description: 'Secondary line of text. Not currently shown in the overlay but available for tooling.' },
  { name: 'enabled', type: 'boolean', required: false, description: 'When false, the listener skips this shortcut and it appears dimmed in the overlay. Defaults to true.' },
];

function PropTable({ rows }: { rows: PropRow[] }) {
  const th: React.CSSProperties = {
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    padding: '6px 12px',
    borderBottom: '1px solid var(--border-subtle)',
  };
  const td: React.CSSProperties = {
    fontSize: 13,
    padding: '7px 12px',
    borderBottom: '1px solid var(--border-subtle)',
    verticalAlign: 'top',
  };
  return (
    <div style={{ overflowX: 'auto', borderRadius: 4, border: '1px solid var(--border-subtle)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Prop</th>
            <th style={th}>Type</th>
            <th style={th}>Required</th>
            <th style={th}>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td style={{ ...td, fontFamily: 'monospace', color: 'var(--color-info)' }}>{row.name}</td>
              <td style={{ ...td, fontFamily: 'monospace', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{row.type}</td>
              <td style={{ ...td, color: row.required ? 'var(--color-positive)' : 'var(--text-muted)' }}>
                {row.required ? 'Yes' : 'No'}
              </td>
              <td style={{ ...td, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- Code block ----

function CodeBlock({ code }: { code: string }) {
  return (
    <pre
      style={{
        background: 'var(--bg-base)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 4,
        padding: '14px 16px',
        fontSize: 12,
        lineHeight: 1.7,
        color: 'var(--text-secondary)',
        overflowX: 'auto',
        margin: 0,
        fontFamily: 'monospace',
      }}
    >
      <code>{code}</code>
    </pre>
  );
}

// ---- KeyBadge demo ----

function KeyBadgeDemo() {
  const examples: Array<{ hotkey: string; label: string }> = [
    { hotkey: 'mod+k', label: 'Open palette' },
    { hotkey: 'mod+shift+e', label: 'Export' },
    { hotkey: 'escape', label: 'Dismiss' },
    { hotkey: '?', label: 'Show shortcuts' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {examples.map(({ hotkey, label }) => (
        <div key={hotkey} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <KeyBadge hotkey={hotkey} />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <KeyBadge hotkey="mod+n" muted />
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>New Order (disabled)</span>
      </div>
    </div>
  );
}

// ---- Page ----

export default function ShortcutsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        Keyboard Shortcuts
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        A global keyboard shortcut system with a discoverable overlay. The architecture is split into
        three pieces: a context provider that owns the shortcut registry and listener, an overlay UI
        that renders registered shortcuts grouped by category, and a hook that gives any component
        access to register shortcuts or open the overlay programmatically.
      </p>

      <Section title="Live Demo">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
          The demo registers four shortcuts across two categories. Click the button to open the overlay,
          or press <kbd style={{ fontFamily: 'monospace', fontSize: 12 }}>?</kbd> while focused in
          the demo area. The overlay itself registers the{' '}
          <kbd style={{ fontFamily: 'monospace', fontSize: 12 }}>?</kbd> key automatically via its{' '}
          <code style={{ fontFamily: 'monospace', fontSize: 12 }}>hotkey</code> prop.
        </p>
        <ComponentDemo label="ShortcutProvider + ShortcutOverlay + useShortcuts">
          <ShortcutProvider>
            <ShortcutOverlay hotkey="?" />
            <LaunchButton />
          </ShortcutProvider>
        </ComponentDemo>
      </Section>

      <Section title="Architecture">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
          Three exports compose the full feature. They are kept separate so the provider can wrap a
          whole application while the overlay and individual shortcut registrations live wherever they
          are logically owned.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
          {[
            {
              name: 'ShortcutProvider',
              role: 'Context root',
              detail: 'Owns the shortcut registry and the global keydown listener. Also owns open/close state for the overlay. Wrap the application (or a subtree) once.',
            },
            {
              name: 'ShortcutOverlay',
              role: 'UI',
              detail: 'Renders a modal listing all registered shortcuts grouped by category. Reads from context — place it anywhere inside the provider. Registers its own trigger shortcut via the hotkey prop.',
            },
            {
              name: 'useShortcuts',
              role: 'Hook',
              detail: 'Returns open, close, isOpen, register, and the full shortcut list. Use register inside a useEffect for automatic cleanup on unmount.',
            },
          ].map((item) => (
            <div
              key={item.name}
              style={{
                padding: '12px 14px',
                background: 'var(--bg-base)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
              }}
            >
              <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--color-info)', marginBottom: 4 }}>{item.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.role}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.detail}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Integration Pattern">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
          A typical integration: provider at the app root, overlay rendered once, shortcuts registered
          from feature components.
        </p>
        <CodeBlock code={`// App root
import { ShortcutProvider, ShortcutOverlay } from '@meridian/components';

export function App() {
  return (
    <ShortcutProvider>
      <ShortcutOverlay hotkey="?" />
      <YourApp />
    </ShortcutProvider>
  );
}

// Feature component — registers shortcuts on mount, cleans up on unmount
import { useEffect } from 'react';
import { useShortcuts } from '@meridian/components';
import type { Shortcut } from '@meridian/components';

const MY_SHORTCUTS: Shortcut[] = [
  {
    id: 'orders.new',
    key: 'mod+n',
    label: 'New Order',
    category: 'Trading',
    execute: () => openOrderTicket(),
  },
  {
    id: 'orders.cancel',
    key: 'mod+backspace',
    label: 'Cancel Selected Order',
    category: 'Trading',
    execute: () => cancelSelected(),
  },
];

export function OrdersPanel() {
  const { register } = useShortcuts();
  useEffect(() => register(MY_SHORTCUTS), [register]);
  // ...
}`} />
      </Section>

      <Section title="Wiring with Command Palette">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
          A common pattern is to wire keyboard shortcuts directly to command palette actions,
          so the same logic is reachable both by hotkey and by search.
        </p>
        <CodeBlock code={`import { useEffect } from 'react';
import { useShortcuts } from '@meridian/components';
import { useCommandPalette } from '@meridian/components';

export function AppShortcuts() {
  const { register } = useShortcuts();
  const { open: openPalette } = useCommandPalette();

  useEffect(() => {
    return register([
      {
        id: 'global.command-palette',
        key: 'mod+k',
        label: 'Open Command Palette',
        category: 'Navigation',
        execute: openPalette,
      },
    ]);
  }, [register, openPalette]);

  return null;
}`} />
      </Section>

      <Section title="KeyBadge">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
          <code style={{ fontFamily: 'monospace', fontSize: 12 }}>KeyBadge</code> renders a key
          combo string as styled badge(s). It accepts the same{' '}
          <code style={{ fontFamily: 'monospace', fontSize: 12 }}>hotkey</code> string format used
          by <code style={{ fontFamily: 'monospace', fontSize: 12 }}>Shortcut.key</code> and
          normalises platform-specific symbols automatically.
        </p>
        <ComponentDemo label="KeyBadge">
          <KeyBadgeDemo />
        </ComponentDemo>
        <div style={{ marginTop: 12 }}>
          <PropTable rows={[
            { name: 'hotkey', type: 'string', required: true, description: 'Key combo string in the same format as Shortcut.key. "mod" is rendered as ⌘ on macOS and Ctrl on other platforms.' },
            { name: 'muted', type: 'boolean', required: false, description: 'When true, renders the badge at reduced opacity. Used by the overlay for disabled shortcuts.' },
          ]} />
        </div>
      </Section>

      <Section title="Shortcut Interface">
        <PropTable rows={SHORTCUT_PROPS} />
      </Section>

      <Section title="ShortcutProvider Props">
        <PropTable rows={[
          { name: 'children', type: 'ReactNode', required: true, description: 'Subtree that can access the shortcut context.' },
        ]} />
      </Section>

      <Section title="ShortcutOverlay Props">
        <PropTable rows={[
          { name: 'hotkey', type: 'string', required: false, description: 'Key combo that toggles the overlay. The overlay registers this as a shortcut automatically. Defaults to "?".' },
        ]} />
      </Section>

      <Section title="useShortcuts Return Value">
        <PropTable rows={[
          { name: 'shortcuts', type: 'Shortcut[]', required: false, description: 'All currently registered shortcuts.' },
          { name: 'register', type: '(shortcuts: Shortcut[]) => () => void', required: false, description: 'Registers an array of shortcuts and returns a cleanup function that unregisters them. Use inside useEffect.' },
          { name: 'open', type: '() => void', required: false, description: 'Opens the shortcut overlay.' },
          { name: 'close', type: '() => void', required: false, description: 'Closes the shortcut overlay.' },
          { name: 'isOpen', type: 'boolean', required: false, description: 'Whether the overlay is currently open.' },
        ]} />
      </Section>

      <Section title="Input Focus Behaviour">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          The global listener automatically suppresses shortcuts that have no modifier key (or only
          Shift) when an <code style={{ fontFamily: 'monospace', fontSize: 12 }}>input</code>,{' '}
          <code style={{ fontFamily: 'monospace', fontSize: 12 }}>textarea</code>, or{' '}
          <code style={{ fontFamily: 'monospace', fontSize: 12 }}>contenteditable</code> element is
          focused. Shortcuts with a non-Shift modifier (⌘, Ctrl, Alt) fire regardless of focus state.
          Use the <code style={{ fontFamily: 'monospace', fontSize: 12 }}>enabled</code> field on a
          shortcut to disable it conditionally at runtime without unregistering it.
        </p>
      </Section>
    </div>
  );
}
