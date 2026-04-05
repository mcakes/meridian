import type { Instrument } from './types';

export interface InstrumentData extends Instrument {
  basePrice: number;
  volatility: number;
  spreadPct: number;
}

export const instrumentList: InstrumentData[] = [
  // Equities - Technology
  { symbol: 'AAPL', name: 'Apple Inc.', assetClass: 'Equity', group: 'Technology', basePrice: 195, volatility: 0.002, spreadPct: 0.0001 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', assetClass: 'Equity', group: 'Technology', basePrice: 420, volatility: 0.002, spreadPct: 0.0001 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', assetClass: 'Equity', group: 'Technology', basePrice: 175, volatility: 0.002, spreadPct: 0.0001 },
  // Equities - Semiconductors
  { symbol: 'NVDA', name: 'NVIDIA Corp.', assetClass: 'Equity', group: 'Semiconductors', basePrice: 130, volatility: 0.002, spreadPct: 0.0001 },
  { symbol: 'AMD', name: 'Advanced Micro Devices', assetClass: 'Equity', group: 'Semiconductors', basePrice: 160, volatility: 0.002, spreadPct: 0.0001 },
  // Equities - Healthcare
  { symbol: 'JNJ', name: 'Johnson & Johnson', assetClass: 'Equity', group: 'Healthcare', basePrice: 155, volatility: 0.002, spreadPct: 0.0001 },
  { symbol: 'PFE', name: 'Pfizer Inc.', assetClass: 'Equity', group: 'Healthcare', basePrice: 28, volatility: 0.002, spreadPct: 0.0001 },
  // Equities - Energy
  { symbol: 'XOM', name: 'Exxon Mobil Corp.', assetClass: 'Equity', group: 'Energy', basePrice: 105, volatility: 0.002, spreadPct: 0.0001 },
  { symbol: 'CVX', name: 'Chevron Corp.', assetClass: 'Equity', group: 'Energy', basePrice: 155, volatility: 0.002, spreadPct: 0.0001 },
  // FX - G10 Majors
  { symbol: 'EURUSD', name: 'Euro / US Dollar', assetClass: 'FX', group: 'G10 Majors', basePrice: 1.0850, volatility: 0.0005, spreadPct: 0.00002 },
  { symbol: 'GBPUSD', name: 'British Pound / US Dollar', assetClass: 'FX', group: 'G10 Majors', basePrice: 1.2650, volatility: 0.0005, spreadPct: 0.00002 },
  { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', assetClass: 'FX', group: 'G10 Majors', basePrice: 155.50, volatility: 0.0005, spreadPct: 0.00002 },
  // FX - Commodity FX
  { symbol: 'AUDUSD', name: 'Australian Dollar / US Dollar', assetClass: 'FX', group: 'Commodity FX', basePrice: 0.6550, volatility: 0.0005, spreadPct: 0.00002 },
  { symbol: 'USDCAD', name: 'US Dollar / Canadian Dollar', assetClass: 'FX', group: 'Commodity FX', basePrice: 1.3600, volatility: 0.0005, spreadPct: 0.00002 },
  { symbol: 'NZDUSD', name: 'New Zealand Dollar / US Dollar', assetClass: 'FX', group: 'Commodity FX', basePrice: 0.6100, volatility: 0.0005, spreadPct: 0.00002 },
];

export const instrumentMap: Record<string, InstrumentData> = Object.fromEntries(
  instrumentList.map((inst) => [inst.symbol, inst])
);
