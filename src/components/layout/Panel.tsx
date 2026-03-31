import type { ReactNode } from 'react';
import { PanelHeader } from './PanelHeader';
import { Toolbar } from './Toolbar';

interface PanelProps {
  title: string;
  toolbar?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

export function Panel({ title, toolbar, actions, children }: PanelProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <PanelHeader title={title} actions={actions} />
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
