import { useTheme } from '@/hooks/useTheme';

interface NavBarProps {
  currentPreset: string | null;
  presets: string[];
  onPresetChange: (name: string) => void;
}

export function NavBar({ currentPreset, presets, onPresetChange }: NavBarProps) {
  const { theme, toggle } = useTheme();

  return (
    <div
      style={{
        height: 40,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 12px',
        gap: 16,
      }}
    >
      {/* Left: Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
          }}
        >
          MERIDIAN
        </span>
        <span
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
          }}
        >
          v0.1
        </span>
      </div>

      {/* Center: Workspace preset selector */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <select
          value={currentPreset ?? ''}
          onChange={(e) => onPresetChange(e.target.value)}
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            fontSize: 13,
            padding: '2px 8px',
            borderRadius: 4,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {currentPreset === null && (
            <option value="" disabled>
              Custom layout
            </option>
          )}
          {presets.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Right: Theme toggle */}
      <button
        onClick={toggle}
        style={{
          backgroundColor: 'var(--bg-muted)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-primary)',
          fontSize: 12,
          padding: '3px 10px',
          borderRadius: 4,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {theme === 'dark' ? '☀ Light' : '☾ Dark'}
      </button>
    </div>
  );
}
