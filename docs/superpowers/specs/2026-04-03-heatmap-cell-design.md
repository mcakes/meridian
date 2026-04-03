# HeatmapCell Component — Design Spec

## Overview

A general-purpose primitive that maps a normalized 0–1 numeric value to a color-intensity background. Works standalone, in CSS grids, or as an AG Grid cell renderer. Follows the same stateless, data-in / visual-out pattern as ThresholdValue and HealthBar.

## Props

| Prop        | Type                              | Default      | Description                                        |
| ----------- | --------------------------------- | ------------ | -------------------------------------------------- |
| `value`     | `number`                          | **required** | Normalized intensity, clamped to 0–1               |
| `scale`     | `'diverging' \| 'sequential'`    | `'diverging'`| Color mapping mode                                 |
| `children`  | `ReactNode`                       | —            | Optional content rendered on top of the background  |
| `style`     | `CSSProperties`                   | —            | Merged with computed styles (escape hatch)          |
| `className` | `string`                          | —            | Additional class names                              |

## Color Computation

All colors are computed inline using `color-mix()` against existing design tokens. No new tokens are introduced.

### Diverging Scale (default)

Maps value across a three-stop ramp: negative → neutral → positive.

- **0.0** — `--color-negative` at 100% intensity
- **0.0–0.5** — `--color-negative` at decreasing intensity, mixed with `--bg-surface`
- **0.5** — `--bg-surface` (neutral midpoint)
- **0.5–1.0** — `--color-positive` at increasing intensity, mixed with `--bg-surface`
- **1.0** — `--color-positive` at 100% intensity

Formula for the lower half (value < 0.5):
```
intensity = (1 - value / 0.5) * 100  // 100% at 0, 0% at 0.5
color-mix(in srgb, var(--color-negative) {intensity}%, var(--bg-surface))
```

Formula for the upper half (value >= 0.5):
```
intensity = ((value - 0.5) / 0.5) * 100  // 0% at 0.5, 100% at 1
color-mix(in srgb, var(--color-positive) {intensity}%, var(--bg-surface))
```

### Sequential Scale

Linear ramp from surface background to `--color-info`.

```
intensity = value * 100  // 0% at 0, 100% at 1
color-mix(in srgb, var(--color-info) {intensity}%, var(--bg-surface))
```

## Text Contrast

When `children` are provided, the component sets text color based on the computed intensity to maintain readability:

- **Intensity > 60%** — `var(--text-inverse)` (light text on strong background)
- **Intensity <= 60%** — `var(--text-primary)` (standard text on weak background)

For the diverging scale, intensity is computed as distance from the midpoint: `Math.abs(value - 0.5) * 2`.

## Clamping

The `value` prop is clamped to 0–1 internally, matching HealthBar's behavior.

## Styling

- Inline `style={}` with `color-mix()` referencing CSS custom properties
- `fontVariantNumeric: 'tabular-nums'` when children are present
- `borderRadius: 2px` (standard primitive radius)
- No transitions — heatmaps are static snapshots, not live-updating values
- `display: flex; align-items: center; justify-content: center` for child content centering
- Consumer `style` prop is spread last, allowing full override

## Accessibility

- `role="cell"` with `aria-label` containing the numeric value (e.g., `"0.72"`)
- Color is always paired with optional text content for semantic redundancy
- Theme-aware via CSS custom properties — works in both light and dark modes

## AG Grid Integration

A thin cell renderer wrapper, `HeatmapCellRenderer`, registered alongside existing renderers in `cell-renderers.tsx`:

```tsx
function HeatmapCellRenderer({ value, cellRendererParams }: ICellRendererParams) {
  const { scale } = cellRendererParams ?? {};
  return <HeatmapCell value={value} scale={scale}>{value?.toFixed(2)}</HeatmapCell>;
}
```

Follows the same thin-wrapper pattern as `ChangeCell` and `BadgeCell`.

## File Locations

| Artifact                | Path                                              |
| ----------------------- | ------------------------------------------------- |
| Component               | `src/components/primitives/HeatmapCell.tsx`        |
| Cell renderer addition  | `src/components/data/cell-renderers.tsx`            |
| Export                  | `src/components/index.ts` (primitives section)      |
| Demo                   | `src/site/pages/components/PrimitivesPage.tsx`      |
| Docs                   | `docs/reference/components.md`                      |

## Out of Scope

- New design tokens or color ramps — uses existing tokens only
- Hover/click interactivity — this is a display primitive
- Tooltip integration — consumer can wrap with a Tooltip when that component exists
- Grid composition (building full heatmap grids) — consumer responsibility using CSS grid or AG Grid
