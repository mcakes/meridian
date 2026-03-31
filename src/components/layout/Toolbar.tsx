import type { ReactNode } from 'react';

interface ToolbarProps {
  children: ReactNode;
}

export function Toolbar({ children }: ToolbarProps) {
  return (
    <div
      style={{
        height: 32,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
        padding: '0 8px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}
