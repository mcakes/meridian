import { Section } from '../../components/Section';
import { ComponentDemo } from '../../components/ComponentDemo';
import { DataTable } from '@/components/data/DataTable';
import type { ColDef } from 'ag-grid-community';

const SAMPLE_ROWS = [
  { symbol: 'AAPL', name: 'Apple Inc.', last: 187.42, changePct: 2.45, volume: 52300000 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', last: 378.91, changePct: -0.82, volume: 28100000 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', last: 141.80, changePct: 1.15, volume: 18900000 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', last: 875.30, changePct: 3.21, volume: 41200000 },
  { symbol: 'AMD', name: 'AMD Inc.', last: 162.45, changePct: -1.53, volume: 35600000 },
];

const COLUMNS: ColDef[] = [
  { field: 'symbol', headerName: 'Symbol', flex: 1, minWidth: 70, cellStyle: { textAlign: 'left', fontWeight: 600 } },
  { field: 'name', headerName: 'Name', flex: 2, minWidth: 120, cellStyle: { textAlign: 'left', color: 'var(--text-secondary)' } },
  { field: 'last', headerName: 'Last', flex: 1, minWidth: 70, cellRenderer: 'NumericCell', cellRendererParams: { decimals: 2 } },
  { field: 'changePct', headerName: 'Change %', flex: 1, minWidth: 90, cellRenderer: 'ChangeCell' },
  { field: 'volume', headerName: 'Volume', flex: 1, minWidth: 80, valueFormatter: (p: any) => (p.value / 1e6).toFixed(1) + 'M', cellStyle: { textAlign: 'right', fontVariantNumeric: 'tabular-nums' } },
];

export default function DataTablePage() {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        Data Table
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        AG Grid wrapper with Meridian theming, custom cell renderers, density modes, and row grouping.
      </p>

      <Section title="Density Modes">
        <ComponentDemo label="Compact (24px rows)">
          <div style={{ height: 200 }}>
            <DataTable columns={COLUMNS} rows={SAMPLE_ROWS} density="compact" />
          </div>
        </ComponentDemo>

        <ComponentDemo label="Default (32px rows)">
          <div style={{ height: 200 }}>
            <DataTable columns={COLUMNS} rows={SAMPLE_ROWS} density="default" />
          </div>
        </ComponentDemo>

        <ComponentDemo label="Comfortable (40px rows)">
          <div style={{ height: 200 }}>
            <DataTable columns={COLUMNS} rows={SAMPLE_ROWS} density="comfortable" />
          </div>
        </ComponentDemo>
      </Section>

      <Section title="Cell Renderers">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '12px 0' }}>
          <strong>NumericCell</strong> — right-aligned tabular with flash-on-update.{' '}
          <strong>ChangeCell</strong> — PriceChange with redundant encoding.{' '}
          <strong>BadgeCell</strong> — Tag component.{' '}
          <strong>SparklineCell</strong> — inline SVG.{' '}
          <strong>ActionCell</strong> — icon button.
        </p>
      </Section>
    </div>
  );
}
