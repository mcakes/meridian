# Dropdown Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a compound DropdownMenu component wrapping Radix UI for action menus on buttons/icons.

**Architecture:** Compound component (`DropdownMenu`, `.Trigger`, `.Content`, `.Label`, `.Item`, `.Separator`) wrapping `@radix-ui/react-dropdown-menu` with Meridian inline styles and design tokens. Follows Select's pattern for Radix integration.

**Tech Stack:** React 19, @radix-ui/react-dropdown-menu, Vitest + @testing-library/react

---

### Task 1: Install Radix Dropdown Menu

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the package**

```bash
npm install @radix-ui/react-dropdown-menu
```

- [ ] **Step 2: Verify installation**

```bash
grep "react-dropdown-menu" package.json
```

Expected: `"@radix-ui/react-dropdown-menu": "^X.X.X"` appears in dependencies.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install @radix-ui/react-dropdown-menu"
```

---

### Task 2: Write failing tests for DropdownMenu

**Files:**
- Create: `src/components/menus/__tests__/DropdownMenu.test.tsx`

- [ ] **Step 1: Write the test file**

```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DropdownMenu } from '../DropdownMenu';

afterEach(() => cleanup());

describe('DropdownMenu', () => {
  function renderMenu(itemProps?: Record<string, unknown>) {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    return {
      onEdit,
      onDelete,
      ...render(
        <DropdownMenu>
          <DropdownMenu.Trigger>
            <button>Actions</button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Label>File</DropdownMenu.Label>
            <DropdownMenu.Item onSelect={onEdit} {...itemProps}>Edit</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item variant="destructive" onSelect={onDelete}>Delete</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>,
      ),
    };
  }

  it('renders the trigger', () => {
    renderMenu();
    expect(screen.getByRole('button', { name: 'Actions' })).toBeDefined();
  });

  it('opens on trigger click and shows items', async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeDefined();
  });

  it('shows group labels', async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    expect(screen.getByText('File')).toBeDefined();
  });

  it('calls onSelect when an item is clicked', async () => {
    const user = userEvent.setup();
    const { onEdit } = renderMenu();
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('renders shortcut hint when provided', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>
          <button>Actions</button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={() => {}} shortcut="⌘E">Edit</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    expect(screen.getByText('⌘E')).toBeDefined();
  });

  it('does not call onSelect for disabled items', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>
          <button>Actions</button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={onEdit} disabled>Edit</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(onEdit).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Check that @testing-library/user-event is available**

```bash
grep "user-event" package.json
```

If not present, install it:

```bash
npm install -D @testing-library/user-event
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npx vitest run src/components/menus/__tests__/DropdownMenu.test.tsx
```

Expected: FAIL — cannot find module `../DropdownMenu`.

- [ ] **Step 4: Commit**

```bash
git add src/components/menus/__tests__/DropdownMenu.test.tsx package.json package-lock.json
git commit -m "test: add failing tests for DropdownMenu"
```

---

### Task 3: Implement DropdownMenu component

**Files:**
- Create: `src/components/menus/DropdownMenu.tsx`

- [ ] **Step 1: Create the component file**

```tsx
import * as Radix from '@radix-ui/react-dropdown-menu';
import type { ReactNode, CSSProperties } from 'react';

/* ------------------------------------------------------------------ */
/* Root                                                                */
/* ------------------------------------------------------------------ */

interface RootProps {
  children: ReactNode;
}

function Root({ children }: RootProps) {
  return <Radix.Root>{children}</Radix.Root>;
}

/* ------------------------------------------------------------------ */
/* Trigger                                                             */
/* ------------------------------------------------------------------ */

interface TriggerProps {
  children: ReactNode;
}

function Trigger({ children }: TriggerProps) {
  return <Radix.Trigger asChild>{children}</Radix.Trigger>;
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

interface ContentProps {
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

const contentStyle: CSSProperties = {
  backgroundColor: 'var(--bg-surface)',
  border: '1px solid var(--border-default)',
  borderRadius: 6,
  padding: '4px 0',
  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
  zIndex: 9999,
  minWidth: 160,
};

function Content({ children, side = 'bottom', align = 'start', sideOffset = 4 }: ContentProps) {
  return (
    <Radix.Portal>
      <Radix.Content side={side} align={align} sideOffset={sideOffset} style={contentStyle}>
        {children}
      </Radix.Content>
    </Radix.Portal>
  );
}

/* ------------------------------------------------------------------ */
/* Label                                                               */
/* ------------------------------------------------------------------ */

interface LabelProps {
  children: ReactNode;
}

const labelStyle: CSSProperties = {
  padding: '6px 12px',
  fontSize: 11,
  lineHeight: '14px',
  fontWeight: 400,
  color: 'var(--text-muted)',
  userSelect: 'none',
};

function Label({ children }: LabelProps) {
  return <Radix.Label style={labelStyle}>{children}</Radix.Label>;
}

/* ------------------------------------------------------------------ */
/* Separator                                                           */
/* ------------------------------------------------------------------ */

const separatorStyle: CSSProperties = {
  height: 1,
  backgroundColor: 'var(--border-subtle)',
  margin: '4px 0',
};

function Separator() {
  return <Radix.Separator style={separatorStyle} />;
}

/* ------------------------------------------------------------------ */
/* Item                                                                */
/* ------------------------------------------------------------------ */

interface ItemProps {
  children: ReactNode;
  onSelect: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive';
  shortcut?: string;
}

function itemStyle(variant: 'default' | 'destructive', disabled: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 8px',
    margin: '0 4px',
    borderRadius: 4,
    fontSize: 13,
    lineHeight: '18px',
    cursor: disabled ? 'default' : 'pointer',
    outline: 'none',
    color: variant === 'destructive' ? 'var(--color-negative)' : 'var(--text-primary)',
    opacity: disabled ? 0.5 : 1,
    userSelect: 'none',
    transition: 'background-color 150ms ease',
  };
}

const shortcutStyle: CSSProperties = {
  fontSize: 11,
  lineHeight: '14px',
  color: 'var(--text-muted)',
  marginLeft: 16,
};

function Item({ children, onSelect, disabled = false, variant = 'default', shortcut }: ItemProps) {
  return (
    <Radix.Item
      disabled={disabled}
      onSelect={onSelect}
      style={itemStyle(variant, disabled)}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLDivElement).style.backgroundColor =
            variant === 'destructive'
              ? 'color-mix(in srgb, var(--color-negative) 12%, transparent)'
              : 'var(--bg-highlight)';
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
      }}
    >
      <span>{children}</span>
      {shortcut && <span style={shortcutStyle}>{shortcut}</span>}
    </Radix.Item>
  );
}

/* ------------------------------------------------------------------ */
/* Compound export                                                     */
/* ------------------------------------------------------------------ */

export const DropdownMenu = Object.assign(Root, {
  Trigger,
  Content,
  Label,
  Item,
  Separator,
});
```

- [ ] **Step 2: Run the tests**

```bash
npx vitest run src/components/menus/__tests__/DropdownMenu.test.tsx
```

Expected: All 6 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/menus/DropdownMenu.tsx
git commit -m "feat: implement DropdownMenu compound component"
```

---

### Task 4: Add barrel export

**Files:**
- Modify: `src/components/index.ts`

- [ ] **Step 1: Add menus section to barrel exports**

Add the following after the existing Feedback section (around line 38) in `src/components/index.ts`:

```ts
// Menus
export { DropdownMenu } from './menus/DropdownMenu';
```

- [ ] **Step 2: Verify build still works**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/index.ts
git commit -m "feat: export DropdownMenu from component barrel"
```

---

### Task 5: Create showcase page

**Files:**
- Create: `src/site/pages/components/MenusPage.tsx`
- Modify: `src/site/router.tsx`
- Modify: `src/site/components/Sidebar.tsx`

- [ ] **Step 1: Create the MenusPage**

```tsx
import { Section } from '@/site/components/Section';
import { ComponentDemo } from '@/site/components/ComponentDemo';
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
```

- [ ] **Step 2: Add route to router.tsx**

In `src/site/router.tsx`, add the following line after the shortcuts route (line 49):

```ts
{ path: 'components/menus', element: lazyPage(() => import('./pages/components/MenusPage')) },
```

- [ ] **Step 3: Add nav link in Sidebar.tsx**

In `src/site/components/Sidebar.tsx`, add to the Components group items array (after the Shortcuts entry, around line 54):

```ts
{ label: 'Menus', path: '/components/menus' },
```

- [ ] **Step 4: Verify the dev server renders the page**

```bash
npm run dev
```

Open `http://localhost:5173/components/menus` and confirm the page renders with all three demos. Click each trigger and verify menus open, items highlight on hover, and the destructive variant shows red text.

- [ ] **Step 5: Commit**

```bash
git add src/site/pages/components/MenusPage.tsx src/site/router.tsx src/site/components/Sidebar.tsx
git commit -m "feat: add Menus showcase page with DropdownMenu demos"
```

---

### Task 6: Run full test suite and type check

**Files:** None (verification only)

- [ ] **Step 1: Run type check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 2: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass, including the new DropdownMenu tests.

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors.
