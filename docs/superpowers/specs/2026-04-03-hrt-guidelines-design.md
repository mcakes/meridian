# HRT-Inspired Developer Guidelines & Components

**Date:** 2026-04-03
**Status:** Approved
**Source:** [Optimizing UX/UI Design for Trading at HRT](https://www.hudsonrivertrading.com/hrtbeat/optimizing-ux-ui-design-for-trading/)

---

## Motivation

The HRT article describes a Task Watcher redesign where interviews revealed that 80+ fields across 5 sub-tabs were mostly unknown to users and only 20% of features were actually used. The root cause: the UI was organized around accumulated feature requests rather than user goals. Card sorting revealed three actual goals — monitor, find errors, debug — and the redesign structured the UI around those goals instead.

Meridian's existing philosophy docs cover *how much attention* information needs (the 3-tier glanceable/scannable/explorable model) but not *how to group* information or *when to stop adding it*. This spec adds:

1. Developer guidelines that make the right design decisions the easy ones
2. Components that codify the anomaly/threshold highlighting pattern HRT uses
3. Reference patterns for threshold-aware displays and panel purpose declarations

---

## 1. Philosophy Doc: `docs/philosophy/design-checklist.md`

### Structure

Three sections:

**Task-Based Organization**
- Panels should be organized around user goals, not data domains
- Three universal goal categories for trading UIs: Monitor (watch for change), Investigate (understand why), Act (execute a decision)
- Each panel should serve one primary goal; mixing goals leads to the 80-fields problem
- Group related information by what the user is trying to accomplish at that moment

**Anti-Patterns**
- Feature accumulation: adding fields because someone asked, not because they serve a goal
- Tab proliferation: splitting a panel into tabs to accommodate unrelated features instead of rethinking the panel's purpose
- Orphaned fields: fields that no current user can explain the purpose of
- Density without hierarchy: showing everything at the same visual weight

**Pre-Flight Checklist**
Five questions before adding a panel or field:
1. What user goal does this serve? (monitor / investigate / act)
2. Which information tier? (glanceable / scannable / explorable)
3. Does this duplicate information available in another panel?
4. Can the user accomplish the same goal without this?
5. If removed in 6 months, would anyone notice?

New features default to Tier 3 (explorable/on-demand) and promote to Tier 1-2 only when validated.

---

## 2. ThresholdValue Component

**Location:** `src/components/primitives/ThresholdValue.tsx`
**Category:** Primitives

A numeric display that applies semantic color based on configurable thresholds. Follows the same conventions as FlashCell and PriceChange: inline styles, CSS custom property tokens, `tabular-nums`, optional format prop.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Current numeric value |
| `warnAt` | `number` | — | Threshold above which value is warning |
| `errorAt` | `number` | — | Threshold above which value is error |
| `format` | `(n: number) => string` | `String` | Formatter for display |
| `invert` | `boolean` | `false` | When true, thresholds trigger below instead of above (e.g., for values where lower is worse) |

### Behavior

- `value < warnAt` (or `> warnAt` if inverted): normal — `--color-positive`, indicator `●`
- `value >= warnAt && value < errorAt`: warning — `--color-warning`, indicator `▲`
- `value >= errorAt`: error — `--color-negative`, indicator `⬥`

The indicator symbol provides redundant encoding so color is never the sole channel.

### Tokens

`--color-positive`, `--color-warning`, `--color-negative`

---

## 3. HealthBar Component

**Location:** `src/components/primitives/HealthBar.tsx`
**Category:** Primitives

A horizontal bar where width represents a normalized value and fill color represents status. Compact enough for table cells and metric cards.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Normalized value 0–1, clamped |
| `status` | `'ok' \| 'warn' \| 'error'` | `'ok'` | Determines fill color |
| `height` | `number` | `4` | Bar height in pixels |
| `label` | `string` | — | Accessible label for screen readers |

### Behavior

- Renders a track (`--bg-muted`) with a filled portion whose width = `value * 100%`
- Fill color: `ok` → `--color-positive`, `warn` → `--color-warning`, `error` → `--color-negative`
- Uses 15% opacity background tint on the fill (matching Tag and FlashCell conventions)
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax` for accessibility
- `role="meter"` with `aria-label` from the `label` prop
- Border radius: 2px (matching buttons/inputs/badges convention)

### Tokens

`--color-positive`, `--color-warning`, `--color-negative`, `--bg-muted`

---

## 4. Pattern Additions to `docs/reference/patterns.md`

### Threshold Highlighting Pattern

Documents the general approach: when a numeric value has known operational bounds, apply semantic color automatically rather than requiring the user to visually scan for problems. References the `ThresholdValue` component and describes how to apply the same pattern to custom displays (check value against bounds, select semantic token, pair with non-color indicator).

### Panel Purpose Declaration Pattern

A lightweight JSDoc convention:
```tsx
/** @goals monitor */
export function WatchlistPanel() { ... }
```

Valid goals: `monitor`, `investigate`, `act`. A panel with more than one goal is a signal to reconsider scope. This is documentation, not runtime enforcement — it forces the developer to articulate why the panel exists.

---

## 5. Updates to Existing Files

- `src/components/index.ts`: export `ThresholdValue` and `HealthBar` from primitives
- `docs/reference/components.md`: add entries for both components in the Primitives section, following existing format (prop table, usage example, tokens)

---

## Out of Scope

- Runtime feature usage tracking
- Automated panel goal enforcement
- Changes to existing components
