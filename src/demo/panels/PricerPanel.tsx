import { Panel } from '@/components/layout/Panel';
import { MetricCard } from '@/components/primitives/MetricCard';
import { CatDot } from '@/components/primitives/CatDot';
import { useDataContext } from '@/providers/DataProvider';
import { useMarketData } from '@/hooks/useMarketData';
import { fmt, fmtK } from '@/lib/format';

interface SectionHeaderProps {
  index: number;
  label: string;
}

function SectionHeader({ index, label }: SectionHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
        marginTop: 12,
      }}
    >
      <CatDot index={index} />
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-secondary)',
        }}
      >
        {label}
      </span>
    </div>
  );
}

interface MetricGridProps {
  children: React.ReactNode;
}

function MetricGrid({ children }: MetricGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: 6,
      }}
    >
      {children}
    </div>
  );
}

export function PricerPanel() {
  const { selectedSymbol } = useDataContext();
  const { price, bid, ask, volume } = useMarketData(selectedSymbol);

  const title = `Pricer — ${selectedSymbol ?? ''}`;

  return (
    <Panel title={title}>
      {!selectedSymbol ? (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: 14,
          }}
        >
          Select an instrument
        </div>
      ) : (
        <div style={{ padding: '0 12px 12px' }}>
          {/* Market Data */}
          <SectionHeader index={0} label="Market Data" />
          <MetricGrid>
            <MetricCard label="Price" value={fmt(price)} />
            <MetricCard label="Bid" value={fmt(bid)} />
            <MetricCard label="Ask" value={fmt(ask)} />
            <MetricCard label="Volume" value={fmtK(volume)} />
          </MetricGrid>

          {/* Volatility */}
          <SectionHeader index={1} label="Volatility" />
          <MetricGrid>
            <MetricCard label="IV" value="25.00%" />
            <MetricCard label="HV" value="20.00%" />
            <MetricCard label="IV Rank" value="45" />
          </MetricGrid>

          {/* Rates */}
          <SectionHeader index={2} label="Rates" />
          <MetricGrid>
            <MetricCard label="Risk-Free Rate" value="5.25%" />
            <MetricCard label="Div. Yield" value="0.55%" />
          </MetricGrid>

          {/* Greeks */}
          <SectionHeader index={3} label="Greeks" />
          <MetricGrid>
            <MetricCard label="Delta" value="0.55" />
            <MetricCard label="Gamma" value="0.035" />
            <MetricCard label="Vega" value="0.18" />
            <MetricCard label="Theta" value="-0.045" />
          </MetricGrid>
        </div>
      )}
    </Panel>
  );
}
