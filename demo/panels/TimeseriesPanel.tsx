import { useEffect, useState, useMemo } from 'react';
import { Panel } from '@/components/layout/Panel';
import { TimeseriesChart } from '@/components/charting/TimeseriesChart';
import { useDataContext } from '../providers/DataProvider';
import type { Candle } from '../data/types';

export function TimeseriesPanel() {
  const { provider, selectedSymbol } = useDataContext();
  const [candles, setCandles] = useState<Candle[]>([]);

  useEffect(() => {
    if (!selectedSymbol) {
      setCandles([]);
      return;
    }
    setCandles(provider.getHistory(selectedSymbol, '3M'));
  }, [selectedSymbol, provider]);

  const bidAskData = useMemo(() => {
    if (candles.length === 0) return undefined;
    return {
      times: candles.map((c) => c.time),
      bid: candles.map((c) => c.low + (c.close - c.low) * 0.4),
      ask: candles.map((c) => c.low + (c.close - c.low) * 0.4 + (c.high - c.low) * 0.05),
    };
  }, [candles]);

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
        <TimeseriesChart bidAsk={bidAskData} />
      )}
    </Panel>
  );
}
