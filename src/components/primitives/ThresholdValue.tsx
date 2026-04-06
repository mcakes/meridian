interface ThresholdValueProps {
  value: number;
  warnAt: number;
  errorAt: number;
  format?: (n: number) => string;
  /** When true, thresholds trigger below instead of above (for values where lower is worse). */
  invert?: boolean;
}

type Severity = 'normal' | 'warn' | 'error';

const severityColor: Record<Severity, string> = {
  normal: 'var(--color-positive)',
  warn: 'var(--color-warning)',
  error: 'var(--color-negative)',
};

const severityIndicator: Record<Severity, string> = {
  normal: '●',
  warn: '▲',
  error: '⬥',
};

function getSeverity(
  value: number,
  warnAt: number,
  errorAt: number,
  invert: boolean,
): Severity {
  if (invert) {
    if (value <= errorAt) return 'error';
    if (value <= warnAt) return 'warn';
    return 'normal';
  }
  if (value >= errorAt) return 'error';
  if (value >= warnAt) return 'warn';
  return 'normal';
}

export function ThresholdValue({
  value,
  warnAt,
  errorAt,
  format = String,
  invert = false,
}: ThresholdValueProps) {
  const severity = getSeverity(value, warnAt, errorAt, invert);
  const color = severityColor[severity];
  const indicator = severityIndicator[severity];

  return (
    <span
      style={{
        color,
        fontVariantNumeric: 'tabular-nums',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <span style={{ fontSize: '0.65em', lineHeight: 1 }}>{indicator}</span>
      {format(value)}
    </span>
  );
}
