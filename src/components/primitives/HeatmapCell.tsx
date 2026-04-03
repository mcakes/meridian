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
  const clamped = Math.max(0, Math.min(1, value));
  const { bg, textColor } = computeHeatmap(clamped, scale);

  return (
    <div
      role="cell"
      aria-label={String(clamped)}
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
