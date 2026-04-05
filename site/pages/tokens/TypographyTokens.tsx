import { Section } from '../../components/Section';
import { Figure } from '../../components/Figure';
import { TokenTable } from '../../components/TokenTable';

const typeScale = [
  { purpose: 'Panel title', token: '--text-panel-title', size: 16, weight: 600, lineHeight: 22 },
  { purpose: 'Section header', token: '--text-section', size: 13, weight: 600, lineHeight: 18 },
  { purpose: 'Column header', token: '--text-column-header', size: 11, weight: 500, lineHeight: 14, extra: 'uppercase, 0.5px tracking' },
  { purpose: 'Body', token: '--text-body', size: 13, weight: 400, lineHeight: 18 },
  { purpose: 'Body strong', token: '--text-body-strong', size: 13, weight: 600, lineHeight: 18 },
  { purpose: 'Small', token: '--text-small', size: 12, weight: 400, lineHeight: 16 },
  { purpose: 'Small strong', token: '--text-small-strong', size: 12, weight: 600, lineHeight: 16 },
  { purpose: 'Caption', token: '--text-caption', size: 11, weight: 400, lineHeight: 14 },
  { purpose: 'Monospace', token: '--text-mono', size: 12, weight: 400, lineHeight: 16 },
];

export default function TypographyTokens() {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Typography Tokens</h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        Two font families and a nine-step type scale optimized for numeric-heavy professional interfaces.
      </p>

      <Section title="Font Stack">
        <TokenTable
          columns={['Role', 'Font', 'Usage']}
          rows={[
            ['Primary', 'Inter', 'Labels, prose, body text'],
            ['Numeric', 'Inter + tabular-nums', 'Prices, quantities in tables'],
            ['Monospace', 'JetBrains Mono', 'Order books, tick data, chart axes'],
          ]}
        />
      </Section>

      <Section title="Type Scale">
        <TokenTable
          columns={['Purpose', 'Token', 'Size/Weight/Line-Height']}
          rows={[
            ['Panel title', '--text-panel-title', '16px / 600 / 22px'],
            ['Section header', '--text-section', '13px / 600 / 18px'],
            ['Column header', '--text-column-header', '11px / 500 / 14px — uppercase, 0.5px tracking'],
            ['Body', '--text-body', '13px / 400 / 18px'],
            ['Body strong', '--text-body-strong', '13px / 600 / 18px'],
            ['Small', '--text-small', '12px / 400 / 16px'],
            ['Small strong', '--text-small-strong', '12px / 600 / 16px'],
            ['Caption', '--text-caption', '11px / 400 / 14px'],
            ['Monospace', '--text-mono', '12px / 400 / 16px'],
          ]}
        />
      </Section>

      <Section title="Live Type Samples">
        <Figure caption="Type Scale">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {typeScale.map((entry) => (
              <div key={entry.token}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{entry.purpose}</div>
                <div
                  style={{
                    fontSize: entry.size,
                    fontWeight: entry.weight,
                    lineHeight: `${entry.lineHeight}px`,
                    color: 'var(--text-primary)',
                    textTransform: entry.extra?.includes('uppercase') ? 'uppercase' : undefined,
                    letterSpacing: entry.extra?.includes('tracking') ? '0.5px' : undefined,
                    fontFamily: entry.token === '--text-mono' ? 'var(--font-mono)' : undefined,
                  }}
                >
                  {entry.token === '--text-mono'
                    ? 'AaBbCc 0123456789'
                    : 'The quick brown fox jumps over the lazy dog'}
                </div>
              </div>
            ))}
          </div>
        </Figure>
      </Section>
    </div>
  );
}
