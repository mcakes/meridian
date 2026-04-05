interface TokenSwatchProps { color: string; name: string; hex: string; variable: string; }

export function TokenSwatch({ color, name, hex, variable }: TokenSwatchProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: 'var(--bg-surface)', padding: '8px 12px', borderRadius: 2 }}>
      <div style={{ width: 28, height: 28, backgroundColor: color, borderRadius: 2, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{hex}</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{variable}</div>
      </div>
    </div>
  );
}
