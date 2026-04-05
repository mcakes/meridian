import { useTheme } from '@/hooks/useTheme';
import { DropdownMenu } from '@/components/menus/DropdownMenu';
import { Button } from '@/components/inputs/Button';
import type { PanelDefinition } from './panels/panel-registry';

interface NavBarProps {
  currentPreset: string | null;
  presets: string[];
  onPresetChange: (name: string) => void;
  panelTypes: PanelDefinition[];
  onAddPanel: (type: string, title: string) => void;
}

const caretStyle: React.CSSProperties = {
  fontSize: 10,
  color: 'var(--text-muted)',
  marginLeft: 2,
};

export function NavBar({
  currentPreset,
  presets,
  onPresetChange,
  panelTypes,
  onAddPanel,
}: NavBarProps) {
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
        boxShadow: '0 1px 4px var(--shadow-elevation)',
        padding: '0 12px',
        gap: 16,
        position: 'relative',
        zIndex: 1,
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

      {/* Center: Workspace preset selector + Add Panel */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 8 }}>
        <DropdownMenu>
          <DropdownMenu.Trigger>
            <Button size="sm">
              {currentPreset ?? 'Custom layout'} <span style={caretStyle}>▼</span>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="center">
            {presets.map((name) => (
              <DropdownMenu.Item key={name} onSelect={() => onPresetChange(name)}>
                {name}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenu.Trigger>
            <Button size="sm">
              + Add Panel <span style={caretStyle}>▼</span>
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="center">
            {panelTypes.map((def) => (
              <DropdownMenu.Item key={def.type} onSelect={() => onAddPanel(def.type, def.title)}>
                {def.title}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>

      {/* Right: Theme toggle */}
      <Button size="sm" onClick={toggle}>
        {theme === 'dark' ? '☀ Light' : '☾ Dark'}
      </Button>
    </div>
  );
}
