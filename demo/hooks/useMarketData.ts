import { useEffect, useState } from 'react';
import { useDataContext } from '../providers/DataProvider';
import type { Tick, Candle, TimeRange } from '../data/types';

export function useMarketData(symbol: string | null) {
  const { provider } = useDataContext();
  const [tick, setTick] = useState<Tick | null>(null);

  useEffect(() => {
    if (!symbol) return;
    const unsub = provider.subscribe(symbol, setTick);
    return unsub;
  }, [symbol, provider]);

  const getHistory = (range: TimeRange): Candle[] => {
    if (!symbol) return [];
    return provider.getHistory(symbol, range);
  };

  return {
    price: tick?.price ?? 0,
    bid: tick?.bid ?? 0,
    ask: tick?.ask ?? 0,
    change: tick?.change ?? 0,
    changePct: tick?.changePct ?? 0,
    volume: tick?.volume ?? 0,
    getHistory,
  };
}
