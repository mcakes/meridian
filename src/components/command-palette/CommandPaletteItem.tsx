import type { Command, ItemRenderProps } from './types';

interface HighlightedTextProps {
  text: string;
  ranges: { start: number; end: number }[];
}

function HighlightedText({ text, ranges }: HighlightedTextProps) {
  if (ranges.length === 0) return <span>{text}</span>;

  const parts: React.ReactNode[] = [];
  let cursor = 0;

  for (const range of ranges) {
    if (cursor < range.start) {
      parts.push(<span key={`p-${cursor}`}>{text.slice(cursor, range.start)}</span>);
    }
    parts.push(
      <mark
        key={`m-${range.start}`}
        style={{
          background: 'color-mix(in srgb, var(--color-info) 20%, transparent)',
          color: 'var(--color-info)',
          borderRadius: 1,
        }}
      >
        {text.slice(range.start, range.end)}
      </mark>,
    );
    cursor = range.end;
  }

  if (cursor < text.length) {
    parts.push(<span key="end">{text.slice(cursor)}</span>);
  }

  return <>{parts}</>;
}

interface CommandPaletteItemProps {
  command: Command;
  active: boolean;
  matchRanges: { start: number; end: number }[];
  onSelect: () => void;
  onHover: () => void;
}

export function CommandPaletteItem({
  command,
  active,
  matchRanges,
  onSelect,
  onHover,
}: CommandPaletteItemProps) {
  // Custom renderer
  if (command.renderItem) {
    const renderProps: ItemRenderProps = { command, active, matchRanges };
    return (
      <div
        onMouseDown={(e) => { e.preventDefault(); onSelect(); }}
        onMouseEnter={onHover}
        style={{
          cursor: 'pointer',
          backgroundColor: active ? 'var(--bg-highlight)' : 'transparent',
        }}
      >
        {command.renderItem(renderProps)}
      </div>
    );
  }

  // Standard layout
  return (
    <div
      onMouseDown={(e) => { e.preventDefault(); onSelect(); }}
      onMouseEnter={onHover}
      style={{
        padding: '8px 16px',
        cursor: 'pointer',
        backgroundColor: active ? 'var(--bg-highlight)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 13,
      }}
    >
      {command.icon && (
        <span style={{ width: 20, textAlign: 'center', flexShrink: 0 }}>
          {command.icon}
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
          <HighlightedText text={command.label} ranges={matchRanges} />
        </div>
        {command.description && (
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              marginTop: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {command.description}
          </div>
        )}
      </div>
      {command.category && (
        <span
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            background: 'color-mix(in srgb, var(--text-muted) 10%, transparent)',
            padding: '2px 6px',
            borderRadius: 2,
            flexShrink: 0,
          }}
        >
          {command.category}
        </span>
      )}
      {command.shortcut && (
        <span
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            fontFamily: 'monospace',
            flexShrink: 0,
          }}
        >
          {command.shortcut}
        </span>
      )}
    </div>
  );
}
