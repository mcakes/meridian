import './ag-grid-meridian.css';

import { useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  colorSchemeDark,
  colorSchemeLight,
} from 'ag-grid-community';
import type { ColDef, RowClickedEvent } from 'ag-grid-community';
import { useTheme } from '@/hooks/useTheme';

import {
  NumericCell,
  ChangeCell,
  BadgeCell,
  SparklineCell,
  ActionCell,
} from './cell-renderers';

ModuleRegistry.registerModules([AllCommunityModule]);

const darkTheme = themeQuartz.withPart(colorSchemeDark).withParams({
  backgroundColor: '#24283b',
  foregroundColor: '#c0caf5',
  borderColor: '#292e42',
  chromeBackgroundColor: '#24283b',
  headerFontSize: 11,
  headerFontWeight: 500,
  fontSize: 13,
  rowHeight: 32,
  headerHeight: 28,
  cellHorizontalPadding: 8,
  borderRadius: 0,
  oddRowBackgroundColor: '#292e42',
  rowHoverColor: '#3b4261',
  selectedRowBackgroundColor: '#343a52',
  fontFamily: "var(--font-sans)",
});

const lightTheme = themeQuartz.withPart(colorSchemeLight).withParams({
  backgroundColor: '#f8f8fb',
  foregroundColor: '#1a1b26',
  borderColor: '#d8d8de',
  chromeBackgroundColor: '#f8f8fb',
  headerFontSize: 11,
  headerFontWeight: 500,
  fontSize: 13,
  rowHeight: 32,
  headerHeight: 28,
  cellHorizontalPadding: 8,
  borderRadius: 0,
  oddRowBackgroundColor: '#e8e8ed',
  rowHoverColor: '#e0e0e6',
  selectedRowBackgroundColor: '#d8d8de',
  fontFamily: "var(--font-sans)",
});

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
  const { theme: currentTheme } = useTheme();
  const agTheme = currentTheme === 'dark' ? darkTheme : lightTheme;

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
        theme={agTheme}
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
