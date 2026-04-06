import { useRef, useId } from 'react';
import './inputs.css';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const labelId = useId();

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label
          id={labelId}
          style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}
        >
          {label}
        </label>
      )}
      <div
        className="m-input-wrap"
        style={{
          display: 'inline-flex',
          alignItems: 'stretch',
          height: 28,
          border: '1px solid var(--border-default)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <button
          className="m-stepper"
          type="button"
          aria-label="Decrease"
          tabIndex={0}
          onClick={() => update(value - step)}
          style={{ borderRight: '1px solid var(--border-subtle)' }}
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
            min={min}
            max={max}
            step={step}
            aria-labelledby={label ? labelId : undefined}
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
          className="m-stepper"
          type="button"
          aria-label="Increase"
          tabIndex={0}
          onClick={() => update(value + step)}
          style={{ borderLeft: '1px solid var(--border-subtle)' }}
        >
          +
        </button>
      </div>
    </div>
  );
}
