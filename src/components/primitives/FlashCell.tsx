import { useFlash } from '@/hooks/useFlash';

interface FlashCellProps {
  value: number;
  format?: (n: number) => string;
}

export function FlashCell({ value, format = String }: FlashCellProps) {
  const flash = useFlash(value);

  const bgColor =
    flash === 'up'
      ? 'color-mix(in srgb, var(--color-positive) 15%, transparent)'
      : flash === 'down'
        ? 'color-mix(in srgb, var(--color-negative) 15%, transparent)'
        : 'transparent';

  return (
    <span
      style={{
        backgroundColor: bgColor,
        transition: 'background-color 100ms ease',
        display: 'inline-block',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {format(value)}
    </span>
  );
}
