import { useEffect, useState, useMemo } from 'react';
import { Panel } from '@/components/layout/Panel';
import { Chart } from '@/components/charting/Chart';
import { useDataContext } from '../providers/DataProvider';
import { useTheme } from '@/hooks/useTheme';
import type { Candle } from '../data/types';

function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function ChartPanel() {
  const { provider, selectedSymbol } = useDataContext();
  const { theme } = useTheme();
  const [candles, setCandles] = useState<Candle[]>([]);

  const semanticColors = useMemo(() => ({
    positive: getCSSVar('--color-positive'),
    negative: getCSSVar('--color-negative'),
  }), [theme]);

  useEffect(() => {
    if (!selectedSymbol) {
      setCandles([]);
      return;
    }
    setCandles(provider.getHistory(selectedSymbol, '3M'));
  }, [selectedSymbol, provider]);

  return (
    <Panel>
      {!selectedSymbol ? (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: 12,
          }}
        >
          Select an instrument
        </div>
      ) : (
        <Chart
          data={[
            {
              type: 'candlestick' as const,
              x: candles.map((c) => new Date(c.time * 1000)),
              open: candles.map((c) => c.open),
              high: candles.map((c) => c.high),
              low: candles.map((c) => c.low),
              close: candles.map((c) => c.close),
              increasing: {
                line: {
                  color: semanticColors.positive,
                },
              },
              decreasing: {
                line: {
                  color: semanticColors.negative,
                },
              },
              showlegend: false,
            },
            {
              type: 'scatter' as const,
              x: [candles[0] ? new Date(candles[0].time * 1000) : undefined],
              y: [candles[0]?.close],
              yaxis: 'y2',
              mode: 'markers',
              marker: { opacity: 0 },
              hoverinfo: 'skip',
              showlegend: false,
            },
          ]}
        />
      )}
    </Panel>
  );
}
