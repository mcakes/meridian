import { Section } from '../../components/Section';
import { Figure } from '../../components/Figure';
import { TokenTable } from '../../components/TokenTable';
import { Citation } from '../../components/Citation';
import { CatDot } from '@/components/primitives/CatDot';

export default function ColorSystem() {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        Color System
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        Meridian separates color into two independent systems: semantic colors with fixed meaning,
        and a categorical ramp that applications assign freely.
      </p>

      <Section title="Two Separate Systems">
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Semantic colors have fixed meaning — positive, negative, warning, info. They always use
          redundant encoding: color plus arrow plus sign prefix. The categorical ramp is
          application-agnostic. The design system provides an ordered sequence; applications assign
          meaning. Early iterations baked asset-class meaning into the ramp — this was wrong.
          Professional traders organize spatially by asset class, so color-as-asset-class is
          redundant. Color should add a new dimension: sector, input category, chart series.
        </p>
      </Section>

      <Section title="Perceptual Science">
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Pre-attentive processing — visual properties detected in under 200 to 500 milliseconds
          without conscious effort — is the foundation for color-as-dimension. Hue is best for
          categorical distinctions. Luminance is more reliably pre-attentive than hue for magnitude.
          Beyond approximately six distinct hues, discrimination drops sharply.
        </p>
      </Section>

      <Section title="Dark Mode">
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Dark mode reduces eye strain in low-light environments. Reading performance is worse in
          dark mode for extended text, but this matters less for numeric scanning. Red text on dark
          backgrounds causes the highest visual fatigue. Pure black causes halation; pure white text
          causes glare. Meridian uses dark grays and off-whites: base background #1a1b26, primary
          text #c0caf5.
        </p>
      </Section>

      <Section title="Categorical Ramp Methodology">
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Criteria were drawn from five sources: perceptual distance (minimum {'\u0394'}E of 20 or
          more in CIELAB), lightness uniformity (L* standard deviation below 8), CVD safety (minimum{' '}
          {'\u0394'}E of 12 under deuteranopia simulation via Vi{'\u00e9'}not 1999), name uniqueness
          (distinct Berlin-Kay color terms), and hue distribution (approximately 60 degree separation
          for six colors).
        </p>
        <Figure caption="Categorical Ramp — Max-Distance-First Order">
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {['blue', 'green', 'red', 'teal', 'orange', 'purple', 'cyan', 'pink'].map(
              (name, i) => (
                <div
                  key={name}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <CatDot index={i} size={24} />
                  <span
                    style={{
                      fontSize: 11,
                      color: i < 6 ? 'var(--text-secondary)' : 'var(--text-muted)',
                    }}
                  >
                    {name}
                  </span>
                </div>
              ),
            )}
          </div>
        </Figure>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          The 6+2 structure follows Tseng et al.'s finding that perception drops beyond six
          categories. Core six are optimized with hues at approximately 60 degree intervals. L* is
          used as a 'CVD weapon' — colors that collapse in hue under deuteranopia are given large L*
          separation. Extensions (cyan, pink) fill the two largest hue gaps but require secondary
          encoding (dash pattern, marker shape, or label).
        </p>
      </Section>

      <Section title="Max-Distance-First Ordering">
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          The ramp is ordered so the first N colors drawn are maximally distinguishable, following
          the Tableau 10 methodology. Blue starts the sequence because it carries the least semantic
          baggage.
        </p>
        <TokenTable
          columns={['N', 'First N colors', 'Min pairwise \u0394E', 'vs. rainbow']}
          rows={[
            ['2', 'blue, green', '100.8', '+187%'],
            ['3', 'blue, green, red', '73.4', '+109%'],
            ['4', 'blue, green, red, teal', '45.4', '+29%'],
          ]}
        />
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          You cannot have eight colors simultaneously perceptually equidistant, CVD-safe, and
          aesthetically consistent on a dark background. Tableau and Observable reached the same
          conclusion.
        </p>
      </Section>

      <Section title="Light Theme Derivation">
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          The light theme is not a naive inversion. Every color was re-derived for WCAG contrast
          against white. A critical lesson: naively darkening colors to similar contrast ratios can
          collapse L* values. The initial light green (L*=53.3) and teal (L*=53.6) had only 0.3 L*
          units separation — perceptually identical despite large {'\u0394'}E on the b* axis. Both
          read as 'dark green' on white. Fix: push green darker (L* approximately 46) and teal
          lighter (L* approximately 60), restoring 13.5 L* units of separation.
        </p>
      </Section>

      <Section title="References">
        <Citation
          id={5}
          authors="Ware, C."
          title="Information Visualization: Perception for Design"
          source="Elsevier, 2004"
        />
        <Citation
          id={6}
          authors="Bertin, J."
          title="Semiology of Graphics"
          source="1983"
        />
        <Citation
          id={7}
          authors="Healey, C. & Enns, J."
          title="Perception in Visualization"
          url="https://www.csc2.ncsu.edu/faculty/healey/PP/"
        />
        <Citation
          id={8}
          authors="Tseng, C. et al."
          title="Revisiting Categorical Color Perception in Scatterplots"
          source="arXiv:2404.03787, 2024"
        />
        <Citation
          id={9}
          authors="Pathari, F. et al."
          title="Dark vs. Light Mode: Effects on Eye Fatigue"
          source="2024"
        />
        <Citation
          id={10}
          authors="Shrestha, A. et al."
          title="Effects of Dark Mode on University Students"
          source="arXiv:2409.10895, 2024"
        />
        <Citation
          id={11}
          authors="Various"
          title="Text Color and Visual Fatigue under Negative Polarity"
          source="PMC, 2024"
        />
        <Citation
          id={12}
          authors="Gramazio, C. et al."
          title="Colorgorical: Creating Discriminable Color Palettes"
          source="2016"
        />
        <Citation
          id={13}
          authors="Observable"
          title="Crafting Data Colors"
          source="2024"
          url="https://observablehq.com/blog/crafting-data-colors"
        />
        <Citation
          id={14}
          authors="Stone, M."
          title="Tableau 10 Color Palettes"
          source="2016"
          url="https://www.tableau.com/blog/colors-upgrade-tableau-10-56782"
        />
        <Citation
          id={15}
          authors="Vi\u00e9not, F., Brettel, H. & Mollon, J."
          title="Digital Video Colourmaps for Checking Legibility by Dichromats"
          source="Color Research & Application, 1999"
        />
        <Citation
          id={16}
          authors="Bujack, R. et al."
          title="Accessible Color Sequences"
          source="arXiv:2107.02270, 2021"
        />
        <Citation
          id={17}
          authors="Berlin, B. & Kay, P."
          title="Basic Color Terms"
          source="UC Press, 1969"
        />
        <Citation
          id={18}
          authors="Heer, J. & Stone, M."
          title="Color Naming Models for Color Selection"
          source="CHI 2012"
        />
      </Section>
    </div>
  );
}
