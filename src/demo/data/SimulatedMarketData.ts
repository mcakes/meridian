import type { MarketDataProvider, Instrument, Tick, Candle, TimeRange } from './types';
import { instrumentList, instrumentMap } from './instruments';

const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  '1D': 1,
  '1W': 5,
  '1M': 22,
  '3M': 66,
  '1Y': 252,
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export class SimulatedMarketData implements MarketDataProvider {
  readonly instruments: Instrument[];

  private prices: Record<string, number> = {};
  private volumes: Record<string, number> = {};
  private subscribers: Map<string, Set<(tick: Tick) => void>> = new Map();
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.instruments = instrumentList.map(({ symbol, name, assetClass, group }) => ({
      symbol,
      name,
      assetClass,
      group,
    }));

    // Initialise prices to base prices
    for (const inst of instrumentList) {
      this.prices[inst.symbol] = inst.basePrice;
      this.volumes[inst.symbol] = this.initialVolume(inst.assetClass);
    }

    this.intervalId = setInterval(() => this.tick(), 700);
  }

  private initialVolume(assetClass: string): number {
    return assetClass === 'Equity'
      ? Math.floor(Math.random() * 5_000_000) + 1_000_000
      : Math.floor(Math.random() * 500_000_000) + 100_000_000;
  }

  private tick(): void {
    for (const inst of instrumentList) {
      const { symbol, volatility, spreadPct, basePrice } = inst;

      // Stochastic price walk
      const currentPrice = this.prices[symbol] ?? basePrice;
      const price = currentPrice * (1 + (Math.random() - 0.5) * volatility);
      this.prices[symbol] = price;

      // Volume increment
      const volDelta =
        inst.assetClass === 'Equity'
          ? Math.floor(Math.random() * 10_000)
          : Math.floor(Math.random() * 1_000_000);
      this.volumes[symbol] = (this.volumes[symbol] ?? 0) + volDelta;

      const callbacks = this.subscribers.get(symbol);
      if (!callbacks || callbacks.size === 0) continue;

      const halfSpread = price * spreadPct * 0.5;
      const bid = price - halfSpread;
      const ask = price + halfSpread;
      const change = price - basePrice;
      const changePct = change / basePrice;

      const tick: Tick = {
        symbol,
        price,
        bid,
        ask,
        change,
        changePct,
        volume: this.volumes[symbol] ?? 0,
        timestamp: Date.now(),
      };

      for (const cb of callbacks) {
        cb(tick);
      }
    }
  }

  subscribe(symbol: string, callback: (tick: Tick) => void): () => void {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
    }
    this.subscribers.get(symbol)!.add(callback);

    return () => {
      this.subscribers.get(symbol)?.delete(callback);
    };
  }

  getHistory(symbol: string, range: TimeRange): Candle[] {
    const inst = instrumentMap[symbol];
    if (!inst) return [];

    const numDays = TIME_RANGE_DAYS[range];
    const currentPrice = this.prices[symbol] ?? inst.basePrice;
    const { volatility } = inst;

    const candles: Candle[] = [];
    let closePrice = currentPrice;
    const now = Date.now();

    // Walk backwards from today, generating one candle per day
    for (let i = 0; i < numDays; i++) {
      const time = Math.floor((now - i * MS_PER_DAY) / 1000); // unix seconds

      // Generate open near close with random walk
      const dayMove = (Math.random() - 0.5) * volatility * 20;
      const open = closePrice * (1 - dayMove);

      // High and low span within the day
      const range = closePrice * volatility * (5 + Math.random() * 10);
      const high = Math.max(open, closePrice) + Math.random() * range;
      const low = Math.min(open, closePrice) - Math.random() * range;

      const volume =
        inst.assetClass === 'Equity'
          ? Math.floor(Math.random() * 20_000_000) + 5_000_000
          : Math.floor(Math.random() * 2_000_000_000) + 500_000_000;

      candles.unshift({ time, open, high, low, close: closePrice, volume });

      // Previous day's close becomes today's open reference
      closePrice = open;
    }

    return candles;
  }

  destroy(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
