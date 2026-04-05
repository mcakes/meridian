import { useEffect } from 'react';
import { Section } from '../../components/Section';
import { ComponentDemo } from '../../components/ComponentDemo';
import { CommandPaletteProvider, CommandPalette, useCommandPalette } from '@/components';
import type { Command } from '@/components';

// ---- Demo commands ----

const DEMO_COMMANDS: Command[] = [
  {
    id: 'demo.new-order',
    label: 'New Order',
    description: 'Open the order entry ticket',
    category: 'Trading',
    shortcut: '⌘N',
    execute: () => alert('New Order opened'),
  },
  {
    id: 'demo.toggle-theme',
    label: 'Toggle Theme',
    description: 'Switch between dark and light mode',
    category: 'View',
    execute: () => alert('Theme toggled'),
  },
  {
    id: 'demo.export-blotter',
    label: 'Export Blotter',
    description: 'Download trade blotter as CSV',
    category: 'Data',
    execute: () => alert('Blotter exported'),
  },
  {
    id: 'demo.set-venue',
    label: 'Set Execution Venue',
    description: 'Choose a venue then a routing strategy',
    category: 'Trading',
    args: [
      {
        name: 'venue',
        label: 'Venue',
        resolve: async () => [
          { label: 'NYSE', value: 'nyse', description: 'New York Stock Exchange' },
          { label: 'NASDAQ', value: 'nasdaq', description: 'NASDAQ Global Select' },
          { label: 'BATS', value: 'bats', description: 'CBOE BZX Exchange' },
          { label: 'IEX', value: 'iex', description: 'Investors Exchange' },
        ],
      },
      {
        name: 'strategy',
        label: 'Routing Strategy',
        resolve: async (ctx) => {
          const base = [
            { label: 'TWAP', value: 'twap', description: 'Time-weighted average price' },
            { label: 'VWAP', value: 'vwap', description: 'Volume-weighted average price' },
            { label: 'IS', value: 'is', description: 'Implementation shortfall' },
          ];
          // Simulate async fetch that might use collected context
          await new Promise((r) => setTimeout(r, 200));
          return ctx.venue === 'iex'
            ? [{ label: 'Discretionary Peg', value: 'dpeg', description: 'IEX D-Peg order type' }, ...base]
            : base;
        },
      },
    ],
    execute: (args) =>
      alert(`Venue: ${args?.venue?.toUpperCase()}, Strategy: ${args?.strategy?.toUpperCase()}`),
  },
];

// ---- Launch button (consumes context) ----

function LaunchButton() {
  const { open, registerCommands } = useCommandPalette();

  useEffect(() => {
    return registerCommands(DEMO_COMMANDS);
  }, [registerCommands]);

  return (
    <button
      onClick={open}
      style={{
        padding: '7px 16px',
        fontSize: 13,
        fontFamily: 'inherit',
        background: 'var(--color-info)',
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
        letterSpacing: '0.01em',
      }}
    >
      Open Command Palette
    </button>
  );
}

// ---- Prop table ----

interface PropRow {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

const COMMAND_PROPS: PropRow[] = [
  { name: 'id', type: 'string', required: true, description: 'Unique identifier used for frequency tracking and deduplication.' },
  { name: 'label', type: 'string', required: true, description: 'Primary display text. Searched by the fuzzy scorer.' },
  { name: 'execute', type: '(args?) => void', required: true, description: 'Called when the command is confirmed. Receives collected args when args are defined.' },
  { name: 'description', type: 'string', required: false, description: 'Secondary line of text shown below the label.' },
  { name: 'category', type: 'string', required: false, description: 'Group label shown as a section header in the results list.' },
  { name: 'shortcut', type: 'string', required: false, description: 'Display-only hint (e.g. "⌘T"). Does not register a keyboard listener.' },
  { name: 'keywords', type: 'string[]', required: false, description: 'Extra terms included in fuzzy search beyond label and description.' },
  { name: 'args', type: 'ArgDefinition[]', required: false, description: 'Argument steps. When present, selecting the command enters arg-stepping mode.' },
  { name: 'renderItem', type: '(props: ItemRenderProps) => ReactNode', required: false, description: 'Custom renderer for this command row. Receives active state and match highlight ranges.' },
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
        background: 'var(--bg-canvas)',
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

// ---- Page ----

export default function CommandPalettePage() {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        Command Palette
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        A modal command launcher with fuzzy search, frequency-ranked results, and multi-step argument collection.
        The architecture is split into three pieces: a context provider that owns the registry and open/close state,
        the palette UI that reads from that context, and a hook that gives any component access to register commands
        or open the palette programmatically.
      </p>

      <Section title="Live Demo">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
          The demo registers four commands: three simple actions and one with two async argument steps.
          Try selecting "Set Execution Venue" to walk through arg-stepping mode.
          Use <kbd style={{ fontFamily: 'monospace', fontSize: 12 }}>↑↓</kbd> to navigate,{' '}
          <kbd style={{ fontFamily: 'monospace', fontSize: 12 }}>↵</kbd> to select,
          and <kbd style={{ fontFamily: 'monospace', fontSize: 12 }}>Backspace</kbd> to go back a step.
        </p>
        <ComponentDemo label="CommandPalette + CommandPaletteProvider + useCommandPalette">
          <CommandPaletteProvider hotkey="mod+shift+p">
            <CommandPalette />
            <LaunchButton />
          </CommandPaletteProvider>
        </ComponentDemo>
      </Section>

      <Section title="Architecture">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
          Three exports compose the full feature. They are kept separate so the provider can wrap a whole
          application while the palette UI and individual command registrations live wherever they are
          logically owned.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
          {[
            { name: 'CommandPaletteProvider', role: 'Context root', detail: 'Owns the command registry, open/close state, frequency map, and the global hotkey listener. Wrap the application (or a subtree) once.' },
            { name: 'CommandPalette', role: 'UI', detail: 'Renders the modal dialog. Reads from context — place it anywhere inside the provider. Accepts a maxResults prop (default 12).' },
            { name: 'useCommandPalette', role: 'Hook', detail: 'Returns open, close, isOpen, registerCommands, and the full command list. Use registerCommands inside a useEffect for automatic cleanup on unmount.' },
          ].map((item) => (
            <div
              key={item.name}
              style={{
                padding: '12px 14px',
                background: 'var(--bg-canvas)',
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
          A typical integration: provider at the app root, palette rendered once, commands registered
          from feature components.
        </p>
        <CodeBlock code={`// App root
import { CommandPaletteProvider, CommandPalette } from '@meridian/components';

export function App() {
  return (
    <CommandPaletteProvider hotkey="mod+k">
      <CommandPalette />
      <YourApp />
    </CommandPaletteProvider>
  );
}

// Feature component — registers commands on mount, cleans up on unmount
import { useEffect } from 'react';
import { useCommandPalette } from '@meridian/components';
import type { Command } from '@meridian/components';

const MY_COMMANDS: Command[] = [
  {
    id: 'orders.new',
    label: 'New Order',
    description: 'Open the order entry ticket',
    category: 'Trading',
    shortcut: '⌘N',
    execute: () => openOrderTicket(),
  },
];

export function OrdersPanel() {
  const { registerCommands } = useCommandPalette();
  useEffect(() => registerCommands(MY_COMMANDS), [registerCommands]);
  // ...
}`} />
      </Section>

      <Section title="Arg-Stepping Pattern">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
          When a command defines <code style={{ fontFamily: 'monospace', fontSize: 12 }}>args</code>,
          selecting it enters a guided wizard. Each step resolves options asynchronously (useful for
          server-fetched enumerations). The resolve function receives all args collected so far, so
          later steps can be context-aware.
        </p>
        <CodeBlock code={`const routeCommand: Command = {
  id: 'orders.route',
  label: 'Route Order',
  category: 'Trading',
  args: [
    {
      name: 'venue',
      label: 'Venue',
      resolve: async () => fetchVenues(),          // no prior args needed
    },
    {
      name: 'strategy',
      label: 'Routing Strategy',
      resolve: async ({ venue }) => fetchStrategies(venue),  // uses prior arg
    },
  ],
  execute: ({ venue, strategy }) => sendOrder(venue, strategy),
};`} />
      </Section>

      <Section title="Command Interface">
        <PropTable rows={COMMAND_PROPS} />
      </Section>

      <Section title="CommandPaletteProvider Props">
        <PropTable rows={[
          { name: 'children', type: 'ReactNode', required: true, description: 'Subtree that can access the palette context.' },
          { name: 'hotkey', type: 'string', required: false, description: 'Keyboard shortcut to toggle the palette. Uses "mod" for ⌘/Ctrl. Defaults to "mod+k".' },
          { name: 'initialFrequency', type: 'FrequencyMap', required: false, description: 'Seed frequency data (e.g. rehydrated from localStorage) to pre-rank commands on first open.' },
        ]} />
      </Section>

      <Section title="Scoring and Ranking">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          Results are ranked by a composite score: fuzzy match quality against label, description, and
          keywords; plus a log-dampened frequency bonus based on execution count. When scores tie,
          the most recently used command wins. When the query is empty the palette shows
          recently used commands, ordered by last use.
        </p>
      </Section>
    </div>
  );
}
