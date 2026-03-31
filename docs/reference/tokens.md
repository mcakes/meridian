# Token Reference

All tokens are CSS custom properties defined in `src/tokens/`. The color token system uses `data-theme="dark"` and `data-theme="light"` on the root element to switch between value sets. Typography and spacing tokens are theme-independent and live on `:root`.

---

## Categorical Ramp

Indices 0–5 form the core ramp, ordered to maximise perceptual distance between adjacent assignments. Indices 6–7 are extensions that require a secondary encoding channel (dash pattern, marker shape, or label) because they cannot be reliably distinguished from earlier indices by colour alone in all viewing conditions.

| Index | Name | CSS token | Dark hex | Light hex | Usage |
|-------|------|-----------|----------|-----------|-------|
| 0 | blue | `--color-cat-0` | `#7aa2f7` | `#4a76c9` | First series; primary trace colour |
| 1 | green | `--color-cat-1` | `#9ece6a` | `#4d7a1f` | Second series |
| 2 | red | `--color-cat-2` | `#e06c75` | `#c4525c` | Third series |
| 3 | teal | `--color-cat-3` | `#41c5b0` | `#32a18a` | Fourth series |
| 4 | orange | `--color-cat-4` | `#ff9e64` | `#c97a3e` | Fifth series |
| 5 | purple | `--color-cat-5` | `#d6a0e8` | `#9e6fb8` | Sixth series |
| 6 | cyan | `--color-cat-6` | `#80d8e8` | `#4a9fad` | Extension — requires secondary encoding |
| 7 | pink | `--color-cat-7` | `#b8608e` | `#9e4a75` | Extension — requires secondary encoding |

**Usage rules:** Groups of up to 6 may use the core ramp (indices 0–5) directly. Groups of 7–8 must pair colour with a secondary channel. Do not assign fixed semantic meaning to ramp indices at the design-system level — applications map indices to their own categories.

---

## Semantic Colors

Every semantic color token must be accompanied by a redundant non-colour encoding. Colour alone is insufficient for accessibility.

| Token | CSS property | Dark hex | Light hex | Usage | Required redundant encoding |
|-------|-------------|----------|-----------|-------|----------------------------|
| positive | `--color-positive` | `#9ece6a` | `#1e7a1e` | Gains, bullish movement | Arrow up (▲) + "+" sign prefix |
| negative | `--color-negative` | `#f7768e` | `#c93545` | Losses, bearish movement | Arrow down (▼) + "−" sign prefix |
| neutral | `--color-neutral` | `#a9b1d6` | `#6a6b7a` | No change | Em dash (—) |
| warning | `--color-warning` | `#e0af68` | `#8f6200` | Alerts, threshold breaches, limits | Warning icon |
| info | `--color-info` | `#7aa2f7` | `#2e5cb8` | Informational states, focus rings, active inputs | Contextual label or position |
| accent | `--color-accent` | `#bb9af7` | `#7c4dab` | Focus indicators, active selections | Border or outline |

---

## Backgrounds

| Token | CSS property | Dark hex | Light hex | Usage |
|-------|-------------|----------|-----------|-------|
| base | `--bg-base` | `#1a1b26` | `#f0f0f3` | Page and application background |
| surface | `--bg-surface` | `#24283b` | `#f8f8fb` | Cards, panels, table background (not pure white — reduces glare) |
| muted | `--bg-muted` | `#292e42` | `#e8e8ed` | Alternating rows, subtle fills, stepper button hover |
| overlay | `--bg-overlay` | `#343a52` | `#d8d8de` | Active tabs, dropdowns, hover labels |
| highlight | `--bg-highlight` | `#3b4261` | `#e0e0e6` | Row hover, calendar day hover |

---

## Text

| Token | CSS property | Dark hex | Light hex | Usage |
|-------|-------------|----------|-----------|-------|
| primary | `--text-primary` | `#c0caf5` | `#1a1b26` | Body text, numeric values, headings |
| secondary | `--text-secondary` | `#a9b1d6` | `#4a4b5c` | Labels, descriptions, stepper icons |
| muted | `--text-muted` | `#565f89` | `#8b8c9a` | Captions, timestamps, disabled states, chart chrome |
| inverse | `--text-inverse` | `#1a1b26` | `#f0f0f3` | Text on filled or inverted backgrounds |

---

## Borders

| Token | CSS property | Dark hex | Light hex | Usage |
|-------|-------------|----------|-----------|-------|
| subtle | `--border-subtle` | `#292e42` | `#d8d8de` | Panel dividers, row separators, stepper button separators |
| default | `--border-default` | `#3b4261` | `#c0c0c8` | Input borders, card borders, floating element borders |
| active | `--border-active` | `#565f89` | `#9a9aa8` | Hover borders on interactive elements |

Additional border utilities defined in `src/tokens/borders.css`:

| Token | Value | Usage |
|-------|-------|-------|
| `--border-width` | `1px` | Standard border thickness throughout the system |
| `--focus-ring` | `0 0 0 2px var(--color-info)` | Focus indicator applied via `box-shadow` to avoid layout shift |

---

## Typography

Tokens are defined as CSS shorthand in the format `weight size/line-height font-family`. Source: `src/tokens/typography.css`.

| Token | CSS property | Font | Size | Weight | Line height | Usage |
|-------|-------------|------|------|--------|-------------|-------|
| panel-title | `--text-panel-title` | Inter | 16px | 600 | 22px | Panel titles in `PanelHeader` |
| section | `--text-section` | Inter | 13px | 600 | 18px | Section headings within panels |
| column-header | `--text-column-header` | Inter | 11px | 500 | 14px | Table column headers; apply `text-transform: uppercase; letter-spacing: 0.5px` |
| body | `--text-body` | Inter | 13px | 400 | 18px | Body text, cell content, input values |
| body-strong | `--text-body-strong` | Inter | 13px | 600 | 18px | Emphasis within body text |
| small | `--text-small` | Inter | 12px | 400 | 16px | Secondary information, sublabels |
| small-strong | `--text-small-strong` | Inter | 12px | 600 | 16px | Emphasis within small text |
| caption | `--text-caption` | Inter | 11px | 400 | 14px | Timestamps, footnotes, metadata |
| mono | `--text-mono` | JetBrains Mono | 12px | 400 | 16px | Order book data, tick data, axis tick labels |

Font stacks:
- `--font-sans`: `'Inter', system-ui, -apple-system, sans-serif`
- `--font-mono`: `'JetBrains Mono', 'Fira Code', monospace`

Numeric data (prices, quantities) uses `--text-body` with `font-variant-numeric: tabular-nums` applied. This is a CSS feature of Inter, not a separate token.

---

## Spacing

All spacing is based on a 4px grid. Source: `src/tokens/spacing.css`.

| Token | CSS property | Value | Usage |
|-------|-------------|-------|-------|
| px | `--space-px` | 1px | Hairline gaps, pixel-precise offsets |
| 0 | `--space-0` | 0px | Explicit zero — avoids ambiguity with absence of a property |
| 0.5 | `--space-0-5` | 2px | Icon-to-text gaps, tight inline spacing |
| 1 | `--space-1` | 4px | Tight padding in badges, compact cells |
| 1.5 | `--space-1-5` | 6px | Default cell padding (vertical) |
| 2 | `--space-2` | 8px | Default cell padding (horizontal), component gaps |
| 3 | `--space-3` | 12px | Component internal padding |
| 4 | `--space-4` | 16px | Panel internal padding |
| 5 | `--space-5` | 20px | Medium section spacing |
| 6 | `--space-6` | 24px | Large section gaps |
| 8 | `--space-8` | 32px | Major layout gaps |

---

## Border Radius

Radius correlates with an element's detachment from the workspace grid. Nothing uses a radius of 8px or greater.

| Token | CSS property | Value | Usage |
|-------|-------------|-------|-------|
| none | `--radius-none` | 0px | Tiled panel borders, table cells, flush-to-panel elements |
| sm | `--radius-sm` | 2px | Buttons, inputs, badges, toggles, calendar day cells |
| md | `--radius-md` | 4px | Tooltips, dropdowns, popovers, cards, toast notifications |
| lg | `--radius-lg` | 6px | Modal dialogs only |
