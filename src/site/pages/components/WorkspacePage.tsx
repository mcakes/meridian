import { useState } from 'react';
import type { MosaicNode } from 'react-mosaic-component';
import { Workspace } from '@/components/layout/Workspace';
import { Panel } from '@/components/layout/Panel';
import { Section } from '@/site/components/Section';
import { ComponentDemo } from '@/site/components/ComponentDemo';

const initialLayout: MosaicNode<string> = {
  direction: 'row',
  first: 'panel-a',
  second: {
    direction: 'column',
    first: 'panel-b',
    second: 'panel-c',
    splitPercentage: 50,
  },
  splitPercentage: 40,
};

const titles: Record<string, string> = {
  'panel-a': 'Watchlist',
  'panel-b': 'Chart',
  'panel-c': 'Details',
};

export default function WorkspacePage() {
  const [layout, setLayout] = useState<MosaicNode<string>>(initialLayout);

  const renderTile = (id: string) => (
    <Panel title={titles[id] ?? id}>
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
        {titles[id] ?? id}
      </div>
    </Panel>
  );

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
        react-mosaic tiling with serializable layouts and named presets. Panels can be split,
        resized, and rearranged.
      </p>

      <Section title="Tiling Demo">
        <ComponentDemo label="Three-Panel Layout">
          <div style={{ height: 400 }}>
            <Workspace
              layout={layout}
              onChange={(next) => {
                if (next !== null) setLayout(next);
              }}
              renderTile={renderTile}
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
          The demo app ships with two presets: Equity Trading (watchlist left, chart and pricer
          right) and Options Desk (watchlist and pricer top, chart bottom). Presets store the full
          mosaic tree plus split percentages.
        </p>
      </Section>
    </div>
  );
}
