# Meridian Design System — Implementation Guide
## Token specs, component patterns, and build plan

For the research and rationale behind these choices, see the companion **Research & Rationale** document.

---

## 1. Technology Stack

| Layer | Choice | License | Notes |
|-------|--------|---------|-------|
| Framework | [React](https://react.dev/) | MIT | |
| Primitives | [Radix UI](https://www.radix-ui.com/primitives/docs/overview/introduction) | MIT | Unstyled, WAI-ARIA, keyboard nav |
| Styling | [Tailwind CSS](https://tailwindcss.com/) | MIT | Tokens map to `theme.extend` |
| Data grid | [AG Grid](https://www.ag-grid.com/) | Community: MIT | Evaluate Enterprise at paywall |
| Charting (primary) | [Plotly.js](https://plotly.com/javascript/) | MIT | `plotly.js-finance-dist-min` partial bundle |
| Charting (upgrade) | [SciChart.js](https://www.scichart.com/) or [ECharts](https://echarts.apache.org/) | Commercial / Apache 2.0 | Only when Plotly bottlenecks |
| Sparklines | Custom SVG | — | `<polyline>` in `<svg>` |
| Layout | [react-mosaic](https://github.com/nomcopter/react-mosaic) | Apache 2.0 | Palantir origins, serializable tree |

---

## 2. Color Tokens

### 2.1 Categorical Ramp (max-distance-first order)

| Index | Name | Dark | Light | CIELAB (dark) |
|-------|------|------|-------|---------------|
| 0 | blue | `#7aa2f7` | `#4a76c9` | L*=67.0 H=282° |
| 1 | green | `#9ece6a` | `#4d7a1f` | L*=77.6 H=126° |
| 2 | red | `#e06c75` | `#c4525c` | L*=59.8 H=20° |
| 3 | teal | `#41c5b0` | `#32a18a` | L*=72.4 H=180° |
| 4 | orange | `#ff9e64` | `#c97a3e` | L*=74.0 H=56° |
| 5 | purple | `#d6a0e8` | `#9e6fb8` | L*=73.1 H=319° |
| 6 | cyan | `#80d8e8` | `#4a9fad` | L*=81.6 H=216° (extension — needs secondary encoding) |
| 7 | pink | `#b8608e` | `#9e4a75` | L*=52.4 H=347° (extension — needs secondary encoding) |

**Usage rules:** ≤6 groups use core ramp directly. 7–8 groups must pair color with a secondary channel (dash pattern, marker shape, or label). Do not assign fixed meaning at the design-system level — applications map indices to their own categories.

### 2.2 Semantic Colors

| Token | Dark | Light | Usage | Redundant encoding |
|-------|------|-------|-------|-------------------|
| `positive` | `#9ece6a` | `#1e7a1e` | Gains, bullish | Color + ▲ + "+" |
| `negative` | `#f7768e` | `#c93545` | Losses, bearish | Color + ▼ + "−" |
| `neutral` | `#a9b1d6` | `#6a6b7a` | Unchanged | Color + "—" |
| `warning` | `#e0af68` | `#8f6200` | Alerts, limits | Color + icon |
| `info` | `#7aa2f7` | `#2e5cb8` | Informational | Color + context |
| `accent` | `#bb9af7` | `#7c4dab` | Focus, active | Color + border |

### 2.3 Backgrounds

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `base` | `#1a1b26` | `#f0f0f3` | Page/app background |
| `surface` | `#24283b` | `#f8f8fb` | Cards, panels, table bg (not pure white — reduces glare) |
| `muted` | `#292e42` | `#e8e8ed` | Alternating rows, subtle fills |
| `overlay` | `#414868` | `#d8d8de` | Active tabs, dropdowns |
| `highlight` | `#2f344d` | `#e0e0e6` | Row hover |

### 2.4 Text

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `primary` | `#c0caf5` | `#1a1b26` | Body text, values |
| `secondary` | `#a9b1d6` | `#4a4b5c` | Labels, descriptions |
| `muted` | `#565f89` | `#8b8c9a` | Captions, timestamps, disabled |
| `inverse` | `#1a1b26` | `#f0f0f3` | Text on filled backgrounds |

### 2.5 Borders

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `subtle` | `#292e42` | `#d8d8de` | Panel dividers, row separators |
| `default` | `#3b4261` | `#c0c0c8` | Input borders, card borders |
| `active` | `#565f89` | `#9a9aa8` | Hover borders |

### 2.6 Theming Implementation

CSS custom properties switched by `data-theme="dark"` / `data-theme="light"` on the root element. Tailwind config consumes variables via `theme.extend.colors`, not hardcoded hex. Theme switching is a single DOM attribute change.

---

## 3. Typography

### 3.1 Font Stack

| Role | Font | Source |
|------|------|--------|
| Primary (labels, prose) | [Inter](https://rsms.me/inter/) | Google Fonts or self-hosted |
| Numeric (prices, quantities) | Inter with `font-variant-numeric: tabular-nums` | Same font, CSS feature |
| Monospace (order books, tick data) | [JetBrains Mono](https://www.jetbrains.com/lp/mono/) | Google Fonts or self-hosted |

### 3.2 Type Scale

| Purpose | Font | Size | Weight | CSS notes |
|---------|------|------|--------|-----------|
| Panel title | Inter | 16px | 600 | |
| Section header | Inter | 14px | 600 | |
| Column header | Inter | 11px | 500 | `text-transform: uppercase; letter-spacing: 0.5px` |
| Body / labels | Inter | 13px | 400 | |
| Numeric data | Inter | 13px | 400 | `font-variant-numeric: tabular-nums` |
| Price ladder | JetBrains Mono | 12px | 400 | Full monospace |
| Caption | Inter | 11px | 400 | |

### 3.3 Numeric Formatting

- `font-variant-numeric: tabular-nums` everywhere
- Right-align numeric columns, left-align text
- Decimal precision: 2 (equities), 4+ (FX), 8 (crypto)
- Dim trailing zeros in `text.muted`
- Locale-configurable thousands separators

---

## 4. Spacing and Shape

### 4.1 Spacing Scale (4px base)

| Token | Value | Usage |
|-------|-------|-------|
| `space-px` | 1px | Hairline gaps |
| `space-0.5` | 2px | Icon-to-text gaps |
| `space-1` | 4px | Tight padding (badges, compact cells) |
| `space-1.5` | 6px | Default cell padding vertical |
| `space-2` | 8px | Default cell padding horizontal |
| `space-3` | 12px | Component internal padding |
| `space-4` | 16px | Panel internal padding |
| `space-6` | 24px | Large section gaps |
| `space-8` | 32px | Major layout gaps |

### 4.2 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-none` | 0px | Tiled panel borders, table cells |
| `radius-sm` | 2px | Buttons, inputs, badges, toggles |
| `radius-md` | 4px | Tooltips, dropdowns, popovers, cards |
| `radius-lg` | 6px | Modal dialogs only |

**Principle:** radius correlates with detachment from workspace grid. Nothing ≥ 8px.

### 4.3 Borders

- **Panel dividers:** 1px solid `border.subtle`
- **Row separators:** 1px solid `border.subtle`, every row
- **Interactive elements:** 1px `border.default` at rest, `border.active` on hover
- **Focus ring:** `box-shadow: 0 0 0 2px {info}` (not border — avoids layout shift)
- **Floating elements:** 1px `border.default`, no box-shadow

---

## 5. Workspace Layout

### 5.1 Architecture

1. Tree of split containers (horizontal/vertical) via [react-mosaic](https://github.com/nomcopter/react-mosaic)
2. Tabs within panels (`MosaicTabsNode`)
3. Named workspaces — serialized JSON snapshots, save/switch atomically
4. Persistence: restore panel positions, sizes, active tabs, scroll positions, filters on launch
5. Ship 2–3 pre-built default workspaces

### 5.2 Panel Anatomy

| Region | Height | Content |
|--------|--------|---------|
| Header | 24–32px | Title, tab strip, close/max/min |
| Toolbar (optional) | 28–36px | Actions, filters, search |
| Data area | Fills remainder | Table, chart, or form content |

Header + toolbar ≤ 64px combined.

---

## 6. Data Table (AG Grid)

### 6.1 Configuration

- Start with [AG Grid Community](https://www.ag-grid.com/) (MIT)
- Theme via [Theming API](https://www.ag-grid.com/javascript-data-grid/global-style-customisation/) consuming CSS custom properties
- Evaluate Enterprise for: row grouping, clipboard, range selection

### 6.2 Cell Types

| Type | Alignment | Font | Color | Behavior |
|------|-----------|------|-------|----------|
| Text | Left | Proportional | `text.secondary` | Truncate + Radix Tooltip |
| Numeric | Right | Tabular | `text.primary` | Flash-on-update (100ms fade) |
| Change | Right | Tabular | Semantic | Arrow + sign prefix + color |
| Badge | Center | Proportional | Categorical/semantic | Compact pill, `radius-sm` |
| Sparkline | Center | n/a | Categorical | Inline SVG `<polyline>`, ~60px |
| Action | Center | n/a | `text.muted` | Icon buttons, Radix Tooltip |
| Editable | Right | Tabular | `text.primary` | Click-to-edit, Enter/Escape |

### 6.3 Features

- **Frozen columns:** first 1–2 via `position: sticky`
- **Row grouping:** categorical ramp left-border (2px) + CatDot. Collapsible.
- **Column reorder/visibility:** persists in workspace snapshot
- **Selection:** click → highlight + update linked panels. Ctrl/Shift for multi/range.
- **Density modes:** compact (24px rows), default (32px), comfortable (40px)

---

## 7. Charting

### 7.1 Layered Strategy

| Layer | Library | When | Bundle |
|-------|---------|------|--------|
| Primary | [Plotly.js](https://plotly.com/javascript/) `plotly.js-finance-dist-min` | Start here | ~1MB |
| Upgrade | [SciChart.js](https://www.scichart.com/) or [ECharts](https://echarts.apache.org/) | When Plotly bottlenecks (5K+ bars, multi-Hz) | ~2MB / ~800KB |
| Sparklines | Custom SVG | Always | ~0 |

### 7.2 Plotly Chart Styling — Meridian Template

All Plotly charts consume the same Meridian template object. This ensures visual consistency across every chart type (scatter, candlestick, heatmap, histogram, etc.) without per-chart configuration.

**Governing principles:**
- Charts are for *reading*, not decoration. Gridlines, tick labels, and spikes exist to support precise value extraction.
- Chart chrome (axes, grid, labels) should be visible but not compete with the data. Use `text.muted` and `border.subtle` — never `text.primary`.
- Data traces use the categorical ramp. Chrome uses the neutral palette. These two systems never overlap.
- Zero whitespace between chart and panel edges. The chart fills its container entirely — no `paper_bgcolor` padding.

#### 7.2.1 Layout Template (dark theme)

```javascript
const meridianPlotlyLayout = {
  // Backgrounds
  paper_bgcolor: "transparent",  // chart sits on panel surface
  plot_bgcolor: tokens.bg.base,  // plot area uses base (darkest)

  // Typography
  font: {
    family: "'Inter', system-ui, sans-serif",
    size: 11,
    color: tokens.text.muted,    // all chrome text is muted
  },
  title: {
    font: { size: 13, color: tokens.text.secondary },
    x: 0, xanchor: "left",       // left-aligned, not centered
    pad: { l: 0, t: 4, b: 0 },
  },

  // Margins — tight, no wasted space
  margin: { l: 48, r: 12, t: 28, b: 32 },

  // X Axis
  xaxis: {
    showgrid: true,
    gridcolor: tokens.border.subtle,
    gridwidth: 1,
    griddash: "dot",             // dotted grid = visible but non-competing
    zeroline: false,
    showline: true,
    linecolor: tokens.border.default,
    linewidth: 1,
    tickfont: { family: "'JetBrains Mono', monospace", size: 10, color: tokens.text.muted },
    tickcolor: tokens.border.default,
    ticks: "outside",
    ticklen: 3,
    // Spikelines — crosshair on hover
    showspikes: true,
    spikemode: "across",         // full-width line
    spikesnap: "cursor",         // follows cursor, not nearest data
    spikecolor: tokens.text.muted,
    spikethickness: 1,
    spikedash: "solid",
  },

  // Y Axis
  yaxis: {
    showgrid: true,
    gridcolor: tokens.border.subtle,
    gridwidth: 1,
    griddash: "dot",
    zeroline: false,
    showline: false,             // no y-axis line (grid is enough)
    tickfont: { family: "'JetBrains Mono', monospace", size: 10, color: tokens.text.muted },
    tickcolor: tokens.border.default,
    ticks: "outside",
    ticklen: 3,
    side: "right",               // financial convention: prices on right
    // Y spikeline
    showspikes: true,
    spikemode: "across",
    spikesnap: "cursor",
    spikecolor: tokens.text.muted,
    spikethickness: 1,
    spikedash: "solid",
  },

  // Hover
  hovermode: "x",                // show all traces at same x
  hoverlabel: {
    bgcolor: tokens.bg.overlay,
    bordercolor: tokens.border.default,
    font: { family: "'Inter', sans-serif", size: 12, color: tokens.text.primary },
  },

  // Legend
  legend: {
    bgcolor: "transparent",
    borderwidth: 0,
    font: { size: 11, color: tokens.text.secondary },
    orientation: "h",            // horizontal legend above chart
    x: 0, y: 1.02, xanchor: "left", yanchor: "bottom",
  },

  // Color sequence — categorical ramp
  colorway: tokens.cat,

  // Modebar
  modebar: {
    bgcolor: "transparent",
    color: tokens.text.muted,
    activecolor: tokens.text.secondary,
  },
};
```

#### 7.2.2 Light Theme Overrides

The light template inherits the structure above with these overrides:

```javascript
const meridianPlotlyLayoutLight = {
  ...meridianPlotlyLayout,
  plot_bgcolor: lightTokens.bg.base,
  font: { ...meridianPlotlyLayout.font, color: lightTokens.text.muted },
  xaxis: {
    ...meridianPlotlyLayout.xaxis,
    gridcolor: lightTokens.border.subtle,
    linecolor: lightTokens.border.default,
    tickfont: { ...meridianPlotlyLayout.xaxis.tickfont, color: lightTokens.text.muted },
    spikecolor: lightTokens.text.muted,
  },
  yaxis: {
    ...meridianPlotlyLayout.yaxis,
    gridcolor: lightTokens.border.subtle,
    tickfont: { ...meridianPlotlyLayout.yaxis.tickfont, color: lightTokens.text.muted },
    spikecolor: lightTokens.text.muted,
  },
  hoverlabel: {
    bgcolor: lightTokens.bg.overlay,
    bordercolor: lightTokens.border.default,
    font: { ...meridianPlotlyLayout.hoverlabel.font, color: lightTokens.text.primary },
  },
  colorway: lightTokens.cat,
};
```

#### 7.2.3 Design Rules

| Element | Style | Rationale |
|---------|-------|-----------|
| Grid lines | `border.subtle`, 1px, dotted | Visible for precise reading, doesn't compete with data |
| X grid | Shown | Vertical gridlines help read time series precisely |
| Y grid | Shown | Horizontal gridlines are essential for price/value reading |
| Grid dash | `"dot"` | Lighter than solid, more visible than `"dash"` at 1px |
| Zero line | Hidden | Rarely meaningful in financial data; creates visual noise |
| Axis line | X only, `border.default` | Grounds the chart bottom; Y-axis line is redundant with Y grid |
| Tick labels | JetBrains Mono, 10px, `text.muted` | Monospace for numeric alignment; muted to not compete |
| Ticks | Outside, 3px | Small ticks connect labels to the axis without intruding into plot |
| Y-axis side | Right | Financial convention — prices on the right side |
| Spikelines | Both axes, `"across"`, `"cursor"` snap | Full crosshair on hover for precise value reading |
| Spike style | `text.muted`, 1px, solid | Visible but subtle — thinner than data traces |
| Spike snap | `"cursor"` | Follows mouse position, not nearest data point — feels more responsive |
| Hover mode | `"x"` | Shows all traces at the same x — essential for multi-series comparison |
| Hover label | `bg.overlay` bg, `border.default` border | Consistent with tooltip styling elsewhere in the system |
| Title | 13px, left-aligned | Not centered — aligns with the professional density aesthetic |
| Legend | Horizontal, above chart | Doesn't consume plot area; reads left-to-right |
| Margins | 48/12/28/32 (l/r/t/b) | Tight — enough for tick labels, no wasted space |
| Paper bg | `transparent` | Chart sits on the panel surface, not its own background |
| Plot bg | `bg.base` | Darkest surface — data traces (which are brighter) pop against it |
| Color sequence | Categorical ramp | Max-distance-first order applies to auto-assigned trace colors |

#### 7.2.4 Per-Chart-Type Overrides

**Candlestick / OHLC:**
```javascript
{
  increasing: { line: { color: tokens.semantic.positive } },
  decreasing: { line: { color: tokens.semantic.negative } },
}
```

**Scatter / Line:**
- Line width: 1.5px (thinner than default 2px — denser data requires thinner lines)
- Marker size: 4px (smaller than default — reduces clutter at high point density)
- Mode: `"lines"` for time series, `"markers"` for non-temporal scatter

**Heatmap:**
- Use `Viridis` or a sequential single-hue scale (blue or purple from the ramp) — never rainbow
- Show colorbar on the right, 12px wide, muted tick labels

**Histogram:**
- Use first ramp color as fill, 80% opacity
- Outline: 1px `border.default`

#### 7.2.5 Plotly Config Object

```javascript
const meridianPlotlyConfig = {
  displayModeBar: true,
  displaylogo: false,
  modeBarButtonsToRemove: [
    "select2d", "lasso2d", "sendDataToCloud", "toImage"
  ],
  scrollZoom: true,              // scroll wheel zoom
  doubleClick: "reset",          // double-click resets view
  responsive: true,
};
```

### 7.3 Cross-Panel Linking

Watchlist selection drives chart via pub/sub context. Configurable: follow selection vs. pinned instrument.

---

## 8. Notifications

### 8.1 Four-Tier Taxonomy

| Tier | Urgency | UI | Dismiss |
|------|---------|-----|---------|
| Critical | Immediate | Modal overlay or audio | Explicit only |
| Urgent | Seconds | Toast (top-right), badge | Self-dismissing |
| Informational | Next moment | Feed entry, unread count | User-driven |
| Passive | Background | Dedicated panel | n/a |

### 8.2 Rules

- Toast stack limit: 3 visible, older → "+N more"
- Sound for critical only
- Notification panel always accessible, never forced
- Per-instrument alert configuration

---

## 9. Interaction Patterns

### 9.1 Hover Taxonomy

| Element | Effect | Timing | Purpose |
|---------|--------|--------|---------|
| Table row | bg → `highlight` | Instant | Spatial orientation |
| Table cell (interactive) | text → `primary` | Instant | Affordance |
| Table cell (detail) | Dotted underline + pointer | Instant | "More info" signal |
| Button | bg shift one step | Instant | Standard affordance |
| Nav tab | bg → `overlay` | Instant | Standard affordance |
| Instrument symbol | Underline + pointer | Instant | Clickable signal |
| Tooltip trigger | Show Radix Tooltip | 250ms delay | Progressive disclosure |
| Panel header | No effect | — | Not interactive |
| Disabled element | No effect, `cursor: not-allowed` | — | Non-interactive |

### 9.2 Hover Rules

1. One property change only (bg OR text OR border)
2. Transition: 50–100ms ease
3. No false affordances
4. Consistent across entire system
5. Hover is additive — interface works without it

### 9.3 Focus Ring

All interactive elements: `box-shadow: 0 0 0 2px {info}` + `border-color: {info}` on focus. Visible, high-contrast, no layout shift.

### 9.4 Keyboard

- Order entry: instrument → Tab → qty → Tab → price → Enter
- Navigation: `/` search, `Esc` dismiss, arrows for grids
- Autocomplete: ↑↓ navigate, Enter select, Escape close
- Panel management: Ctrl+1–9 focus, Ctrl+Shift+arrow resize

### 9.5 Real-Time Updates

- Flash-on-update: 100ms semantic bg fade → transparent
- Directional micro-animation: 1–2px up/down tick
- Both toggleable, respect `prefers-reduced-motion`

### 9.6 Error Prevention

- Threshold-based order confirmation (configurable)
- Fat finger detection (visual warning on size/price deviation)
- 2–3 second undo window post-submission

---

## 10. Component Specifications

### 10.1 Autocomplete

- Fuzzy matching: exact substring first (higher score), then sequential character match
- Highlighted partial matches in `info` color, `fontWeight: 600`
- Keyboard: ↑↓ navigate, Enter select, Escape close
- Focus ring: `info` border + 2px shadow
- Dropdown: `radius-md`, `border.default`, shadow `0 4px 12px rgba(0,0,0,0.25)`
- Max height: 200px, overflow scroll
- "No matches" state when query returns empty

### 10.2 Date Picker

- Calendar grid: 7-column (Su–Sa), `radius-sm` on day cells
- Selected day: `info` bg, white text
- Today: `info` text color
- Month navigation: ‹/› buttons with hover
- Dropdown: `radius-md`, 240px wide

### 10.3 Select Dropdown

- Trigger button: full width, `radius-sm`, chevron rotates on open
- Selected item: `info` color + `fontWeight: 600`
- Options: hover → `bg.highlight`, max height 180px
- Focus ring matches all other inputs

### 10.4 Number Input

- Stepper buttons (−/+) flanking the input, separated by `border.subtle`
- Stepper hover: bg → `muted`
- Center-aligned value, tabular figures
- Optional suffix label (e.g., "%", "lots")

### 10.5 Toggle

- Track: 36×20px, `radius: 10px`
- Knob: 16×16px, `radius: 8px`
- On: `info` bg, white knob. Off: `overlay` bg, `muted` knob.
- Transition: 150ms ease on both bg and knob position

### 10.6 Radix Primitives Mapping

| Primitive | Trading use |
|-----------|------------|
| Dialog | Order entry, confirmations |
| Popover | Instrument details, quick actions |
| DropdownMenu | Right-click context menus |
| Tabs | Multi-view panels |
| Tooltip | Abbreviation expansion, data details (250ms delay) |
| Select | Instrument pickers, timeframes |
| ScrollArea | Virtualized lists |
| ToggleGroup | Chart type selectors |
| Slider | Quantity input, risk parameters |

---

## 11. Build Phases

### Phase 1: Workspace with Simulated Data
React + Tailwind + Radix + react-mosaic + AG Grid + Plotly.js. Token system as CSS variables + Tailwind config. Basic data table. Chart panel. Watchlist→chart linking. Simulated prices at 1–2Hz. **Validates layout and hierarchy.**

### Phase 2: Harden the Table
500+ rows. All cell types via AG Grid cell renderers. Column reorder/visibility/pinning. Row grouping. Flash-on-update. Keyboard navigation.

### Phase 3: Workspace Persistence
Serialize react-mosaic tree + panel state to JSON. Save/restore from localStorage. Named presets + switcher. Density mode switching.

### Phase 4: Notifications
Four-tier taxonomy. Toast component (Radix Toast). Notification panel (slide-out, filterable). Per-instrument price alerts.

### Phase 5: Light Mode
Light theme token set. Categorical ramp re-validation (verify L* separation between hue neighbors). Theme toggle via `data-theme` attribute.

### Phase 6: Charting Upgrade (if needed)
Triggered by: laggy pan/zoom at 5K+ bars, frame drops at multi-Hz, slowdown with 5+ chart panels. Evaluate SciChart community edition or ECharts. Keep Plotly for all analytical charts.
