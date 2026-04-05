# TimeseriesChart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `TimeseriesChart` component that renders bid/ask and/or mean/stdev timeseries with shaded bands, on top of the existing `Chart` wrapper.

**Architecture:** `TimeseriesChart` is a pure data-to-traces transformer. It accepts parallel arrays for each series type, builds Plotly scatter traces (lower bound, upper bound fill, center line), and passes them to `Chart`. Two parallel builder functions keep bid/ask and mean/stdev independent.

**Tech Stack:** React, Plotly.js (via `react-plotly.js`), Vitest, Testing Library

**Spec:** `docs/superpowers/specs/2026-04-05-timeseries-chart-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/charting/TimeseriesChart.tsx` | Create | Component + trace builder functions |
| `src/components/charting/__tests__/TimeseriesChart.test.tsx` | Create | Unit tests for trace generation |
| `src/components/index.ts` | Modify (line 36) | Add export |

---

### Task 1: Test trace generation for bid/ask series

**Files:**
- Create: `src/components/charting/__tests__/TimeseriesChart.test.tsx`

Since `TimeseriesChart` renders a Plotly `<Plot>` component (canvas-based, not DOM), we test the trace builder functions directly rather than rendering the component.

- [ ] **Step 1: Write tests for `buildBidAskTraces`**

```tsx
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildBidAskTraces } from '../TimeseriesChart';

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
    const traces = buildBidAskTraces(series, '#ff0000');
    const lower = traces[0];
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
    const traces = buildBidAskTraces(series, '#ff0000');
    const upper = traces[1];
    expect(upper.y).toEqual([103, 104, 105]);
    expect(upper.fill).toBe('tonexty');
    expect(upper.showlegend).toBe(false);
    expect(upper.hoverinfo).toBe('skip');
  });

  it('center line plots mid = 0.5*(bid+ask)', () => {
    const traces = buildBidAskTraces(series, '#ff0000');
    const center = traces[2];
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/charting/__tests__/TimeseriesChart.test.tsx`
Expected: FAIL — `buildBidAskTraces` does not exist yet.

---

### Task 2: Implement bid/ask trace builder

**Files:**
- Create: `src/components/charting/TimeseriesChart.tsx`

- [ ] **Step 1: Write `buildBidAskTraces` and the component shell**

```tsx
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
): Plotly.Data[] {
  const x = toDateArray(series.times);
  const yaxis = series.yaxis ?? 'y';

  const lower: Plotly.Data = {
    type: 'scatter',
    x,
    y: series.bid,
    mode: 'lines',
    line: { color: 'transparent' },
    showlegend: false,
    hoverinfo: 'skip',
    yaxis,
  };

  const upper: Plotly.Data = {
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

  const mid = series.bid.map((b, i) => 0.5 * (b + series.ask[i]));
  const center: Plotly.Data = {
    type: 'scatter',
    x,
    y: mid,
    mode: 'lines',
    line: { color },
    name: 'Mid',
    showlegend: true,
    yaxis,
  };

  return [lower, upper, center];
}

export function TimeseriesChart({ bidAsk, meanStdev, layout, config }: TimeseriesChartProps) {
  const { theme: _ } = useTheme();

  const traces: Plotly.Data[] = [];

  if (bidAsk) {
    const color = getCSSVar('--color-cat-0');
    traces.push(...buildBidAskTraces(bidAsk, color));
  }

  return <Chart data={traces} layout={layout} config={config} />;
}
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `npx vitest run src/components/charting/__tests__/TimeseriesChart.test.tsx`
Expected: PASS — all 6 bid/ask tests green.

- [ ] **Step 3: Commit**

```bash
git add src/components/charting/TimeseriesChart.tsx src/components/charting/__tests__/TimeseriesChart.test.tsx
git commit -m "feat: add TimeseriesChart with bid/ask trace builder"
```

---

### Task 3: Test trace generation for mean/stdev series

**Files:**
- Modify: `src/components/charting/__tests__/TimeseriesChart.test.tsx`

- [ ] **Step 1: Add tests for `buildMeanStdevTraces`**

Append to the test file:

```tsx
import { buildMeanStdevTraces } from '../TimeseriesChart';

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
    const traces = buildMeanStdevTraces(series, '#00ff00');
    const lower = traces[0];
    expect(lower.y).toEqual([45, 54, 63]);
    expect(lower.line).toEqual({ color: 'transparent' });
    expect(lower.showlegend).toBe(false);
    expect(lower.hoverinfo).toBe('skip');
  });

  it('upper bound uses mean + stdev with fill', () => {
    const traces = buildMeanStdevTraces(series, '#00ff00');
    const upper = traces[1];
    expect(upper.y).toEqual([55, 66, 77]);
    expect(upper.fill).toBe('tonexty');
    expect(upper.showlegend).toBe(false);
    expect(upper.hoverinfo).toBe('skip');
  });

  it('center line plots mean values', () => {
    const traces = buildMeanStdevTraces(series, '#00ff00');
    const center = traces[2];
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/charting/__tests__/TimeseriesChart.test.tsx`
Expected: FAIL — `buildMeanStdevTraces` does not exist yet.

---

### Task 4: Implement mean/stdev trace builder

**Files:**
- Modify: `src/components/charting/TimeseriesChart.tsx`

- [ ] **Step 1: Add `buildMeanStdevTraces` and wire it into the component**

Add the function to `TimeseriesChart.tsx`:

```tsx
export function buildMeanStdevTraces(
  series: MeanStdevSeries,
  color: string,
): Plotly.Data[] {
  const x = toDateArray(series.times);
  const yaxis = series.yaxis ?? 'y';

  const lower: Plotly.Data = {
    type: 'scatter',
    x,
    y: series.mean.map((m, i) => m - series.stdev[i]),
    mode: 'lines',
    line: { color: 'transparent' },
    showlegend: false,
    hoverinfo: 'skip',
    yaxis,
  };

  const upper: Plotly.Data = {
    type: 'scatter',
    x,
    y: series.mean.map((m, i) => m + series.stdev[i]),
    mode: 'lines',
    line: { color: 'transparent' },
    fill: 'tonexty',
    fillcolor: color.replace(')', ', 0.15)').replace('rgb(', 'rgba('),
    showlegend: false,
    hoverinfo: 'skip',
    yaxis,
  };

  const center: Plotly.Data = {
    type: 'scatter',
    x,
    y: series.mean,
    mode: 'lines',
    line: { color },
    name: 'Mean',
    showlegend: true,
    yaxis,
  };

  return [lower, upper, center];
}
```

Update the component body to include mean/stdev traces:

```tsx
if (meanStdev) {
  const color = getCSSVar('--color-cat-1');
  traces.push(...buildMeanStdevTraces(meanStdev, color));
}
```

- [ ] **Step 2: Run all tests to verify they pass**

Run: `npx vitest run src/components/charting/__tests__/TimeseriesChart.test.tsx`
Expected: PASS — all 12 tests green.

- [ ] **Step 3: Commit**

```bash
git add src/components/charting/TimeseriesChart.tsx src/components/charting/__tests__/TimeseriesChart.test.tsx
git commit -m "feat: add mean/stdev trace builder to TimeseriesChart"
```

---

### Task 5: Add invisible y2 trace and export

**Files:**
- Modify: `src/components/charting/TimeseriesChart.tsx`
- Modify: `src/components/index.ts` (line 36)

- [ ] **Step 1: Add invisible y2 trace injection**

In the `TimeseriesChart` component, after building all traces, add logic to inject an invisible y2 trace if no trace already targets y2:

```tsx
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
```

- [ ] **Step 2: Export from index**

In `src/components/index.ts`, after line 36 (`export { Chart } from './charting/Chart';`), add:

```tsx
export { TimeseriesChart } from './charting/TimeseriesChart';
```

- [ ] **Step 3: Run all tests**

Run: `npx vitest run src/components/charting/__tests__/TimeseriesChart.test.tsx`
Expected: PASS — all tests still green.

- [ ] **Step 4: Commit**

```bash
git add src/components/charting/TimeseriesChart.tsx src/components/index.ts
git commit -m "feat: export TimeseriesChart with automatic y2 axis support"
```
