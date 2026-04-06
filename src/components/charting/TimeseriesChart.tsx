import { useMemo } from 'react';
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
  if (typeof document === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function withAlpha(color: string, alpha: number): string {
  // Handle hex colors (3, 4, 6, or 8 digit)
  const hexMatch = /^#([0-9a-f]{3,8})$/i.exec(color);
  if (hexMatch) {
    const hex = hexMatch[1]!;
    let r: number, g: number, b: number;
    if (hex.length === 3 || hex.length === 4) {
      r = parseInt(hex[0]! + hex[0]!, 16);
      g = parseInt(hex[1]! + hex[1]!, 16);
      b = parseInt(hex[2]! + hex[2]!, 16);
    } else {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  // Handle rgb() and rgba() — replace or append alpha
  const rgbMatch = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/.exec(color);
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`;
  }
  // Fallback: use color-mix for any CSS color value (hsl, oklch, named colors, etc.)
  return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
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
  // Subscribe to theme so we re-read CSS vars when the user toggles theme
  const { theme } = useTheme();

  const traces = useMemo(() => {
    const result: Plotly.ScatterData[] = [];

    if (bidAsk) {
      const color = getCSSVar('--color-cat-0');
      result.push(...buildBidAskTraces(bidAsk, color));
    }

    if (meanStdev) {
      const color = getCSSVar('--color-cat-1');
      result.push(...buildMeanStdevTraces(meanStdev, color));
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- theme triggers CSS var re-read
  }, [bidAsk, meanStdev, theme]);

  const usesY2 = traces.some((t) => t.yaxis === 'y2');
  let y2LayoutOverride: Partial<Plotly.Layout> | undefined;
  // Copy traces so we can append the phantom y2 trace without mutating the memoized array
  const finalTraces = [...traces];

  if (!usesY2) {
    // No trace targets y2 — inject an invisible trace so the mirrored left axis renders
    const firstY = traces.find((t) => t.y && (t.y as number[]).length > 0);
    if (firstY) {
      finalTraces.push({
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

  return <Chart data={finalTraces as Plotly.Data[]} layout={mergedLayout} config={config} />;
}
