# Spinner Component Design

## Overview

A small, inline CSS border spinner primitive for indicating loading state. Primary use case is toolbar-level loading indicators in panels, but generic enough to use anywhere.

## Component

### `Spinner`

**Location:** `src/components/primitives/Spinner.tsx`

**Props:**

```ts
interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md';  // default 'sm'
  color?: string;               // CSS color or variable, default 'var(--text-muted)'
  label?: string;               // aria-label, default 'Loading'
}
```

**Size map:**

| Size | Diameter | Border width |
|------|----------|-------------|
| `xs` | 12px     | 2px         |
| `sm` | 14px     | 2px         |
| `md` | 18px     | 2px         |

**Rendering:** A single `<div>` with:
- `role="status"` and `aria-label` for accessibility
- CSS border technique: transparent border with colored `border-top-color`
- `border-radius: 50%`
- `@keyframes spin` rotation, 0.8s linear infinite
- `display: inline-block`, `flexShrink: 0`

**Styling approach:** Inline styles with CSS variables, matching library convention. The `@keyframes spin` is added to `src/tokens/index.css` alongside the existing `pulse-border` keyframe.

**Color:** Defaults to `var(--text-muted)` so the spinner blends with toolbar chrome. The track (non-spinning border) uses the same color at 0.25 opacity.

**Motion:** Animation runs regardless of `prefers-reduced-motion` — this is a small functional indicator, not decorative animation.

## Usage

```tsx
// In a toolbar
<Toolbar>
  <span>Positions</span>
  {loading && <Spinner />}
</Toolbar>

// Custom size and color
<Spinner size="md" color="var(--color-info)" />

// Custom aria-label
<Spinner label="Refreshing positions" />
```

## Export

Exported from `src/components/primitives/Spinner.tsx` and re-exported via `src/components/index.ts`.

## Testing

- Renders with correct size for each variant
- Applies custom color when provided
- Has `role="status"` and correct `aria-label`
- Default `aria-label` is "Loading"

## Site Documentation

Add Spinner to the Primitives showcase page (`site/pages/components/PrimitivesPage.tsx`) with examples of each size and a toolbar context demo.
