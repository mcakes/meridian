# HeatmapCell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a general-purpose HeatmapCell primitive that maps a normalized 0–1 value to a color-intensity background, usable standalone or as an AG Grid cell renderer.

**Architecture:** Stateless React component using inline `color-mix()` against existing design tokens. Diverging scale maps negative→surface→positive; sequential maps surface→info. Thin AG Grid wrapper registered alongside existing renderers.

**Tech Stack:** React, TypeScript, CSS `color-mix()`, vitest

---

### Task 1: HeatmapCell Component — Tests

**Files:**
- Create: `src/components/primitives/__tests__/HeatmapCell.test.ts`

- [ ] **Step 1: Create the test file with color computation tests**

```typescript
// src/components/primitives/__tests__/HeatmapCell.test.ts
import { describe, it, expect } from 'vitest';
import { computeHeatmap } from '../HeatmapCell';

describe('computeHeatmap', () => {
  describe('clamping', () => {
    it('clamps values below 0 to 0', () => {
      const result = computeHeatmap(-0.5, 'diverging');
      expect(result).toEqual(computeHeatmap(0, 'diverging'));
    });

    it('clamps values above 1 to 1', () => {
      const result = computeHeatmap(1.5, 'diverging');
      expect(result).toEqual(computeHeatmap(1, 'diverging'));
    });
  });

  describe('diverging scale', () => {
    it('returns full negative at 0', () => {
      const result = computeHeatmap(0, 'diverging');
      expect(result.bg).toBe('color-mix(in srgb, var(--color-negative) 100%, var(--bg-surface))');
      expect(result.textColor).toBe('var(--text-inverse)');
    });

    it('returns neutral at 0.5', () => {
      const result = computeHeatmap(0.5, 'diverging');
      expect(result.bg).toBe('var(--bg-surface)');
      expect(result.textColor).toBe('var(--text-primary)');
    });

    it('returns full positive at 1', () => {
      const result = computeHeatmap(1, 'diverging');
      expect(result.bg).toBe('color-mix(in srgb, var(--color-positive) 100%, var(--bg-surface))');
      expect(result.textColor).toBe('var(--text-inverse)');
    });

    it('returns partial negative between 0 and 0.5', () => {
      const result = computeHeatmap(0.2, 'diverging');
      expect(result.bg).toBe('color-mix(in srgb, var(--color-negative) 60%, var(--bg-surface))');
    });

    it('returns partial positive between 0.5 and 1', () => {
      const result = computeHeatmap(0.8, 'diverging');
      expect(result.bg).toBe('color-mix(in srgb, var(--color-positive) 60%, var(--bg-surface))');
    });
  });

  describe('sequential scale', () => {
    it('returns surface at 0', () => {
      const result = computeHeatmap(0, 'sequential');
      expect(result.bg).toBe('var(--bg-surface)');
      expect(result.textColor).toBe('var(--text-primary)');
    });

    it('returns full info at 1', () => {
      const result = computeHeatmap(1, 'sequential');
      expect(result.bg).toBe('color-mix(in srgb, var(--color-info) 100%, var(--bg-surface))');
      expect(result.textColor).toBe('var(--text-inverse)');
    });

    it('returns partial info at 0.4', () => {
      const result = computeHeatmap(0.4, 'sequential');
      expect(result.bg).toBe('color-mix(in srgb, var(--color-info) 40%, var(--bg-surface))');
      expect(result.textColor).toBe('var(--text-primary)');
    });
  });

  describe('text contrast', () => {
    it('uses inverse text when intensity exceeds 60%', () => {
      const result = computeHeatmap(0.1, 'diverging'); // intensity = 80%
      expect(result.textColor).toBe('var(--text-inverse)');
    });

    it('uses primary text when intensity is at or below 60%', () => {
      const result = computeHeatmap(0.3, 'diverging'); // intensity = 40%
      expect(result.textColor).toBe('var(--text-primary)');
    });

    it('uses primary text at midpoint', () => {
      const result = computeHeatmap(0.5, 'diverging'); // intensity = 0%
      expect(result.textColor).toBe('var(--text-primary)');
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/primitives/__tests__/HeatmapCell.test.ts`
Expected: FAIL — `computeHeatmap` is not exported / file does not exist

- [ ] **Step 3: Commit**

```bash
git add src/components/primitives/__tests__/HeatmapCell.test.ts
git commit -m "test(heatmap): add unit tests for computeHeatmap color logic"
```

---

### Task 2: HeatmapCell Component — Implementation

**Files:**
- Create: `src/components/primitives/HeatmapCell.tsx`

- [ ] **Step 1: Implement the component**

```tsx
// src/components/primitives/HeatmapCell.tsx
import type { CSSProperties, ReactNode } from 'react';

type HeatmapScale = 'diverging' | 'sequential';

interface HeatmapCellProps {
  /** Normalized intensity value, clamped to 0–1. */
  value: number;
  /** Color mapping mode. */
  scale?: HeatmapScale;
  /** Optional content rendered on top of the background. */
  children?: ReactNode;
  /** Merged with computed styles. */
  style?: CSSProperties;
  /** Additional class names. */
  className?: string;
}

export function computeHeatmap(
  raw: number,
  scale: HeatmapScale,
): { bg: string; textColor: string } {
  const value = Math.max(0, Math.min(1, raw));

  if (scale === 'sequential') {
    const intensity = Math.round(value * 100);
    const bg =
      intensity === 0
        ? 'var(--bg-surface)'
        : `color-mix(in srgb, var(--color-info) ${intensity}%, var(--bg-surface))`;
    const textColor = intensity > 60 ? 'var(--text-inverse)' : 'var(--text-primary)';
    return { bg, textColor };
  }

  // Diverging: 0 = full negative, 0.5 = neutral, 1 = full positive
  const intensity = Math.round(Math.abs(value - 0.5) * 2 * 100);

  if (intensity === 0) {
    return { bg: 'var(--bg-surface)', textColor: 'var(--text-primary)' };
  }

  const token = value < 0.5 ? 'var(--color-negative)' : 'var(--color-positive)';
  const bg = `color-mix(in srgb, ${token} ${intensity}%, var(--bg-surface))`;
  const textColor = intensity > 60 ? 'var(--text-inverse)' : 'var(--text-primary)';
  return { bg, textColor };
}

export function HeatmapCell({
  value,
  scale = 'diverging',
  children,
  style,
  className,
}: HeatmapCellProps) {
  const { bg, textColor } = computeHeatmap(value, scale);

  return (
    <div
      role="cell"
      aria-label={String(Math.max(0, Math.min(1, value)))}
      className={className}
      style={{
        backgroundColor: bg,
        color: textColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2,
        fontVariantNumeric: children != null ? 'tabular-nums' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Run the tests**

Run: `npx vitest run src/components/primitives/__tests__/HeatmapCell.test.ts`
Expected: All tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/primitives/HeatmapCell.tsx
git commit -m "feat(heatmap): add HeatmapCell primitive with diverging and sequential scales"
```

---

### Task 3: AG Grid Cell Renderer

**Files:**
- Modify: `src/components/data/cell-renderers.tsx`

- [ ] **Step 1: Add import and HeatmapCellRenderer to cell-renderers.tsx**

Add the import at the top of the file, after the existing primitive imports:

```tsx
import { HeatmapCell } from '@/components/primitives/HeatmapCell';
```

Add the renderer function at the end of the file, after the `ActionCell` function:

```tsx
export function HeatmapCellRenderer(params: ICellRendererParams) {
  const scale = (params.colDef?.cellRendererParams as { scale?: 'diverging' | 'sequential' } | undefined)?.scale;
  const value = params.value as number | null | undefined;
  if (value == null) return null;
  return <HeatmapCell value={value} scale={scale}>{value.toFixed(2)}</HeatmapCell>;
}
```

- [ ] **Step 2: Verify the app still compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add src/components/data/cell-renderers.tsx
git commit -m "feat(heatmap): add HeatmapCellRenderer for AG Grid"
```

---

### Task 4: Export from Component Index

**Files:**
- Modify: `src/components/index.ts:8`

- [ ] **Step 1: Add the export**

Add after the `HealthBar` export (line 8):

```typescript
export { HeatmapCell } from './primitives/HeatmapCell';
```

- [ ] **Step 2: Verify the app still compiles**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add src/components/index.ts
git commit -m "feat(heatmap): export HeatmapCell from component index"
```

---

### Task 5: Showcase Demo on PrimitivesPage

**Files:**
- Modify: `src/site/pages/components/PrimitivesPage.tsx`

- [ ] **Step 1: Add import**

Add to the import block at the top:

```tsx
import { HeatmapCell } from '@/components/primitives/HeatmapCell';
```

- [ ] **Step 2: Add demo section**

Add a new `<Section>` block after the HealthBar section (before the Sparkline section, around line 175). Insert:

```tsx
      <Section title="HeatmapCell">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
          Maps a normalised 0–1 value to a colour-intensity background. Diverging scale
          uses negative/positive colours; sequential uses a single-colour ramp.
        </p>
        <ComponentDemo label="Diverging Scale">
          <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(5, 56px)', gap: 2 }}>
            {[0, 0.15, 0.35, 0.5, 0.65, 0.85, 1].map(v => (
              <HeatmapCell key={v} value={v} style={{ height: 40, fontSize: 12 }}>
                {v.toFixed(2)}
              </HeatmapCell>
            ))}
          </div>
        </ComponentDemo>
        <ComponentDemo label="Sequential Scale">
          <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(5, 56px)', gap: 2 }}>
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map(v => (
              <HeatmapCell key={v} value={v} scale="sequential" style={{ height: 40, fontSize: 12 }}>
                {v.toFixed(2)}
              </HeatmapCell>
            ))}
          </div>
        </ComponentDemo>
        <ComponentDemo label="Correlation Matrix">
          <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(4, 56px)', gap: 2 }}>
            {[1.0, 0.72, -0.15, 0.08,
              0.72, 1.0, 0.31, -0.04,
              -0.15, 0.31, 1.0, -0.53,
              0.08, -0.04, -0.53, 1.0].map((corr, i) => (
              <HeatmapCell key={i} value={(corr + 1) / 2} style={{ height: 40, fontSize: 11 }}>
                {corr.toFixed(2)}
              </HeatmapCell>
            ))}
          </div>
        </ComponentDemo>
      </Section>
```

- [ ] **Step 3: Verify it renders**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add src/site/pages/components/PrimitivesPage.tsx
git commit -m "feat(heatmap): add HeatmapCell demos to PrimitivesPage"
```

---

### Task 6: Documentation

**Files:**
- Modify: `docs/reference/components.md`

- [ ] **Step 1: Add HeatmapCell docs**

Add a new section after the HealthBar section (after the `---` on the line following HealthBar's Tokens), before the `## Inputs` heading:

```markdown
### HeatmapCell

Maps a normalised 0–1 value to a colour-intensity background using `color-mix()`. Diverging scale (default) runs from negative through neutral to positive; sequential runs from surface to info. Pass `children` to render text on top with automatic contrast switching.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Normalised intensity, clamped to 0–1. |
| `scale` | `'diverging' \| 'sequential'` | `'diverging'` | Colour mapping mode. |
| `children` | `ReactNode` | — | Optional content rendered on top of the background. |
| `style` | `CSSProperties` | — | Merged with computed styles. |
| `className` | `string` | — | Additional class names. |

**Colour scales:**

| Scale | 0 | 0.5 | 1 |
|-------|---|-----|---|
| Diverging | `--color-negative` | `--bg-surface` | `--color-positive` |
| Sequential | `--bg-surface` | 50% `--color-info` | `--color-info` |

Text colour switches to `--text-inverse` when background intensity exceeds 60%.

**Usage:**
```tsx
<HeatmapCell value={0.85}>+2.4%</HeatmapCell>
<HeatmapCell value={0.2} scale="sequential" style={{ height: 40 }}>Low</HeatmapCell>
<HeatmapCell value={(correlation + 1) / 2}>{correlation.toFixed(2)}</HeatmapCell>
```

**Tokens:** `--color-negative`, `--color-positive`, `--color-info`, `--bg-surface`, `--text-primary`, `--text-inverse`

---
```

- [ ] **Step 2: Commit**

```bash
git add docs/reference/components.md
git commit -m "docs(heatmap): add HeatmapCell to component reference"
```
