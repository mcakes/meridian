import { Section } from '../../components/Section';

const spacingTokens = [
  { label: 'px', px: 1, vars: ['--space-px', '--spacing-px'] },
  { label: '0', px: 0, vars: ['--space-0'] },
  { label: '0.5', px: 2, vars: ['--space-0-5', '--spacing-0-5'] },
  { label: '1', px: 4, vars: ['--space-1', '--spacing-1'] },
  { label: '1.5', px: 6, vars: ['--space-1-5', '--spacing-1-5'] },
  { label: '2', px: 8, vars: ['--space-2', '--spacing-2'] },
  { label: '3', px: 12, vars: ['--space-3', '--spacing-3'] },
  { label: '4', px: 16, vars: ['--space-4', '--spacing-4'] },
  { label: '5', px: 20, vars: ['--space-5', '--spacing-5'] },
  { label: '6', px: 24, vars: ['--space-6', '--spacing-6'] },
  { label: '8', px: 32, vars: ['--space-8', '--spacing-8'] },
];

export default function Spacing() {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Spacing</h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        A 4-pixel base grid. All spacing tokens are multiples of 4px (with 1px and 2px for hairlines and icon gaps).
      </p>

      <Section title="Spacing Scale">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {spacingTokens.map((t) => (
            <div
              key={t.label}
              style={{
                display: 'grid',
                gridTemplateColumns: '48px 200px 48px 1fr',
                alignItems: 'center',
                gap: 12,
                fontSize: 12,
              }}
            >
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{t.label}</span>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                {t.vars.join(' / ')}
              </span>
              <span style={{ color: 'var(--text-secondary)', textAlign: 'right' }}>{t.px}px</span>
              <div
                style={{
                  backgroundColor: 'var(--color-cat-0)',
                  height: 8,
                  width: Math.max(t.px * 4, 1),
                  borderRadius: 1,
                }}
              />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
