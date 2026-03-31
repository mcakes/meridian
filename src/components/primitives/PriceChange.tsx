import { fmt } from '@/lib/format';

interface PriceChangeProps {
  value: number;
  decimals?: number;
}

export function PriceChange({ value, decimals = 2 }: PriceChangeProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;

  const arrow = isPositive ? '▲' : isNegative ? '▼' : '—';
  const sign = isPositive ? '+' : isNegative ? '-' : '';
  const absValue = Math.abs(value);
  const color = isPositive
    ? 'var(--color-positive)'
    : isNegative
      ? 'var(--color-negative)'
      : 'var(--color-neutral)';

  return (
    <span style={{ color, fontVariantNumeric: 'tabular-nums' }}>
      {arrow} {sign}{fmt(absValue, decimals)}%
    </span>
  );
}
