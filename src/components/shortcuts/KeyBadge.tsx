import { formatKeyForDisplay } from './hotkeys';

const isMac =
  typeof navigator !== 'undefined' &&
  /mac/i.test((navigator as any).userAgentData?.platform ?? navigator.platform ?? '');

interface KeyBadgeProps {
  hotkey: string;
  muted?: boolean;
}

export function KeyBadge({ hotkey, muted = false }: KeyBadgeProps) {
  const parts = formatKeyForDisplay(hotkey, isMac);

  return (
    <span style={{ display: 'inline-flex', gap: 3 }}>
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
