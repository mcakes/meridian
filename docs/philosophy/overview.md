# Meridian Design System — Philosophy Overview

Meridian is a design system built for professional trading and financial analytics applications. It addresses a specific and demanding context: users who spend eight or more hours a day navigating dense, time-sensitive information across multiple data streams, making decisions where errors have immediate financial consequences.

This document explains what Meridian is, the principles it operates on, the technology choices it makes, and how to work with the system.

---

## What Meridian Is

Meridian is an evidence-based design system. Every significant decision — color methodology, typographic choices, layout philosophy, interaction timing — is grounded in perceptual science, cognitive psychology, or observed practice in professional trading environments. The companion research document provides the full references and rationale; this overview summarizes the principles and their implications for day-to-day usage.

---

## Core Design Principles

### 1. Density Backed by Perceptual Science

Professional interfaces need to pack a great deal of meaningful information into limited screen space. But density is not simply a matter of making things smaller — the research distinguishes three axes:

- **Visual density:** information per unit of screen area
- **Temporal density:** information per unit of time, achieved through fast navigation and progressive disclosure
- **Value density:** useful decision-making input per interaction

The goal is maximum value density, which sometimes means adding whitespace rather than removing it. The aversion users report toward dense interfaces is in practice an aversion to *poorly designed* dense interfaces — ones where information competes rather than cooperates.

### 2. Redundant Encoding as a Default

Meridian encodes critical information through multiple channels simultaneously: color plus icon plus sign prefix for directional values (gains/losses), color plus shape for categorical data, color plus border for focus states. Redundant encoding is not an accessibility accommodation bolted on at the end — it is the default design mode. This makes the system robust for users with color vision deficiency and reduces cognitive load for everyone else.

### 3. Cognitive Load Management

Working memory capacity is approximately 4 items, not the commonly cited 7±2 from Miller (the [updated figure from Cowan](https://pmc.ncbi.nlm.nih.gov/articles/PMC12292122/) reflects chunked items under realistic conditions). This constraint informs every limit in the system: 6 maximum categorical colors before discrimination degrades, 3 visible toast notifications before the stack collapses to "+N more," 64px maximum for panel chrome before the data area is unacceptably compressed.

### 4. Evidence-Based Color

Color decisions follow a documented methodology: perceptual distance measured in CIELAB space (minimum ΔE ≥ 20), lightness uniformity to prevent one color from appearing more important than another, CVD safety validated via the [Viénot 1999 deuteranopia simulation matrix](https://vis.cs.brown.edu/docs/pdf/Gramazio-2016-CCD.pdf), and max-distance-first ordering so that the first N colors used in any visualization are the most distinguishable set available.

### 5. Professional Signal

Shape and radius choices signal precision rather than approachability. Research on shape perception ([Bar & Neta, 2006](https://journals.sagepub.com/doi/10.1111/j.1467-9280.2006.01759.x)) found that rounded shapes are perceived as friendlier — a desirable quality for consumer products, less appropriate for a professional tool where precision is the signal. Meridian uses 2px radius as the contemporary convergence point for professional desktop software, with nothing exceeding 6px except modal dialogs.

---

## Technology Choices

| Layer | Choice | License | Rationale |
|-------|--------|---------|-----------|
| Framework | [React](https://react.dev/) | MIT | Component model fits the panel-based architecture |
| Primitives | [Radix UI](https://www.radix-ui.com/primitives/docs/overview/introduction) | MIT | Unstyled, WAI-ARIA compliant, full keyboard navigation |
| Styling | [Tailwind CSS](https://tailwindcss.com/) | MIT | Design tokens map to `theme.extend`; utilities avoid style conflict at scale |
| Data grid | [AG Grid](https://www.ag-grid.com/) | Community: MIT | Virtualization at 100K+ rows, column features, row grouping with ~2x faster aggregation than alternatives |
| Charting (primary) | [Plotly.js](https://plotly.com/javascript/) | MIT | 40+ chart types, existing ecosystem, MIT license |
| Charting (upgrade) | [SciChart.js](https://www.scichart.com/) or [ECharts](https://echarts.apache.org/) | Commercial / Apache 2.0 | Only when Plotly bottlenecks at multi-Hz or 5K+ bars |
| Sparklines | Custom SVG | — | 50–200 simultaneous inline charts exceed what Canvas instances can handle cleanly |
| Workspace layout | [react-mosaic](https://github.com/nomcopter/react-mosaic) | Apache 2.0 | Serializable tile tree; Palantir origins validate the approach for finance |

AG Grid was chosen over [TanStack Table](https://tanstack.com/table/latest) for a specific reason: the features trading UIs need — virtualization, clipboard, row grouping, range selection — are built into AG Grid Community and require substantial custom work in TanStack. J.P. Morgan's [Salt design system](https://saltdesignsystem.com/) uses AG Grid, validating this trade-off for the finance context.

Radix UI provides the unstyled primitive layer (dialogs, popovers, tooltips, tabs, dropdowns) so Meridian's tokens and styles fully control appearance without fighting framework defaults, while WAI-ARIA compliance and keyboard navigation are handled correctly by the library.

---

## How to Use the System

### Tokens First

All visual properties — color, spacing, radius, typography — are expressed as CSS custom properties (e.g., `--color-positive`, `--bg-surface`, `--radius-sm`). Tailwind consumes these via `theme.extend`. Do not hardcode hex values anywhere in application code. Theme switching (dark/light) is a single `data-theme` attribute change on the root element.

### Color Assignment

The categorical ramp provides an ordered sequence of 6 core colors (plus 2 extensions for 7–8 category use cases). Applications map ramp indices to their own domain categories. The design system does not assign fixed meaning at the ramp level — only the semantic tokens (`positive`, `negative`, `warning`, `info`, `accent`) carry fixed meaning.

### Information Hierarchy

Every panel should organize its content into three tiers:

- **Tier 1 — Glanceable:** pre-attentive properties (color, magnitude, direction). Readable from arm's length.
- **Tier 2 — Scannable:** focused but not deep attention (bid/ask, secondary metrics).
- **Tier 3 — Explorable:** on-demand via hover, click, or tab switch.

Panel header plus toolbar must never exceed 64px combined. Every pixel above that is taken from the data area.

### Redundant Encoding

Never use color alone to convey meaning. Every color-encoded state must pair with at least one non-color channel. Semantic values use color + directional arrow + sign prefix. Categorical series in charts with more than 6 groups require color + dash pattern or marker shape.

---

## References

- [Ström-Awn, M. (2024). "UI Density."](https://mattstromawn.com/writing/ui-density/)
- [Cowan, N. Working memory capacity ~4 items.](https://pmc.ncbi.nlm.nih.gov/articles/PMC12292122/)
- [Bar, M. & Neta, M. (2006). "Humans Prefer Curved Visual Objects." *Psychological Science*, 17(8).](https://journals.sagepub.com/doi/10.1111/j.1467-9280.2006.01759.x)
- [AG Grid vs TanStack performance.](https://strapi.io/blog/table-in-react-performance-guide)
- [TanStack aggregation benchmarks.](https://github.com/TanStack/table/discussions/4860)
- [Hudson River Trading (2024). "Optimizing UX/UI Design for Trading."](https://www.hudsonrivertrading.com/hrtbeat/optimizing-ux-ui-design-for-trading)
