import { useRef, useEffect, useCallback } from 'react';
import Plotly from 'plotly.js-finance-dist-min';
import Plot from 'react-plotly.js';
import { useTheme } from '@/hooks/useTheme';
import { getMeridianLayout, getMeridianConfig } from './meridian-plotly-template';

interface ChartProps {
  data: Plotly.Data[];
  layout?: Partial<Plotly.Layout>;
  config?: Partial<Plotly.Config>;
}

export function Chart({ data, layout, config }: ChartProps) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const plotElRef = useRef<Plotly.PlotlyHTMLElement | null>(null);

  // Grab the Plotly DOM element when the plot mounts or updates
  const capturePlotEl = useCallback((_figure: any, graphDiv: any) => {
    plotElRef.current = graphDiv as Plotly.PlotlyHTMLElement;
  }, []);

  // ResizeObserver on the wrapper — fires when FlexLayout resizes the panel
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let rafId: number | null = null;
    const ro = new ResizeObserver(() => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (plotElRef.current) {
          Plotly.Plots.resize(plotElRef.current);
        }
        rafId = null;
      });
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const baseLayout = getMeridianLayout(theme);

  const mergedLayout: Partial<Plotly.Layout> = {
    ...baseLayout,
    ...layout,
    autosize: true,
    datarevision: theme,
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
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <Plot
        data={data}
        layout={mergedLayout}
        config={mergedConfig}
        useResizeHandler={false}
        style={{ width: '100%', height: '100%' }}
        onInitialized={capturePlotEl}
        onUpdate={capturePlotEl}
      />
    </div>
  );
}
