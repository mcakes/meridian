const sizes = { xs: 12, sm: 14, md: 18 } as const;

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md';
  color?: string;
  label?: string;
}

export function Spinner({ size = 'sm', color = 'var(--text-muted)', label = 'Loading' }: SpinnerProps) {
  const d = sizes[size];
  return (
    <div
      role="status"
      aria-label={label}
      style={{
        display: 'inline-block',
        width: d,
        height: d,
        border: `2px solid color-mix(in srgb, ${color} 25%, transparent)`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        willChange: 'transform',
        flexShrink: 0,
      }}
    />
  );
}
