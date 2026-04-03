import { useState, useCallback } from 'react';
import { Model, type IJsonModel, type Action, type TabNode } from 'flexlayout-react';
import { Workspace } from '@/components/layout/Workspace';
import { Panel } from '@/components/layout/Panel';
import { Section } from '@/site/components/Section';
import { ComponentDemo } from '@/site/components/ComponentDemo';

const DEMO_LAYOUT: IJsonModel = {
  global: {
    tabEnableClose: false,
    tabSetEnableMaximize: false,
    splitterSize: 3,
  },
  layout: {
    type: 'row',
    weight: 100,
    children: [
      {
        type: 'tabset',
        weight: 40,
        children: [
          { type: 'tab', name: 'Watchlist', component: 'panel-a' },
        ],
      },
      {
        type: 'row',
        weight: 60,
        children: [
          {
            type: 'tabset',
            weight: 50,
            children: [
              { type: 'tab', name: 'Chart', component: 'panel-b' },
            ],
          },
          {
            type: 'tabset',
            weight: 50,
            children: [
              { type: 'tab', name: 'Details', component: 'panel-c' },
            ],
          },
        ],
      },
    ],
  },
};

const titles: Record<string, string> = {
  'panel-a': 'Watchlist',
  'panel-b': 'Chart',
  'panel-c': 'Details',
};

function factory(node: TabNode) {
  const component = node.getComponent() ?? '';
  const label = titles[component] ?? component;
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
        {label}
      </div>
    </Panel>
  );
}

export default function WorkspacePage() {
  const [model] = useState(() => Model.fromJson(DEMO_LAYOUT));

  const handleModelChange = useCallback((_model: Model, _action: Action) => {
    // Model is mutated in place by FlexLayout — no state update needed
  }, []);

  return (
    <div>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 8,
        }}
      >
        Workspace
      </h1>
      <p
        style={{
          fontSize: 15,
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
        }}
      >
        FlexLayout React tiling with serializable layouts, tabs, and named presets. Panels can be
        split, resized, dragged, and rearranged.
      </p>

      <Section title="Tiling Demo">
        <ComponentDemo label="Three-Panel Layout">
          <div style={{ height: 400 }}>
            <Workspace
              model={model}
              factory={factory}
              onModelChange={handleModelChange}
            />
          </div>
        </ComponentDemo>
        <p
          style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            margin: '12px 0',
          }}
        >
          Layouts serialize to JSON for persistence. Named presets allow switching between complete
          workspace configurations atomically.
        </p>
      </Section>

      <Section title="Presets">
        <p
          style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            margin: '12px 0',
          }}
        >
          The demo app ships with two presets: Three Panel (watchlist left, chart and pricer right)
          and Stacked (watchlist and pricer top, chart bottom). Presets store the full FlexLayout
          JSON model including tab positions and split weights.
        </p>
      </Section>
    </div>
  );
}
