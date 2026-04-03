import { useState } from 'react';
import { Section } from '@/site/components/Section';
import { ComponentDemo } from '@/site/components/ComponentDemo';
import { Toggle } from '@/components/inputs/Toggle';
import { NumberInput } from '@/components/inputs/NumberInput';
import { Select } from '@/components/inputs/Select';
import { DatePicker } from '@/components/inputs/DatePicker';
import { Autocomplete } from '@/components/inputs/Autocomplete';

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
        <ComponentDemo label="Date Picker">
          <div style={{ width: 200 }}>
            <DatePicker value={date} onChange={setDate} label="Settlement Date" />
          </div>
        </ComponentDemo>
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
              onSelect={() => {}}
              placeholder="Search instruments..."
              label="Instrument"
            />
          </div>
        </ComponentDemo>
      </Section>
    </div>
  );
}
