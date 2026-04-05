interface TokenTableProps { columns: string[]; rows: string[][]; }

export function TokenTable({ columns, rows }: TokenTableProps) {
  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 4, overflow: 'hidden', margin: '16px 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {columns.map((col) => (
              <th key={col} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border-subtle)' : 'none', backgroundColor: i % 2 === 1 ? 'var(--bg-muted)' : 'transparent' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '6px 12px', color: 'var(--text-primary)', fontFamily: cell.startsWith('#') || cell.startsWith('--') ? 'var(--font-mono)' : undefined }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
