# Keyboard Shortcuts — Design Spec

## Overview

A global keyboard shortcut system for Meridian. Independent of the command palette but designed to wire together easily. Components register shortcuts via a provider + hook pattern. A built-in overlay displays all registered shortcuts grouped by category.

## Architecture

Three layers:

### 1. ShortcutProvider (context)

Wraps the app tree. Owns:
- Shortcut registry (merged from all registered sources)
- Single global `keydown` listener
- Collision detection (console.warn in dev, last registered wins)
- Overlay open/close state

### 2. ShortcutOverlay (UI component)

Radix Dialog overlay showing all registered shortcuts grouped by category. Reads from provider context. Trigger hotkey configurable (default `?`).

### 3. useShortcuts (hook)

Gives consuming code access to:
- `register(shortcuts: Shortcut[])` → returns unregister cleanup function
- `shortcuts` — the full registry (read-only, for custom display)
- `open()` / `close()` — control the overlay programmatically
- `isOpen` — overlay state

## Shortcut Registration

```ts
interface Shortcut {
  id: string;
  key: string;              // e.g. "mod+d", "mod+shift+t", "escape", "?"
  label: string;
  category?: string;        // grouping in overlay, e.g. "Navigation", "Workspace"
  description?: string;
  execute: () => void;
  enabled?: boolean;        // default true; when false, listener skips this shortcut
}
```

Components register on mount and unregister on unmount:

```tsx
function WatchlistPanel() {
  const { register } = useShortcuts();

  useEffect(() => {
    return register([
      {
        id: 'watchlist:refresh',
        key: 'mod+r',
        label: 'Refresh Watchlist',
        category: 'Watchlist',
        execute: () => refresh(),
      },
    ]);
  }, []);
}
```

## Integration

```tsx
<ShortcutProvider>
  <ShortcutOverlay hotkey="?" />
  <CommandPaletteProvider hotkey="mod+k">
    <CommandPalette />
    <App />
  </CommandPaletteProvider>
</ShortcutProvider>
```

- `ShortcutProvider` wraps outside `CommandPaletteProvider` — they are independent
- `ShortcutOverlay` placed anywhere inside the provider — renders via portal
- The two systems share nothing at the code level

### Wiring Shortcuts with Command Palette Commands

The systems are independent but share conventions. A consuming app wires them by sharing the `execute` function:

```tsx
function MyFeature() {
  const { register } = useShortcuts();
  const { registerCommands } = useCommandPalette();

  useEffect(() => {
    const execute = () => doThing();

    const unregisterShortcut = register([
      { id: 'my:thing', key: 'mod+d', label: 'Do Thing', category: 'My Feature', execute },
    ]);

    const unregisterCommand = registerCommands([
      { id: 'my:thing', label: 'Do Thing', shortcut: '⌘D', category: 'My Feature', execute },
    ]);

    return () => { unregisterShortcut(); unregisterCommand(); };
  }, []);
}
```

The `shortcut` field on a command remains display-only. The shortcut system handles the actual key listener.

## Hotkey Matching

### Key Syntax

Format: `modifier+modifier+key`

Examples: `mod+k`, `mod+shift+t`, `alt+d`, `escape`, `f1`, `?`

### Supported Modifiers

| Modifier | Mac | Windows/Linux |
|----------|-----|---------------|
| `mod` | Cmd (⌘) | Ctrl |
| `shift` | Shift (⇧) | Shift |
| `alt` | Option (⌥) | Alt |
| `ctrl` | Control (⌃) | Ctrl |

### Matching Rules

- All specified modifiers must be held
- No extra modifiers can be present (`mod+k` does not fire if Shift is also held)
- Case-insensitive key matching
- Matching uses `e.key` (the produced character), not `e.code` (the physical key). So `?` matches `e.key === '?'` directly, not `e.code === 'Slash'` + shiftKey

### Input Suppression

Shortcuts are suppressed when the active element is an `<input>`, `<textarea>`, or `[contenteditable]` — **unless** the shortcut includes at least one modifier (`mod`, `alt`, `ctrl`). This prevents plain letter keys from firing while typing, but allows `mod+k` to work from any context.

### Collision Detection

- On registration, if the same `key` combo is already registered, emit `console.warn` in development: `"Shortcut collision: 'mod+d' registered by 'feature:a', overwriting 'feature:b'"`
- Last registered wins (the previous handler is replaced in the registry)
- Collision detection compares the normalised key string (modifiers sorted alphabetically)

## ShortcutOverlay

### Visual Design

Radix Dialog overlay, visually consistent with the command palette:
- Centered, positioned ~20% from viewport top
- Max width: 480px
- `--bg-surface` background, `--border-default` border, `--radius-lg` (6px)
- Backdrop blur overlay consistent with Modal and CommandPalette

### Layout

Shortcuts grouped by `category`:
- Category headings in `--text-muted`, uppercase, 11px
- Each row: `label` on the left in `--text-secondary`, key combo badges on the right
- Shortcuts without a category grouped under "Other" (rendered last)
- Categories sorted alphabetically
- Disabled shortcuts (`enabled: false`) still appear but with muted styling (`--text-muted` for both label and badges)

### Key Badge Rendering

`mod+shift+t` renders as individual `<kbd>` elements:
- Mac: `⌘` `⇧` `T`
- Other: `Ctrl` `Shift` `T`

Platform detection via `navigator.platform` (or `navigator.userAgentData.platform`).

Badge styling: `--bg-muted` background, `--text-primary` text, `--border-subtle` border, `--radius-sm` (2px), 11px font, monospace.

### Behaviour

- Default trigger: `?` (Shift+/)
- Configurable via `hotkey` prop on `ShortcutOverlay`
- Escape closes
- The overlay registers its own trigger as a shortcut internally (appears in the overlay under "Help" category)

### Props

```ts
interface ShortcutOverlayProps {
  hotkey?: string;  // default "?"
}
```

## Keyboard Interaction

| Key | Action |
|-----|--------|
| `?` (configurable) | Toggle overlay open/close |
| `Escape` | Close overlay |

## File Structure

```
src/components/shortcuts/
  types.ts                  — Shortcut, ShortcutContextValue
  hotkeys.ts                — parseHotkey, matchesHotkey, normaliseKey, formatKeyForDisplay
  ShortcutProvider.tsx       — context, registry, global listener, collision detection
  useShortcuts.ts            — public hook
  ShortcutOverlay.tsx        — overlay UI component
  KeyBadge.tsx               — renders a key combo as styled <kbd> elements
```

Exported from `src/components/index.ts` as:
- `ShortcutProvider`
- `ShortcutOverlay`
- `useShortcuts`
- Types: `Shortcut`
