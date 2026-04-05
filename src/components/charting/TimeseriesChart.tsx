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
    fillcolor: color.replace(')', ', 0.15)').replace('rgb(', 'rgba('),
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
    fillcolor: color.replace(')', ', 0.15)').replace('rgb(', 'rgba('),
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
  const { theme: _ } = useTheme();

  const traces: Plotly.Data[] = [];

  if (bidAsk) {
    const color = getCSSVar('--color-cat-0');
    traces.push(...buildBidAskTraces(bidAsk, color));
  }

  if (meanStdev) {
    const color = getCSSVar('--color-cat-1');
    traces.push(...buildMeanStdevTraces(meanStdev, color));
  }

  const usesY2 = traces.some((t) => t.yaxis === 'y2');
  if (!usesY2) {
    const firstY = traces.find((t) => t.y && (t.y as number[]).length > 0);
    if (firstY) {
      traces.push({
        type: 'scatter',
        x: [(firstY.x as Date[])[0]],
        y: [(firstY.y as number[])[0]],
        yaxis: 'y2',
        mode: 'markers',
        marker: { opacity: 0 },
        hoverinfo: 'skip',
        showlegend: false,
      });
    }
  }

  return <Chart data={traces} layout={layout} config={config} />;
}
