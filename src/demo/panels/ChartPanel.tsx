import { useEffect, useState } from 'react';
import { Panel } from '@/components/layout/Panel';
import { Chart } from '@/components/charting/Chart';
import { useDataContext } from '@/providers/DataProvider';
import type { Candle } from '../data/types';

export function ChartPanel() {
  const { provider, selectedSymbol } = useDataContext();
  const [candles, setCandles] = useState<Candle[]>([]);

  useEffect(() => {
    if (!selectedSymbol) {
      setCandles([]);
      return;
    }
    setCandles(provider.getHistory(selectedSymbol, '3M'));
  }, [selectedSymbol, provider]);

  const title = `Chart — ${selectedSymbol ?? ''}`;

  return (
    <Panel title={title}>
      {!selectedSymbol ? (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: 14,
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
                  color: getComputedStyle(document.documentElement)
                    .getPropertyValue('--color-positive')
                    .trim(),
                },
              },
              decreasing: {
                line: {
                  color: getComputedStyle(document.documentElement)
                    .getPropertyValue('--color-negative')
                    .trim(),
                },
              },
            },
          ]}
        />
      )}
    </Panel>
  );
}
