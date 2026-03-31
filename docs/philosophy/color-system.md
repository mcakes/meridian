# Color System

Color is the most powerful pre-attentive dimension available to interface designers. It is detected in under 200–500ms without conscious effort ([Ware, 2004](https://www.elsevier.com/books/information-visualization/ware/978-0-12-381464-7); [Healey & Enns](https://www.csc2.ncsu.edu/faculty/healey/PP/)). Meridian's color system is designed to use that power deliberately: fixed meaning where meaning matters, free assignment where applications define their own categories, and a rigorous perceptual methodology throughout.

---

## Two Separate Color Systems

### Semantic Colors

Semantic tokens carry fixed, system-wide meaning that cannot be overridden by applications:

| Token | Dark | Light | Meaning | Redundant encoding |
|-------|------|-------|---------|-------------------|
| `positive` | `#9ece6a` | `#1e7a1e` | Gains, bullish | Color + ▲ + "+" prefix |
| `negative` | `#f7768e` | `#c93545` | Losses, bearish | Color + ▼ + "−" prefix |
| `neutral` | `#a9b1d6` | `#6a6b7a` | Unchanged | Color + "—" |
| `warning` | `#e0af68` | `#8f6200` | Alerts, limits | Color + icon |
| `info` | `#7aa2f7` | `#2e5cb8` | Informational | Color + context |
| `accent` | `#bb9af7` | `#7c4dab` | Focus, active state | Color + border |

Semantic colors always use redundant encoding — color is never the sole signal. This is not an accessibility add-on; it is the default design mode.

### Categorical Ramp

The categorical ramp is application-agnostic. Meridian provides an ordered sequence; applications assign meaning by mapping their own category names to ramp indices. Early design iterations baked asset-class meaning directly into the ramp — this was a mistake. Professional traders organize data spatially by asset class, so color-as-asset-class adds no new dimension. Color should encode something the layout does not already convey: sector, input type, chart series.

---

## CIELAB Methodology

All perceptual calculations use the [CIELAB color space](https://vis.cs.brown.edu/docs/pdf/Gramazio-2016-CCD.pdf) (CIE L\*a\*b\*), which approximates perceptual uniformity — a given ΔE distance represents roughly the same perceived difference regardless of where in the color space it occurs. The pipeline is: sRGB → XYZ (D65 illuminant) → CIELAB.

Selection criteria:

- **Perceptual distance:** minimum ΔE ≥ 20 between any two colors in the core ramp ([Gramazio et al., 2016](https://vis.cs.brown.edu/docs/pdf/Gramazio-2016-CCD.pdf))
- **Lightness uniformity:** L\* standard deviation < 8 across the ramp ([Observable, 2024](https://observablehq.com/blog/crafting-data-colors); [Stone, 2016](https://www.tableau.com/blog/colors-upgrade-tableau-10-56782))
- **CVD safety:** minimum ΔE ≥ 12 under deuteranopia simulation ([Bujack et al., 2021](https://arxiv.org/pdf/2107.02270))
- **Name uniqueness:** each color maps to a distinct basic color term ([Berlin & Kay, 1969](https://en.wikipedia.org/wiki/Basic_Color_Terms:_Their_Universality_and_Evolution))
- **Hue distribution:** approximately 60° separation for 6 colors

---

## CVD Safety: The Viénot 1999 Deuteranopia Matrix

Color vision deficiency affects approximately 8% of males. Deuteranopia (red-green deficiency) is the most common form. CVD simulation uses the [Viénot, Brettel & Mollon (1999)](https://vis.cs.brown.edu/docs/pdf/Gramazio-2016-CCD.pdf) transformation matrix applied in LMS cone space, which collapses certain hue pairs to near-identical percepts.

The design process started from [Tokyo Night](https://deepwiki.com/tokyo-night/tokyo-night-vscode-theme/3-color-system-architecture) accents and identified three CVD collapses and two name collisions. A subsequent attempt using purely mathematical construction — 8 equi-spaced hues at constant L\* and C\* — still produced CVD pairs at ΔE = 6.8 under deuteranopia simulation.

This established a key finding: **8 simultaneously CVD-safe, perceptually equidistant, aesthetically consistent colors on a dark background is a mathematical constraint of the sRGB gamut, not a palette selection failure.** [Tableau](https://www.tableau.com/blog/colors-upgrade-tableau-10-56782) and [Observable](https://observablehq.com/blog/crafting-data-colors) independently reached the same conclusion.

---

## L\* as a CVD Weapon

The solution to CVD pairs that collapse in hue is lightness separation. Colors that become perceptually similar in hue under deuteranopia receive large L\* offsets to remain distinguishable:

- Red (L\* = 60) vs. orange (L\* = 74): ΔE = 16.3 even under full deuteranopia
- The luminance channel is more reliably pre-attentive than hue ([Ware, 2004](https://www.elsevier.com/books/information-visualization/ware/978-0-12-381464-7)), so this trade-off costs little in non-CVD contexts

---

## 6+2 Structure

[Tseng et al. (2024)](https://arxiv.org/html/2404.03787v2) found that categorical color discrimination in scatterplots drops sharply beyond 6 categories. Meridian adopts a 6+2 structure in response:

**Core 6** — fully optimized; usable without secondary encoding:

| Index | Name | Dark | Light | CIELAB (dark) |
|-------|------|------|-------|---------------|
| 0 | blue | `#7aa2f7` | `#4a76c9` | L\*=67.0, H=282° |
| 1 | green | `#9ece6a` | `#4d7a1f` | L\*=77.6, H=126° |
| 2 | red | `#e06c75` | `#c4525c` | L\*=59.8, H=20° |
| 3 | teal | `#41c5b0` | `#32a18a` | L\*=72.4, H=180° |
| 4 | orange | `#ff9e64` | `#c97a3e` | L\*=74.0, H=56° |
| 5 | purple | `#d6a0e8` | `#9e6fb8` | L\*=73.1, H=319° |

**Extensions** — fill the two largest hue gaps; require secondary encoding for 7–8 category use cases:

| Index | Name | Dark | Light | Requirement |
|-------|------|------|-------|-------------|
| 6 | cyan | `#80d8e8` | `#4a9fad` | Pair with dash pattern, marker shape, or label |
| 7 | pink | `#b8608e` | `#9e4a75` | Pair with dash pattern, marker shape, or label |

For 1–6 categories: use the core ramp directly. For 7–8 categories: add a mandatory secondary encoding channel.

---

## Max-Distance-First Ordering

The ramp is ordered so the first N colors drawn from it are the most distinguishable set of N colors available. This is the same methodology [Tableau used for its 10-color palette](https://www.tableau.com/blog/colors-upgrade-tableau-10-56782).

The problem with rainbow ordering: red and orange are adjacent in the spectrum and have minimal perceptual distance. A visualization using only 2 of 8 rainbow-ordered colors has a 1-in-7 chance of landing on the worst possible pair.

Max-distance-first ordering guarantees the worst case is eliminated for small N:

| N colors | First N | Min pairwise ΔE | vs. rainbow ordering |
|----------|---------|-----------------|----------------------|
| 2 | blue, green | 100.8 | +187% |
| 3 | blue, green, red | 73.4 | +109% |
| 4 | blue, green, red, teal | 45.4 | +29% |

Blue starts the sequence because it carries the least semantic baggage across finance, geography, and culture.

---

## Dark Mode Design Choices

Dark mode reduces eye strain in low-light environments ([Pathari et al., 2024](https://www.thinkmind.org/articles/achi_2024_3_150_20069.pdf); [Shrestha et al., 2024](https://arxiv.org/abs/2409.10895)). Reading performance is worse in dark mode for extended prose, but numeric scanning — the dominant activity in trading interfaces — is not significantly impaired.

Two specific constraints informed the dark palette:

- Red text on dark backgrounds causes the highest visual fatigue among text colors ([PMC, 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11175232/)). The `negative` semantic color uses a red that is brightened and slightly de-saturated relative to pure red to mitigate this.
- Pure black (`#000000`) causes halation around bright text; pure white text on black causes glare. Meridian uses `#1a1b26` for the base background and `#c0caf5` for primary text — dark gray and off-white respectively.

---

## Light Theme Derivation: The L\* Collapse Problem

The light theme is not a naive inversion. Every color was re-derived for WCAG contrast against a light background. This process exposed a non-obvious failure mode.

Naively darkening colors to achieve similar contrast ratios can collapse L\* values even when the overall ΔE between colors remains large. Initial light theme versions of green (`#5e8c2a`, L\*=53.3) and teal (`#2a8f7d`, L\*=53.6) had only 0.3 L\* units of separation. Their overall ΔE was 44 — superficially healthy — but it was all on the b\* axis. Both colors read as "dark green" on a white background.

The fix: push green darker (L\* ≈ 46) and teal lighter (L\* ≈ 60), restoring 13.5 L\* units of separation.

**Rule:** when deriving light theme ramps, verify L\* separation between hue neighbors, not just overall ΔE.

---

## References

- [Ware, C. (2004). *Information Visualization: Perception for Design.* Elsevier.](https://www.elsevier.com/books/information-visualization/ware/978-0-12-381464-7)
- [Healey, C. & Enns, J. "Perception in Visualization."](https://www.csc2.ncsu.edu/faculty/healey/PP/)
- [Gramazio, C. et al. (2016). "Colorgorical."](https://vis.cs.brown.edu/docs/pdf/Gramazio-2016-CCD.pdf)
- [Observable (2024). "Crafting Data Colors."](https://observablehq.com/blog/crafting-data-colors)
- [Stone, M. (2016). "Tableau 10 Color Palettes."](https://www.tableau.com/blog/colors-upgrade-tableau-10-56782)
- [Viénot, F., Brettel, H., & Mollon, J. (1999). "Digital Video Colourmaps for Checking Legibility by Dichromats." *Color Research & Application*, 24(4).](https://vis.cs.brown.edu/docs/pdf/Gramazio-2016-CCD.pdf)
- [Bujack, R. et al. (2021). "Accessible Color Sequences."](https://arxiv.org/pdf/2107.02270)
- [Tseng, C. et al. (2024). "Revisiting Categorical Color Perception in Scatterplots."](https://arxiv.org/html/2404.03787v2)
- [Berlin, B. & Kay, P. (1969). *Basic Color Terms.* UC Press.](https://en.wikipedia.org/wiki/Basic_Color_Terms:_Their_Universality_and_Evolution)
- [Tokyo Night Color Architecture.](https://deepwiki.com/tokyo-night/tokyo-night-vscode-theme/3-color-system-architecture)
- [Pathari, F. et al. (2024). "Dark vs. Light Mode: Effects on Eye Fatigue."](https://www.thinkmind.org/articles/achi_2024_3_150_20069.pdf)
- [Shrestha, A. et al. (2024). "Effects of Dark Mode on University Students."](https://arxiv.org/abs/2409.10895)
- ["Text Color and Visual Fatigue under Negative Polarity."](https://pmc.ncbi.nlm.nih.gov/articles/PMC11175232/)
