import { Section } from '@/site/components/Section';
import { Figure } from '@/site/components/Figure';
import { TokenTable } from '@/site/components/TokenTable';

const radii = [
  { token: '--radius-none', value: 0 },
  { token: '--radius-sm', value: 2 },
  { token: '--radius-md', value: 4 },
  { token: '--radius-lg', value: 6 },
];

export default function Borders() {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Borders &amp; Radius</h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        Standard border width, four radius tokens, and a focus ring specification.
      </p>

      <Section title="Border Width">
        <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
          All borders use 1px width (<code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>--border-width: 1px</code>). No exceptions.
        </p>
      </Section>

      <Section title="Border Radius">
        <Figure caption="Radius Tokens">
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
            {radii.map((r) => (
              <div key={r.token} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 64,
                    height: 48,
                    backgroundColor: 'var(--bg-muted)',
                    border: '1px solid var(--border-default)',
                    borderRadius: r.value,
                  }}
                />
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{r.value}px</span>
              </div>
            ))}
          </div>
        </Figure>
        <TokenTable
          columns={['Token', 'Value', 'Usage']}
          rows={[
            ['--radius-none', '0px', 'Table cells, tiled panel borders'],
            ['--radius-sm', '2px', 'Buttons, inputs, badges, toggles'],
            ['--radius-md', '4px', 'Tooltips, dropdowns, cards, toast'],
            ['--radius-lg', '6px', 'Modal dialogs only — maximum'],
          ]}
        />
      </Section>

      <Section title="Focus Ring">
        <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
          Focus ring: <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>box-shadow: 0 0 0 2px var(--color-info)</code>. Using box-shadow avoids layout shift. Must achieve 3:1 contrast against the surface background.
        </p>
        <Figure caption="Focus Ring Demo">
          <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
            <div
              style={{
                padding: '6px 16px',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-muted)',
                border: '1px solid var(--border-default)',
                borderRadius: 2,
                boxShadow: '0 0 0 2px var(--color-info)',
                cursor: 'default',
              }}
            >
              Focused Button
            </div>
          </div>
        </Figure>
      </Section>
    </div>
  );
}
