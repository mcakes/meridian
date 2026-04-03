import { Section } from '@/site/components/Section';
import { TokenTable } from '@/site/components/TokenTable';
import { Citation } from '@/site/components/Citation';

export default function WorkspaceLayout() {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Workspace Layout</h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        Professional traders expect their workspace to restore exactly. Layout persistence is non-negotiable.
      </p>

      <Section title="Industry Analysis">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '12px 0' }}>
          Bloomberg Launchpad uses pages — full-screen layouts containing components snapped to a grid. The page abstraction is key: traders switch between complete layouts as a unit. OpenFin Workspace provides platform-level layout engines with splits, tabs, and serializable snapshots. Goldman Sachs Marquee and BNP Paribas Cortex use it.
        </p>
      </Section>

      <Section title="Psychology-Driven Layout">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '12px 0' }}>
          Patel (2025), building on Sweller's Cognitive Load Theory, identifies three principles: default to persist (traders expect their setup to restore exactly), progressive disclosure (show complexity only when needed), and reduce cognitive load from the layout itself. The Zeigarnik effect means rebuilding layout daily is an ongoing cognitive tax.
        </p>
      </Section>

      <Section title="Recommendation">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '12px 0' }}>
          Hybrid tiling plus tabs with named workspace presets. Tiling handles spatial organization; tabs handle 'I need eight views but only have room for five panels.' Persistence is non-negotiable. Multi-monitor is deferred — it is a three-times complexity multiplier that does not change the single-window design.
        </p>

        <TokenTable
          columns={['Feature', 'Implementation', 'Status']}
          rows={[
            ['Tiling', 'FlexLayout React split tree', 'Implemented'],
            ['Tabs', 'FlexLayout tabsets', 'Implemented'],
            ['Named presets', 'Atomic save/restore of full tree', 'Implemented'],
            ['Persistence', 'JSON serialization to localStorage', 'Implemented'],
            ['Multi-monitor', 'Deferred (3x complexity)', 'Deferred'],
          ]}
        />
      </Section>

      <Section title="References">
        <Citation id={21} authors="Bloomberg" title="Bloomberg Launchpad" source="Documentation PDF" />
        <Citation id={22} authors="OpenFin" title="Platform API — Multiple Layouts" source="2023" url="https://www.openfin.co/blog/openfins-platform-api-introducing-multiple-layouts/" />
        <Citation id={23} authors="Patel, V." title="Psychology-Driven Layouts: Designing for How Traders Think" source="2025" />
        <Citation id={24} authors="Sweller, J." title="Cognitive Load During Problem Solving" source="Cognitive Science, 1988" />
      </Section>
    </div>
  );
}
