import type { ReactNode } from 'react';
import { Toolbar } from './Toolbar';

interface PanelProps {
  toolbar?: ReactNode;
  children: ReactNode;
}

export function Panel({ toolbar, children }: PanelProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {toolbar !== undefined && <Toolbar>{toolbar}</Toolbar>}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          minHeight: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
