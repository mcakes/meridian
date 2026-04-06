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
  HeatmapCellRenderer,
} from './cell-renderers';

ModuleRegistry.registerModules([AllCommunityModule]);

const densityParams = {
  compact:     { fontSize: 12, dataFontSize: 12, rowHeight: 24, headerHeight: 24, cellHorizontalPadding: 6 },
  default:     { fontSize: 13, dataFontSize: 13, rowHeight: 32, headerHeight: 28, cellHorizontalPadding: 8 },
  comfortable: { fontSize: 13, dataFontSize: 13, rowHeight: 40, headerHeight: 32, cellHorizontalPadding: 10 },
} as const;

const darkParams = {
  backgroundColor: '#24283b',
  foregroundColor: '#c0caf5',
  borderColor: '#292e42',
  chromeBackgroundColor: '#24283b',
  headerFontSize: 11,
  headerFontWeight: 500,
  borderRadius: 0,
  wrapperBorderRadius: 0,
  oddRowBackgroundColor: '#292e42',
  rowHoverColor: '#3b4261',
  selectedRowBackgroundColor: '#343a52',
  fontFamily: "var(--font-sans)",
};

const lightParams = {
  backgroundColor: '#f5f5fa',
  foregroundColor: '#1a1b26',
  borderColor: '#ccccd8',
  chromeBackgroundColor: '#f5f5fa',
  headerFontSize: 11,
  headerFontWeight: 500,
  borderRadius: 0,
  wrapperBorderRadius: 0,
  oddRowBackgroundColor: '#eaeaf0',
  rowHoverColor: '#e4e4eb',
  selectedRowBackgroundColor: '#dcdce8',
  fontFamily: "var(--font-sans)",
};

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
  const colorScheme = currentTheme === 'dark' ? colorSchemeDark : colorSchemeLight;
  const themeParams = currentTheme === 'dark' ? darkParams : lightParams;
  const agTheme = themeQuartz
    .withPart(colorScheme)
    .withParams({ ...themeParams, ...densityParams[density] });

  const components = useMemo(
    () => ({
      NumericCell,
      ChangeCell,
      BadgeCell,
      SparklineCell,
      ActionCell,
      HeatmapCellRenderer,
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
      className="ag-theme-meridian"
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
