import { useId } from 'react';
import './inputs.css';

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}

export function Toggle({ value, onChange, label }: ToggleProps) {
  const toggleId = useId();
  return (
    <label
      htmlFor={toggleId}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <button
        id={toggleId}
        className="m-toggle-track"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        style={{
          backgroundColor: value ? 'var(--color-info)' : 'var(--bg-muted)',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: 2,
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: value ? 'var(--text-inverse)' : 'var(--text-secondary)',
            transform: value ? 'translateX(16px)' : 'translateX(0)',
            transition: 'transform 150ms ease, background-color 150ms ease',
            display: 'block',
          }}
        />
      </button>
      {label && (
        <span style={{ color: 'var(--text-primary)', fontSize: 13 }}>
          {label}
        </span>
      )}
    </label>
  );
}
