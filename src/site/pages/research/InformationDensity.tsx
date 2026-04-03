import { Section } from '@/site/components/Section';
import { Figure } from '@/site/components/Figure';
import { TokenTable } from '@/site/components/TokenTable';
import { Citation } from '@/site/components/Citation';

export default function InformationDensity() {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        Information Density
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        Density spans three independent axes. The goal is maximum value density — useful
        decision-making input per interaction — which sometimes means more whitespace, not less.
      </p>

      <Section title="Three Axes of Density">
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          The aversion to dense interfaces is really aversion to poorly designed dense ones. Density
          is not a single dimension:
        </p>
        <Figure caption="Three Axes of Density">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ borderLeft: '2px solid var(--color-cat-0)', paddingLeft: 12 }}>
              <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>Visual density</strong>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                Information per unit screen area. Professional users need more, not less.
              </p>
            </div>
            <div style={{ borderLeft: '2px solid var(--color-cat-1)', paddingLeft: 12 }}>
              <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>Temporal density</strong>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                Information per unit time. Fast navigation, progressive disclosure, keyboard depth.
              </p>
            </div>
            <div style={{ borderLeft: '2px solid var(--color-cat-4)', paddingLeft: 12 }}>
              <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>Value density</strong>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                Useful decision input per interaction. The axis that matters most — sometimes means
                adding whitespace.
              </p>
            </div>
          </div>
        </Figure>
      </Section>

      <Section title="Working Memory">
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Working memory capacity is approximately 4 items (Cowan 2001), not Miller's 7±2. This
          constrains how many color-coded categories a user can track simultaneously. Professional
          users build spatial muscle memory — design for consistency across views, not optimization
          of any single view.
        </p>
      </Section>

      <Section title="Three-Tier Information Hierarchy">
        <TokenTable
          columns={['Tier', 'Timing', 'Examples', 'Styling']}
          rows={[
            ['Glanceable', '<200ms pre-attentive', 'Prices, P&L, positions', '13px+ text, high-contrast semantic colors'],
            ['Scannable', 'Focused scanning', 'Bid/ask, volume, Greeks', 'Secondary text color, tabular alignment'],
            ['Explorable', 'On demand (hover/click)', 'Details, history, news', 'Hidden by default, instant access'],
          ]}
        />
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Progressive disclosure must be instant for professionals — hover reveals and keyboard
          depth, not hidden behind clicks.
        </p>
      </Section>

      <Section title="Chrome Budget">
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Panel header plus toolbar should never exceed 64 pixels combined. On a 1080px monitor with
          taskbar and window chrome (80px), five panels at 64px chrome each consume 320px — leaving
          only 80px extra for data. Every pixel above 64px is stolen from the data area.
        </p>
        <Figure caption="Panel Anatomy">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            <div
              style={{
                height: 28,
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              Header (28px)
            </div>
            <div
              style={{
                height: 32,
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              Toolbar (32px)
            </div>
            <div
              style={{
                height: 80,
                backgroundColor: 'var(--bg-base)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
              }}
            >
              Data Area (fills remainder)
            </div>
            <div
              style={{
                textAlign: 'right',
                color: 'var(--text-muted)',
                paddingTop: 8,
                fontSize: 11,
              }}
            >
              = 60px chrome
            </div>
          </div>
        </Figure>
      </Section>

      <Section title="References">
        <Citation
          id={1}
          authors="Str\u00f6m-Awn, M."
          title="UI Density"
          source="2024"
          url="https://mattstromawn.com/writing/ui-density/"
        />
        <Citation
          id={2}
          authors="Garrett, J. J."
          title="The Elements of User Experience"
          source="Referenced via LogRocket"
        />
        <Citation
          id={3}
          authors="Cowan, N."
          title="The magical number 4 in short-term memory"
          source="Behavioral and Brain Sciences, 2001"
        />
        <Citation
          id={4}
          authors="Hudson River Trading"
          title="Optimizing UX/UI Design for Trading"
          source="2024"
          url="https://www.hudsonrivertrading.com/hrtbeat/optimizing-ux-ui-design-for-trading/"
        />
      </Section>
    </div>
  );
}
