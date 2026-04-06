import { useState } from 'react';
import { Section } from '../../components/Section';
import { ComponentDemo } from '../../components/ComponentDemo';
import { Toggle } from '@/components/inputs/Toggle';
import { NumberInput } from '@/components/inputs/NumberInput';
import { Select } from '@/components/inputs/Select';
import { DatePicker } from '@/components/inputs/DatePicker';
import { Autocomplete } from '@/components/inputs/Autocomplete';
import { Button } from '@/components/inputs/Button';

export default function InputsPage() {
  const [toggle1, setToggle1] = useState(true);
  const [toggle2, setToggle2] = useState(false);
  const [num, setNum] = useState(10);
  const [selectVal, setSelectVal] = useState('equities');
  const [date, setDate] = useState<Date | null>(new Date());

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        Inputs
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        Form controls styled with Meridian tokens. All inputs support focus ring, keyboard navigation, and theme switching.
      </p>

      <Section title="Button">
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 12px 0' }}>
          Reusable button with built-in hover and focus states. Three variants (default, ghost, destructive),
          two sizes (sm, md), and an icon-only mode. Works with Radix triggers via forwardRef.
        </p>
        <ComponentDemo label="Variants">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Button>Default</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </ComponentDemo>
        <ComponentDemo label="Sizes">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
          </div>
        </ComponentDemo>
        <ComponentDemo label="Icon mode">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Button icon size="sm" aria-label="Add">+</Button>
            <Button icon aria-label="Add">+</Button>
            <Button icon variant="ghost" aria-label="Close">✕</Button>
          </div>
        </ComponentDemo>
        <ComponentDemo label="Disabled">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Button disabled>Default</Button>
            <Button variant="ghost" disabled>Ghost</Button>
            <Button variant="destructive" disabled>Destructive</Button>
          </div>
        </ComponentDemo>
      </Section>

      <Section title="Toggle">
        <ComponentDemo label="Toggle">
          <div style={{ display: 'flex', gap: 24 }}>
            <Toggle value={toggle1} onChange={setToggle1} label="Dark mode" />
            <Toggle value={toggle2} onChange={setToggle2} label="Notifications" />
          </div>
        </ComponentDemo>
      </Section>

      <Section title="NumberInput">
        <ComponentDemo label="Number Input">
          <div style={{ width: 200 }}>
            <NumberInput value={num} onChange={setNum} min={0} max={100} step={1} suffix="qty" label="Quantity" />
          </div>
        </ComponentDemo>
      </Section>

      <Section title="Select">
        <ComponentDemo label="Select">
          <div style={{ width: 200 }}>
            <Select
              value={selectVal}
              onChange={setSelectVal}
              options={[
                { value: 'equities', label: 'Equities' },
                { value: 'fixed-income', label: 'Fixed Income' },
                { value: 'fx', label: 'FX' },
                { value: 'crypto', label: 'Crypto' },
              ]}
              label="Asset Class"
            />
          </div>
        </ComponentDemo>
      </Section>

      <Section title="DatePicker">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px 0', lineHeight: 1.7 }}>
          Keyboard-first date entry with three editable segments: day, month, and year.
          Click a segment or use Tab to move between them. The calendar dropdown is available
          via the trailing button for visual date picking.
        </p>
        <ComponentDemo label="Date Picker">
          <div style={{ width: 200 }}>
            <DatePicker value={date} onChange={setDate} label="Settlement Date" />
          </div>
        </ComponentDemo>
        <div
          style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            lineHeight: 1.8,
            marginTop: 12,
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: '4px 16px',
          }}
        >
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Left / Right</span>
          <span>Move between segments</span>
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Up / Down</span>
          <span>Increment / decrement the active segment</span>
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Shift+Up / Down</span>
          <span>Increment / decrement the whole date by one day</span>
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>0-9</span>
          <span>Type a numeric value into the active segment</span>
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>a-z</span>
          <span>Type month by name (on the month segment)</span>
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>/ - Space Tab</span>
          <span>Advance to the next segment</span>
        </div>
      </Section>

      <Section title="Autocomplete">
        <ComponentDemo label="Autocomplete">
          <div style={{ width: 300 }}>
            <Autocomplete
              items={[
                { label: 'Apple Inc.', value: 'AAPL', sublabel: 'NASDAQ' },
                { label: 'Microsoft Corp.', value: 'MSFT', sublabel: 'NASDAQ' },
                { label: 'Alphabet Inc.', value: 'GOOGL', sublabel: 'NASDAQ' },
                { label: 'NVIDIA Corp.', value: 'NVDA', sublabel: 'NASDAQ' },
                { label: 'AMD Inc.', value: 'AMD', sublabel: 'NASDAQ' },
                { label: 'Johnson & Johnson', value: 'JNJ', sublabel: 'NYSE' },
                { label: 'Pfizer Inc.', value: 'PFE', sublabel: 'NYSE' },
                { label: 'Exxon Mobil', value: 'XOM', sublabel: 'NYSE' },
              ]}
              onChange={() => {}}
              placeholder="Search instruments..."
              label="Instrument"
            />
          </div>
        </ComponentDemo>
      </Section>
    </div>
  );
}
