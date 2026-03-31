import type { ReactNode } from 'react';

interface PanelHeaderProps {
  title: string;
  actions?: ReactNode;
}

export function PanelHeader({ title, actions }: PanelHeaderProps) {
  return (
    <div
      style={{
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </span>
      {actions !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </div>
  );
}
