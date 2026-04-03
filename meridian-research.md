# Meridian Design System — Research & Rationale
## Why we made these choices

This document presents the research, perceptual science, and design reasoning behind the Meridian design system for professional multi-asset trading applications. For token values, component specs, and implementation details, see the companion **Implementation Guide**.

---

## 1. Core Thesis

**The Bloomberg Terminal is a local maximum, not a global one.** Its design solves the right problems — density, speed, color-as-dimension — but its solutions are anchored to constraints (character-cell displays, keyboard-only input, single-vendor lock-in) that no longer apply. We preserve what works and improve what doesn't.

---

## 2. Information Density

### 2.1 Three Axes of Density

Density spans visual (information per screen area), temporal (information per unit of time via navigation and disclosure), and value (useful decision-making input per interaction)[<sup>1</sup>](#ref-1). The goal is maximum *value* density, which sometimes means more whitespace, not less.

### 2.2 Key Research Findings

The aversion to dense interfaces is really aversion to *poorly designed* dense ones[<sup>2</sup>](#ref-2). Working memory capacity is ~4 items[<sup>3</sup>](#ref-3) (not Miller's 7±2), constraining how many color-coded categories a user can track simultaneously. Professional users build spatial muscle memory — design for consistency across views, not optimization of any single view. Progressive disclosure must be instant for professionals[<sup>4</sup>](#ref-4) — hover reveals and keyboard depth, not hidden behind clicks.

### 2.3 Three-Tier Information Hierarchy

Information within any panel falls into three tiers:

- **Tier 1 — Glanceable.** Pre-attentive: colors, magnitudes, directional changes. Prices, P&L, positions. Readable from arm's length.
- **Tier 2 — Scannable.** Focused attention, not deep reading. Bid/ask, volume, greeks. Secondary text color, tabular alignment.
- **Tier 3 — Explorable.** On demand via hover, click, or tab switch. Instrument details, history, news. Hidden by default, instantly accessible.

Panel header + toolbar should never exceed 64px combined. Every pixel above that is stolen from the data area.

---

## 3. Color System

### 3.1 Two Separate Systems

**Semantic colors** have fixed meaning (positive/negative/warning/info). Always use redundant encoding (color + arrow + sign prefix) per WCAG 2.2.

**Categorical ramp** is application-agnostic. The design system provides an ordered sequence; applications assign meaning. Early iterations baked asset-class meaning into the ramp — this was wrong. Professional traders organize spatially by asset class, so color-as-asset-class is redundant. Color should add a *new* dimension (sector, input category, chart series).

### 3.2 Perceptual Science

Pre-attentive processing — visual properties detected in under 200–500ms without conscious effort — is the foundation for color-as-dimension[<sup>5</sup>](#ref-5)[<sup>6</sup>](#ref-6)[<sup>7</sup>](#ref-7). Hue is best for categorical distinctions. Luminance is more reliably pre-attentive than hue for magnitude. Beyond ~6 distinct hues, discrimination drops sharply[<sup>8</sup>](#ref-8).

### 3.3 Dark Mode Research

Dark mode reduces eye strain in low-light environments[<sup>9</sup>](#ref-9)[<sup>10</sup>](#ref-10). Reading performance is worse in dark mode for extended text, but this matters less for numeric scanning. Red text on dark backgrounds causes the highest visual fatigue[<sup>11</sup>](#ref-11). Pure black causes halation; pure white text causes glare. Use dark grays and off-whites.

### 3.4 Categorical Ramp Methodology

**Criteria** were drawn from five sources: perceptual distance (min ΔE ≥ 20 in CIELAB)[<sup>12</sup>](#ref-12), lightness uniformity (L* stdev < 8)[<sup>13</sup>](#ref-13)[<sup>14</sup>](#ref-14), CVD safety (min ΔE ≥ 12 under deuteranopia)[<sup>15</sup>](#ref-15)[<sup>16</sup>](#ref-16), name uniqueness (distinct Berlin-Kay terms)[<sup>17</sup>](#ref-17)[<sup>18</sup>](#ref-18), and hue distribution (~60° separation for 6 colors).

**Process:** sRGB → XYZ (D65) → CIELAB for perceptual distance. CVD simulation via Viénot 1999 deuteranopia matrix[<sup>15</sup>](#ref-15). Starting from [Tokyo Night](https://github.com/tokyo-night/tokyo-night-vscode-theme) accents[<sup>31</sup>](#ref-31), we identified three CVD collapses and two name collisions. A pure-math attempt (8 equi-spaced hues at constant L* and C) still produced CVD pairs at ΔE=6.8. **This established that 8 CVD-safe colors on a dark background is a mathematical constraint of the sRGB gamut, not a palette-selection failure.**

**6+2 structure** adopted per Tseng et al.'s finding[<sup>8</sup>](#ref-8) that perception drops beyond 6 categories. Core 6 optimized with hues at ~60° intervals, L* used as a "CVD weapon" — colors that collapse in hue under deuteranopia were given large L* separation (red L*=60 vs. orange L*=74 gives ΔE=16.3 even under full deuteranopia). Extensions fill the two largest hue gaps but require secondary encoding.

**Max-distance-first ordering.** The ramp is ordered so the first N colors drawn are maximally distinguishable, following the Tableau 10 methodology[<sup>14</sup>](#ref-14). Rainbow ordering gives min ΔE=35.2 for the first 2 colors (red + orange — the worst pair). Max-distance-first gives min ΔE=100.8 (blue + green) — a 3x improvement. Blue starts the sequence because it carries the least semantic baggage.

| N | First N colors | Min pairwise ΔE | vs. rainbow |
|---|---------------|-----------------|-------------|
| 2 | blue, green | 100.8 | +187% |
| 3 | blue, green, red | 73.4 | +109% |
| 4 | blue, green, red, teal | 45.4 | +29% |

**Fundamental constraint:** You cannot have 8 colors simultaneously perceptually equidistant, CVD-safe, and aesthetically consistent on a dark background. Tableau[<sup>14</sup>](#ref-14) and Observable[<sup>13</sup>](#ref-13) reached the same conclusion.

### 3.5 Light Theme Color Derivation

The light theme is not a naive inversion. Every color was re-derived for WCAG contrast against white. A critical lesson: **naively darkening colors to similar contrast ratios can collapse L\* values.** Initial light green (#5e8c2a, L\*=53.3) and teal (#2a8f7d, L\*=53.6) had only 0.3 L\* units separation — perceptually identical despite ΔE=44 on the b\* axis. Both read as "dark green" on white. Fix: push green darker (L\*≈46) and teal lighter (L\*≈60), restoring the 13.5 L\* units of separation. **When deriving light-theme ramps, verify L\* separation between hue neighbors, not just overall ΔE.**

---

## 4. Typography

Trading UIs need two optimization targets: tabular figures for numeric column alignment and proportional spacing for labels/prose[<sup>19</sup>](#ref-19)[<sup>30</sup>](#ref-30). [Inter](https://rsms.me/inter/) was selected for its screen optimization at 11–13px, true tabular figure support, and extensive weight range. [JetBrains Mono](https://www.jetbrains.com/lp/mono/) for price ladders and order books where full monospace is needed.

---

## 5. Shape and Border Radius

Research on shape perception[<sup>20</sup>](#ref-20) found rounded shapes are perceived as "friendlier" and "more approachable." Consumer apps want this; professional tools should signal precision instead. Bloomberg Terminal uses 0px. VS Code uses 0–2px. Pure 0px feels dated; 2px is the contemporary convergence point for professional desktop applications. The governing principle: **radius correlates with detachment from the workspace grid.** Inline elements get 0–2px, floating overlays get 4px, nothing exceeds 6px.

---

## 6. Workspace Layout

### 6.1 Industry Analysis

**Bloomberg Launchpad**[<sup>21</sup>](#ref-21) uses pages (full-screen layouts) containing components snapped to a grid. The *page* abstraction is key — traders switch between complete layouts as a unit.

**OpenFin Workspace**[<sup>22</sup>](#ref-22) provides platform-level layout engines with splits, tabs, and serializable snapshots. Goldman Sachs Marquee and BNP Paribas Cortex use it.

### 6.2 Psychology-Driven Layout

Patel (2025)[<sup>23</sup>](#ref-23), building on Sweller's Cognitive Load Theory[<sup>24</sup>](#ref-24), identifies three principles: (1) default to persist — traders expect their setup to restore exactly; (2) progressive disclosure — show complexity only when needed; (3) reduce cognitive load from the layout itself. The Zeigarnik effect means rebuilding layout daily is an ongoing cognitive tax.

### 6.3 Recommendation

Hybrid tiling + tabs with named workspace presets. Tiling handles spatial organization; tabs handle "I need 8 views but only have room for 5 panels." Persistence is non-negotiable. Multi-monitor deferred — it's a 3x complexity multiplier that doesn't change the single-window design.

---

## 7. Data Table

The data table is where 80%+ of a trader's screen time is spent. [AG Grid](https://www.ag-grid.com/) was chosen over [TanStack Table](https://tanstack.com/table/latest)[<sup>25</sup>](#ref-25) for pragmatic reasons: virtualization at 100K+ rows, column features, clipboard, row grouping with ~2x faster aggregation[<sup>26</sup>](#ref-26) — all out of the box. The theming API accepts CSS custom properties, so design tokens still drive appearance. J.P. Morgan's [Salt design system](https://saltdesignsystem.com/) uses AG Grid, validating the trade-off for finance. License strategy: start Community (MIT), evaluate Enterprise at the paywall.

---

## 8. Charting

Trading has two distinct charting needs: **analytical** (scatter, heatmap, histogram — chart type variety matters) and **real-time price** (candlestick at multi-Hz — rendering performance matters). No single library is best at both.

[Plotly.js](https://plotly.com/javascript/) is the primary choice — 40+ chart types, existing knowledge, MIT license. Its SVG candlestick becomes laggy at 17K+ bars[<sup>27</sup>](#ref-27), but this ceiling is further away than expected for initial implementation. When the bottleneck arrives: [SciChart.js](https://www.scichart.com/) (WebGL+WASM, strongest performer, ~$999/yr) or [Apache ECharts](https://echarts.apache.org/) (Canvas-based, strongest free option). Custom SVG for sparklines — 50–200 simultaneous inline mini-charts are too many for Canvas instances.

---

## 9. Notifications

Constant notifications raised cognitive workload (NASA-TLX), decreased HRV, and worsened accuracy in a hybrid lab/field study (N=120 lab, N=100 field)[<sup>28</sup>](#ref-28). Batching preserved responsiveness while cutting stress. The Zeigarnik effect creates "cognitive open loops" when notifications are perceived but not acted on[<sup>29</sup>](#ref-29). Four tiers: Critical (immediate, undismissable), Urgent (self-dismissing toast), Informational (silent feed), Passive (dedicated panel).

---

## 10. Hover and Interaction Research

Affordance theory[<sup>38</sup>](#ref-38) (Gibson 1966, Norman 1988) establishes that users need perceivable cues about interactivity. Hover states provide *confirmation before commitment*. In dense trading grids, they serve three functions: affordance signaling (is this clickable?), progressive disclosure (Tier 2 → Tier 3 without breaking scanning flow), and spatial orientation (where am I in a 500-row table?).

Timing is critical per Nielsen Norman Group[<sup>39</sup>](#ref-39): visual feedback (background shift) should be instant. Tooltip content should require 200–300ms pause to prevent accidental triggers during mouse transit. Large overlays need 300–500ms.

**No false affordances** — if something responds to hover, it must do something on click. This principle overrides aesthetic preference.

---

## 11. Accessibility

WCAG 2.2 AA compliance. ≤6 categories use the core ramp with no secondary encoding. 7–8 categories require mandatory secondary channel (shape, dash, label). Redundant encoding is the default, not an opt-in feature. Respect `prefers-reduced-motion`.

---

## 12. References

<a id="ref-1"></a>**[1]** Ström-Awn, M. (2024). "UI Density." [mattstromawn.com/writing/ui-density](https://mattstromawn.com/writing/ui-density/)

<a id="ref-2"></a>**[2]** Garrett, J. J. *The Elements of User Experience.* Referenced via: [blog.logrocket.com/balancing-information-density](https://blog.logrocket.com/balancing-information-density-in-web-development/)

<a id="ref-3"></a>**[3]** Working memory ~4 items: [pmc.ncbi.nlm.nih.gov/articles/PMC12292122](https://pmc.ncbi.nlm.nih.gov/articles/PMC12292122/)

<a id="ref-4"></a>**[4]** Hudson River Trading (2024). "Optimizing UX/UI Design for Trading." [hudsonrivertrading.com/hrtbeat/optimizing-ux-ui-design-for-trading](https://www.hudsonrivertrading.com/hrtbeat/optimizing-ux-ui-design-for-trading/)

<a id="ref-5"></a>**[5]** Ware, C. (2004). *Information Visualization: Perception for Design.* [Elsevier](https://www.elsevier.com/books/information-visualization/ware/978-0-12-381464-7)

<a id="ref-6"></a>**[6]** Bertin, J. (1983). *Semiology of Graphics.*

<a id="ref-7"></a>**[7]** Healey, C. & Enns, J. "Perception in Visualization." [csc2.ncsu.edu/faculty/healey/PP](https://www.csc2.ncsu.edu/faculty/healey/PP/)

<a id="ref-8"></a>**[8]** Tseng, C. et al. (2024). "Revisiting Categorical Color Perception in Scatterplots." [arxiv.org/html/2404.03787v2](https://arxiv.org/html/2404.03787v2)

<a id="ref-9"></a>**[9]** Pathari, F. et al. (2024). "Dark vs. Light Mode: Effects on Eye Fatigue." [thinkmind.org](https://www.thinkmind.org/articles/achi_2024_3_150_20069.pdf)

<a id="ref-10"></a>**[10]** Shrestha, A. et al. (2024). "Effects of Dark Mode on University Students." [arxiv.org/abs/2409.10895](https://arxiv.org/abs/2409.10895)

<a id="ref-11"></a>**[11]** "Text Color and Visual Fatigue under Negative Polarity." [pmc.ncbi.nlm.nih.gov/articles/PMC11175232](https://pmc.ncbi.nlm.nih.gov/articles/PMC11175232/)

<a id="ref-12"></a>**[12]** Gramazio, C. et al. (2016). "Colorgorical." [vis.cs.brown.edu/docs/pdf/Gramazio-2016-CCD.pdf](https://vis.cs.brown.edu/docs/pdf/Gramazio-2016-CCD.pdf)

<a id="ref-13"></a>**[13]** Observable (2024). "Crafting Data Colors." [observablehq.com/blog/crafting-data-colors](https://observablehq.com/blog/crafting-data-colors)

<a id="ref-14"></a>**[14]** Stone, M. (2016). "Tableau 10 Color Palettes." [tableau.com/blog/colors-upgrade-tableau-10-56782](https://www.tableau.com/blog/colors-upgrade-tableau-10-56782)

<a id="ref-15"></a>**[15]** Viénot, F., Brettel, H., & Mollon, J. (1999). "Digital Video Colourmaps for Checking Legibility by Dichromats." *Color Research & Application*, 24(4).

<a id="ref-16"></a>**[16]** Bujack, R. et al. (2021). "Accessible Color Sequences." [arxiv.org/pdf/2107.02270](https://arxiv.org/pdf/2107.02270)

<a id="ref-17"></a>**[17]** Berlin, B. & Kay, P. (1969). *Basic Color Terms.* UC Press.

<a id="ref-18"></a>**[18]** Heer, J. & Stone, M. (2012). "Color Naming Models for Color Selection." CHI 2012.

<a id="ref-19"></a>**[19]** Inforiver (2024). "Best Fonts for Financial Reporting." [inforiver.com/blog/general/best-fonts-financial-reporting](https://inforiver.com/blog/general/best-fonts-financial-reporting/)

<a id="ref-20"></a>**[20]** Bar, M. & Neta, M. (2006). "Humans Prefer Curved Visual Objects." *Psychological Science*, 17(8).

<a id="ref-21"></a>**[21]** Bloomberg Launchpad. [PDF](https://library.iima.ac.in/public/download/bloomberg/launchpad.pdf)

<a id="ref-22"></a>**[22]** OpenFin Platform API. [openfin.co/blog/openfins-platform-api-introducing-multiple-layouts](https://www.openfin.co/blog/openfins-platform-api-introducing-multiple-layouts/)

<a id="ref-23"></a>**[23]** Patel, V. (2025). "Psychology-Driven Layouts." [medium.com/@p_viraj](https://medium.com/@p_viraj/psychology-driven-layouts-designing-for-how-traders-think-b11e2e7cac5c)

<a id="ref-24"></a>**[24]** Sweller, J. (1988). "Cognitive Load During Problem Solving." *Cognitive Science*, 12(2).

<a id="ref-25"></a>**[25]** AG Grid + TanStack: [tanstack.com/blog/ag-grid-partnership](https://tanstack.com/blog/ag-grid-partnership). Performance: [strapi.io/blog/table-in-react-performance-guide](https://strapi.io/blog/table-in-react-performance-guide)

<a id="ref-26"></a>**[26]** TanStack aggregation benchmarks: [github.com/TanStack/table/discussions/4860](https://github.com/TanStack/table/discussions/4860)

<a id="ref-27"></a>**[27]** Plotly candlestick at 17K bars: [community.plotly.com/t/candlestick-plot-performance/28851](https://community.plotly.com/t/candlestick-plot-performance/28851). Blocking: [github.com/plotly/plotly.js/issues/1860](https://github.com/plotly/plotly.js/issues/1860)

<a id="ref-28"></a>**[28]** Notification batching study (2025). [researchgate.net/publication/396180740](https://www.researchgate.net/publication/396180740_Managing_Digital_Notifications_and_Stress_Evidence_from_a_Hybrid_Laboratory_and_Field_Study_on_Cognitive_Load_HRV_and_Well-being)

<a id="ref-29"></a>**[29]** Zeigarnik effect in notifications: [netpsychology.org/the-neuroscience-of-notifications](https://netpsychology.org/the-neuroscience-of-notifications-why-you-cant-ignore-them/)

<a id="ref-30"></a>**[30]** Smashing Magazine (2023). "Typefaces for Fintech." [smashingmagazine.com](https://www.smashingmagazine.com/2023/10/choose-typefaces-fintech-products-guide-part1/)

<a id="ref-31"></a>**[31]** Tokyo Night Color Architecture. [deepwiki.com/tokyo-night](https://deepwiki.com/tokyo-night/tokyo-night-vscode-theme/3-color-system-architecture)

<a id="ref-32"></a>**[32]** Tufte, E. (2001). *The Visual Display of Quantitative Information.*

<a id="ref-33"></a>**[33]** SciChart (2025). "Best JS Chart Libraries." [scichart.com/blog/best-javascript-chart-libraries](https://www.scichart.com/blog/best-javascript-chart-libraries/)

<a id="ref-34"></a>**[34]** Radix UI. [radix-ui.com/primitives/docs](https://www.radix-ui.com/primitives/docs/overview/introduction)

<a id="ref-35"></a>**[35]** react-mosaic. [github.com/nomcopter/react-mosaic](https://github.com/nomcopter/react-mosaic)

<a id="ref-36"></a>**[36]** Cleveland, W. & McGill, R. (1984). "Graphical Perception." JASA 79(387).

<a id="ref-37"></a>**[37]** Kahneman, D. (2011). *Thinking, Fast and Slow.*

<a id="ref-38"></a>**[38]** IxDF. "Affordances." [ixdf.org/literature/topics/affordances](https://ixdf.org/literature/topics/affordances). Norman (1988). Gibson (1966).

<a id="ref-39"></a>**[39]** NNG (2018). "Timing for Exposing Hidden Content." [nngroup.com/articles/timing-exposing-content](https://www.nngroup.com/articles/timing-exposing-content/)
