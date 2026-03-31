type TagVariant = 'pass' | 'warn' | 'fail';

interface TagProps {
  variant: TagVariant;
  children: string;
}

const variantColorMap: Record<TagVariant, string> = {
  pass: 'var(--color-positive)',
  warn: 'var(--color-warning)',
  fail: 'var(--color-negative)',
};

export function Tag({ variant, children }: TagProps) {
  const color = variantColorMap[variant];

  return (
    <span
      style={{
        color,
        backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
        borderRadius: 2,
        fontSize: 11,
        fontWeight: 600,
        padding: '1px 6px',
        display: 'inline-block',
        letterSpacing: '0.02em',
      }}
    >
      {children}
    </span>
  );
}
