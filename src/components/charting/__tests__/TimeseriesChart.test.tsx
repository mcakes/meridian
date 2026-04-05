// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import type * as Plotly from 'plotly.js';

// Prevent plotly's browser-only internals from crashing jsdom during module load
vi.mock('react-plotly.js', () => ({ default: () => null }));
vi.mock('plotly.js', () => ({ default: {} }));

import { buildBidAskTraces, buildMeanStdevTraces } from '../TimeseriesChart';

describe('buildBidAskTraces', () => {
  const series = {
    times: [1000, 2000, 3000],
    bid: [100, 101, 102],
    ask: [103, 104, 105],
  };

  it('returns 3 traces: lower bound, upper bound fill, center line', () => {
    const traces = buildBidAskTraces(series, '#ff0000');
    expect(traces).toHaveLength(3);
  });

  it('lower bound uses bid values with transparent line', () => {
    const [lower] = buildBidAskTraces(series, '#ff0000') as [Plotly.ScatterData, Plotly.ScatterData, Plotly.ScatterData];
    expect(lower.x).toEqual([
      new Date(1000000),
      new Date(2000000),
      new Date(3000000),
    ]);
    expect(lower.y).toEqual([100, 101, 102]);
    expect(lower.line).toEqual({ color: 'transparent' });
    expect(lower.showlegend).toBe(false);
    expect(lower.hoverinfo).toBe('skip');
  });

  it('upper bound uses ask values with fill to lower bound', () => {
    const [, upper] = buildBidAskTraces(series, '#ff0000') as [Plotly.ScatterData, Plotly.ScatterData, Plotly.ScatterData];
    expect(upper.y).toEqual([103, 104, 105]);
    expect(upper.fill).toBe('tonexty');
    expect(upper.showlegend).toBe(false);
    expect(upper.hoverinfo).toBe('skip');
  });

  it('center line plots mid = 0.5*(bid+ask)', () => {
    const [, , center] = buildBidAskTraces(series, '#ff0000') as [Plotly.ScatterData, Plotly.ScatterData, Plotly.ScatterData];
    expect(center.y).toEqual([101.5, 102.5, 103.5]);
    expect(center.line).toEqual({ color: '#ff0000' });
    expect(center.showlegend).toBe(true);
  });

  it('assigns yaxis when provided', () => {
    const traces = buildBidAskTraces({ ...series, yaxis: 'y2' }, '#ff0000');
    traces.forEach((t) => expect(t.yaxis).toBe('y2'));
  });

  it('defaults yaxis to y', () => {
    const traces = buildBidAskTraces(series, '#ff0000');
    traces.forEach((t) => expect(t.yaxis).toBe('y'));
  });
});

describe('buildMeanStdevTraces', () => {
  const series = {
    times: [1000, 2000, 3000],
    mean: [50, 60, 70],
    stdev: [5, 6, 7],
  };

  it('returns 3 traces: lower bound, upper bound fill, center line', () => {
    const traces = buildMeanStdevTraces(series, '#00ff00');
    expect(traces).toHaveLength(3);
  });

  it('lower bound uses mean - stdev', () => {
    const [lower] = buildMeanStdevTraces(series, '#00ff00') as [Plotly.ScatterData, Plotly.ScatterData, Plotly.ScatterData];
    expect(lower.y).toEqual([45, 54, 63]);
    expect(lower.line).toEqual({ color: 'transparent' });
    expect(lower.showlegend).toBe(false);
    expect(lower.hoverinfo).toBe('skip');
  });

  it('upper bound uses mean + stdev with fill', () => {
    const [, upper] = buildMeanStdevTraces(series, '#00ff00') as [Plotly.ScatterData, Plotly.ScatterData, Plotly.ScatterData];
    expect(upper.y).toEqual([55, 66, 77]);
    expect(upper.fill).toBe('tonexty');
    expect(upper.showlegend).toBe(false);
    expect(upper.hoverinfo).toBe('skip');
  });

  it('center line plots mean values', () => {
    const [, , center] = buildMeanStdevTraces(series, '#00ff00') as [Plotly.ScatterData, Plotly.ScatterData, Plotly.ScatterData];
    expect(center.y).toEqual([50, 60, 70]);
    expect(center.line).toEqual({ color: '#00ff00' });
    expect(center.showlegend).toBe(true);
  });

  it('assigns yaxis when provided', () => {
    const traces = buildMeanStdevTraces({ ...series, yaxis: 'y2' }, '#00ff00');
    traces.forEach((t) => expect(t.yaxis).toBe('y2'));
  });

  it('defaults yaxis to y', () => {
    const traces = buildMeanStdevTraces(series, '#00ff00');
    traces.forEach((t) => expect(t.yaxis).toBe('y'));
  });
});
