import { Section } from '../../components/Section';
import { Figure } from '../../components/Figure';
import { TokenTable } from '../../components/TokenTable';
import { Citation } from '../../components/Citation';

export default function TypographyResearch() {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Typography</h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        Trading UIs need two optimization targets: tabular figures for numeric column alignment and proportional spacing for labels and prose.
      </p>

      <Section title="Font Selection">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '12px 0' }}>
          Inter was selected for its screen optimization at 11 to 13 pixels, true tabular figure support via font-variant-numeric, and extensive weight range. JetBrains Mono handles price ladders and order books where full monospace alignment is needed.
        </p>

        <Figure caption="Type Samples">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Inter — Labels &amp; Prose (13px)</div>
              <div style={{ fontSize: 13, fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>AAPL 187.42 +2.45% Bid 187.40 Ask 187.44 Vol 52.3M</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Inter — Tabular Figures</div>
              <div style={{ fontSize: 13, fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)' }}>
                <div>187.42</div>
                <div>1,234.56</div>
                <div>42.00</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>JetBrains Mono — Order Books (12px)</div>
              <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>187.44 × 1,200  |  187.40 × 800</div>
            </div>
          </div>
        </Figure>
      </Section>

      <Section title="Numeric Formatting">
        <TokenTable
          columns={['Asset Class', 'Decimal Places', 'Example']}
          rows={[
            ['Equities', '2', '142.75'],
            ['FX (major pairs)', '4', '1.0843'],
            ['FX (JPY pairs)', '2–3', '151.42'],
            ['Fixed Income', '3–4', '98.750'],
            ['Crypto', '8', '0.00042100'],
          ]}
        />
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '12px 0' }}>
          Trailing zeros within required decimal places are visually dimmed using muted text color. This preserves column alignment while reducing visual noise.
        </p>
      </Section>

      <Section title="References">
        <Citation id={19} authors="Inforiver" title="Best Fonts for Financial Reporting" source="2024" url="https://inforiver.com/blog/general/best-fonts-financial-reporting/" />
        <Citation id={30} authors="Smashing Magazine" title="Typefaces for Fintech Products" source="2023" />
      </Section>
    </div>
  );
}
