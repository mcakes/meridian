import { useTheme } from '@/hooks/useTheme';

export function TopBar() {
  const { theme, toggle } = useTheme();

  return (
    <div
      style={{
        height: 48,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 20px',
        gap: 16,
      }}
    >
      <span
        style={{
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: 'var(--text-primary)',
        }}
      >
        MERIDIAN
      </span>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        Design System
      </span>
      <div style={{ flex: 1 }} />
      <button
        onClick={toggle}
        style={{
          backgroundColor: 'var(--bg-muted)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-primary)',
          fontSize: 12,
          padding: '4px 10px',
          borderRadius: 2,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {theme === 'dark' ? '☀ Light' : '☾ Dark'}
      </button>
      <a
        href="https://github.com/anthropics/meridian"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: 'var(--text-secondary)',
          fontSize: 12,
          padding: '4px 10px',
          border: '1px solid var(--border-subtle)',
          borderRadius: 2,
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        GitHub ↗
      </a>
    </div>
  );
}
