import { Section } from '../../components/Section';
import { Figure } from '../../components/Figure';

const projectStructure = `src/
  tokens/          Design tokens (CSS custom properties)
    colors.css     Dark and light theme color values
    typography.css Font families and type scale
    spacing.css    4px-based spacing scale
    borders.css    Border radius and focus ring
    index.css      Imports + Tailwind @theme + global defaults

  components/      Meridian component library
    primitives/    CatDot, PriceChange, FlashCell, MetricCard, Tag
    inputs/        Toggle, NumberInput, Select, DatePicker, Autocomplete
    data/          DataTable (AG Grid), Sparkline, cell renderers
    charting/      Chart (Plotly), Meridian Plotly template
    layout/        Panel, PanelHeader, Toolbar, Workspace
    feedback/      Toast, Modal, NotificationFeed

  providers/       ThemeProvider, DataProvider
  hooks/           useTheme, useMarketData, useWorkspace, useFlash`;

export default function GettingStarted() {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px 0' }}>
        Getting Started
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
        How Meridian's layers connect: design tokens define the visual language, components implement
        it, and themes switch it.
      </p>

      <Section title="Project Structure">
        <Figure caption="Project Structure">
          <pre
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--text-secondary)',
              margin: 0,
              whiteSpace: 'pre',
              overflowX: 'auto',
            }}
          >
            {projectStructure}
          </pre>
        </Figure>
      </Section>

      <Section title="Design Tokens">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
          All visual values are CSS custom properties scoped under{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>data-theme="dark"</code>{' '}
          and{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>data-theme="light"</code>{' '}
          on the root element. Switching themes is a single DOM attribute change — every component
          updates instantly because they reference <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>var()</code>{' '}
          tokens, not hardcoded values.
        </p>
      </Section>

      <Section title="Theming">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
          ThemeProvider manages the{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>data-theme</code>{' '}
          attribute and persists the choice to localStorage. Use the{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>useTheme</code>{' '}
          hook to access the current theme and toggle function. All components use CSS custom
          properties, so they respond to theme changes automatically.
        </p>
      </Section>
    </div>
  );
}
