# Command Palette — Design Spec

## Overview

A pluggable, keyboard-driven command palette for Meridian. The palette is a generic shell — consuming apps inject all commands via a registration API. It supports simple fire-and-forget actions, commands with async context-aware argument steps, custom item renderers, and frequency-based ranking.

## Architecture

Three layers:

### 1. CommandPaletteProvider (context)

Wraps the app tree. Owns:
- Command registry (merged from all registered sources)
- Open/close state
- Global hotkey listener (configurable, default `mod+k` where `mod` = Cmd on Mac, Ctrl elsewhere)
- Frequency tracking map (recents derived from `lastUsed` ordering)

### 2. CommandPalette (UI component)

The overlay. Reads from provider context. Handles:
- Text input and fuzzy filtering
- Arg stepping (breadcrumbs, async option resolution, back navigation)
- Result rendering (standard layout or custom renderer)
- Keyboard navigation

Built on Radix Dialog for focus trapping, portal rendering, and backdrop.

### 3. useCommandPalette (hook)

Gives consuming code access to:
- `open()` / `close()`
- `registerCommands(commands: Command[])` → returns `unregister` cleanup function
- `frequency` map (for optional persistence by consuming app)

## Command Registration

```ts
interface Command {
  id: string;
  label: string;
  description?: string;
  category?: string;
  icon?: ReactNode;
  shortcut?: string;           // display hint only, e.g. "⌘T"
  keywords?: string[];         // extra terms included in fuzzy search
  args?: ArgDefinition[];
  execute: (args?: Record<string, string>) => void;
  renderItem?: (props: ItemRenderProps) => ReactNode;
}

interface ArgDefinition {
  name: string;
  label: string;
  resolve: (context: Record<string, string>) => Promise<ArgOption[]>;
}

interface ArgOption {
  label: string;
  value: string;
  description?: string;
}

interface ItemRenderProps {
  command: Command;
  active: boolean;
  matchRanges: { start: number; end: number }[];
}
```

Components register commands on mount and unregister on unmount:

```tsx
function WatchlistPanel() {
  const { registerCommands } = useCommandPalette();

  useEffect(() => {
    return registerCommands([
      {
        id: 'watchlist:add-instrument',
        label: 'Add Instrument',
        category: 'Watchlist',
        args: [
          { name: 'symbol', label: 'Symbol', resolve: async () => fetchInstruments() }
        ],
        execute: ({ symbol }) => addToWatchlist(symbol),
      },
    ]);
  }, []);
}
```

## Integration

```tsx
<CommandPaletteProvider
  hotkey="mod+k"
  initialFrequency={savedFrequencyMap}  // optional, for cross-session persistence
>
  <Workspace>
    <CommandPalette maxResults={12} />
    {/* panels, content */}
  </Workspace>
</CommandPaletteProvider>
```

- `hotkey` prop configurable by consuming app
- `initialFrequency` prop allows hydrating frequency data from storage (optional)
- `maxResults` on `CommandPalette` caps visible results (default 12)
- `CommandPalette` renders via portal — placement in tree doesn't matter
- Multiple components register commands independently; provider merges them

## State Machine

### States

- **Closed** — nothing visible
- **Open/Search** — input focused, showing filtered results or recents
- **Arg stepping** — walking through argument definitions for a selected command

### Transitions

| From | To | Trigger |
|------|----|---------|
| Closed | Open/Search | Hotkey press |
| Open/Search | Closed | Escape, click outside, hotkey toggle |
| Open/Search | Arg stepping | Enter on command with `args` |
| Open/Search | Closed | Enter on command without `args` (execute immediately) |
| Arg stepping | Previous arg step | Backspace when input is empty |
| Arg stepping (1st arg) | Open/Search | Backspace when input is empty |
| Arg stepping (last arg) | Closed | Enter on final arg option (execute with collected args) |
| Arg stepping | Closed | Escape at any point |

## Arg Stepping Behaviour

When a command with `args` is selected:

1. Breadcrumb trail appears above input: `load-vol › SPX › [source?]`
2. Input clears for each new step
3. `resolve(context)` fires with accumulated selections — context is `{ underlying: "SPX" }` for the second arg, etc.
4. Resolved options populate the results list; user can type to filter them
5. While resolve is in flight, show 3 skeleton placeholder rows
6. If resolve fails, show inline error with option to retry (Enter) or go back (Backspace)
7. On final arg selection, `execute()` fires with full args map and palette closes

## Filtering & Ranking

Uses existing `fuzzyMatch` from `@/lib/format`.

### Search matching

Matches against `label`, `keywords`, and `description` (in that priority). Matched ranges highlighted using the same `HighlightedText` pattern as Autocomplete.

### Score calculation

```
finalScore = fuzzyScore + (0.1 * log(count + 1))
```

- Fuzzy score is primary — bad matches don't surface from frequency alone
- Log dampening prevents a single command from dominating (100x vs 10x matters less than 10x vs 1x)
- `lastUsed` timestamp breaks remaining ties (most recent wins)

### Empty input (default view)

Ordered by `lastUsed` descending — recent commands, up to 10 items.

## Frequency Tracking

Provider maintains:

```ts
Map<commandId, { count: number; lastUsed: number }>
```

- Updated on every successful command execution (including after final arg step)
- Exposed via `useCommandPalette()` so consuming apps can persist/restore if needed
- Provider owns runtime state; app can hydrate via prop for cross-session persistence

## Visual Design

### Layout

- Centered overlay, positioned ~20% from viewport top
- Max width: 520px
- Radix Dialog with backdrop blur overlay (consistent with Modal)

### Structure

```
┌──────────────────────────────────────┐
│ ⌘  [input field]                     │  ← input area
├──────────────────────────────────────┤
│ 🌓  Toggle Theme                     │  ← active (bg-highlight)
│      Switch between dark/light  [⌘T] │
│ 📊  Toggle Threshold Lines           │  ← inactive
│      Show/hide threshold indicators   │
│ 📋  Toggle Throttling                │
│      Enable/disable feed throttling   │
├──────────────────────────────────────┤
│           ↑↓ navigate  ↵ select  esc │  ← footer hints
└──────────────────────────────────────┘
```

During arg stepping, breadcrumbs appear above the input:

```
┌──────────────────────────────────────┐
│ [load-vol] › [SPX] › source          │  ← breadcrumbs
│ ⌘  Select source…                    │  ← input with placeholder
├──────────────────────────────────────┤
│ CBOE                                 │
│   Chicago Board Options Exchange     │
│ ICE                                  │
│   Intercontinental Exchange          │
├──────────────────────────────────────┤
│     ↑↓ navigate  ↵ select  ⌫ back   │
└──────────────────────────────────────┘
```

### Tokens

All Meridian CSS custom properties:

| Element | Token |
|---------|-------|
| Background | `--bg-surface` |
| Border | `--border-default` |
| Active row | `--bg-highlight` |
| Text | `--text-primary`, `--text-secondary`, `--text-muted` |
| Match highlight | `--color-info` at 20% mix |
| Breadcrumb chips | `--color-info` at 10% bg, `--color-info` at 70% text |
| Border radius | `--radius-lg` (6px) for container, `--radius-sm` (2px) for chips/badges |
| Shadow | `0 16px 48px rgba(0,0,0,0.5)` |
| Backdrop | `rgba(0,0,0,0.5)` with `backdrop-filter: blur(4px)` |

### Result item layout

Standard: icon (20px) + label/description (flex) + category badge + shortcut hint

Custom: if `renderItem` is provided on the command, it replaces the standard layout entirely. Receives `{ command, active, matchRanges }`.

### Footer

Contextual keyboard hints:
- Search state: `↑↓ navigate  ↵ select  esc close`
- Arg stepping: `↑↓ navigate  ↵ select  ⌫ back  esc close`

## Keyboard Interaction

| Key | Action |
|-----|--------|
| `mod+k` (configurable) | Toggle palette open/close |
| `Escape` | Close palette (always, from any state) |
| `Arrow Down` / `Arrow Up` | Navigate results |
| `Enter` | Select active result (execute or advance to args) |
| `Backspace` (empty input) | Go back one arg step, or return to search from first arg |
| Any character | Filter results / filter arg options |

## File Structure

```
src/components/command-palette/
  CommandPaletteProvider.tsx   — context, registry, hotkey listener, frequency tracking
  CommandPalette.tsx           — UI overlay component
  useCommandPalette.ts         — public hook
  types.ts                     — Command, ArgDefinition, ArgOption, ItemRenderProps
```

Exported from `src/components/index.ts` as:
- `CommandPaletteProvider`
- `CommandPalette`
- `useCommandPalette`
- Types: `Command`, `ArgDefinition`, `ArgOption`, `ItemRenderProps`
