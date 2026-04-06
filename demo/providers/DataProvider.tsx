import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { MarketDataProvider } from '../data/types';
import { SimulatedMarketData } from '../data/SimulatedMarketData';

interface DataContextValue {
  provider: MarketDataProvider;
  selectedSymbol: string | null;
  setSelectedSymbol: (symbol: string) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const providerRef = useRef<SimulatedMarketData | null>(null);
  if (!providerRef.current) {
    providerRef.current = new SimulatedMarketData();
  }
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      providerRef.current?.destroy();
    };
  }, []);

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
