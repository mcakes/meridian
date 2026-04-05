import { useState, useEffect } from 'react';
import { Section } from '../../components/Section';
import { ComponentDemo } from '../../components/ComponentDemo';
import { PriceChange } from '@/components/primitives/PriceChange';
import { CatDot } from '@/components/primitives/CatDot';
import { FlashCell } from '@/components/primitives/FlashCell';
import { MetricCard } from '@/components/primitives/MetricCard';
import { Tag } from '@/components/primitives/Tag';
import { Sparkline } from '@/components/data/Sparkline';
import { ThresholdValue } from '@/components/primitives/ThresholdValue';
import { HealthBar } from '@/components/primitives/HealthBar';
import { HeatmapCell } from '@/components/primitives/HeatmapCell';
import { Spinner } from '@/components/primitives/Spinner';
import { Toolbar } from '@/components/layout/Toolbar';

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

      <Section title="ThresholdValue">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
          Numeric display with semantic color and shape indicator based on configurable thresholds.
          Redundant encoding ensures color is never the sole channel.
        </p>
        <ComponentDemo label="Severity Levels">
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Normal</div>
              <ThresholdValue value={42} warnAt={100} errorAt={500} format={v => `${v}ms`} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Warning</div>
              <ThresholdValue value={180} warnAt={100} errorAt={500} format={v => `${v}ms`} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Error</div>
              <ThresholdValue value={720} warnAt={100} errorAt={500} format={v => `${v}ms`} />
            </div>
          </div>
        </ComponentDemo>
        <ComponentDemo label="Inverted (lower is worse)">
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Healthy</div>
              <ThresholdValue value={99.8} warnAt={95} errorAt={90} invert format={v => `${v.toFixed(1)}%`} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Degraded</div>
              <ThresholdValue value={93} warnAt={95} errorAt={90} invert format={v => `${v.toFixed(1)}%`} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Critical</div>
              <ThresholdValue value={85} warnAt={95} errorAt={90} invert format={v => `${v.toFixed(1)}%`} />
            </div>
          </div>
        </ComponentDemo>
      </Section>

      <Section title="HealthBar">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
          Compact horizontal bar where width represents a normalised value and fill color represents status.
          Suitable for table cells, metric cards, and monitoring dashboards.
        </p>
        <ComponentDemo label="Status Variants">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 240 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>CPU — 45%</div>
              <HealthBar value={0.45} status="ok" label="CPU utilisation" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Memory — 78%</div>
              <HealthBar value={0.78} status="warn" label="Memory usage" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Disk — 96%</div>
              <HealthBar value={0.96} status="error" label="Disk usage" />
            </div>
          </div>
        </ComponentDemo>
        <ComponentDemo label="Height Variants">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 240 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>4px (default)</div>
              <HealthBar value={0.6} status="ok" label="Default height" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>6px</div>
              <HealthBar value={0.6} status="ok" height={6} label="Medium height" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>8px</div>
              <HealthBar value={0.6} status="ok" height={8} label="Large height" />
            </div>
          </div>
        </ComponentDemo>
      </Section>

      <Section title="HeatmapCell">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
          Maps a normalised 0–1 value to a colour-intensity background. Diverging scale
          uses negative/positive colours; sequential uses a single-colour ramp.
        </p>
        <ComponentDemo label="Diverging Scale">
          <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(5, 56px)', gap: 2 }}>
            {[0, 0.15, 0.35, 0.5, 0.65, 0.85, 1].map(v => (
              <HeatmapCell key={v} value={v} style={{ height: 40, fontSize: 12 }}>
                {v.toFixed(2)}
              </HeatmapCell>
            ))}
          </div>
        </ComponentDemo>
        <ComponentDemo label="Sequential Scale">
          <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(5, 56px)', gap: 2 }}>
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map(v => (
              <HeatmapCell key={v} value={v} scale="sequential" style={{ height: 40, fontSize: 12 }}>
                {v.toFixed(2)}
              </HeatmapCell>
            ))}
          </div>
        </ComponentDemo>
        <ComponentDemo label="Correlation Matrix">
          <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(4, 56px)', gap: 2 }}>
            {[1.0, 0.72, -0.15, 0.08,
              0.72, 1.0, 0.31, -0.04,
              -0.15, 0.31, 1.0, -0.53,
              0.08, -0.04, -0.53, 1.0].map((corr, i) => (
              <HeatmapCell key={i} value={(corr + 1) / 2} style={{ height: 40, fontSize: 11 }}>
                {corr.toFixed(2)}
              </HeatmapCell>
            ))}
          </div>
        </ComponentDemo>
      </Section>

      <Section title="Spinner">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
          Inline loading indicator. CSS border spinner in three sizes, designed
          for toolbar chrome and other compact contexts.
        </p>
        <ComponentDemo label="Size Variants">
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Spinner size="xs" />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>xs</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Spinner />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>sm (default)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Spinner size="md" />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>md</span>
            </div>
          </div>
        </ComponentDemo>
        <ComponentDemo label="Custom Color">
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <Spinner color="var(--color-info)" />
            <Spinner color="var(--color-positive)" />
            <Spinner color="var(--color-warning)" />
          </div>
        </ComponentDemo>
        <ComponentDemo label="In Toolbar">
          <div style={{ maxWidth: 300 }}>
            <Toolbar>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginRight: 'auto' }}>Positions</span>
              <Spinner />
            </Toolbar>
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
