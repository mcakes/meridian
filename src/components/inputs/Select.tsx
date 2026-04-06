import { useState } from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import './inputs.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  label?: string;
}

export function Select({ value, onChange, options, label }: SelectProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? value;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <span
          style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}
        >
          {label}
        </span>
      )}
      <RadixSelect.Root
        value={value}
        onValueChange={onChange}
        open={open}
        onOpenChange={setOpen}
      >
        <RadixSelect.Trigger
          className="m-input-wrap"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            height: 32,
            padding: '0 8px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 2,
            color: 'var(--text-primary)',
            fontSize: 13,
            cursor: 'pointer',
            outline: 'none',
            textAlign: 'left',
          }}
        >
          <RadixSelect.Value>{selectedLabel}</RadixSelect.Value>
          <RadixSelect.Icon>
            <span
              style={{
                display: 'inline-block',
                fontSize: 10,
                color: 'var(--text-muted)',
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 150ms ease',
                marginLeft: 4,
              }}
            >
              ▼
            </span>
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={4}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 4,
              maxHeight: 180,
              overflow: 'auto',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              zIndex: 9999,
              minWidth: 'var(--radix-select-trigger-width)',
            }}
          >
            <RadixSelect.Viewport>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  selected={option.value === value}
                />
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  );
}

interface SelectItemProps {
  value: string;
  label: string;
  selected: boolean;
}

function SelectItem({ value, label, selected }: SelectItemProps) {
  return (
    <RadixSelect.Item
      className="m-select-item"
      value={value}
      style={{
        color: selected ? 'var(--color-info)' : 'var(--text-primary)',
        fontWeight: selected ? 600 : 400,
      }}
    >
      <RadixSelect.ItemText>{label}</RadixSelect.ItemText>
    </RadixSelect.Item>
  );
}
