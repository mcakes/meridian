import type { ICellRendererParams } from 'ag-grid-community';
import { useFlash } from '@/hooks/useFlash';
import { fmt } from '@/lib/format';
import { PriceChange } from '@/components/primitives/PriceChange';
import { Tag } from '@/components/primitives/Tag';
import { Sparkline } from '@/components/data/Sparkline';
import { HeatmapCell } from '@/components/primitives/HeatmapCell';

export function NumericCell(params: ICellRendererParams) {
  const decimals: number = (params.colDef?.cellRendererParams as { decimals?: number } | undefined)?.decimals ?? 2;
  const value = params.value as number | null | undefined;
  const flash = useFlash(value ?? 0);

  if (value == null) return null;

  const bgColor =
    flash === 'up'
      ? 'color-mix(in srgb, var(--color-positive) 15%, transparent)'
      : flash === 'down'
        ? 'color-mix(in srgb, var(--color-negative) 15%, transparent)'
        : 'transparent';

  return (
    <span
      style={{
        display: 'block',
        textAlign: 'right',
        fontFamily: 'var(--font-mono)',
        fontVariantNumeric: 'tabular-nums',
        backgroundColor: bgColor,
        transition: 'background-color 100ms ease',
      }}
    >
      {fmt(value, decimals)}
    </span>
  );
}

export function ChangeCell(params: ICellRendererParams) {
  const value = params.value as number | null | undefined;
  if (value == null) return null;
  return <PriceChange value={value} />;
}

type TagVariant = 'pass' | 'warn' | 'fail';

const VALUE_TO_VARIANT: Record<string, TagVariant> = {
  pass: 'pass',
  warn: 'warn',
  warning: 'warn',
  fail: 'fail',
  error: 'fail',
};

export function BadgeCell(params: ICellRendererParams) {
  const raw = String(params.value ?? '').toLowerCase();
  const variant: TagVariant = VALUE_TO_VARIANT[raw] ?? 'warn';
  return <Tag variant={variant}>{String(params.value ?? '')}</Tag>;
}

export function SparklineCell(params: ICellRendererParams) {
  const data = params.value as number[] | null | undefined;
  if (!data || !Array.isArray(data)) return null;
  return <Sparkline data={data} width={80} height={24} />;
}

export function ActionCell(_params: ICellRendererParams) {
  return (
    <button
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-muted)',
        fontSize: 16,
        padding: '0 4px',
        lineHeight: 1,
        borderRadius: 2,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.color = 'var(--text-primary)';
        el.style.backgroundColor = 'var(--bg-highlight)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.color = 'var(--text-muted)';
        el.style.backgroundColor = 'transparent';
      }}
    >
      ...
    </button>
  );
}

export function HeatmapCellRenderer(params: ICellRendererParams) {
  const scale = (params.colDef?.cellRendererParams as { scale?: 'diverging' | 'sequential' } | undefined)?.scale;
  const value = params.value as number | null | undefined;
  if (value == null) return null;
  return <HeatmapCell value={value} scale={scale}>{value.toFixed(2)}</HeatmapCell>;
}
