# Dropdown Menu — Design Spec

## Purpose

Add a DropdownMenu component for action menus attached to buttons/icons (overflow menus, row actions, toolbar dropdowns). Distinct from Select (which is for form value selection).

## Architecture

Compound component wrapping `@radix-ui/react-dropdown-menu` with Meridian styling. Lives in a new `menus/` component category.

### Sub-components

| Sub-component | Role |
|---|---|
| `DropdownMenu` | Root — manages open state, wraps Radix.Root |
| `DropdownMenu.Trigger` | Wraps consumer's element via `asChild` |
| `DropdownMenu.Content` | Floating menu panel, rendered in a Portal |
| `DropdownMenu.Label` | Non-interactive group heading |
| `DropdownMenu.Item` | Clickable action |
| `DropdownMenu.Separator` | Horizontal divider |

### Props

**Content:**
- `side?: 'top' | 'right' | 'bottom' | 'left'` — default `'bottom'`
- `align?: 'start' | 'center' | 'end'` — default `'start'`
- `sideOffset?: number` — default `4`

**Item:**
- `onSelect: () => void`
- `disabled?: boolean`
- `variant?: 'default' | 'destructive'`
- `shortcut?: string` — display-only hint (e.g. `"⌘D"`)

## Visual Styling

All inline styles using CSS custom properties, matching existing Select pattern.

- **Content panel:** `var(--bg-surface)` background, `1px solid var(--border-default)` border, `border-radius: 6px`, `padding: 4px 0`, subtle box-shadow for depth
- **Items:** `padding: 6px 8px`, `margin: 0 4px`, `border-radius: 4px`
- **Item hover/focus:** `var(--bg-highlight)` background
- **Disabled items:** `opacity: 0.5`, `pointer-events: none`
- **Destructive items:** `var(--color-negative)` text color; hover background `color-mix(in srgb, var(--color-negative) 12%, transparent)`
- **Labels:** `var(--text-caption)` font, `var(--text-muted)` color, `padding: 6px 8px`
- **Separator:** `1px solid var(--border-subtle)`, `margin: 4px 0`
- **Shortcut hint:** right-aligned, `var(--text-muted)` color, `var(--text-caption)` font
- **Focus ring:** `box-shadow: 0 0 0 2px var(--color-info)`
- **Transitions:** `150ms ease`, respects `prefers-reduced-motion`

## File Structure

| File | Purpose |
|---|---|
| `src/components/menus/DropdownMenu.tsx` | Component implementation |
| `src/components/index.ts` | Add exports under new `// menus` section |
| `src/site/pages/components/MenusPage.tsx` | Showcase page with demos |
| `src/site/router.tsx` | Add route for menus page |

## Keyboard Interaction

Handled entirely by Radix — arrow keys to navigate, Enter/Space to select, Escape to close. No custom keyboard code needed.

## Dependencies

- Install `@radix-ui/react-dropdown-menu` (not currently in package.json)

## Scope Exclusions

- No checkbox/radio items (add later if needed)
- No submenus (add later if needed)
- No built-in trigger button — consumer provides their own element
