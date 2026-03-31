export interface Instrument {
  symbol: string;
  name: string;
  assetClass: string;
  group: string;
}

export interface Tick {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  change: number;
  changePct: number;
  volume: number;
  timestamp: number;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y';

export interface MarketDataProvider {
  instruments: Instrument[];
  subscribe(symbol: string, callback: (tick: Tick) => void): () => void;
  getHistory(symbol: string, range: TimeRange): Candle[];
}
