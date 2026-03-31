import type * as Plotly from 'plotly.js';

function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function getMeridianLayout(_theme: 'dark' | 'light'): Partial<Plotly.Layout> {
  const colorway = [
    getCSSVar('--color-cat-0'),
    getCSSVar('--color-cat-1'),
    getCSSVar('--color-cat-2'),
    getCSSVar('--color-cat-3'),
    getCSSVar('--color-cat-4'),
    getCSSVar('--color-cat-5'),
    getCSSVar('--color-cat-6'),
    getCSSVar('--color-cat-7'),
  ];

  const gridColor = getCSSVar('--border-subtle');
  const lineColor = getCSSVar('--border-default');
  const textMuted = getCSSVar('--text-muted');
  const textSecondary = getCSSVar('--text-secondary');
  const bgBase = getCSSVar('--bg-base');
  const bgOverlay = getCSSVar('--bg-overlay');

  const axisDefaults: Partial<Plotly.LayoutAxis> = {
    gridcolor: gridColor,
    griddash: 'dot' as Plotly.Dash,
    linecolor: lineColor,
    tickfont: {
      family: 'JetBrains Mono, monospace',
      size: 10,
      color: textMuted,
    },
    zeroline: false,
    ticks: 'outside',
    ticklen: 3,
    showspikes: true,
    spikemode: 'across',
    spikecolor: lineColor,
    spikethickness: 1,
    spikedash: 'dot' as Plotly.Dash,
  };

  return {
    paper_bgcolor: 'transparent',
    plot_bgcolor: bgBase,
    font: {
      family: 'Inter, system-ui, sans-serif',
      size: 11,
      color: textMuted,
    },
    title: {
      font: {
        size: 13,
        color: textSecondary,
      },
      xref: 'paper' as 'paper',
      x: 0,
    },
    margin: { l: 48, r: 12, t: 28, b: 32 },
    xaxis: {
      ...axisDefaults,
      showline: true,
    },
    yaxis: {
      ...axisDefaults,
      showline: false,
      side: 'right',
    },
    hovermode: 'x',
    hoverlabel: {
      bgcolor: bgOverlay,
      font: {
        family: 'Inter, system-ui, sans-serif',
        size: 12,
        color: textMuted,
      },
    },
    legend: {
      orientation: 'h',
      yanchor: 'bottom',
      y: 1.02,
      xanchor: 'left',
      x: 0,
      bgcolor: 'transparent',
    },
    colorway,
    modebar: {
      bgcolor: 'transparent',
      color: textMuted,
      activecolor: textSecondary,
    },
  } as unknown as Partial<Plotly.Layout>;
}

export function getMeridianConfig(): Partial<Plotly.Config> {
  return {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['select2d', 'lasso2d', 'sendDataToCloud', 'toImage'],
    scrollZoom: true,
    doubleClick: 'reset',
    responsive: true,
  };
}
