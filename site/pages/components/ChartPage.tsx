import { useMemo } from 'react';
import { Section } from '../../components/Section';
import { ComponentDemo } from '../../components/ComponentDemo';
import { TokenTable } from '../../components/TokenTable';
import { CandlestickChart } from '@/components/charting/CandlestickChart';
import { TimeseriesChart } from '@/components/charting/TimeseriesChart';
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

function generateBidAsk(count: number) {
  const times: number[] = [];
  const bid: number[] = [];
  const ask: number[] = [];
  let mid = 1.08;
  const now = Math.floor(Date.now() / 1000);
  for (let i = 0; i < count; i++) {
    times.push(now - (count - i) * 3600);
    mid += (Math.random() - 0.49) * 0.003;
    const spread = 0.0005 + Math.random() * 0.001;
    bid.push(mid - spread / 2);
    ask.push(mid + spread / 2);
  }
  return { times, bid, ask };
}

function generateMeanStdev(count: number) {
  const times: number[] = [];
  const mean: number[] = [];
  const stdev: number[] = [];
  let value = 50;
  const now = Math.floor(Date.now() / 1000);
  for (let i = 0; i < count; i++) {
    times.push(now - (count - i) * 3600);
    value += (Math.random() - 0.48) * 2;
    mean.push(value);
    stdev.push(1.5 + Math.random() * 2);
  }
  return { times, mean, stdev };
}

export default function ChartPage() {
  const { theme } = useTheme();

  const candles = useMemo(() => generateCandles(30), []);
  const bidAskData = useMemo(() => generateBidAsk(120), []);
  const meanStdevData = useMemo(() => generateMeanStdev(120), []);

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
            <CandlestickChart
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

      <Section title="Timeseries — Bid/Ask">
        <ComponentDemo label="Bid/Ask spread with mid line">
          <div style={{ height: 350 }}>
            <TimeseriesChart bidAsk={bidAskData} />
          </div>
        </ComponentDemo>
      </Section>

      <Section title="Timeseries — Mean/Stdev">
        <ComponentDemo label="Mean with standard deviation band">
          <div style={{ height: 350 }}>
            <TimeseriesChart meanStdev={meanStdevData} />
          </div>
        </ComponentDemo>
      </Section>

      <Section title="Timeseries — Combined">
        <ComponentDemo label="Both series on the same chart">
          <div style={{ height: 350 }}>
            <TimeseriesChart
              bidAsk={bidAskData}
              meanStdev={{ ...meanStdevData, yaxis: 'y2' }}
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
            ['Margins', 'l:48 r:48 t:28 b:32'],
            ['Y-axis side', 'right (mirrored left)'],
            ['Grid', 'Dotted, var(--border-subtle)'],
            ['Tick font', 'JetBrains Mono, 10px'],
            ['Hover mode', 'x (all traces at same X)'],
          ]}
        />
      </Section>
    </div>
  );
}
