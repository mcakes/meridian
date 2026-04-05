import type { ReactNode } from 'react';

interface SectionProps { title: string; id?: string; children: ReactNode; }

export function Section({ title, id, children }: SectionProps) {
  const anchor = id ?? title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return (
    <section style={{ marginTop: 32 }}>
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 24 }}>
        <h2 id={anchor} style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px 0' }}>{title}</h2>
        {children}
      </div>
    </section>
  );
}
