import type { ReactNode } from 'react';

interface FigureProps { caption: string; children: ReactNode; }

export function Figure({ caption, children }: FigureProps) {
  return (
    <figure style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: 16, margin: '16px 0' }}>
      <figcaption style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 12 }}>{caption}</figcaption>
      {children}
    </figure>
  );
}
