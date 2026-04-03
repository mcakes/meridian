# Meridian Design System — Design Specification

## Overview

Meridian is a design system for building professional derivative trading, risk management, and analytics applications. It is built on perceptual science research and optimized for dense, real-time information display.

Core design principles:

- **Information density backed by perceptual science.** Three axes of density (visual, temporal, value) with a three-tier information hierarchy (glanceable, scannable, explorable). Aversion to dense UIs is aversion to poorly designed dense ones.
- **Redundant encoding by default.** Color is never the sole channel — directional arrows, +/- signs, and positional cues always accompany semantic color. This is the default, not an accessibility opt-in.
- **Cognitive load management.** Workspace persistence eliminates Zeigarnik-effect layout rebuilding. Four-tier notification taxonomy batches interruptions. Progressive disclosure keeps panels under 64px of chrome.
- **Evidence-based color.** Two separate color systems (semantic and categorical) designed in CIELAB space with CVD-safety validation, max-distance-first ordering, and WCAG AA compliance.

## Technology Stack

| Layer | Choice | License | Rationale |
|-------|--------|---------|-----------|
| Framework | React | MIT | Component model, ecosystem, team knowledge |
| Primitives | Radix UI | MIT | Unstyled, WAI-ARIA compliant, composable |
| Styling | Tailwind CSS | MIT | Utility-first DX, consuming CSS custom property tokens |
| Data Grid | AG Grid (Community) | MIT | Virtualization at 100K+ rows, column features, clipboard. Upgrade to Enterprise at paywall. |
| Charting | Plotly.js (finance bundle) | MIT | 40+ chart types, existing knowledge. Upgrade path to SciChart.js or ECharts at 5K+ bars / multi-Hz. |
| Sparklines | Custom SVG | — | 50-200 simultaneous instances; Canvas/WebGL overhead not justified |
| Layout | flexlayout-react | MIT | Tree of rows, tabsets, and tabs; Caplin Systems; JSON-serializable IJsonModel state; tab support, drag-between-tabsets, dynamic panel add/close |
| Build | Vite | MIT | Fast dev server, ESBuild/Rollup bundling |
| Language | TypeScript | MIT | Type safety, exported prop types |

## Project Structure

```
meridian/
├── docs/
│   ├── philosophy/              # Narrative "why" documentation
│   │   ├── overview.md          # Design principles, technology choices
│   │   ├── color-system.md      # CIELAB methodology, CVD-safety, two-system split
│   │   ├── information-density.md # Three axes, three tiers, working memory
│   │   ├── typography.md        # Inter + JetBrains Mono rationale
│   │   ├── workspace-layout.md  # Persistence, cognitive load, layout patterns
│   │   ├── notifications.md     # Four-tier taxonomy, batching research
│   │   └── accessibility.md     # WCAG 2.2 AA, redundant encoding, prefers-reduced-motion
│   ├── reference/               # Developer reference
│   │   ├── tokens.md            # Complete token tables
│   │   ├── components.md        # Props, usage examples, token consumption
│   │   └── patterns.md          # Cross-panel linking, persistence, flash, density, keyboard
│   └── research/                # Original research preserved
│       └── meridian-research.md
├── src/
│   ├── tokens/
│   │   ├── colors.css           # CSS custom properties — source of truth
│   │   ├── typography.css       # Font stacks, type scale
│   │   ├── spacing.css          # 4px base unit scale
│   │   ├── borders.css          # Radius and border tokens
│   │   └── index.css            # Aggregates all token files
│   ├── components/
│   │   ├── primitives/          # CatDot, PriceChange, FlashCell, MetricCard, Tag
│   │   ├── inputs/              # Autocomplete, DatePicker, NumberInput, Select, Toggle
│   │   ├── data/                # DataTable (AG Grid wrapper), Sparkline
│   │   ├── layout/              # Workspace, Panel, PanelHeader, Toolbar
│   │   ├── feedback/            # Toast, NotificationFeed, Modal
│   │   ├── charting/            # Chart (Plotly wrapper)
│   │   └── index.ts             # Public API barrel export
│   ├── hooks/
│   │   ├── useTheme.ts          # Theme state and toggle
│   │   ├── useWorkspace.ts      # Layout serialization and preset management
│   │   ├── useFlash.ts          # Flash-on-update animation state
│   │   └── useMarketData.ts     # Subscribe to market data provider
│   ├── providers/
│   │   ├── ThemeProvider.tsx     # data-theme attribute management
│   │   └── DataProvider.tsx     # Pluggable market data with simulated default
│   ├── demo/
│   │   ├── App.tsx              # Main trading workspace
│   │   ├── panels/             # WatchlistPanel, PricerPanel, ChartPanel
│   │   ├── data/               # Sample instruments, simulated price feed
│   │   └── main.tsx            # Entry point
│   └── lib/
│       └── format.ts           # fmt, fmtPct, fmtK, fuzzyMatch utilities
├── public/
├── index.html
├── tailwind.config.js          # Consumes CSS custom properties
├── postcss.config.js
├── vite.config.ts
├── package.json
├── tsconfig.json
└── .gitignore
```

## Token Architecture

### Source of Truth: CSS Custom Properties

All design tokens are defined as CSS custom properties in `src/tokens/`. Theme switching is a single DOM attribute change (`data-theme="dark"` or `data-theme="light"` on `<html>`). No JavaScript runtime cost for theming — all values update via CSS cascade.

### Color System — Two Separate Systems

#### 1. Categorical Ramp

Application-agnostic colors for distinguishing data series, groups, and categories. Max-distance-first ordering ensures the first N colors drawn are maximally distinguishable.

```css
[data-theme="dark"] {
  --color-cat-0: #7aa2f7;  /* blue   — L*=67.0, H=282° */
  --color-cat-1: #9ece6a;  /* green  — L*=77.6, H=126° */
  --color-cat-2: #e06c75;  /* red    — L*=59.8, H=20°  */
  --color-cat-3: #41c5b0;  /* teal   — L*=72.4, H=180° */
  --color-cat-4: #ff9e64;  /* orange — L*=74.0, H=56°  */
  --color-cat-5: #d6a0e8;  /* purple — L*=73.1, H=319° */
  --color-cat-6: #80d8e8;  /* cyan   — L*=81.6, H=216° (extension — needs secondary encoding) */
  --color-cat-7: #b8608e;  /* pink   — L*=52.4, H=347° (extension — needs secondary encoding) */
}
```

Design criteria (validated in CIELAB space):
- Min pairwise ΔE ≥ 20 (core 6: 29.8)
- Lightness uniformity: L* stdev < 8 (core 6: 5.8)
- CVD-safety: min ΔE ≥ 12 under deuteranopia (core 6: 16.3)
- Name uniqueness: all Berlin-Kay basic color terms
- Hue distribution: ~60° separation between core 6

Core 6 (indices 0-5) are safe without secondary encoding. Indices 6-7 require a secondary channel (shape, dash, label) when used alongside the full set.

#### 2. Semantic Colors

Fixed-meaning colors. Never used alone — always paired with redundant encoding.

```css
[data-theme="dark"] {
  --color-positive: #9ece6a;  /* gains, bullish */
  --color-negative: #f7768e;  /* losses, bearish */
  --color-neutral:  #a9b1d6;  /* unchanged */
  --color-warning:  #e0af68;  /* alerts */
  --color-info:     #7aa2f7;  /* informational, focus */
  --color-accent:   #bb9af7;  /* active, selected */
}

[data-theme="light"] {
  --color-positive: #1e7a1e;
  --color-negative: #c93545;
  --color-neutral:  #6a6b7a;
  --color-warning:  #8f6200;
  --color-info:     #2e5cb8;
  --color-accent:   #7c4dab;
}
```

#### 3. Surface, Text, and Border Tokens

```css
[data-theme="dark"] {
  /* Backgrounds — darkest to lightest */
  --bg-base:      #1a1b26;  /* page background */
  --bg-surface:   #24283b;  /* cards, panels */
  --bg-muted:     #292e42;  /* alternating rows, subtle fills */
  --bg-overlay:   #343a52;  /* active tabs, dropdowns */
  --bg-highlight: #3b4261;  /* row hover */

  /* Text — highest to lowest contrast */
  --text-primary:   #c0caf5;
  --text-secondary: #a9b1d6;
  --text-muted:     #565f89;
  --text-inverse:   #1a1b26;

  /* Borders */
  --border-subtle:  #292e42;
  --border-default: #3b4261;
  --border-active:  #565f89;
}

[data-theme="light"] {
  --bg-base:      #f0f0f3;
  --bg-surface:   #f8f8fb;
  --bg-muted:     #e8e8ed;
  --bg-overlay:   #d8d8de;
  --bg-highlight: #e0e0e6;

  --text-primary:   #1a1b26;
  --text-secondary: #4a4b5c;
  --text-muted:     #8b8c9a;
  --text-inverse:   #f0f0f3;

  --border-subtle:  #d8d8de;
  --border-default: #c0c0c8;
  --border-active:  #9a9aa8;
}
```

### Typography Tokens

```css
:root {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Type scale — name: weight size/line-height */
  --text-panel-title:  600 16px/22px var(--font-sans);
  --text-section:      600 13px/18px var(--font-sans);
  --text-body:         400 13px/18px var(--font-sans);
  --text-body-strong:  600 13px/18px var(--font-sans);
  --text-small:        400 12px/16px var(--font-sans);
  --text-small-strong: 600 12px/16px var(--font-sans);
  --text-caption:      400 11px/14px var(--font-sans);
  --text-mono:         400 12px/16px var(--font-mono);
}
```

All numeric displays use `font-variant-numeric: tabular-nums` for column alignment.

### Spacing Tokens

4px base unit:

```css
:root {
  --space-px: 1px;
  --space-0: 0px;
  --space-0.5: 2px;
  --space-1: 4px;
  --space-1.5: 6px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
}
```

### Border and Radius Tokens

```css
:root {
  --radius-none: 0px;   /* panels — flush with workspace grid */
  --radius-sm:   2px;   /* buttons, inputs */
  --radius-md:   4px;   /* dropdowns, popovers */
  --radius-lg:   6px;   /* modals — max radius, most detached from grid */

  --border-width: 1px;
  --focus-ring: 0 0 0 2px var(--color-info);  /* no layout shift */
}
```

Principle: radius correlates with detachment from workspace grid.

### Tailwind Consumption

`tailwind.config.js` maps CSS custom properties into Tailwind's theme:

```js
export default {
  content: ['./src/**/*.{ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        cat: {
          0: 'var(--color-cat-0)',
          1: 'var(--color-cat-1)',
          2: 'var(--color-cat-2)',
          3: 'var(--color-cat-3)',
          4: 'var(--color-cat-4)',
          5: 'var(--color-cat-5)',
          6: 'var(--color-cat-6)',
          7: 'var(--color-cat-7)',
        },
        positive: 'var(--color-positive)',
        negative: 'var(--color-negative)',
        neutral: 'var(--color-neutral)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',
        accent: 'var(--color-accent)',
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        muted: 'var(--bg-muted)',
        overlay: 'var(--bg-overlay)',
        highlight: 'var(--bg-highlight)',
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        inverse: 'var(--text-inverse)',
      },
      borderColor: {
        subtle: 'var(--border-subtle)',
        DEFAULT: 'var(--border-default)',
        active: 'var(--border-active)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
        md: '4px',
        lg: '6px',
      },
      spacing: {
        px: '1px',
        0.5: '2px',
        1: '4px',
        1.5: '6px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
      },
    },
  },
}
```

Components use Tailwind classes (`bg-surface`, `text-positive`, `border-subtle`) that resolve to CSS custom properties. Theme changes propagate through CSS cascade — no React re-renders.

## Component Specifications

### Primitives

**CatDot**
- Props: `index: 0-7`, `size?: number` (default 8px)
- Renders a colored square using `--color-cat-{index}`
- Used in legends, table group indicators, chart labels

**PriceChange**
- Props: `value: number`, `decimals?: number`
- Displays: directional arrow (▲/▼/—) + sign + formatted value + %
- Color: `--color-positive` (>0), `--color-negative` (<0), `--color-neutral` (0)
- Redundant encoding: color + arrow + sign (three independent channels)

**FlashCell**
- Props: `value: number`, `previousValue?: number`, `format?: (n: number) => string`
- 100ms background flash on value change (positive=green tint, negative=red tint)
- Uses CSS transition, not JS animation
- Respects `prefers-reduced-motion` (disables flash, still updates value)

**MetricCard**
- Props: `label: string`, `value: string | number`, `sublabel?: string`
- Labeled value display with `--bg-surface` background

**Tag**
- Props: `variant: 'pass' | 'warn' | 'fail'`, `children: string`
- Semantic background tint + text color

### Inputs (Radix UI based)

**Autocomplete**
- Props: `items: Item[]`, `onSelect: (item: Item) => void`, `placeholder?: string`, `renderItem?: (item: Item, highlighted: Range[]) => ReactNode`
- Fuzzy matching: exact substring ranked first, then character-sequence with gap penalty
- Keyboard: ↑↓ navigate, Enter select, Esc close
- Max dropdown height: 200px, scrollable
- Highlighted match ranges rendered via `<mark>`

**DatePicker**
- Props: `value: Date | null`, `onChange: (date: Date) => void`, `label?: string`
- 7-column calendar grid (Su-Sa), month navigation
- Today: `--color-info` text, Selected: `--color-info` background + inverse text
- Built on Radix Popover for positioning

**NumberInput**
- Props: `value: number`, `onChange: (n: number) => void`, `min?: number`, `max?: number`, `step?: number`, `suffix?: string`
- Stepper buttons (−/+) flanking center-aligned input
- `font-variant-numeric: tabular-nums`
- Shift+Arrow for 10x step increment
- Focus ring via `--focus-ring`

**Select**
- Props: `value: string`, `onChange: (v: string) => void`, `options: Option[]`, `label?: string`
- Built on Radix Select
- Chevron rotation on open
- Max dropdown height: 180px

**Toggle**
- Props: `value: boolean`, `onChange: (v: boolean) => void`, `label?: string`
- Track: 36x20px, Knob: 16x16px
- On: `--color-info` track, Off: `--bg-muted` track
- 150ms CSS transition

### Data Components

**DataTable**
- Wraps AG Grid Community
- Props: `columns: ColDef[]`, `rows: any[]`, `density?: 'compact' | 'default' | 'comfortable'`, `onRowClick?: (row: any) => void`, `groupBy?: string`
- Meridian theme applied via AG Grid CSS custom property API (maps Meridian tokens → AG Grid variables)
- Built-in cell renderers:
  - `TextCell` — default
  - `NumericCell` — right-aligned, tabular-nums, configurable decimals
  - `ChangeCell` — `PriceChange` component in a cell
  - `BadgeCell` — `Tag` component in a cell
  - `SparklineCell` — inline SVG sparkline
  - `ActionCell` — icon buttons
- Row flash-on-update: brief background flash when row data changes
- Density modes adjust row height: compact (24px), default (32px), comfortable (40px)
- Grouped rows: 2px left border with categorical color for the group

**Sparkline**
- Props: `data: number[]`, `width?: number`, `height?: number`, `color?: string`, `showArea?: boolean`
- Pure SVG polyline — no Canvas, no charting library
- Designed for 50-200 simultaneous instances without performance degradation

### Layout Components

**Workspace**
- Wraps flexlayout-react
- Props: `model: Model`, `factory: (node: TabNode) => ReactNode`
- Manages tree of rows, tabsets, and tabs; supports tab support, drag-between-tabsets, and dynamic panel add/close
- Serializes layout state to `IJsonModel` JSON for persistence
- Provides named workspace presets ("Equity Trading", "Options Desk")
- Exposes panel registry: maps panel IDs to component factories

**Panel**
- Props: `title: string`, `toolbar?: ReactNode`, `actions?: ReactNode`, `children: ReactNode`
- Anatomy: PanelHeader (24-32px) + optional Toolbar (28-36px) + content area
- Header + toolbar never exceed 64px combined

**PanelHeader**
- Props: `title: string`, `actions?: ReactNode`
- Left-aligned title using `--text-panel-title` scale
- Right-aligned action slot (close, popout, settings icons)

**Toolbar**
- Props: `children: ReactNode`
- Horizontal bar below header for filters, toggles, density controls
- `--bg-surface` background, `--border-subtle` bottom border

### Charting

**Chart**
- Wraps Plotly.js (finance bundle)
- Props: `data: Plotly.Data[]`, `layout?: Partial<Plotly.Layout>`, `config?: Partial<Plotly.Config>`, `type?: 'candlestick' | 'scatter' | 'heatmap' | 'histogram'`
- Applies full Meridian Plotly template:
  - Paper background: transparent, Plot background: `--bg-base`
  - Gridlines: dotted, `--border-subtle`
  - Y-axis: right side (financial convention)
  - Crosshair spikelines on hover
  - Legend: horizontal, above chart
  - Margins: 48/12/28/32 (L/R/T/B)
  - Typography: Inter for labels, tabular-nums for tick values
- Per-type overrides: candlestick uses positive/negative semantic colors, heatmap uses sequential ramp
- Template auto-switches between dark and light variants

### Feedback

**Toast**
- Props: `message: string`, `variant: 'info' | 'warning' | 'error'`, `duration?: number`
- Position: top-right, stacked
- Max visible: 3 (oldest dismissed when exceeded)
- Self-dismissing with configurable duration (default 5s)
- Maps to "urgent" tier in notification taxonomy

**Modal**
- Built on Radix Dialog
- Props: `open: boolean`, `onClose: () => void`, `title: string`, `children: ReactNode`
- Overlay with backdrop blur
- Maps to "critical" tier — requires explicit user dismissal
- Used for fat-finger order confirmation, threshold alerts

**NotificationFeed**
- Props: `notifications: Notification[]`, `onDismiss: (id: string) => void`
- Scrollable list panel for "informational" tier
- Each entry: timestamp + message + optional action
- User-driven dismissal

The "passive" tier (background status, ongoing processes) is handled by dedicated panel content — no separate notification component needed. Status indicators, progress bars, and background job lists are application-level concerns rendered directly in panels.

## Hooks

**useTheme**
- Returns: `{ theme: 'dark' | 'light', toggle: () => void }`
- Manages `data-theme` attribute on `<html>`
- Persists preference to `localStorage`

**useWorkspace**
- Returns: `{ model, setModel, presets, savePreset, loadPreset, resetLayout }`
- Serializes/deserializes FlexLayout React `IJsonModel` state
- Persists to `localStorage`
- Ships with 2-3 default presets

**useFlash**
- Args: `value: number`
- Returns: `{ flash: 'up' | 'down' | null, ref: RefObject }`
- Tracks previous value, triggers 100ms flash state on change
- Respects `prefers-reduced-motion`

**useMarketData**
- Args: `symbol: string`
- Returns: `{ price, bid, ask, change, volume, history }`
- Subscribes to `MarketDataProvider` from context
- Unsubscribes on unmount

## Data Layer

### MarketDataProvider Interface

```typescript
interface Instrument {
  symbol: string;
  name: string;
  assetClass: string;
  group: string;
}

interface Tick {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  change: number;
  changePct: number;
  volume: number;
  timestamp: number;
}

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y';

interface MarketDataProvider {
  instruments: Instrument[];
  subscribe(symbol: string, callback: (tick: Tick) => void): () => void;
  getHistory(symbol: string, range: TimeRange): Candle[];
}
```

### SimulatedMarketData

Default implementation shipping with the demo:

- ~15 instruments across equities, FX, and crypto
- Stochastic price walks at ~1-2Hz
- Maintains bid/ask spreads proportional to instrument type
- Generates candlestick history on demand
- Groups: Technology, Semiconductors, Healthcare, Energy, G10 Majors, Commodity FX

The interface is the contract. Swapping to a real WebSocket feed means implementing `MarketDataProvider` — no demo code changes.

### Cross-Panel Linking

`DataProvider` holds selection state (selected instrument) in React context. Panels subscribe:

- **WatchlistPanel** publishes on row click
- **ChartPanel** consumes selected symbol, renders price history
- **PricerPanel** consumes selected symbol, displays greeks/pricing

Simple pub/sub via context — no event bus library.

## Demo App

### Layout

FlexLayout React workspace with pre-built defaults:

**"Equity Trading" preset:**
```
┌──────────────┬───────────────┐
│              │               │
│  Watchlist   │    Chart      │
│              │               │
│              ├───────────────┤
│              │               │
│              │    Pricer     │
│              │               │
└──────────────┴───────────────┘
```

**"Options Desk" preset:**
```
┌──────────────┬───────────────┐
│              │               │
│  Watchlist   │    Pricer     │
│              │               │
├──────────────┴───────────────┤
│                              │
│           Chart              │
│                              │
└──────────────────────────────┘
```

Users can drag split handles to resize, rearrange panels, and switch between presets via the nav bar.

### Nav Bar

- Left: "MERIDIAN" wordmark + version
- Center: workspace preset switcher (dropdown)
- Right: theme toggle (dark/light)

Minimal chrome — workspace content is the focus.

### Workspace Persistence

- Layout state (split positions, panel arrangement) serialized to `localStorage` on every change
- Named presets stored alongside
- On load: restore last layout, fall back to "Equity Trading" default
- Panel-level state (scroll position, selected filters, density mode) also persisted

## Documentation

### `docs/philosophy/` — Narrative "Why" Documentation

Each doc follows: **What we do -> Why (research/evidence) -> How it's implemented -> References**

- **`overview.md`** — What Meridian is, core design principles, technology choices
- **`color-system.md`** — Two-system split, CIELAB methodology, CVD-safety, max-distance-first ordering, light theme derivation. References: Ware, Viénot 1999, Gramazio, Stone, Berlin-Kay
- **`information-density.md`** — Three density axes, three-tier hierarchy, working memory (~4 items), spatial muscle memory. References: Cowan 2001, Sweller Cognitive Load Theory
- **`typography.md`** — Inter + JetBrains Mono selection, tabular figures, 11-16px scale
- **`workspace-layout.md`** — Industry analysis (Bloomberg Launchpad, OpenFin), Zeigarnik effect, persist-by-default. References: Patel 2025, Sweller
- **`notifications.md`** — Four-tier taxonomy, NASA-TLX cognitive load study (N=120 lab, N=100 field), batching rationale
- **`accessibility.md`** — WCAG 2.2 AA, 6-color discrimination threshold, redundant encoding, prefers-reduced-motion

### `docs/reference/` — Developer Reference

- **`tokens.md`** — Complete token tables: name, dark value, light value, usage description
- **`components.md`** — Each component: props table, usage example, which tokens it consumes
- **`patterns.md`** — Cross-panel linking, workspace persistence, flash-on-update, density modes, keyboard navigation

### `docs/research/` — Original Research

`meridian-research.md` preserved as-is with full academic bibliography (39 references).

## Interaction Patterns

### Hover

- Instant visual feedback on interactive elements
- Additive: content works without hover (touch, keyboard users)
- No false affordances: if it responds to hover, it does something on click
- Timing: visual feedback instant, tooltip 200-300ms delay

### Keyboard

- Tab through order entry fields
- `/` opens search/command palette
- `Esc` dismisses overlays
- Arrow keys for grid navigation
- AG Grid handles its own keyboard nav

### Real-Time Updates

- Flash-on-update: 300ms background fade for price changes
- Directional micro-animation: brief color tint (positive/negative)
- Respects `prefers-reduced-motion`: disables animation, still updates values

### Error Prevention

- Threshold-based order confirmation for large notional values
- Fat-finger detection (deviation from recent price range)
- 2-3 second undo window for destructive actions

## Out of Scope (Future)

- Publishable npm package extraction (do when a second consumer exists)
- Documentation site build (VitePress/Astro — do when audience grows)
- SciChart.js/ECharts upgrade (evaluate at 5K+ bars or multi-Hz bottleneck)
- AG Grid Enterprise license (evaluate at row grouping / clipboard paywall)
- Light theme (implemented in tokens, but visual validation deferred)
- Sound/audio for critical notifications
- Multi-window / OpenFin integration
