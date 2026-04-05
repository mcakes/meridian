import { Section } from '../../components/Section';
import { Figure } from '../../components/Figure';
import { TokenTable } from '../../components/TokenTable';

const principles = [
  {
    title: 'Density backed by science',
    color: 'var(--color-cat-0)',
    body: 'Maximum value density, not just visual density. Three axes: visual, temporal, and value.',
  },
  {
    title: 'Redundant encoding',
    color: 'var(--color-cat-1)',
    body: 'Color + shape + text for every semantic signal. Accessible by default, not as an afterthought.',
  },
  {
    title: 'Cognitive load management',
    color: 'var(--color-cat-4)',
    body: 'Working memory limits enforced in the design. 6 categorical colors, 3 toast max, 64px chrome budget.',
  },
  {
    title: 'Evidence-based color',
    color: 'var(--color-cat-5)',
    body: 'CIELAB perceptual distance, CVD-safe by default. Every color choice backed by research.',
  },
];

const techColumns = ['Layer', 'Library', 'License'];
const techRows = [
  ['Framework', 'React 19', 'MIT'],
  ['Primitives', 'Radix UI', 'MIT'],
  ['Styling', 'Tailwind CSS 4', 'MIT'],
  ['Data Grid', 'AG Grid Community', 'MIT'],
  ['Charting', 'Plotly.js', 'MIT'],
  ['Layout', 'FlexLayout React', 'MIT'],
];

export default function Introduction() {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px 0' }}>
        Meridian Design System
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
        An evidence-based design system for professional multi-asset trading and financial analytics
        applications. Built on perceptual science, cognitive load research, and accessibility-first
        principles.
      </p>

      <Section title="Core Principles">
        <Figure caption="Core Principles">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {principles.map((p) => (
              <div
                key={p.title}
                style={{
                  backgroundColor: 'var(--bg-muted)',
                  borderRadius: 2,
                  padding: 12,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: p.color, marginBottom: 6 }}>
                  {p.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {p.body}
                </div>
              </div>
            ))}
          </div>
        </Figure>
      </Section>

      <Section title="Technology Stack">
        <TokenTable columns={techColumns} rows={techRows} />
      </Section>
    </div>
  );
}
