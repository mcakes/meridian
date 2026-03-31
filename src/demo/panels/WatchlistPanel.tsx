import { useEffect, useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { Panel } from '@/components/layout/Panel';
import { DataTable } from '@/components/data/DataTable';
import { useDataContext } from '@/providers/DataProvider';
import { fmtK } from '@/lib/format';
import type { Tick } from '../data/types';

interface WatchlistRow {
  symbol: string;
  name: string;
  group: string;
  last: number;
  changePct: number;
  bid: number;
  ask: number;
  volume: number;
}

const COLUMNS: ColDef[] = [
  {
    field: 'symbol',
    headerName: 'Symbol',
    flex: 1,
    minWidth: 70,
    cellStyle: { textAlign: 'left', fontWeight: 600 },
  },
  {
    field: 'name',
    headerName: 'Name',
    flex: 2,
    minWidth: 120,
    cellStyle: { textAlign: 'left', color: 'var(--text-secondary)' },
  },
  {
    field: 'last',
    headerName: 'Last',
    flex: 1,
    minWidth: 70,
    cellRenderer: 'NumericCell',
    cellRendererParams: { decimals: 2 },
  },
  {
    field: 'changePct',
    headerName: 'Change %',
    flex: 1,
    minWidth: 90,
    cellRenderer: 'ChangeCell',
  },
  {
    field: 'bid',
    headerName: 'Bid',
    flex: 1,
    minWidth: 70,
    cellRenderer: 'NumericCell',
    cellRendererParams: { decimals: 2 },
  },
  {
    field: 'ask',
    headerName: 'Ask',
    flex: 1,
    minWidth: 70,
    cellRenderer: 'NumericCell',
    cellRendererParams: { decimals: 2 },
  },
  {
    field: 'volume',
    headerName: 'Volume',
    flex: 1,
    minWidth: 80,
    valueFormatter: (params) => fmtK(params.value as number),
    cellStyle: { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
  },
];

export function WatchlistPanel() {
  const { provider, setSelectedSymbol } = useDataContext();

  const [ticks, setTicks] = useState<Record<string, Tick>>({});

  useEffect(() => {
    const unsubs = provider.instruments.map((inst) =>
      provider.subscribe(inst.symbol, (tick) => {
        setTicks((prev) => ({ ...prev, [tick.symbol]: tick }));
      }),
    );
    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [provider]);

  // Build unique sorted groups for color mapping
  const groups = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const inst of provider.instruments) {
      if (!seen.has(inst.group)) {
        seen.add(inst.group);
        result.push(inst.group);
      }
    }
    return result;
  }, [provider.instruments]);

  const rows: WatchlistRow[] = useMemo(() => {
    return provider.instruments.map((inst) => {
      const tick = ticks[inst.symbol];
      return {
        symbol: inst.symbol,
        name: inst.name,
        group: inst.group,
        last: tick?.price ?? 0,
        changePct: tick ? tick.changePct * 100 : 0,
        bid: tick?.bid ?? 0,
        ask: tick?.ask ?? 0,
        volume: tick?.volume ?? 0,
      };
    });
  }, [provider.instruments, ticks]);

  // Columns with group row styling via getRowStyle
  const columnsWithGroup: ColDef[] = useMemo(() => COLUMNS, []);

  const handleRowClick = (row: unknown) => {
    const r = row as WatchlistRow;
    setSelectedSymbol(r.symbol);
  };

  return (
    <Panel title="Watchlist">
      <div style={{ height: '100%', position: 'relative' }}>
        <style>{`
          ${groups.map((g, i) => `
            .ag-theme-meridian [col-id="symbol"][data-group="${g}"] {
              border-left: 2px solid var(--color-cat-${i});
            }
          `).join('')}
        `}</style>
        <DataTable
          columns={columnsWithGroup}
          rows={rows}
          density="compact"
          onRowClick={handleRowClick}
          groupBy="group"
        />
      </div>
    </Panel>
  );
}
