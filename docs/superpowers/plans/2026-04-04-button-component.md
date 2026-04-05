# Button Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a reusable Button component with variant/size/icon support and built-in hover/focus states.

**Architecture:** Single-file component using forwardRef, inline styles, and mouse/focus event handlers. No CSS file — matches the pattern used by Select, Toggle, and other input components. Tests use vitest + @testing-library/react.

**Tech Stack:** React, TypeScript, vitest, @testing-library/react, @testing-library/user-event

---

### File Structure

- **Create:** `src/components/inputs/Button.tsx` — the component
- **Create:** `src/components/inputs/__tests__/Button.test.tsx` — tests
- **Modify:** `src/components/index.ts` — add export
- **Modify:** `demo/NavBar.tsx` — migrate to use Button

---

### Task 1: Write Button tests

**Files:**
- Create: `src/components/inputs/__tests__/Button.test.tsx`

- [ ] **Step 1: Write the test file**

```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

afterEach(() => cleanup());

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeDefined();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick} disabled>Click</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies disabled styling', () => {
    render(<Button disabled>Click</Button>);
    const btn = screen.getByRole('button');
    expect(btn.style.opacity).toBe('0.5');
    expect(btn.style.cursor).toBe('default');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Click</Button>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });

  it('passes through HTML attributes', () => {
    render(<Button aria-label="Close" type="submit">X</Button>);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-label')).toBe('Close');
    expect(btn.getAttribute('type')).toBe('submit');
  });

  describe('variant="default"', () => {
    it('has bordered styling', () => {
      render(<Button variant="default">Click</Button>);
      const btn = screen.getByRole('button');
      expect(btn.style.backgroundColor).toBe('var(--bg-surface)');
      expect(btn.style.border).toBe('1px solid var(--border-default)');
      expect(btn.style.color).toBe('var(--text-primary)');
    });

    it('changes border color on hover', () => {
      render(<Button>Click</Button>);
      const btn = screen.getByRole('button');
      fireEvent.mouseEnter(btn);
      expect(btn.style.borderColor).toBe('var(--border-active)');
      fireEvent.mouseLeave(btn);
      expect(btn.style.borderColor).toBe('var(--border-default)');
    });
  });

  describe('variant="ghost"', () => {
    it('has transparent styling', () => {
      render(<Button variant="ghost">Click</Button>);
      const btn = screen.getByRole('button');
      expect(btn.style.backgroundColor).toBe('transparent');
      expect(btn.style.border).toBe('none');
      expect(btn.style.color).toBe('var(--text-secondary)');
    });

    it('changes background on hover', () => {
      render(<Button variant="ghost">Click</Button>);
      const btn = screen.getByRole('button');
      fireEvent.mouseEnter(btn);
      expect(btn.style.backgroundColor).toBe('var(--bg-highlight)');
      fireEvent.mouseLeave(btn);
      expect(btn.style.backgroundColor).toBe('transparent');
    });
  });

  describe('variant="destructive"', () => {
    it('has destructive styling', () => {
      render(<Button variant="destructive">Delete</Button>);
      const btn = screen.getByRole('button');
      expect(btn.style.color).toBe('var(--color-negative)');
      expect(btn.style.border).toBe('1px solid var(--border-default)');
    });

    it('changes background and border on hover', () => {
      render(<Button variant="destructive">Delete</Button>);
      const btn = screen.getByRole('button');
      fireEvent.mouseEnter(btn);
      expect(btn.style.backgroundColor).toBe('color-mix(in srgb, var(--color-negative) 12%, transparent)');
      expect(btn.style.borderColor).toBe('var(--color-negative)');
    });
  });

  describe('size="sm"', () => {
    it('applies small sizing', () => {
      render(<Button size="sm">Click</Button>);
      const btn = screen.getByRole('button');
      expect(btn.style.fontSize).toBe('12px');
      expect(btn.style.padding).toBe('2px 8px');
    });
  });

  describe('size="md"', () => {
    it('applies medium sizing (default)', () => {
      render(<Button>Click</Button>);
      const btn = screen.getByRole('button');
      expect(btn.style.fontSize).toBe('13px');
      expect(btn.style.padding).toBe('4px 10px');
    });
  });

  describe('icon mode', () => {
    it('applies square dimensions for md', () => {
      render(<Button icon aria-label="Close">X</Button>);
      const btn = screen.getByRole('button');
      expect(btn.style.width).toBe('28px');
      expect(btn.style.height).toBe('28px');
      expect(btn.style.padding).toBe('0px');
    });

    it('applies square dimensions for sm', () => {
      render(<Button icon size="sm" aria-label="Close">X</Button>);
      const btn = screen.getByRole('button');
      expect(btn.style.width).toBe('24px');
      expect(btn.style.height).toBe('24px');
    });
  });

  it('shows focus ring on focus', () => {
    render(<Button>Click</Button>);
    const btn = screen.getByRole('button');
    fireEvent.focus(btn);
    expect(btn.style.boxShadow).toBe('0 0 0 2px var(--color-info)');
    fireEvent.blur(btn);
    expect(btn.style.boxShadow).toBe('none');
  });

  it('does not show hover effects when disabled', () => {
    render(<Button disabled>Click</Button>);
    const btn = screen.getByRole('button');
    fireEvent.mouseEnter(btn);
    expect(btn.style.borderColor).not.toBe('var(--border-active)');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/inputs/__tests__/Button.test.tsx`
Expected: FAIL — `Button` module not found

- [ ] **Step 3: Commit**

```bash
git add src/components/inputs/__tests__/Button.test.tsx
git commit -m "test: add Button component tests"
```

---

### Task 2: Implement the Button component

**Files:**
- Create: `src/components/inputs/Button.tsx`

- [ ] **Step 1: Write the Button component**

```tsx
import { forwardRef, useCallback } from 'react';
import type { ReactNode, CSSProperties, ButtonHTMLAttributes } from 'react';

type Variant = 'default' | 'ghost' | 'destructive';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: boolean;
  children: ReactNode;
}

const sizeConfig = {
  sm: { fontSize: 12, padding: '2px 8px', iconSize: 24 },
  md: { fontSize: 13, padding: '4px 10px', iconSize: 28 },
} as const;

const variantConfig = {
  default: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
  },
  ghost: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
  },
  destructive: {
    backgroundColor: 'transparent',
    border: '1px solid var(--border-default)',
    color: 'var(--color-negative)',
  },
} as const;

function getBaseStyle(variant: Variant, size: Size, icon: boolean, disabled: boolean): CSSProperties {
  const v = variantConfig[variant];
  const s = sizeConfig[size];

  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: icon ? 'center' : undefined,
    gap: icon ? undefined : 4,
    backgroundColor: v.backgroundColor,
    border: v.border,
    color: v.color,
    fontSize: s.fontSize,
    padding: icon ? 0 : s.padding,
    width: icon ? s.iconSize : undefined,
    height: icon ? s.iconSize : undefined,
    borderRadius: 2,
    cursor: disabled ? 'default' : 'pointer',
    outline: 'none',
    opacity: disabled ? 0.5 : 1,
    transition: 'border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease',
  };
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'default', size = 'md', icon = false, disabled = false, style, children, ...rest },
  ref,
) {
  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      const el = e.currentTarget;
      if (variant === 'default') {
        el.style.borderColor = 'var(--border-active)';
      } else if (variant === 'ghost') {
        el.style.backgroundColor = 'var(--bg-highlight)';
      } else if (variant === 'destructive') {
        el.style.backgroundColor = 'color-mix(in srgb, var(--color-negative) 12%, transparent)';
        el.style.borderColor = 'var(--color-negative)';
      }
    },
    [variant, disabled],
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const el = e.currentTarget;
      const v = variantConfig[variant];
      el.style.backgroundColor = v.backgroundColor;
      if (variant === 'default' || variant === 'destructive') {
        el.style.borderColor = '';
      }
    },
    [variant],
  );

  const handleFocus = useCallback((e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-info)';
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = 'none';
  }, []);

  return (
    <button
      ref={ref}
      disabled={disabled}
      style={{ ...getBaseStyle(variant, size, icon, disabled), ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...rest}
    >
      {children}
    </button>
  );
});

export type { ButtonProps };
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `npx vitest run src/components/inputs/__tests__/Button.test.tsx`
Expected: All tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/inputs/Button.tsx
git commit -m "feat: add Button component with variant/size/icon support"
```

---

### Task 3: Export from index

**Files:**
- Modify: `src/components/index.ts`

- [ ] **Step 1: Add Button export**

In `src/components/index.ts`, add to the Inputs section (after the Autocomplete line):

```ts
export { Button } from './inputs/Button';
export type { ButtonProps } from './inputs/Button';
```

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: Clean build, no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/index.ts
git commit -m "feat: export Button from component index"
```

---

### Task 4: Migrate demo NavBar to use Button

**Files:**
- Modify: `demo/NavBar.tsx`

- [ ] **Step 1: Replace inline button styles with Button component**

Replace the entire contents of `demo/NavBar.tsx` with:

```tsx
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
```

This removes `triggerStyle`, `handleTriggerEnter`, `handleTriggerLeave`, and the inline-styled theme toggle button. All three buttons now use `<Button size="sm">`.

- [ ] **Step 2: Run type check and verify in browser**

Run: `npx tsc --noEmit`
Expected: Clean build

Verify in browser: toolbar buttons should have hover (border highlight) and focus (blue ring) states.

- [ ] **Step 3: Commit**

```bash
git add demo/NavBar.tsx
git commit -m "refactor(demo): migrate NavBar buttons to Button component"
```
