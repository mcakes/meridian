# Typography

Typography in a trading interface has two simultaneous optimization targets that consumer-focused type systems rarely need to reconcile: numeric precision (every digit must align in columns, decimal points must stack, values must be comparable at a glance) and label readability (instrument names, descriptions, and annotations must be legible at small sizes). These targets require different typographic characteristics and, in some cases, different fonts.

---

## Two Optimization Targets

### Target 1: Tabular Figures for Numeric Data

Financial data is read in columns. A price table where digits do not align — where "1" is narrower than "8", causing decimal points to drift — forces the eye to seek alignment rather than read value. This is a measurable cognitive cost.

The solution is tabular (monospaced) figures: a typographic feature where all digit characters share identical advance width. `font-variant-numeric: tabular-nums` activates this feature in supporting fonts. Right-alignment of numeric columns is a companion requirement — tabular figures ensure the digits align; right-alignment ensures the decimal points stack.

[Inforiver (2024)](https://inforiver.com/blog/general/best-fonts-financial-reporting/) and [Smashing Magazine (2023)](https://www.smashingmagazine.com/2023/10/choose-typefaces-fintech-products-guide-part1/) both identify tabular figures as the primary typographic requirement for financial reporting interfaces. The feature is often absent from fonts designed for body text.

### Target 2: Proportional Spacing for Labels and Prose

Panel titles, column headers, instrument descriptions, and annotation text benefit from proportional spacing — where character widths vary naturally. Proportional fonts are more readable at small sizes because the natural width variation creates rhythmic texture that the eye uses to parse words. Forcing proportional text into monospace widths reduces readability, particularly for the mixed alphanumeric strings common in financial contexts (ticker symbols, ISIN codes, strategy names).

---

## Font Selection

### Inter — Primary Font

[Inter](https://rsms.me/inter/) was designed specifically for screen readability at small sizes. Its key properties for Meridian's use case:

- Screen optimization at 11–13px, which is the working size for most data in a trading UI
- True tabular figure support via `font-variant-numeric: tabular-nums`
- Extensive weight range (100–900), allowing meaningful weight contrast without switching fonts
- Excellent Latin coverage for instrument names and descriptions from global markets

Inter serves all label, body, and heading text. It also serves numeric data when full monospace is not required — tabular figures are sufficient for column alignment in most table contexts.

### JetBrains Mono — Price Ladders and Order Books

[JetBrains Mono](https://www.jetbrains.com/lp/mono/) is used for contexts requiring full monospace character widths: price ladders, order books, and tick data feeds. These displays have different requirements from standard data tables:

- Characters must align across rows and columns simultaneously (not just within a single column)
- Updates happen at high frequency and the eye needs to track change position, not read character by character
- The monospace grid supports visual diff — what changed between updates is immediately apparent because position is fixed

JetBrains Mono is also the font used for chart axis tick labels, where alignment of numeric values across a scale is more important than word-shape readability.

---

## Type Scale

| Purpose | Font | Size | Weight | Notes |
|---------|------|------|--------|-------|
| Panel title | Inter | 16px | 600 | |
| Section header | Inter | 14px | 600 | |
| Column header | Inter | 11px | 500 | `text-transform: uppercase; letter-spacing: 0.5px` |
| Body / labels | Inter | 13px | 400 | |
| Numeric data | Inter | 13px | 400 | `font-variant-numeric: tabular-nums` |
| Price ladder | JetBrains Mono | 12px | 400 | Full monospace |
| Caption / timestamps | Inter | 11px | 400 | |

The scale is deliberately compressed compared to consumer UI conventions. The smallest size in active use is 11px — visible at normal monitor distances, not comfortable for extended reading, but appropriate for captions and column headers that are referenced rather than read continuously.

Column headers use uppercase with 0.5px letter spacing. This is a convention from financial data products: uppercase column headers create a clear visual category break from the title-case data below them, and the small tracking compensates for the perceived weight increase that uppercase text creates at small sizes.

---

## Numeric Formatting

The `tabular-nums` feature is applied to every element displaying numeric data, without exception. Beyond this, asset class determines decimal precision:

| Asset class | Decimal places | Example |
|-------------|---------------|---------|
| Equities | 2 | 142.75 |
| FX (major pairs) | 4 | 1.0843 |
| FX (JPY pairs) | 2–3 | 151.42 |
| Fixed income | 3–4 | 98.750 |
| Crypto | 8 | 0.00042100 |

Trailing zeros within the required decimal places are displayed but visually dimmed using `text.muted` color. This preserves column alignment (which requires consistent decimal widths) while reducing visual noise from zeros that carry no additional information in that specific position.

Thousands separators are locale-configurable. The system does not enforce a separator style — applications configure this based on their user base and market conventions.

---

## Alignment Rules

- Numeric columns: right-aligned
- Text columns (instrument names, descriptions): left-aligned
- Badge and status columns: center-aligned
- Headers match the alignment of their column data

These rules are not aesthetic preferences. Right-alignment of numerics ensures that decimal points and magnitude indicators (thousands place, millions place) stack vertically in the same screen position — the eye reads the column from a single anchor point without scanning laterally.

---

## Focus Ring Typography Interaction

The focus ring (`box-shadow: 0 0 0 2px {info}`) uses `box-shadow` rather than `border` specifically to avoid layout shift. A border change on focus alters the element's box model and can cause adjacent text to reflow. In dense tables where multiple elements are visible simultaneously, unexpected text reflow during keyboard navigation is disorienting. `box-shadow` renders outside the layout model with no layout impact.

---

## References

- [Inforiver (2024). "Best Fonts for Financial Reporting."](https://inforiver.com/blog/general/best-fonts-financial-reporting/)
- [Smashing Magazine (2023). "Choosing Typefaces for Fintech Products."](https://www.smashingmagazine.com/2023/10/choose-typefaces-fintech-products-guide-part1/)
- [Inter font.](https://rsms.me/inter/)
- [JetBrains Mono.](https://www.jetbrains.com/lp/mono/)
