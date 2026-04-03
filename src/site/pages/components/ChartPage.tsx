import { useMemo } from 'react';
import { Section } from '@/site/components/Section';
import { ComponentDemo } from '@/site/components/ComponentDemo';
import { TokenTable } from '@/site/components/TokenTable';
import { Chart } from '@/components/charting/Chart';
import { useTheme } from '@/hooks/useTheme';

function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function generateCandles(count: number) {
  const candles = [];
  let price = 150;
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const open = price;
    const change = (Math.random() - 0.48) * 4;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    candles.push({
      time: new Date(now - (count - i) * 86400000),
      open, high, low, close,
    });
    price = close;
  }
  return candles;
}

export default function ChartPage() {
  const { theme } = useTheme();

  const candles = useMemo(() => generateCandles(30), []);

  const semanticColors = useMemo(() => ({
    positive: getCSSVar('--color-positive') || '#9ece6a',
    negative: getCSSVar('--color-negative') || '#f7768e',
  }), [theme]);

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        Chart
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        Plotly.js wrapper with Meridian template. Semantic colors for candlesticks, dark/light theme support, responsive resize.
      </p>

      <Section title="Candlestick Chart">
        <ComponentDemo label="Candlestick — OHLC">
          <div style={{ height: 350 }}>
            <Chart
              data={[{
                type: 'candlestick',
                x: candles.map(c => c.time),
                open: candles.map(c => c.open),
                high: candles.map(c => c.high),
                low: candles.map(c => c.low),
                close: candles.map(c => c.close),
                increasing: { line: { color: semanticColors.positive } },
                decreasing: { line: { color: semanticColors.negative } },
              }]}
            />
          </div>
        </ComponentDemo>
      </Section>

      <Section title="Template">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '12px 0' }}>
          Key Meridian Plotly template settings applied to every chart instance.
        </p>
        <TokenTable
          columns={['Setting', 'Value']}
          rows={[
            ['paper_bgcolor', 'transparent'],
            ['plot_bgcolor', 'var(--bg-base)'],
            ['Margins', 'l:48 r:12 t:28 b:32'],
            ['Y-axis side', 'right (financial convention)'],
            ['Grid', 'Dotted, var(--border-subtle)'],
            ['Tick font', 'JetBrains Mono, 10px'],
            ['Hover mode', 'x (all traces at same X)'],
          ]}
        />
      </Section>
    </div>
  );
}
