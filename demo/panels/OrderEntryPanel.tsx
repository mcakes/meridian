import { useState } from 'react';
import { Panel } from '@/components/layout/Panel';
import { Toolbar } from '@/components/layout/Toolbar';
import { Button } from '@/components/inputs/Button';
import { Select } from '@/components/inputs/Select';
import { NumberInput } from '@/components/inputs/NumberInput';
import { DatePicker } from '@/components/inputs/DatePicker';
import { Toggle } from '@/components/inputs/Toggle';
import { Autocomplete } from '@/components/inputs/Autocomplete';
import { useDataContext } from '../providers/DataProvider';
import { useMarketData } from '../hooks/useMarketData';
import { fmt } from '@/lib/format';

const ORDER_TYPES = [
  { value: 'limit', label: 'Limit' },
  { value: 'market', label: 'Market' },
  { value: 'stop', label: 'Stop' },
  { value: 'stop-limit', label: 'Stop Limit' },
];

const TIF_OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'gtc', label: 'GTC' },
  { value: 'ioc', label: 'IOC' },
  { value: 'fok', label: 'FOK' },
];

export function OrderEntryPanel() {
  const { provider, selectedSymbol, setSelectedSymbol } = useDataContext();
  const { price, bid, ask } = useMarketData(selectedSymbol);

  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState('limit');
  const [quantity, setQuantity] = useState(100);
  const [limitPrice, setLimitPrice] = useState(0);
  const [stopPrice, setStopPrice] = useState(0);
  const [tif, setTif] = useState('day');
  const [expiry, setExpiry] = useState<Date | null>(null);
  const [allOrNone, setAllOrNone] = useState(false);
  const [reduceOnly, setReduceOnly] = useState(false);

  const instrumentItems = provider.instruments.map((inst) => ({
    label: inst.symbol,
    value: inst.symbol,
    sublabel: inst.name,
  }));

  const showLimit = orderType === 'limit' || orderType === 'stop-limit';
  const showStop = orderType === 'stop' || orderType === 'stop-limit';

  const sideColor = side === 'buy' ? 'var(--color-positive)' : 'var(--color-negative)';

  return (
    <Panel>
      <Toolbar>
        <Button
          size="sm"
          variant={side === 'buy' ? 'default' : 'ghost'}
          onClick={() => setSide('buy')}
          style={side === 'buy' ? { color: 'var(--color-positive)', borderColor: 'var(--color-positive)' } : undefined}
        >
          Buy
        </Button>
        <Button
          size="sm"
          variant={side === 'sell' ? 'default' : 'ghost'}
          onClick={() => setSide('sell')}
          style={side === 'sell' ? { color: 'var(--color-negative)', borderColor: 'var(--color-negative)' } : undefined}
        >
          Sell
        </Button>
        <div style={{ flex: 1 }} />
        {selectedSymbol && (
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            {fmt(bid)} / {fmt(ask)}
          </span>
        )}
      </Toolbar>

      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
        <Autocomplete
          label="Instrument"
          items={instrumentItems}
          placeholder="Search symbol..."
          onSelect={(item) => setSelectedSymbol(item.value)}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Select
            label="Order Type"
            value={orderType}
            onChange={setOrderType}
            options={ORDER_TYPES}
          />
          <Select
            label="Time in Force"
            value={tif}
            onChange={setTif}
            options={TIF_OPTIONS}
          />
        </div>

        <NumberInput
          label="Quantity"
          value={quantity}
          onChange={setQuantity}
          min={1}
          step={100}
        />

        {showLimit && (
          <NumberInput
            label="Limit Price"
            value={limitPrice ?? price}
            onChange={setLimitPrice}
            min={0}
            step={0.01}
          />
        )}

        {showStop && (
          <NumberInput
            label="Stop Price"
            value={stopPrice ?? price}
            onChange={setStopPrice}
            min={0}
            step={0.01}
          />
        )}

        <DatePicker
          label="Expiry Date"
          value={expiry}
          onChange={setExpiry}
        />

        <div style={{ display: 'flex', gap: 16 }}>
          <Toggle value={allOrNone} onChange={setAllOrNone} label="All or None" />
          <Toggle value={reduceOnly} onChange={setReduceOnly} label="Reduce Only" />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <Button
            style={{
              flex: 1,
              justifyContent: 'center',
              backgroundColor: `color-mix(in srgb, ${sideColor} 15%, var(--bg-surface))`,
              borderColor: sideColor,
              color: sideColor,
              fontWeight: 600,
            }}
            onClick={() => {
              console.log('[OrderEntry] Submit:', {
                side, orderType, quantity, limitPrice, stopPrice, tif, expiry, allOrNone, reduceOnly,
                symbol: selectedSymbol,
              });
            }}
          >
            {side === 'buy' ? 'Buy' : 'Sell'} {selectedSymbol ?? '—'}
          </Button>
          <Button variant="ghost" onClick={() => {
            setQuantity(100);
            setLimitPrice(0);
            setStopPrice(0);
            setAllOrNone(false);
            setReduceOnly(false);
          }}>
            Reset
          </Button>
        </div>
      </div>
    </Panel>
  );
}
