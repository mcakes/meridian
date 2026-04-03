import { useState, useEffect } from 'react';
import { Section } from '@/site/components/Section';
import { ComponentDemo } from '@/site/components/ComponentDemo';
import { PriceChange } from '@/components/primitives/PriceChange';
import { CatDot } from '@/components/primitives/CatDot';
import { FlashCell } from '@/components/primitives/FlashCell';
import { MetricCard } from '@/components/primitives/MetricCard';
import { Tag } from '@/components/primitives/Tag';
import { Sparkline } from '@/components/data/Sparkline';

function FlashDemo() {
  const [flashValue, setFlashValue] = useState(187.42);
  useEffect(() => {
    const id = setInterval(() => {
      setFlashValue(v => v + (Math.random() - 0.5) * 2);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return <FlashCell value={flashValue} format={(n) => n.toFixed(2)} />;
}

export default function PrimitivesPage() {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        Primitives
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        Small, focused components that encode Meridian's core patterns — semantic color, redundant encoding, flash-on-update, and categorical grouping.
      </p>

      <Section title="PriceChange">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
          Directional value display with redundant encoding: arrow, sign prefix, and semantic color.
        </p>
        <ComponentDemo label="All States">
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <PriceChange value={2.45} />
            <PriceChange value={-1.23} />
            <PriceChange value={0} />
          </div>
        </ComponentDemo>
      </Section>

      <Section title="CatDot">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
          Categorical color indicator. Maps index 0–7 to the categorical ramp.
        </p>
        <ComponentDemo label="All Indices">
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {['blue', 'green', 'red', 'teal', 'orange', 'purple', 'cyan', 'pink'].map((name, i) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CatDot index={i} />
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{name}</span>
              </div>
            ))}
          </div>
        </ComponentDemo>
      </Section>

      <Section title="FlashCell">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
          Cell with 100ms flash animation on value change. Green flash for increases, red for decreases.
        </p>
        <ComponentDemo label="Live Flash">
          <FlashDemo />
        </ComponentDemo>
      </Section>

      <Section title="MetricCard">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
          KPI display with label, value, and optional sublabel.
        </p>
        <ComponentDemo label="Metric Cards">
          <div style={{ display: 'flex', gap: 12 }}>
            <MetricCard label="Price" value="187.42" />
            <MetricCard label="Volume" value="12.4M" />
            <MetricCard label="Delta" value="0.55" sublabel="ATM option" />
          </div>
        </ComponentDemo>
      </Section>

      <Section title="Tag">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
          Status indicator with semantic color variants.
        </p>
        <ComponentDemo label="All Variants">
          <div style={{ display: 'flex', gap: 12 }}>
            <Tag variant="pass">Pass</Tag>
            <Tag variant="warn">Warning</Tag>
            <Tag variant="fail">Fail</Tag>
          </div>
        </ComponentDemo>
      </Section>

      <Section title="Sparkline">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
          Inline SVG chart for trends. Custom polyline rendering, optional area fill at 15% opacity.
        </p>
        <ComponentDemo label="Sparkline Patterns">
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Uptrend</div>
              <Sparkline data={[10, 12, 11, 14, 16, 15, 18, 20, 19, 22]} width={80} height={24} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Downtrend</div>
              <Sparkline data={[22, 20, 21, 18, 16, 17, 14, 12, 13, 10]} width={80} height={24} color="var(--color-cat-2)" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>With Area</div>
              <Sparkline data={[15, 18, 12, 20, 14, 22, 16, 19, 13, 21]} width={80} height={24} color="var(--color-cat-3)" showArea />
            </div>
          </div>
        </ComponentDemo>
      </Section>
    </div>
  );
}
