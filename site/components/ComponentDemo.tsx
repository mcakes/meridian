import type { ReactNode } from 'react';

interface ComponentDemoProps { label: string; children: ReactNode; }

export function ComponentDemo({ label, children }: ComponentDemoProps) {
  return (
    <div style={{ margin: '16px 0' }}>
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 8 }}>{label}</div>
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: 20 }}>{children}</div>
    </div>
  );
}
