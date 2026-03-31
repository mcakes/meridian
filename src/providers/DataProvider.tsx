import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import type { MarketDataProvider } from '../demo/data/types';
import { SimulatedMarketData } from '../demo/data/SimulatedMarketData';

interface DataContextValue {
  provider: MarketDataProvider;
  selectedSymbol: string | null;
  setSelectedSymbol: (symbol: string) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const providerRef = useRef(new SimulatedMarketData());
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  return (
    <DataContext.Provider value={{
      provider: providerRef.current,
      selectedSymbol,
      setSelectedSymbol,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useDataContext(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useDataContext must be used within DataProvider');
  return ctx;
}
