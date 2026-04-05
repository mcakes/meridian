import { Section } from '../../components/Section';
import { ComponentDemo } from '../../components/ComponentDemo';
import { DropdownMenu } from '@/components/menus/DropdownMenu';

const triggerStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-muted)',
  border: '1px solid var(--border-default)',
  color: 'var(--text-primary)',
  fontSize: 12,
  padding: '6px 12px',
  borderRadius: 2,
  cursor: 'pointer',
};

export default function MenusPage() {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        Menus
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        Action menus for buttons and icons. Built on Radix UI DropdownMenu with Meridian styling.
      </p>

      <Section title="DropdownMenu">
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 12px 0' }}>
          Compound component for action menus. Supports group labels, separators, keyboard shortcut hints, disabled items, and a destructive variant.
        </p>

        <ComponentDemo label="Basic Action Menu">
          <DropdownMenu>
            <DropdownMenu.Trigger>
              <button style={triggerStyle}>Actions ▾</button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Label>File</DropdownMenu.Label>
              <DropdownMenu.Item onSelect={() => {}}>New Window</DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => {}} shortcut="⌘S">Save Layout</DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Label>Danger Zone</DropdownMenu.Label>
              <DropdownMenu.Item variant="destructive" onSelect={() => {}}>Reset Workspace</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        </ComponentDemo>

        <ComponentDemo label="With Disabled Items">
          <DropdownMenu>
            <DropdownMenu.Trigger>
              <button style={triggerStyle}>Order ▾</button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item onSelect={() => {}}>Edit Order</DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => {}} disabled>Duplicate (limit reached)</DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item variant="destructive" onSelect={() => {}}>Cancel Order</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        </ComponentDemo>

        <ComponentDemo label="Alignment & Side">
          <div style={{ display: 'flex', gap: 12 }}>
            <DropdownMenu>
              <DropdownMenu.Trigger>
                <button style={triggerStyle}>Bottom Start (default)</button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item onSelect={() => {}}>Option A</DropdownMenu.Item>
                <DropdownMenu.Item onSelect={() => {}}>Option B</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenu.Trigger>
                <button style={triggerStyle}>Bottom End</button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end">
                <DropdownMenu.Item onSelect={() => {}}>Option A</DropdownMenu.Item>
                <DropdownMenu.Item onSelect={() => {}}>Option B</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
          </div>
        </ComponentDemo>
      </Section>
    </div>
  );
}
