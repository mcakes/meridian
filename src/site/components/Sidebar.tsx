import { NavLink } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Introduction', path: '/' },
      { label: 'Getting Started', path: '/getting-started' },
    ],
  },
  {
    title: 'Research',
    items: [
      { label: 'Information Density', path: '/research/information-density' },
      { label: 'Color System', path: '/research/color-system' },
      { label: 'Typography', path: '/research/typography' },
      { label: 'Shape & Radius', path: '/research/shape-and-radius' },
      { label: 'Workspace Layout', path: '/research/workspace-layout' },
      { label: 'Notifications', path: '/research/notifications' },
      { label: 'Accessibility', path: '/research/accessibility' },
    ],
  },
  {
    title: 'Tokens',
    items: [
      { label: 'Colors', path: '/tokens/colors' },
      { label: 'Typography', path: '/tokens/typography' },
      { label: 'Spacing', path: '/tokens/spacing' },
      { label: 'Borders & Radius', path: '/tokens/borders' },
    ],
  },
  {
    title: 'Components',
    items: [
      { label: 'Data Table', path: '/components/data-table' },
      { label: 'Chart', path: '/components/chart' },
      { label: 'Workspace', path: '/components/workspace' },
      { label: 'Panel', path: '/components/panel' },
      { label: 'Sidebar & Palette', path: '/components/sidebar' },
      { label: 'Primitives', path: '/components/primitives' },
      { label: 'Inputs', path: '/components/inputs' },
      { label: 'Feedback', path: '/components/feedback' },
      { label: 'Command Palette', path: '/components/command-palette' },
      { label: 'Shortcuts', path: '/components/shortcuts' },
      { label: 'Menus', path: '/components/menus' },
    ],
  },
  {
    title: 'Demo',
    items: [{ label: 'Trading App', path: '/demo' }],
  },
];

const groupLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 1,
  color: 'var(--text-muted)',
  marginBottom: 8,
};

const linkBaseStyle: React.CSSProperties = {
  display: 'block',
  padding: '4px 8px',
  fontSize: 13,
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  borderRadius: 2,
  marginBottom: 2,
};

export function Sidebar() {
  return (
    <nav
      style={{
        width: 220,
        flexShrink: 0,
        backgroundColor: 'var(--bg-base)',
        borderRight: '1px solid var(--border-subtle)',
        padding: '16px 0',
        overflowY: 'auto',
      }}
    >
      {NAV_GROUPS.map((group) => (
        <div key={group.title} style={{ padding: '0 16px', marginBottom: 16 }}>
          <div style={groupLabelStyle}>{group.title}</div>
          {group.items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                ...linkBaseStyle,
                ...(isActive
                  ? {
                      color: 'var(--color-info)',
                      backgroundColor: 'var(--bg-muted)',
                    }
                  : {}),
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}
