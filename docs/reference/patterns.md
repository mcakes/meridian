# Pattern Reference

Cross-cutting patterns that span multiple components or govern system-wide behaviour. Each section describes the mechanism, the relevant source files, and how to use or extend the pattern.

---

## Cross-Panel Linking

**The problem:** multiple panels (watchlist, chart, order book) need to share the concept of "the currently selected instrument" without explicit prop drilling.

**How it works:** `DataProvider` (in `src/providers/DataProvider.tsx`) holds a single `selectedSymbol: string | null` in React state and exposes it through context. Any panel that wants to publish a selection calls `setSelectedSymbol`. Any panel that wants to consume the selection reads `selectedSymbol`.

```
DataProvider (context root)
  ├── selectedSymbol: string | null
  └── setSelectedSymbol: (symbol: string) => void
```

**Publisher pattern** (e.g. a watchlist row click):
```tsx
const { setSelectedSymbol } = useDataContext();
// ...
<DataTable onRowClick={(row) => setSelectedSymbol(row.symbol)} />
```

**Subscriber pattern** (e.g. a chart panel):
```tsx
const { selectedSymbol } = useDataContext();
const { getHistory } = useMarketData(selectedSymbol);
```

`DataProvider` also owns the `MarketDataProvider` instance (via `useRef` to prevent re-instantiation on render). The `useMarketData` hook calls `provider.subscribe(symbol, callback)` and returns the unsubscribe function as the `useEffect` cleanup, so subscriptions are automatically cleaned up when a panel unmounts or the selected symbol changes.

**Extending:** To add a second linking dimension (e.g. selected time range), add a second state value to `DataContext` alongside `selectedSymbol`.

**Source files:**
- `src/providers/DataProvider.tsx`
- `src/hooks/useMarketData.ts`

---

## Workspace Persistence

**The problem:** panel positions, sizes, and the active layout preset should survive a page reload.

**How it works:** `useWorkspace` (in `src/hooks/useWorkspace.ts`) wraps FlexLayout React model state with `localStorage` read/write. On mount it reads from `localStorage.getItem('meridian-workspace')`. On every layout change it writes the serialised `IJsonModel` back.

**Storage key:** `meridian-workspace`

**Serialisation format:** The FlexLayout React `Model` serialises to an `IJsonModel` JSON object via `model.toJson()`. The JSON describes the full tree of rows, tabsets, and tabs, including sizes and active tab indices.

```ts
// Example stored value (IJsonModel)
{
  "global": {},
  "layout": {
    "type": "row",
    "children": [
      { "type": "tabset", "weight": 30, "children": [{ "type": "tab", "id": "watchlist", "name": "Watchlist" }] },
      { "type": "tabset", "weight": 70, "children": [{ "type": "tab", "id": "chart", "name": "Chart" }] }
    ]
  }
}
```

**Preset system:** `useWorkspace` accepts a `builtInPresets` record mapping preset names to `IJsonModel` objects. `loadPreset(name)` creates a new `Model` from the preset JSON and persists it. Custom preset saving is currently a stub (`savePreset` is a no-op).

**Hook API:**

| Return value | Type | Description |
|--------------|------|-------------|
| `model` | `Model` | Current FlexLayout React model. Pass to `<Workspace model={model}>`. |
| `setModel` | `(model: Model) => void` | Called when the model changes. Persists the serialised JSON. |
| `presets` | `Record<string, IJsonModel>` | The built-in preset map passed to the hook. |
| `activePreset` | `string \| null` | Name of the last loaded preset, or `null` if layout was modified manually. |
| `loadPreset` | `(name: string) => void` | Activate a named preset and persist it. |
| `savePreset` | `(name: string) => void` | Stub — no-op in current implementation. |
| `resetLayout` | `() => void` | Restore the `defaultLayout` and persist it. |

**Usage:**
```tsx
const { model, setModel, loadPreset, activePreset } = useWorkspace(
  defaultLayout,
  { 'Equity Trading': equityPreset, 'FX Desk': fxPreset }
);

<Workspace model={model} factory={factory} />
```

**Source file:** `src/hooks/useWorkspace.ts`

---

## Flash-on-Update

**The problem:** when a numeric value updates in real time, users need a transient signal that change has occurred and in which direction, without disrupting reading.

**How it works:** the `useFlash` hook compares the current value to its previous value on every render. When a change is detected, it sets a `'up'` or `'down'` direction state and clears it after 100ms via `setTimeout`.

```
value changes
  → compare to prevRef.current
  → set flash direction ('up' | 'down')
  → setTimeout 100ms → set flash null
  → prevRef.current = value
```

`FlashCell` reads the flash direction and applies a `color-mix` background:
- Up flash: `color-mix(in srgb, var(--color-positive) 15%, transparent)`
- Down flash: `color-mix(in srgb, var(--color-negative) 15%, transparent)`

The background transitions back to transparent via `transition: background-color 100ms ease` on the element style. Because the flash direction is cleared after 100ms, the transition has already completed by the time the state resets, so there is no visible jump.

**CSS transition approach:** the transition is applied inline (`style` prop), not via a class. This avoids specificity issues with AG Grid's cell renderer styles.

**prefers-reduced-motion:** the current implementation does not check `prefers-reduced-motion`. To add support, read the media query in `useFlash` or in `FlashCell` and skip setting the flash state when motion is reduced:
```ts
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reducedMotion) setFlash(direction);
```

**Using outside FlashCell:** call `useFlash(value)` directly to get the `'up' | 'down' | null` state and apply your own visual treatment.

```tsx
const flash = useFlash(price);
// flash is 'up', 'down', or null
```

**Source files:**
- `src/hooks/useFlash.ts`
- `src/components/primitives/FlashCell.tsx`

---

## Density Modes

**The problem:** different workflows require different information density. Traders monitoring a small number of positions may prefer comfortable spacing; those scanning a large watchlist need compact rows.

**How it works:** `DataTable` accepts a `density` prop (`'compact' | 'default' | 'comfortable'`). It applies a CSS class (`density-compact` or `density-comfortable`) to the AG Grid container div. The default density has no extra class.

**AG Grid row heights:**

| Mode | Class applied | Row height |
|------|--------------|------------|
| compact | `density-compact` | 24px |
| default | _(none)_ | 32px |
| comfortable | `density-comfortable` | 40px |

Row heights are set in `src/components/data/ag-grid-meridian.css` using AG Grid's CSS custom property `--ag-row-height`.

**Switching at runtime:** pass a new `density` value to `DataTable`. The component re-applies the class on the next render; AG Grid recalculates row heights automatically. The density preference can be persisted in the workspace snapshot or in a separate `localStorage` key.

**Extending to other components:** the `density-compact` / `density-comfortable` classes can also be applied to any parent element to propagate density-aware spacing through child components if needed.

**Source files:**
- `src/components/data/DataTable.tsx`
- `src/components/data/ag-grid-meridian.css`

---

## Keyboard Navigation

**Tab order:** the standard browser tab order is used throughout. No `tabIndex` values above 0 are assigned. Stepper buttons in `NumberInput` use `tabIndex={-1}` to keep them out of the tab sequence — keyboard users control the value via Arrow keys on the input element itself.

**Grid navigation:** AG Grid's built-in keyboard navigation is active. `suppressCellFocus` is set to `false` by default in AG Grid, allowing cell focus. Arrow keys navigate between cells. Enter activates an editable cell.

**Autocomplete keyboard behaviour:**

| Key | Behaviour |
|-----|-----------|
| Arrow Down | Move highlight down through matches |
| Arrow Up | Move highlight up through matches |
| Enter | Select the highlighted match |
| Escape | Close the dropdown |

**DatePicker keyboard behaviour:** the Radix Popover trigger receives focus normally. Day cells inside the calendar are `<button>` elements and can be tabbed to and activated with Enter or Space. Month navigation buttons are keyboard accessible.

**NumberInput keyboard behaviour:**

| Key | Behaviour |
|-----|-----------|
| Arrow Up | Increment by `step` (or `step * 10` with Shift) |
| Arrow Down | Decrement by `step` (or `step * 10` with Shift) |

**Select keyboard behaviour:** delegated entirely to Radix UI Select, which implements the ARIA combobox pattern including Arrow key navigation, Enter to select, and Escape to close.

**Application-level shortcuts (from implementation spec):**

| Shortcut | Action |
|----------|--------|
| `/` | Open global instrument search |
| `Escape` | Dismiss active popover, dropdown, or modal |
| `Arrow keys` | Navigate within focused grid |
| `Ctrl+1`–`Ctrl+9` | Focus panel by position (application-level, not implemented in components) |
| `Ctrl+Shift+Arrow` | Resize focused panel (application-level) |
| `Tab` in order entry | Advance through instrument → quantity → price fields |
| `Enter` in order entry | Submit |

**Focus ring:** all interactive elements use `box-shadow: var(--focus-ring)` on focus, which resolves to `0 0 0 2px var(--color-info)`. Applied via inline style in `onFocus` / `onBlur` handlers in the current implementation.

---

## Theme Switching

**The problem:** the entire application must switch between dark and light colour schemes without a page reload, and the preference must persist.

**How it works:** `ThemeProvider` (in `src/providers/ThemeProvider.tsx`) holds `theme: 'dark' | 'light'` in React state. A `useEffect` writes the value to `document.documentElement.setAttribute('data-theme', theme)` and persists it to `localStorage` under the key `meridian-theme` on every change.

```
ThemeProvider state: 'dark' | 'light'
  → useEffect → document.documentElement.data-theme = 'dark' | 'light'
  → useEffect → localStorage.setItem('meridian-theme', ...)
```

All colour tokens in `src/tokens/colors.css` are scoped under `[data-theme="dark"]` and `[data-theme="light"]` selectors. Because the attribute is on the root element, the cascade applies the correct values everywhere in the document automatically.

**Token cascade:**
```css
[data-theme="dark"]  { --bg-base: #1a1b26; ... }
[data-theme="light"] { --bg-base: #f0f0f3; ... }
```

The theme switch is a single DOM attribute write. No JavaScript iterates over elements; no CSS classes are toggled beyond the root attribute. Rendering is synchronous — there is no flash between the stored preference being read and the attribute being applied because the initial state reads from `localStorage` synchronously in the `useState` initialiser.

**Consuming the theme in components:** use the `useTheme` hook (re-exported from `src/hooks/useTheme.ts`):
```tsx
const { theme, toggle } = useTheme();
// theme is 'dark' | 'light'
// toggle() switches between them
```

`Chart` uses `useTheme` to select the correct Meridian Plotly template at render time, since Plotly layout properties are set in JavaScript rather than CSS.

**ThemeProvider setup:** mount once at the application root, outside any panel or layout component:
```tsx
<ThemeProvider>
  <DataProvider>
    <App />
  </DataProvider>
</ThemeProvider>
```

**Adding theme-aware values in new components:** read CSS custom properties at render time via `getComputedStyle` if needed in JavaScript contexts, or use `var(--token-name)` directly in inline styles. Prefer CSS custom property references over reading values in JavaScript — they update automatically when the attribute changes.

**Source files:**
- `src/providers/ThemeProvider.tsx`
- `src/hooks/useTheme.ts`
- `src/tokens/colors.css`
- `src/components/charting/meridian-plotly-template.ts`
