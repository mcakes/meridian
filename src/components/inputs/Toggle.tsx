interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}

export function Toggle({ value, onChange, label }: ToggleProps) {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        style={{
          position: 'relative',
          width: 36,
          height: 20,
          borderRadius: 10,
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          backgroundColor: value ? 'var(--color-info)' : 'var(--bg-muted)',
          transition: 'background-color 150ms ease',
          flexShrink: 0,
          outline: 'none',
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            '0 0 0 2px var(--color-info)';
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
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
            backgroundColor: value ? '#ffffff' : 'var(--text-muted)',
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
