interface CatDotProps {
  index: number;
  size?: number;
}

export function CatDot({ index, size = 8 }: CatDotProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        backgroundColor: `var(--color-cat-${index})`,
        borderRadius: 2,
        flexShrink: 0,
      }}
    />
  );
}
