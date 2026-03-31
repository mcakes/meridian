import { useRef, useState } from 'react';

interface NumberInputProps {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  label?: string;
}

function clamp(value: number, min?: number, max?: number): number {
  let result = value;
  if (min !== undefined) result = Math.max(min, result);
  if (max !== undefined) result = Math.min(max, result);
  return result;
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  label,
}: NumberInputProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const update = (next: number) => {
    onChange(clamp(next, min, max));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      update(value + (e.shiftKey ? step * 10 : step));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      update(value - (e.shiftKey ? step * 10 : step));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed)) {
      update(parsed);
    }
  };

  const stepperButtonStyle: React.CSSProperties = {
    width: 28,
    flexShrink: 0,
    height: '100%',
    border: 'none',
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: 14,
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  };

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
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'stretch',
          height: 28,
          border: '1px solid var(--border-default)',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: focused ? '0 0 0 2px var(--color-info)' : 'none',
          transition: 'box-shadow 150ms ease',
        }}
      >
        <button
          type="button"
          aria-label="Decrease"
          tabIndex={-1}
          onClick={() => update(value - step)}
          style={{
            ...stepperButtonStyle,
            borderRight: '1px solid var(--border-subtle)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'var(--bg-muted)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'var(--bg-surface)';
          }}
        >
          −
        </button>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            flex: 1,
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <input
            ref={inputRef}
            type="number"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            min={min}
            max={max}
            step={step}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              fontSize: 13,
              textAlign: 'center',
              fontVariantNumeric: 'tabular-nums',
              padding: suffix ? '0 0 0 8px' : '0',
              MozAppearance: 'textfield',
            } as React.CSSProperties}
          />
          {suffix && (
            <span
              style={{
                color: 'var(--text-muted)',
                fontSize: 12,
                paddingRight: 6,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {suffix}
            </span>
          )}
        </div>
        <button
          type="button"
          aria-label="Increase"
          tabIndex={-1}
          onClick={() => update(value + step)}
          style={{
            ...stepperButtonStyle,
            borderLeft: '1px solid var(--border-subtle)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'var(--bg-muted)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'var(--bg-surface)';
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}
