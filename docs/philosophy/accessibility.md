# Accessibility

Meridian treats accessibility as a design constraint that shapes every component from the beginning, not a compliance checklist applied at the end. The practical result is that accessible design patterns — redundant encoding, sufficient contrast, keyboard navigation — produce better interfaces for all users, not just those with disabilities.

---

## WCAG 2.2 AA Baseline

All Meridian components meet [WCAG 2.2 Level AA](https://www.w3.org/TR/WCAG22/) as a minimum. This covers:

- **Contrast:** 4.5:1 for normal text, 3:1 for large text and UI components
- **Keyboard navigation:** all interactive elements reachable and operable via keyboard
- **Focus indication:** visible focus indicators on all interactive elements
- **Reduced motion:** respecting `prefers-reduced-motion` for all animations

AA is a floor, not a ceiling. Where research or practical reasoning supports exceeding it, Meridian does.

---

## Redundant Encoding as the Default

WCAG success criterion 1.4.1 (Use of Color) requires that color not be the sole means of conveying information. Meridian interprets this as a design principle rather than a compliance target: all information encoded in color is also encoded through at least one non-color channel.

This is the default design mode for every semantic state:

| State | Color | Non-color channels |
|-------|-------|-------------------|
| Positive / gain | `positive` green | ▲ directional arrow + "+" prefix |
| Negative / loss | `negative` red | ▼ directional arrow + "−" prefix |
| Neutral / unchanged | `neutral` blue-gray | "—" indicator |
| Warning | `warning` amber | Warning icon |
| Focus | `accent` / `info` blue | `box-shadow` focus ring + border color |
| Categorical series (≤6) | Core ramp colors | Position in table/legend; label |
| Categorical series (7–8) | Extension colors | Mandatory: dash pattern, marker shape, or explicit label |

For categorical data specifically, [Tseng et al. (2024)](https://arxiv.org/html/2404.03787v2) found that discrimination drops sharply beyond 6 categories. For 7–8 category use cases, the two extension colors (cyan and pink) require a mandatory secondary encoding channel. This is not optional — without it, discrimination fails not only for CVD users but for color-normal users at any scale or viewing distance.

---

## The 6-Color Discrimination Threshold

The limit of 6 core categorical colors is grounded in two independent findings:

1. [Tseng et al. (2024)](https://arxiv.org/html/2404.03787v2) — categorical color discrimination in scatterplots drops sharply beyond 6, regardless of CVD status
2. [Cowan (2001)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12292122/) — working memory holds approximately 4 chunks simultaneously; tracking 7+ color-meaning mappings exceeds this capacity

The 6-color limit is therefore both perceptual (discrimination) and cognitive (working memory). These are separate failure modes that happen to converge on the same number.

---

## CVD Safety Methodology

Approximately 8% of males have some form of color vision deficiency. Deuteranopia (red-green insensitivity) is the most common variant. Meridian's categorical ramp was validated using the [Viénot, Brettel & Mollon (1999)](https://vis.cs.brown.edu/docs/pdf/Gramazio-2016-CCD.pdf) deuteranopia simulation matrix, with a minimum post-simulation ΔE of 12 required between any two core ramp colors.

The primary mechanism for CVD safety in cases where hue separation collapses under simulation is lightness separation (L\*). Red (L\*=60) and orange (L\*=74) appear similar in hue under deuteranopia; the 14 L\* unit lightness difference provides ΔE=16.3 even under full deuteranopia simulation. See the [color system documentation](color-system.md) for the full methodology.

Semantic colors use redundant encoding as the CVD strategy — color plus shape plus symbol means the signal survives complete hue loss.

---

## prefers-reduced-motion

Meridian respects the `prefers-reduced-motion` media query throughout:

- Flash-on-update animations (100ms semantic background fade on price updates) are disabled
- Directional micro-animations (1–2px tick on price movement) are disabled
- Toast slide-in animations are disabled
- Panel resize transitions are immediate rather than animated
- Toggle and button hover transitions (50–100ms) are reduced to instant state changes

The system remains fully functional with motion disabled. Animations in Meridian are enhancements to legibility (the flash communicates that a value changed), not load-bearing features. The underlying information — which value changed, in which direction — is always present through non-animated channels.

---

## Focus Ring Design

All interactive elements receive a visible focus ring on keyboard focus:

```css
box-shadow: 0 0 0 2px var(--color-info);
border-color: var(--color-info);
```

`box-shadow` is used rather than `border` for a specific reason: changing border width on focus shifts the element's box model and can cause adjacent content to reflow. In dense tables where many elements are visible simultaneously, this reflow is disorienting during keyboard navigation. `box-shadow` renders outside the layout model with no layout impact.

The focus ring color (`info`, a blue derived from the categorical ramp) achieves 3:1 contrast against the `surface` background in both dark and light themes — meeting WCAG 2.2 success criterion 1.4.11 (Non-text Contrast). It is also visually distinct from all semantic states (positive/negative/warning), avoiding false signal.

---

## Keyboard Navigation

Meridian components support full keyboard navigation without requiring a mouse:

### Grid Navigation

- Arrow keys move focus between cells
- Tab moves to the next interactive element outside the grid
- Enter activates editable cells
- Escape cancels edit and returns to navigation mode

### Order Entry (Critical Path)

The keyboard path for order entry is linear and predictable:

1. Instrument field (autocomplete — ↑↓ navigate, Enter select, Escape close)
2. Tab → Quantity field
3. Tab → Price field
4. Enter → Submit (with confirmation threshold for large orders)
5. Escape → Cancel

### Global Shortcuts

| Key | Action |
|-----|--------|
| `/` | Open search / instrument lookup |
| Escape | Dismiss active overlay, modal, or tooltip |
| Arrow keys | Navigate within grids and lists |
| Ctrl+1–9 | Focus numbered panel |
| Ctrl+Shift+Arrow | Resize focused panel |

These shortcuts follow conventions established in professional desktop applications and are not configurable in the initial implementation.

---

## Radix UI Primitives

Meridian uses [Radix UI](https://www.radix-ui.com/primitives/docs/overview/introduction) as its primitive layer for all interactive overlays: dialogs, popovers, dropdown menus, tooltips, tabs, selects, and toggle groups. Radix implements WAI-ARIA patterns correctly — focus management, keyboard interaction, ARIA role and state attributes — so Meridian's layer does not have to reimplement this for each component.

The trade-off: Radix primitives are unstyled, so all visual design is applied by Meridian's token system. This means accessibility and visual design are fully independent — accessibility is not compromised by visual changes, and visual changes don't require understanding ARIA.

---

## References

- [WCAG 2.2. W3C.](https://www.w3.org/TR/WCAG22/)
- [Tseng, C. et al. (2024). "Revisiting Categorical Color Perception in Scatterplots."](https://arxiv.org/html/2404.03787v2)
- [Cowan, N. Working memory capacity ~4 items.](https://pmc.ncbi.nlm.nih.gov/articles/PMC12292122/)
- [Viénot, F., Brettel, H., & Mollon, J. (1999). "Digital Video Colourmaps for Checking Legibility by Dichromats."](https://vis.cs.brown.edu/docs/pdf/Gramazio-2016-CCD.pdf)
- [Bujack, R. et al. (2021). "Accessible Color Sequences."](https://arxiv.org/pdf/2107.02270)
- [Radix UI Primitives.](https://www.radix-ui.com/primitives/docs/overview/introduction)
