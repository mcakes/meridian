import { SidebarProvider } from '@/components/layout/sidebar/SidebarProvider';
import { Sidebar } from '@/components/layout/sidebar/Sidebar';
import { Palette } from '@/components/layout/sidebar/Palette';
import { Section } from '../../components/Section';
import { ComponentDemo } from '../../components/ComponentDemo';

function FilterIcon() {
  return <span style={{ fontSize: 12 }}>&#9783;</span>;
}

function BellIcon() {
  return <span style={{ fontSize: 12 }}>&#9854;</span>;
}

function StarIcon() {
  return <span style={{ fontSize: 12 }}>&#9733;</span>;
}

function GearIcon() {
  return <span style={{ fontSize: 12 }}>&#9881;</span>;
}

export default function SidebarPage() {
  return (
    <div>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 8,
        }}
      >
        Sidebar & Palette
      </h1>
      <p
        style={{
          fontSize: 15,
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
        }}
      >
        Fixed rails flanking the workspace with collapsible, reorderable tool palettes. Sidebars
        expand and collapse via a toggle button and are resizable when expanded. Palettes can be
        dragged to reorder within a sidebar or moved between sidebars.
      </p>

      <Section title="Basic Usage">
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
          Wrap your layout in <code>SidebarProvider</code>, place <code>Sidebar</code> components
          on either side, and fill them with <code>Palette</code> sections.
        </p>
        <ComponentDemo label="Left sidebar with two palettes">
          <div style={{ height: 280 }}>
            <SidebarProvider>
              <Sidebar side="left" defaultExpanded defaultWidth={220}>
                <Palette id="filters" title="Filters" icon={<FilterIcon />} defaultExpanded>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Asset Class</span>
                      <span style={{ fontSize: 10, color: 'var(--text-primary)', background: 'var(--bg-muted)', padding: '2px 8px', borderRadius: 2 }}>Equities</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Region</span>
                      <span style={{ fontSize: 10, color: 'var(--text-primary)', background: 'var(--bg-muted)', padding: '2px 8px', borderRadius: 2 }}>EMEA</span>
                    </div>
                  </div>
                </Palette>
                <Palette id="alerts" title="Alerts" icon={<BellIcon />}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No active alerts</div>
                </Palette>
              </Sidebar>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  fontSize: 13,
                  height: '100%',
                }}
              >
                Workspace content area
              </div>
            </SidebarProvider>
          </div>
        </ComponentDemo>
      </Section>

      <Section title="Dual Sidebars">
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
          Both left and right sidebars can be rendered simultaneously. Palettes can be dragged
          between them.
        </p>
        <ComponentDemo label="Left and right sidebars">
          <div style={{ height: 300 }}>
            <SidebarProvider>
              <Sidebar side="left" defaultExpanded defaultWidth={200}>
                <Palette id="watchlist" title="Watchlist" icon={<StarIcon />} defaultExpanded>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {['AAPL', 'MSFT', 'GOOGL'].map((sym) => (
                      <div key={sym} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
                        <span>{sym}</span>
                        <span style={{ color: 'var(--color-positive)' }}>+0.4%</span>
                      </div>
                    ))}
                  </div>
                </Palette>
              </Sidebar>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  fontSize: 13,
                  height: '100%',
                }}
              >
                Workspace
              </div>
              <Sidebar side="right" defaultExpanded defaultWidth={200}>
                <Palette id="settings" title="Settings" icon={<GearIcon />} defaultExpanded>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Theme</span>
                      <span style={{ fontSize: 10, color: 'var(--text-primary)', background: 'var(--bg-muted)', padding: '2px 8px', borderRadius: 2 }}>Dark</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Refresh</span>
                      <span style={{ fontSize: 10, color: 'var(--text-primary)', background: 'var(--bg-muted)', padding: '2px 8px', borderRadius: 2 }}>1s</span>
                    </div>
                  </div>
                </Palette>
                <Palette id="actions" title="Quick Actions" icon={<FilterIcon />}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ background: 'var(--color-accent)', borderRadius: 4, padding: '4px 8px', fontSize: 11, color: 'var(--text-inverse)', textAlign: 'center', cursor: 'pointer' }}>
                      New Order
                    </div>
                    <div style={{ background: 'var(--bg-muted)', borderRadius: 4, padding: '4px 8px', fontSize: 11, color: 'var(--text-primary)', textAlign: 'center', cursor: 'pointer' }}>
                      Export Data
                    </div>
                  </div>
                </Palette>
              </Sidebar>
            </SidebarProvider>
          </div>
        </ComponentDemo>
      </Section>

      <Section title="Collapsed State">
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
          When collapsed, the sidebar shows a narrow icon strip. Click an icon to expand the
          sidebar and focus that palette. Click the toggle chevron to expand without focusing a
          specific palette.
        </p>
        <ComponentDemo label="Sidebar starting collapsed">
          <div style={{ height: 200 }}>
            <SidebarProvider>
              <Sidebar side="left">
                <Palette id="col-filters" title="Filters" icon={<FilterIcon />}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Filter controls here</div>
                </Palette>
                <Palette id="col-alerts" title="Alerts" icon={<BellIcon />}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Alert list here</div>
                </Palette>
                <Palette id="col-settings" title="Settings" icon={<GearIcon />}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Settings here</div>
                </Palette>
              </Sidebar>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  fontSize: 13,
                  height: '100%',
                }}
              >
                Click icons in the collapsed rail to expand
              </div>
            </SidebarProvider>
          </div>
        </ComponentDemo>
      </Section>

      <Section title="API Reference">
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '16px 0 8px' }}>SidebarProvider</h3>
        <table style={{ width: '100%', fontSize: 12, color: 'var(--text-secondary)', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-primary)' }}>Prop</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-primary)' }}>Type</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-primary)' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '6px 8px' }}><code>children</code></td>
              <td style={{ padding: '6px 8px' }}><code>ReactNode</code></td>
              <td style={{ padding: '6px 8px' }}>Sidebar and content elements</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '6px 8px' }}><code>state?</code></td>
              <td style={{ padding: '6px 8px' }}><code>SidebarState</code></td>
              <td style={{ padding: '6px 8px' }}>Controlled state for restoring saved layouts</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '6px 8px' }}><code>onStateChange?</code></td>
              <td style={{ padding: '6px 8px' }}><code>(state: SidebarState) =&gt; void</code></td>
              <td style={{ padding: '6px 8px' }}>Callback when state changes, for persistence</td>
            </tr>
          </tbody>
        </table>

        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '16px 0 8px' }}>Sidebar</h3>
        <table style={{ width: '100%', fontSize: 12, color: 'var(--text-secondary)', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-primary)' }}>Prop</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-primary)' }}>Type</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-primary)' }}>Default</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '6px 8px' }}><code>side</code></td>
              <td style={{ padding: '6px 8px' }}><code>'left' | 'right'</code></td>
              <td style={{ padding: '6px 8px' }}>required</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '6px 8px' }}><code>defaultExpanded?</code></td>
              <td style={{ padding: '6px 8px' }}><code>boolean</code></td>
              <td style={{ padding: '6px 8px' }}><code>false</code></td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '6px 8px' }}><code>defaultWidth?</code></td>
              <td style={{ padding: '6px 8px' }}><code>number</code></td>
              <td style={{ padding: '6px 8px' }}><code>260</code></td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '6px 8px' }}><code>minWidth?</code></td>
              <td style={{ padding: '6px 8px' }}><code>number</code></td>
              <td style={{ padding: '6px 8px' }}><code>200</code></td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '6px 8px' }}><code>maxWidth?</code></td>
              <td style={{ padding: '6px 8px' }}><code>number</code></td>
              <td style={{ padding: '6px 8px' }}><code>480</code></td>
            </tr>
          </tbody>
        </table>

        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '16px 0 8px' }}>Palette</h3>
        <table style={{ width: '100%', fontSize: 12, color: 'var(--text-secondary)', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-primary)' }}>Prop</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-primary)' }}>Type</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-primary)' }}>Default</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '6px 8px' }}><code>id</code></td>
              <td style={{ padding: '6px 8px' }}><code>string</code></td>
              <td style={{ padding: '6px 8px' }}>required</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '6px 8px' }}><code>title</code></td>
              <td style={{ padding: '6px 8px' }}><code>string</code></td>
              <td style={{ padding: '6px 8px' }}>required</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '6px 8px' }}><code>icon</code></td>
              <td style={{ padding: '6px 8px' }}><code>ReactNode</code></td>
              <td style={{ padding: '6px 8px' }}>required</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '6px 8px' }}><code>defaultExpanded?</code></td>
              <td style={{ padding: '6px 8px' }}><code>boolean</code></td>
              <td style={{ padding: '6px 8px' }}><code>false</code></td>
            </tr>
          </tbody>
        </table>
      </Section>
    </div>
  );
}
