import Plot from 'react-plotly.js';
import type * as Plotly from 'plotly.js';
import { useTheme } from '@/hooks/useTheme';
import { getMeridianLayout, getMeridianConfig } from './meridian-plotly-template';

interface ChartProps {
  data: Plotly.Data[];
  layout?: Partial<Plotly.Layout>;
  config?: Partial<Plotly.Config>;
}

export function Chart({ data, layout, config }: ChartProps) {
  const { theme } = useTheme();

  const baseLayout = getMeridianLayout(theme);

  const mergedLayout: Partial<Plotly.Layout> = {
    ...baseLayout,
    ...layout,
    datarevision: theme, // force Plotly to re-render on theme change
    xaxis: {
      ...baseLayout.xaxis,
      ...(layout?.xaxis ?? {}),
    },
    yaxis: {
      ...baseLayout.yaxis,
      ...(layout?.yaxis ?? {}),
    },
    yaxis2: {
      ...baseLayout.yaxis2,
      ...(layout?.yaxis2 ?? {}),
    },
  };

  const mergedConfig: Partial<Plotly.Config> = {
    ...getMeridianConfig(),
    ...config,
  };

  return (
    <Plot
      data={data}
      layout={mergedLayout}
      config={mergedConfig}
      useResizeHandler
      style={{ width: '100%', height: '100%' }}
    />
  );
}
