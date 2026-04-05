import type * as Plotly from 'plotly.js';
import { useTheme } from '@/hooks/useTheme';
import { Chart } from './Chart';

interface BidAskSeries {
  times: number[];
  bid: number[];
  ask: number[];
  yaxis?: string;
}

interface MeanStdevSeries {
  times: number[];
  mean: number[];
  stdev: number[];
  yaxis?: string;
}

interface TimeseriesChartProps {
  bidAsk?: BidAskSeries;
  meanStdev?: MeanStdevSeries;
  layout?: Partial<Plotly.Layout>;
  config?: Partial<Plotly.Config>;
}

function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function withAlpha(color: string, alpha: number): string {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color.replace(')', `, ${alpha})`).replace('rgb(', 'rgba(');
}

function toDateArray(epochSeconds: number[]): Date[] {
  return epochSeconds.map((t) => new Date(t * 1000));
}

export function buildBidAskTraces(
  series: BidAskSeries,
  color: string,
): Plotly.ScatterData[] {
  const x = toDateArray(series.times);
  const yaxis = series.yaxis ?? 'y';

  const lower = {
    type: 'scatter',
    x,
    y: series.bid,
    mode: 'lines',
    line: { color: 'transparent' },
    showlegend: false,
    hoverinfo: 'skip',
    yaxis,
  };

  const upper = {
    type: 'scatter',
    x,
    y: series.ask,
    mode: 'lines',
    line: { color: 'transparent' },
    fill: 'tonexty',
    fillcolor: withAlpha(color, 0.15),
    showlegend: false,
    hoverinfo: 'skip',
    yaxis,
  };

  const mid = series.bid.map((b, i) => 0.5 * (b + series.ask[i]!));
  const center = {
    type: 'scatter',
    x,
    y: mid,
    mode: 'lines',
    line: { color },
    name: 'Mid',
    showlegend: true,
    yaxis,
  };

  return [lower, upper, center] as Plotly.ScatterData[];
}

export function buildMeanStdevTraces(
  series: MeanStdevSeries,
  color: string,
): Plotly.ScatterData[] {
  const x = toDateArray(series.times);
  const yaxis = series.yaxis ?? 'y';

  const lower = {
    type: 'scatter',
    x,
    y: series.mean.map((m, i) => m - series.stdev[i]!),
    mode: 'lines',
    line: { color: 'transparent' },
    showlegend: false,
    hoverinfo: 'skip',
    yaxis,
  };

  const upper = {
    type: 'scatter',
    x,
    y: series.mean.map((m, i) => m + series.stdev[i]!),
    mode: 'lines',
    line: { color: 'transparent' },
    fill: 'tonexty',
    fillcolor: withAlpha(color, 0.15),
    showlegend: false,
    hoverinfo: 'skip',
    yaxis,
  };

  const center = {
    type: 'scatter',
    x,
    y: series.mean,
    mode: 'lines',
    line: { color },
    name: 'Mean',
    showlegend: true,
    yaxis,
  };

  return [lower, upper, center] as Plotly.ScatterData[];
}

export function TimeseriesChart({ bidAsk, meanStdev, layout, config }: TimeseriesChartProps) {
  // Subscribe to theme changes so getCSSVar picks up updated CSS custom properties
  // on re-render when the user switches themes. The value is intentionally unused.
  const { theme: _ } = useTheme();

  // Use ScatterData[] so the y2 injection block can safely access .yaxis, .x, .y
  // without type assertions on every property access. Cast to Plotly.Data[] at the
  // Chart call site, which is the only place the broader union type is required.
  const traces: Plotly.ScatterData[] = [];

  if (bidAsk) {
    const color = getCSSVar('--color-cat-0');
    traces.push(...buildBidAskTraces(bidAsk, color));
  }

  if (meanStdev) {
    const color = getCSSVar('--color-cat-1');
    traces.push(...buildMeanStdevTraces(meanStdev, color));
  }

  const usesY2 = traces.some((t) => t.yaxis === 'y2');
  let y2LayoutOverride: Partial<Plotly.Layout> | undefined;

  if (!usesY2) {
    // No trace targets y2 — inject an invisible trace so the mirrored left axis renders
    const firstY = traces.find((t) => t.y && (t.y as number[]).length > 0);
    if (firstY) {
      traces.push({
        type: 'scatter',
        x: [(firstY.x as Date[])[0]!],
        y: [(firstY.y as number[])[0]!],
        yaxis: 'y2',
        mode: 'markers',
        marker: { opacity: 0 },
        hoverinfo: 'skip',
        showlegend: false,
      } as Plotly.ScatterData);
    }
  } else {
    // A trace explicitly uses y2 for real data — make it an independent axis
    y2LayoutOverride = {
      yaxis2: {
        ...((layout?.yaxis2 ?? {}) as Partial<Plotly.LayoutAxis>),
        side: 'left',
        overlaying: 'y' as const,
        matches: undefined,
        showgrid: false,
      },
    };
  }

  const mergedLayout = { ...layout, ...y2LayoutOverride };

  return <Chart data={traces as Plotly.Data[]} layout={mergedLayout} config={config} />;
}
