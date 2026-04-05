# TimeseriesChart Component Design

## Overview

A higher-level charting component built on `Chart` that renders timeseries data with shaded regions. Supports two series types: bid/ask and mean/stdev. Both can be provided simultaneously and assigned to different y-axes.

## Props / API

```tsx
interface BidAskSeries {
  times: number[];       // epoch seconds
  bid: number[];
  ask: number[];
  yaxis?: string;        // e.g. 'y' or 'y2', defaults to 'y'
}

interface MeanStdevSeries {
  times: number[];       // epoch seconds
  mean: number[];
  stdev: number[];
  yaxis?: string;        // defaults to 'y'
}

interface TimeseriesChartProps {
  bidAsk?: BidAskSeries;
  meanStdev?: MeanStdevSeries;
  layout?: Partial<Plotly.Layout>;
  config?: Partial<Plotly.Config>;
}
```

- Times are epoch seconds, consistent with the existing `Candle` type.
- `yaxis` lets consumers assign each series to a specific Plotly axis (e.g. `'y'` for right, `'y2'` for left).
- At least one of `bidAsk` or `meanStdev` must be provided.

## Trace Generation

Both series types follow the same three-trace pattern:

### Bid/Ask Series

1. **Lower bound (bid)** — `scatter` trace, transparent line (`opacity: 0`)
2. **Upper bound (ask)** — `scatter` trace, transparent line, `fill: 'tonexty'` with ~0.15 opacity
3. **Center line (mid)** — `scatter` trace, solid line plotting `0.5 * (bid + ask)`

### Mean/Stdev Series

1. **Lower bound (mean - stdev)** — `scatter` trace, transparent line (`opacity: 0`)
2. **Upper bound (mean + stdev)** — `scatter` trace, transparent line, `fill: 'tonexty'` with ~0.15 opacity
3. **Center line (mean)** — `scatter` trace, solid line

### Shared Behavior

- Fill traces have `showlegend: false`; center line has `showlegend: true`
- Colors come from Meridian colorway: `--color-cat-0` for bid/ask, `--color-cat-1` for mean/stdev
- The component injects an invisible scatter trace on `y2` if needed, to ensure the mirrored left-side axis renders (same pattern used in ChartPanel)
- The two series types are implemented as parallel code paths (not DRY'd together) so they can diverge independently in the future

## File Structure

- **New file:** `src/components/charting/TimeseriesChart.tsx`
- **Imports:** `Chart` from `./Chart`, builds Plotly traces internally
- **Export:** Added to `src/components/index.ts` alongside `Chart`
- **No CSS:** All styling via Plotly trace config and existing Meridian template

## Architecture

```
TimeseriesChartProps
  -> buildBidAskTraces()    // returns 3 Plotly.Data traces
  -> buildMeanStdevTraces() // returns 3 Plotly.Data traces
  -> inject y2 invisible trace if needed
  -> <Chart data={traces} layout={layout} config={config} />
```

The component is a pure data-to-traces transformer on top of `Chart`. No internal state beyond theme-aware color resolution.
