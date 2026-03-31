interface MetricCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
}

export function MetricCard({ label, value, sublabel }: MetricCardProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 4,
        padding: '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontSize: 11,
          color: 'var(--text-secondary)',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 16,
          color: 'var(--text-primary)',
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
      {sublabel !== undefined && (
        <span
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
          }}
        >
          {sublabel}
        </span>
      )}
    </div>
  );
}
