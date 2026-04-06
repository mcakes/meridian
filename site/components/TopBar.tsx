import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/inputs/Button';

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
      <Button size="sm" onClick={toggle}>
        {theme === 'dark' ? '☀ Light' : '☾ Dark'}
      </Button>
    </div>
  );
}
