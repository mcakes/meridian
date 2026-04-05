# Button Component Design

## Problem

Every button in Meridian is a raw `<button>` with inline styles and manual hover/focus handlers. The same patterns (border hover, ghost hover, focus ring) are duplicated across NavBar triggers, theme toggles, modal close buttons, calendar navigation, and sidebar icon buttons. A reusable Button component eliminates this duplication and ensures consistent interaction states.

## Location

`src/components/inputs/Button.tsx` — alongside Select, Toggle, and other interactive components.

## Props

```ts
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'destructive';
  size?: 'sm' | 'md';
  icon?: boolean;
  children: ReactNode;
}
```

- `variant` — controls colors, borders, and hover behavior. Default: `'default'`
- `size` — controls font size, padding, and icon-only dimensions. Default: `'md'`
- `icon` — when true, renders as a square button sized for icon-only content
- All standard button HTML attributes pass through (onClick, disabled, aria-label, type, etc.)
- Uses `forwardRef` so it works with Radix `asChild` patterns (e.g. DropdownMenu.Trigger)

## Variants

### default
Bordered button for primary toolbar actions.
- Background: `--bg-surface`
- Border: `1px solid --border-default`
- Text: `--text-primary`
- Hover: border changes to `--border-active`
- Disabled: opacity 0.5, cursor default

### ghost
Minimal button for icon actions and secondary controls.
- Background: transparent
- Border: none
- Text: `--text-secondary`
- Hover: background changes to `--bg-highlight`
- Disabled: opacity 0.5, cursor default

### destructive
For delete/remove actions.
- Background: transparent
- Border: `1px solid --border-default`
- Text: `--color-negative`
- Hover: background `color-mix(in srgb, var(--color-negative) 12%, transparent)`, border `--color-negative`
- Disabled: opacity 0.5, cursor default

## Sizes

| Property | sm | md |
|---|---|---|
| Font size | 12px | 13px |
| Padding | 2px 8px | 4px 10px |
| Icon-only dimensions | 24x24 | 28x28 |
| Border radius | 2px | 2px |

When `icon` is true, padding is replaced by centering content within the fixed square dimensions.

## Focus State (all variants)

`box-shadow: 0 0 0 2px var(--color-info)` — matches the existing focus pattern used by Select, Toggle, Autocomplete, and NumberInput.

## Transitions

`border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease` — matches existing 150ms ease convention throughout the library.

## Implementation

Inline styles with `onMouseEnter`/`onMouseLeave`/`onFocus`/`onBlur` handlers. No CSS file. This is consistent with how Select, Toggle, NumberInput, and other input components handle interaction states.

## Export

Add `Button` and `ButtonProps` to `src/components/index.ts`.
