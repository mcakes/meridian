type HealthBarStatus = 'ok' | 'warn' | 'error';

interface HealthBarProps {
  /** Normalized value between 0 and 1. Clamped to bounds. */
  value: number;
  status?: HealthBarStatus;
  /** Bar height in pixels. */
  height?: number;
  /** Accessible label for screen readers. */
  label?: string;
}

const statusColor: Record<HealthBarStatus, string> = {
  ok: 'var(--color-positive)',
  warn: 'var(--color-warning)',
  error: 'var(--color-negative)',
};

export function HealthBar({
  value,
  status = 'ok',
  height = 4,
  label,
}: HealthBarProps) {
  const clamped = Math.max(0, Math.min(1, value));
  const color = statusColor[status];

  return (
    <div
      role="meter"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={1}
      aria-label={label}
      style={{
        width: '100%',
        height,
        backgroundColor: 'var(--bg-muted)',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${clamped * 100}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: 2,
          transition: 'width 200ms ease',
        }}
      />
    </div>
  );
}
