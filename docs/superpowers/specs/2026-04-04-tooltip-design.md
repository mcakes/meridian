# Tooltip — Design Spec

## Purpose

Add a Tooltip component for informational text hints on hover. Wraps `@radix-ui/react-tooltip` (already installed) with Meridian styling.

## Architecture

Single-component wrapper (not compound) since tooltip content is always a string. A separate `TooltipProvider` manages shared delay timing across all tooltips.

### Components

| Component | Role |
|---|---|
| `TooltipProvider` | App-root wrapper for shared delay timing |
| `Tooltip` | Wraps a trigger element, shows text label on hover |

### Props

**TooltipProvider:**
- `delayDuration?: number` — default `700` (ms before showing)
- `children: ReactNode`

**Tooltip:**
- `content: string` — the tooltip text (required)
- `side?: 'top' | 'right' | 'bottom' | 'left'` — default `'top'`
- `align?: 'start' | 'center' | 'end'` — default `'center'`
- `sideOffset?: number` — default `4`
- `children: ReactNode` — trigger element (rendered via `asChild`)

### Usage

```tsx
<TooltipProvider>
  <Tooltip content="Save layout">
    <button>💾</button>
  </Tooltip>
</TooltipProvider>
```

## Visual Styling

All inline styles with CSS custom properties.

- **Content:** `var(--bg-overlay)` background, `var(--text-primary)` text, `fontSize: 11`, `lineHeight: '14px'`, `padding: '4px 8px'`, `border-radius: 4px`, subtle `box-shadow: 0 2px 8px rgba(0,0,0,0.25)`
- **Arrow:** `fill: var(--bg-overlay)` to match content background
- **Animation:** `opacity` fade `150ms ease`, respects `prefers-reduced-motion`
- **z-index:** `9999`

## Accessibility

Radix handles `aria-describedby` automatically. No custom ARIA work needed.

## File Structure

| File | Purpose |
|---|---|
| `src/components/feedback/Tooltip.tsx` | Component implementation |
| `src/components/index.ts` | Add `Tooltip` and `TooltipProvider` exports under Feedback section |
| `src/site/pages/components/FeedbackPage.tsx` | Add Tooltip demo section |

## Scope Exclusions

- No rich/formatted content — use Popover for that
- No controlled open state — Radix handles hover/focus automatically
- No custom trigger rendering — consumer passes element as children
