import { useState, useCallback } from 'react';
import { Model, type IJsonModel, type Action, type TabNode } from 'flexlayout-react';
import { Workspace } from '@/components/layout/Workspace';
import { Panel } from '@/components/layout/Panel';
import { Section } from '@/site/components/Section';
import { Figure } from '@/site/components/Figure';
import { TokenTable } from '@/site/components/TokenTable';
import { ComponentDemo } from '@/site/components/ComponentDemo';

/* ── Demo presets ──────────────────────────────────────── */

const THREE_PANEL: IJsonModel = {
  global: { tabEnableClose: false, tabSetEnableMaximize: false, splitterSize: 3 },
  layout: {
    type: 'row',
    weight: 100,
    children: [
      { type: 'tabset', weight: 35, children: [{ type: 'tab', name: 'Watchlist', component: 'watchlist' }] },
      {
        type: 'row',
        weight: 65,
        children: [
          { type: 'tabset', weight: 60, children: [{ type: 'tab', name: 'Chart', component: 'chart' }] },
          { type: 'tabset', weight: 40, children: [{ type: 'tab', name: 'Pricer', component: 'pricer' }] },
        ],
      },
    ],
  },
};

const STACKED: IJsonModel = {
  global: { tabEnableClose: false, tabSetEnableMaximize: false, splitterSize: 3, rootOrientationVertical: true },
  layout: {
    type: 'row',
    weight: 100,
    children: [
      {
        type: 'row',
        weight: 45,
        children: [
          { type: 'tabset', weight: 40, children: [{ type: 'tab', name: 'Watchlist', component: 'watchlist' }] },
          { type: 'tabset', weight: 60, children: [{ type: 'tab', name: 'Pricer', component: 'pricer' }] },
        ],
      },
      { type: 'tabset', weight: 55, children: [{ type: 'tab', name: 'Chart', component: 'chart' }] },
    ],
  },
};

const PRESETS: Record<string, IJsonModel> = {
  'Three Panel': THREE_PANEL,
  Stacked: STACKED,
};

/* ── Panel factory ─────────────────────────────────────── */

const panelLabels: Record<string, string> = {
  watchlist: 'Watchlist',
  chart: 'Chart',
  pricer: 'Pricer',
};

function demoFactory(node: TabNode) {
  const component = node.getComponent() ?? '';
  const label = panelLabels[component] ?? component;
  return (
    <Panel>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'var(--text-muted)',
          fontSize: 13,
        }}
      >
        {label} content
      </div>
    </Panel>
  );
}

/* ── Interactive demo with preset switching ────────────── */

function WorkspaceDemo() {
  const [model, setModel] = useState(() => Model.fromJson(THREE_PANEL));
  const [activePreset, setActivePreset] = useState('Three Panel');

  const handleModelChange = useCallback((_model: Model, _action: Action) => {}, []);

  const loadPreset = (name: string) => {
    const preset = PRESETS[name];
    if (preset) {
      setModel(Model.fromJson(preset));
      setActivePreset(name);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {Object.keys(PRESETS).map((name) => (
          <button
            key={name}
            onClick={() => loadPreset(name)}
            style={{
              backgroundColor: name === activePreset ? 'var(--bg-highlight)' : 'var(--bg-muted)',
              border: '1px solid var(--border-default)',
              color: name === activePreset ? 'var(--color-info)' : 'var(--text-secondary)',
              fontSize: 12,
              fontWeight: name === activePreset ? 600 : 400,
              padding: '4px 12px',
              borderRadius: 2,
              cursor: 'pointer',
            }}
          >
            {name}
          </button>
        ))}
      </div>
      <div style={{ height: 350 }}>
        <Workspace model={model} factory={demoFactory} onModelChange={handleModelChange} />
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────── */

const pStyle: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--text-secondary)',
  lineHeight: 1.7,
  margin: '12px 0',
};

export default function WorkspacePage() {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        Workspace
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        A tiling layout system built on FlexLayout React. Panels can be split, resized, dragged
        between tabsets, and serialized to JSON for persistence and preset management.
      </p>

      <Section title="Layout Model">
        <p style={pStyle}>
          FlexLayout uses a tree model where the root contains rows, rows contain tabsets, and
          tabsets contain tabs. Each tab has a <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, backgroundColor: 'var(--bg-muted)', padding: '1px 4px', borderRadius: 2 }}>component</code> string
          that maps to a React component via a factory function. The tree is serialized as an{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, backgroundColor: 'var(--bg-muted)', padding: '1px 4px', borderRadius: 2 }}>IJsonModel</code>{' '}
          object that can be saved to localStorage or a server.
        </p>
        <Figure caption="JSON Model Structure">
          <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
{`{
  global: {
    tabEnableClose: true,
    splitterSize: 3
  },
  layout: {
    type: "row",
    children: [
      {
        type: "tabset", weight: 35,
        children: [
          { type: "tab", name: "Watchlist", component: "watchlist" }
        ]
      },
      {
        type: "row", weight: 65,
        children: [
          { type: "tabset", weight: 60,
            children: [{ type: "tab", name: "Chart", component: "chart" }] },
          { type: "tabset", weight: 40,
            children: [{ type: "tab", name: "Pricer", component: "pricer" }] }
        ]
      }
    ]
  }
}`}
          </pre>
        </Figure>
        <p style={pStyle}>
          Weights control relative sizing between siblings. Rows can nest inside rows to create
          both horizontal and vertical splits. Setting{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, backgroundColor: 'var(--bg-muted)', padding: '1px 4px', borderRadius: 2 }}>rootOrientationVertical: true</code>{' '}
          in the global config makes the top-level split vertical instead of horizontal.
        </p>
      </Section>

      <Section title="Factory Pattern">
        <p style={pStyle}>
          The factory function receives a{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, backgroundColor: 'var(--bg-muted)', padding: '1px 4px', borderRadius: 2 }}>TabNode</code>{' '}
          and returns the React element to render in that tab. The{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, backgroundColor: 'var(--bg-muted)', padding: '1px 4px', borderRadius: 2 }}>component</code>{' '}
          string from the JSON model is used as a lookup key.
        </p>
        <p style={pStyle}>
          Meridian uses a panel registry — an array of{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, backgroundColor: 'var(--bg-muted)', padding: '1px 4px', borderRadius: 2 }}>{'{ type, title, component }'}</code>{' '}
          definitions that the factory searches by type. This makes it straightforward to add new
          panel types or expose an "Add Panel" menu to users.
        </p>
      </Section>

      <Section title="Named Presets">
        <p style={pStyle}>
          Presets are complete{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, backgroundColor: 'var(--bg-muted)', padding: '1px 4px', borderRadius: 2 }}>IJsonModel</code>{' '}
          objects that can be loaded atomically. When a preset is loaded, the entire model is replaced — all
          panel positions, tab groupings, and split weights reset to the preset's definition. The demo
          ships with two presets:
        </p>
        <TokenTable
          columns={['Preset', 'Layout', 'Description']}
          rows={[
            ['Three Panel', 'Watchlist | Chart / Pricer', 'Watchlist left (35%), chart top-right (60%), pricer bottom-right (40%)'],
            ['Stacked', 'Watchlist + Pricer / Chart', 'Watchlist and pricer side-by-side on top (45%), chart below (55%)'],
          ]}
        />
        <ComponentDemo label="Preset Switching">
          <WorkspaceDemo />
        </ComponentDemo>
      </Section>

      <Section title="Persistence">
        <p style={pStyle}>
          The{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, backgroundColor: 'var(--bg-muted)', padding: '1px 4px', borderRadius: 2 }}>useWorkspace</code>{' '}
          hook manages the lifecycle: it loads the model from localStorage on mount (falling back to a
          default preset), persists on every model change, and provides{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, backgroundColor: 'var(--bg-muted)', padding: '1px 4px', borderRadius: 2 }}>loadPreset</code>{' '}
          and{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, backgroundColor: 'var(--bg-muted)', padding: '1px 4px', borderRadius: 2 }}>addPanel</code>{' '}
          actions. The full model JSON — including tab positions, split weights, and which tab is
          active — round-trips through{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, backgroundColor: 'var(--bg-muted)', padding: '1px 4px', borderRadius: 2 }}>model.toJson()</code>{' '}
          and{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, backgroundColor: 'var(--bg-muted)', padding: '1px 4px', borderRadius: 2 }}>Model.fromJson()</code>.
        </p>
      </Section>

      <Section title="Theming">
        <p style={pStyle}>
          FlexLayout ships its own CSS which Meridian overrides completely in{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, backgroundColor: 'var(--bg-muted)', padding: '1px 4px', borderRadius: 2 }}>workspace.css</code>.
          Every FlexLayout class is restyled to use Meridian design tokens:
        </p>
        <TokenTable
          columns={['Element', 'Token', 'Notes']}
          rows={[
            ['Tab strip', '--bg-surface', 'Matches panel header background'],
            ['Selected tab', '--text-primary, --bg-muted', 'Weight 600 for active'],
            ['Unselected tab', '--text-muted', 'Weight 500'],
            ['Tab content area', '--bg-base', 'Darkest background for data'],
            ['Splitters', '--border-subtle', 'Active on hover via --border-active'],
            ['Drag indicator', '--border-active', '2px border outline'],
            ['All elements', 'border-radius: 0', 'Grid-flush, no rounded corners'],
          ]}
        />
      </Section>

      <Section title="Workspace Component">
        <p style={pStyle}>
          The{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, backgroundColor: 'var(--bg-muted)', padding: '1px 4px', borderRadius: 2 }}>Workspace</code>{' '}
          component is a thin wrapper around FlexLayout's{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, backgroundColor: 'var(--bg-muted)', padding: '1px 4px', borderRadius: 2 }}>Layout</code>.
          It accepts three props:
        </p>
        <TokenTable
          columns={['Prop', 'Type', 'Description']}
          rows={[
            ['model', 'Model', 'FlexLayout Model instance created from IJsonModel'],
            ['factory', '(node: TabNode) => ReactNode', 'Maps tab component strings to React elements'],
            ['onModelChange', '(model: Model, action: Action) => void', 'Called after every user action (resize, drag, close)'],
          ]}
        />
      </Section>
    </div>
  );
}
