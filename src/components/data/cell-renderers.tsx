import type { ICellRendererParams } from 'ag-grid-community';
import { fmt } from '@/lib/format';
import { PriceChange } from '@/components/primitives/PriceChange';
import { Tag } from '@/components/primitives/Tag';
import { Sparkline } from '@/components/data/Sparkline';

export function NumericCell(params: ICellRendererParams) {
  const decimals: number = (params.colDef?.cellRendererParams as { decimals?: number } | undefined)?.decimals ?? 2;
  const value = params.value as number | null | undefined;
  if (value == null) return null;
  return (
    <span style={{ display: 'block', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
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
      }}
    >
      ...
    </button>
  );
}
