import { Section } from '../../components/Section';
import { Figure } from '../../components/Figure';
import { TokenTable } from '../../components/TokenTable';
import { Citation } from '../../components/Citation';

export default function ShapeAndRadius() {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Shape &amp; Radius</h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        Shape perception research informs border radius choices. The governing principle: radius correlates with detachment from the workspace grid.
      </p>

      <Section title="Shape Perception Research">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '12px 0' }}>
          Bar and Neta (2006) found that rounded shapes are perceived as friendlier and more approachable. Consumer apps want this; professional tools should signal precision instead. Bloomberg Terminal uses 0 pixels. VS Code uses 0 to 2 pixels. Pure 0px feels dated; 2px is the contemporary convergence point for professional desktop applications.
        </p>
      </Section>

      <Section title="Radius Scale">
        <Figure caption="Border Radius Tokens">
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { token: 'none', value: '0px', usage: 'Table cells, tiled panels' },
              { token: 'sm', value: '2px', usage: 'Buttons, inputs, badges' },
              { token: 'md', value: '4px', usage: 'Tooltips, cards, toasts' },
              { token: 'lg', value: '6px', usage: 'Modal dialogs only' },
            ].map((r) => (
              <div key={r.token} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 48,
                  backgroundColor: 'var(--bg-muted)',
                  border: '1px solid var(--border-default)',
                  borderRadius: r.value,
                  marginBottom: 8,
                }} />
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{r.token}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{r.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 100 }}>{r.usage}</div>
              </div>
            ))}
          </div>
        </Figure>

        <TokenTable
          columns={['Token', 'Value', 'Usage']}
          rows={[
            ['--radius-none', '0px', 'Grid-flush elements: table cells, tiled panel borders'],
            ['--radius-sm', '2px', 'Attached to workspace: buttons, inputs, badges, toggles'],
            ['--radius-md', '4px', 'Floating elements: tooltips, dropdowns, popovers, cards, toast'],
            ['--radius-lg', '6px', 'Maximum — modal dialogs only. Nothing exceeds 6px.'],
          ]}
        />
      </Section>

      <Section title="References">
        <Citation id={20} authors="Bar, M. & Neta, M." title="Humans Prefer Curved Visual Objects" source="Psychological Science, 2006" />
      </Section>
    </div>
  );
}
