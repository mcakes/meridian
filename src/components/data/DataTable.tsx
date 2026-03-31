import 'ag-grid-community/styles/ag-grid.css';
import './ag-grid-meridian.css';

import { useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import type { ColDef, RowClickedEvent } from 'ag-grid-community';

import {
  NumericCell,
  ChangeCell,
  BadgeCell,
  SparklineCell,
  ActionCell,
} from './cell-renderers';

ModuleRegistry.registerModules([AllCommunityModule]);

interface DataTableProps {
  columns: ColDef[];
  rows: unknown[];
  density?: 'compact' | 'default' | 'comfortable';
  onRowClick?: (row: unknown) => void;
  groupBy?: string;
}

export function DataTable({
  columns,
  rows,
  density = 'default',
  onRowClick,
  groupBy,
}: DataTableProps) {
  const densityClass =
    density === 'compact'
      ? 'density-compact'
      : density === 'comfortable'
        ? 'density-comfortable'
        : '';

  const components = useMemo(
    () => ({
      NumericCell,
      ChangeCell,
      BadgeCell,
      SparklineCell,
      ActionCell,
    }),
    [],
  );

  // If groupBy is set, sort rows by that field so groups appear together,
  // and inject group header rows for display purposes.
  const processedRows = useMemo(() => {
    if (!groupBy) return rows;
    const sorted = [...rows].sort((a, b) => {
      const av = String((a as Record<string, unknown>)[groupBy] ?? '');
      const bv = String((b as Record<string, unknown>)[groupBy] ?? '');
      return av.localeCompare(bv);
    });
    return sorted;
  }, [rows, groupBy]);

  const onRowClicked = useCallback(
    (event: RowClickedEvent) => {
      if (onRowClick) {
        onRowClick(event.data);
      }
    },
    [onRowClick],
  );

  return (
    <div
      className={`ag-theme-meridian ${densityClass}`}
      style={{ width: '100%', height: '100%' }}
    >
      <AgGridReact
        columnDefs={columns}
        rowData={processedRows}
        components={components}
        onRowClicked={onRowClick ? onRowClicked : undefined}
        rowSelection={onRowClick ? { mode: 'singleRow' } : undefined}
        suppressCellFocus
      />
    </div>
  );
}
