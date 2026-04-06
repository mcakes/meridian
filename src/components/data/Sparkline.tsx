interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
}

export function Sparkline({
  data,
  width = 60,
  height = 20,
  color = 'var(--color-cat-0)',
  showArea = false,
}: SparklineProps) {
  if (!data || data.length === 0) {
    return <svg width={width} height={height} />;
  }

  let min = Infinity;
  let max = -Infinity;
  for (const v of data) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const range = max - min || 1; // avoid division by zero when all values equal

  const points = data.map((value, index) => {
    const x = data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  const linePoints = points.join(' ');

  // Area polygon: line points + bottom-right corner + bottom-left corner
  const lastX = width;
  const firstX = 0;
  const areaPoints = `${linePoints} ${lastX},${height} ${firstX},${height}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      {showArea && (
        <polygon
          points={areaPoints}
          fill={color}
          opacity={0.15}
        />
      )}
      <polyline
        points={linePoints}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
