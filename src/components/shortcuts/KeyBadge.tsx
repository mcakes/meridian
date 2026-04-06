// src/components/shortcuts/KeyBadge.tsx
import { formatKeyForDisplay } from './hotkeys';

const isMac =
  typeof navigator !== 'undefined' &&
  /mac/i.test((navigator as any).userAgentData?.platform ?? navigator.platform ?? '');

interface KeyBadgeProps {
  hotkey: string;
  muted?: boolean;
  onClick?: () => void;
  recording?: boolean;
}

export function KeyBadge({ hotkey, muted = false, onClick, recording = false }: KeyBadgeProps) {
  if (recording) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '1px 8px',
          fontSize: 11,
          fontFamily: 'monospace',
          lineHeight: '18px',
          color: 'var(--text-muted)',
          border: '1px solid var(--color-info)',
          borderRadius: 2,
          animation: 'pulse-border 1.5s ease-in-out infinite',
        }}
      >
        Press keys…
      </span>
    );
  }

  const parts = formatKeyForDisplay(hotkey, isMac);

  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex',
        gap: 3,
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      {parts.map((part, i) => (
        <kbd
          key={i}
          style={{
            display: 'inline-block',
            padding: '1px 5px',
            fontSize: 11,
            fontFamily: 'monospace',
            lineHeight: '18px',
            color: muted ? 'var(--text-muted)' : 'var(--text-primary)',
            backgroundColor: 'var(--bg-muted)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 2,
          }}
        >
          {part}
        </kbd>
      ))}
    </span>
  );
}
