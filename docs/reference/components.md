# Component Reference

All components are exported from `src/components/index.ts`. Import from that barrel or from the individual file path. Components are organised into six categories matching the source directory structure.

---

## Primitives

Small, stateless display components. They have no internal state and delegate data formatting to the caller.

---

### CatDot

A small coloured square used to associate a row, series, or group with a position in the categorical colour ramp. Used as a visual legend marker in watchlists and table row groups.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `index` | `number` | — | Ramp index (0–7). Maps to `--color-cat-{index}`. |
| `size` | `number` | `8` | Side length in pixels. Applied to both width and height. |

**Usage:**
```tsx
<CatDot index={0} />
<CatDot index={2} size={10} />
```

**Tokens:** `--color-cat-0` through `--color-cat-7`

---

### PriceChange

Displays a numeric change value with directional arrow, sign prefix, and semantic colour. Always renders a redundant text encoding alongside the colour so the direction is machine-readable and accessible.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Change value. Positive = gain, negative = loss, zero = neutral. |
| `decimals` | `number` | `2` | Decimal places for the formatted absolute value. |

**Usage:**
```tsx
<PriceChange value={1.45} />
<PriceChange value={-0.32} decimals={4} />
<PriceChange value={0} />
```

**Tokens:** `--color-positive`, `--color-negative`, `--color-neutral`

---

### FlashCell

Wraps a numeric value and flashes a brief semantic background when the value changes. The flash lasts 100ms and is driven by the `useFlash` hook. `prefers-reduced-motion` is not yet applied at the CSS level — callers that need to suppress animation should gate the component conditionally.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Current numeric value. A change from the previous render triggers the flash. |
| `previousValue` | `number` | — | Not used internally; included in the interface for caller bookkeeping. |
| `format` | `(n: number) => string` | `String` | Formatter applied to `value` before rendering. |

**Usage:**
```tsx
<FlashCell value={price} format={(n) => n.toFixed(2)} />
```

**Tokens:** `--color-positive` (15% mix on up), `--color-negative` (15% mix on down)

---

### MetricCard

A compact KPI card displaying a label, a primary value, and an optional sublabel. Used in summary rows and dashboard panels.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Short uppercase label rendered above the value. |
| `value` | `string \| number` | — | Primary display value. Rendered with tabular numerics. |
| `sublabel` | `string` | — | Optional secondary line below the value (e.g. a unit or context string). |

**Usage:**
```tsx
<MetricCard label="Volume" value="1.2M" sublabel="shares today" />
<MetricCard label="P&L" value={-450.00} />
```

**Tokens:** `--bg-surface`, `--border-subtle`, `--text-secondary`, `--text-primary`, `--text-muted`

---

### Tag

A compact pill badge for categorical status display. Three fixed variants cover the standard pass/warn/fail pattern used in risk and compliance views.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'pass' \| 'warn' \| 'fail'` | — | Controls colour and implied meaning. |
| `children` | `string` | — | Label text displayed inside the tag. |

**Usage:**
```tsx
<Tag variant="pass">APPROVED</Tag>
<Tag variant="warn">REVIEW</Tag>
<Tag variant="fail">REJECTED</Tag>
```

**Tokens:** `--color-positive` (pass), `--color-warning` (warn), `--color-negative` (fail)

---

### ThresholdValue

Displays a numeric value with semantic colour based on configurable thresholds. When a value crosses a threshold, both colour and a shape indicator change, providing redundant encoding. Use for metrics with known operational bounds — latency, error rates, utilisation — where anomalies should surface pre-attentively.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Current numeric value. |
| `warnAt` | `number` | — | Threshold above which the value is warning. |
| `errorAt` | `number` | — | Threshold above which the value is error. |
| `format` | `(n: number) => string` | `String` | Formatter applied to `value` before rendering. |
| `invert` | `boolean` | `false` | When true, thresholds trigger below instead of above (for values where lower is worse). |

**Severity levels:**

| Severity | Indicator | Colour |
|----------|-----------|--------|
| Normal | `●` | `--color-positive` |
| Warning | `▲` | `--color-warning` |
| Error | `⬥` | `--color-negative` |

**Usage:**
```tsx
<ThresholdValue value={42} warnAt={100} errorAt={500} format={v => `${v}ms`} />
<ThresholdValue value={0.12} warnAt={0.5} errorAt={0.8} format={v => `${(v * 100).toFixed(1)}%`} />
<ThresholdValue value={95} warnAt={80} errorAt={50} invert format={v => `${v}%`} />
```

**Tokens:** `--color-positive`, `--color-warning`, `--color-negative`

---

### HealthBar

A compact horizontal bar where width represents a normalised value (0–1) and fill colour represents status. Suitable for table cells, metric cards, and any context where a proportional value and its health status need to be conveyed in minimal vertical space.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Normalised value between 0 and 1. Clamped to bounds. |
| `status` | `'ok' \| 'warn' \| 'error'` | `'ok'` | Determines the fill colour. |
| `height` | `number` | `4` | Bar height in pixels. |
| `label` | `string` | — | Accessible label for screen readers (rendered as `aria-label`). |

**Usage:**
```tsx
<HealthBar value={0.73} status="ok" label="CPU utilisation" />
<HealthBar value={0.91} status="warn" height={6} label="Memory" />
<HealthBar value={1.0} status="error" label="Disk full" />
```

**Tokens:** `--color-positive` (ok), `--color-warning` (warn), `--color-negative` (error), `--bg-muted` (track)

---

### HeatmapCell

Maps a normalised 0–1 value to a colour-intensity background using `color-mix()`. Diverging scale (default) runs from negative through neutral to positive; sequential runs from surface to info. Pass `children` to render text on top with automatic contrast switching.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Normalised intensity, clamped to 0–1. |
| `scale` | `'diverging' \| 'sequential'` | `'diverging'` | Colour mapping mode. |
| `children` | `ReactNode` | — | Optional content rendered on top of the background. |
| `style` | `CSSProperties` | — | Merged with computed styles. |
| `className` | `string` | — | Additional class names. |

**Colour scales:**

| Scale | 0 | 0.5 | 1 |
|-------|---|-----|---|
| Diverging | `--color-negative` | `--bg-surface` | `--color-positive` |
| Sequential | `--bg-surface` | 50% `--color-info` | `--color-info` |

Text colour switches to `--text-inverse` when background intensity exceeds 60%.

**Usage:**
```tsx
<HeatmapCell value={0.85}>+2.4%</HeatmapCell>
<HeatmapCell value={0.2} scale="sequential" style={{ height: 40 }}>Low</HeatmapCell>
<HeatmapCell value={(correlation + 1) / 2}>{correlation.toFixed(2)}</HeatmapCell>
```

**Tokens:** `--color-negative`, `--color-positive`, `--color-info`, `--bg-surface`, `--text-primary`, `--text-inverse`

---

## Inputs

Form controls. All inputs follow the same focus treatment: `box-shadow: 0 0 0 2px var(--color-info)` on focus. All accept an optional `label` prop that renders a small label above the control.

---

### Autocomplete

A text input with a fuzzy-matching dropdown. Matches are scored and sorted: exact substrings rank higher than sequential character matches. Matched characters are highlighted inline. Keyboard navigation (Arrow keys, Enter, Escape) is fully supported.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array<{ label: string; value: string; sublabel?: string }>` | — | The full list of items to match against. |
| `onSelect` | `(item: { label: string; value: string; sublabel?: string }) => void` | — | Called when the user selects an item. |
| `placeholder` | `string` | — | Input placeholder text. |
| `label` | `string` | — | Optional label rendered above the input. |

**Usage:**
```tsx
<Autocomplete
  items={[{ label: 'AAPL', value: 'AAPL', sublabel: 'Apple Inc.' }]}
  onSelect={(item) => setSymbol(item.value)}
  placeholder="Search symbol..."
  label="Instrument"
/>
```

**Tokens:** `--bg-surface`, `--border-default`, `--text-primary`, `--text-muted`, `--bg-highlight`, `--color-info`

---

### DatePicker

A button trigger that opens a Radix Popover calendar. Month navigation uses previous/next buttons. Selected day is highlighted with `--color-info`. Today is marked with `--color-info` text. Days from adjacent months are shown dimmed.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Date \| null` | — | Currently selected date. `null` renders the placeholder. |
| `onChange` | `(date: Date) => void` | — | Called when the user clicks a day cell. |
| `label` | `string` | — | Optional label rendered above the trigger button. |

**Usage:**
```tsx
<DatePicker
  value={selectedDate}
  onChange={(d) => setSelectedDate(d)}
  label="Settlement date"
/>
```

**Tokens:** `--bg-surface`, `--border-default`, `--text-primary`, `--text-muted`, `--text-secondary`, `--color-info`, `--bg-highlight`

---

### NumberInput

A stepper input with decrement (−) and increment (+) buttons flanking a numeric field. Stepper buttons are excluded from the tab order (`tabIndex={-1}`) — keyboard users increment via Arrow keys on the input. Shift+Arrow steps by 10x.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Current numeric value. |
| `onChange` | `(n: number) => void` | — | Called with the new clamped value on any change. |
| `min` | `number` | — | Optional minimum bound. |
| `max` | `number` | — | Optional maximum bound. |
| `step` | `number` | `1` | Increment/decrement amount. Shift+Arrow uses `step * 10`. |
| `suffix` | `string` | — | Optional unit label rendered after the value (e.g. `%`, `lots`). |
| `label` | `string` | — | Optional label rendered above the control. |

**Usage:**
```tsx
<NumberInput
  value={quantity}
  onChange={setQuantity}
  min={1}
  max={10000}
  step={100}
  suffix="shares"
  label="Quantity"
/>
```

**Tokens:** `--bg-surface`, `--border-default`, `--border-subtle`, `--text-primary`, `--text-secondary`, `--text-muted`, `--bg-muted`, `--color-info`

---

### Select

A single-value select built on Radix UI Select. The chevron icon rotates 180 degrees when the dropdown is open. The selected option is rendered in `--color-info` with `fontWeight: 600`. Options highlight on hover.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Currently selected option value. |
| `onChange` | `(v: string) => void` | — | Called with the new value when the user selects an option. |
| `options` | `Array<{ value: string; label: string }>` | — | The list of selectable options. |
| `label` | `string` | — | Optional label rendered above the trigger. |

**Usage:**
```tsx
<Select
  value={timeframe}
  onChange={setTimeframe}
  options={[
    { value: '1D', label: '1 Day' },
    { value: '1W', label: '1 Week' },
    { value: '1M', label: '1 Month' },
  ]}
  label="Timeframe"
/>
```

**Tokens:** `--bg-surface`, `--border-default`, `--text-primary`, `--text-muted`, `--color-info`, `--bg-highlight`

---

### Toggle

A switch control with a 36x20px track and a 16x16px knob. Track and knob transitions are 150ms. When on, the track uses `--color-info` and the knob is white. When off, the track uses `--bg-muted` and the knob uses `--text-muted`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `boolean` | — | Whether the toggle is on. |
| `onChange` | `(v: boolean) => void` | — | Called with the negated value when clicked. |
| `label` | `string` | — | Optional label rendered to the right of the toggle. |

**Usage:**
```tsx
<Toggle value={flashEnabled} onChange={setFlashEnabled} label="Flash on update" />
```

**Tokens:** `--color-info`, `--bg-muted`, `--text-muted`, `--text-primary`

---

## Data

Components for displaying tabular and time-series data.

---

### DataTable

An AG Grid Community table with Meridian theming applied via `ag-grid-meridian.css`. Supports three density modes and optional row click handling. Six built-in cell renderer types are registered automatically: `NumericCell`, `ChangeCell`, `BadgeCell`, `SparklineCell`, `ActionCell`, and `HeatmapCellRenderer`. Reference these by name in column `cellRenderer` definitions.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `ColDef[]` | — | AG Grid column definitions. Use `cellRenderer: 'NumericCell'` etc. for typed cells. |
| `rows` | `unknown[]` | — | Row data array. |
| `density` | `'compact' \| 'default' \| 'comfortable'` | `'default'` | Row height mode. Compact: 24px, Default: 32px, Comfortable: 40px. |
| `onRowClick` | `(row: unknown) => void` | — | If provided, rows are selectable and this is called on click. |
| `groupBy` | `string` | — | Field name to group and sort rows by. Rows are sorted by the field value; visual group headers are not yet injected. |

**Usage:**
```tsx
<DataTable
  columns={[
    { field: 'symbol', headerName: 'Symbol' },
    { field: 'price', headerName: 'Price', cellRenderer: 'NumericCell' },
    { field: 'change', headerName: 'Chg%', cellRenderer: 'ChangeCell' },
  ]}
  rows={watchlistRows}
  density="compact"
  onRowClick={(row) => setSelected((row as WatchlistRow).symbol)}
/>
```

**Tokens:** Consumes all background, border, and text tokens via `ag-grid-meridian.css`.

---

### Sparkline

An inline SVG sparkline rendered as a `<polyline>`. Optionally renders a filled area polygon below the line. Designed to fit inside a table cell (default 60x20px).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `number[]` | — | Array of numeric values. At least 2 points required for a visible line. |
| `width` | `number` | `60` | SVG width in pixels. |
| `height` | `number` | `20` | SVG height in pixels. |
| `color` | `string` | `'var(--color-cat-0)'` | Stroke colour. Any CSS colour value or custom property reference. |
| `showArea` | `boolean` | `false` | If true, renders a filled polygon below the line at 15% opacity. |

**Usage:**
```tsx
<Sparkline data={priceHistory} width={80} height={24} color="var(--color-cat-1)" />
<Sparkline data={volumeHistory} showArea />
```

**Tokens:** `--color-cat-0` (default); caller controls colour via the `color` prop.

---

## Layout

Structural components for building the panel-based workspace.

---

### Panel

A full-height flex column with a `PanelHeader` at the top, an optional `Toolbar` below the header, and a scrollable content area filling the remainder. Composes `PanelHeader` and `Toolbar` internally.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Panel title passed to `PanelHeader`. |
| `toolbar` | `ReactNode` | — | If provided, renders a `Toolbar` below the header. |
| `actions` | `ReactNode` | — | Action nodes passed to `PanelHeader` (rendered at the right of the header). |
| `children` | `ReactNode` | — | Panel body content. Rendered in a scrollable flex container. |

**Usage:**
```tsx
<Panel
  title="Watchlist"
  actions={<button>+</button>}
  toolbar={<Select value={filter} onChange={setFilter} options={filterOptions} />}
>
  <DataTable columns={cols} rows={rows} />
</Panel>
```

**Tokens:** Via `PanelHeader` and `Toolbar`: `--bg-surface`, `--border-subtle`, `--text-primary`

---

### PanelHeader

The 28px header bar at the top of every panel. Displays a title on the left and optional action nodes on the right.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Panel title text. Truncates with ellipsis on overflow. |
| `actions` | `ReactNode` | — | Optional node(s) rendered at the right edge of the header. |

**Usage:**
```tsx
<PanelHeader title="Order Book" actions={<IconButton icon="settings" />} />
```

**Tokens:** `--bg-surface`, `--border-subtle`, `--text-primary`

---

### Toolbar

A 32px horizontal bar for panel-level controls. Renders its children in a flex row with 8px gaps and 8px horizontal padding.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Control elements (selects, toggles, buttons). |

**Usage:**
```tsx
<Toolbar>
  <Select value={density} onChange={setDensity} options={densityOptions} />
  <Toggle value={flashEnabled} onChange={setFlashEnabled} label="Flash" />
</Toolbar>
```

**Tokens:** `--bg-surface`, `--border-subtle`

---

### Workspace

A thin wrapper around `flexlayout-react` `<Layout>`. Manages a serialisable JSON model (`IJsonModel`) of rows, tabsets, and tabs. The caller owns the model state — use `useWorkspace` for persistence. Supports drag-between-tabsets and dynamic panel add/close out of the box.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `model` | `Model` | — | The FlexLayout React model instance. Created from an `IJsonModel` via `Model.fromJson`. |
| `factory` | `(node: TabNode) => ReactNode` | — | Factory function that maps a tab node to its content node. |
| `onModelChange` | `(model: Model) => void` | — | Callback fired when the model changes (layout resized, panels moved, etc.). |

**Usage:**
```tsx
const { model, handleModelChange } = useWorkspace(defaultLayout, presets);

<Workspace
  model={model}
  factory={(node) => <PanelRegistry id={node.getId()} />}
  onModelChange={handleModelChange}
/>
```

**Tokens:** `workspace.css` applies `--bg-base`, `--border-subtle` to FlexLayout React splitter bars and the container background.

---

## Charting

---

### Chart

A Plotly.js chart pre-configured with the Meridian template. The template is selected automatically based on the current theme from `ThemeProvider`. Callers provide trace data and optionally override layout or config properties — overrides are merged shallowly, with `xaxis` and `yaxis` merged one level deep.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Plotly.Data[]` | — | Array of Plotly trace objects. |
| `layout` | `Partial<Plotly.Layout>` | — | Optional layout overrides merged onto the Meridian base template. |
| `config` | `Partial<Plotly.Config>` | — | Optional config overrides merged onto the Meridian base config. |

The base config enables scroll zoom, sets double-click to reset, removes the Plotly logo, and removes `select2d`, `lasso2d`, `sendDataToCloud`, and `toImage` from the modebar.

**Usage:**
```tsx
<CandlestickChart
  data={[{ type: 'scatter', x: dates, y: prices, mode: 'lines' }]}
  layout={{ title: { text: 'AAPL' } }}
/>

<CandlestickChart
  data={[{
    type: 'candlestick',
    x: dates, open: opens, high: highs, low: lows, close: closes,
  }]}
/>
```

**Tokens:** All chart chrome tokens applied via the Meridian Plotly template: `--bg-base`, `--bg-overlay`, `--border-subtle`, `--border-default`, `--text-primary`, `--text-secondary`, `--text-muted`, `--color-positive`, `--color-negative`, `--color-cat-0` through `--color-cat-7`.

---

## Feedback

---

### ToastContainer / showToast

`ToastContainer` is a singleton container component that must be mounted once near the root of the app. `showToast` is an imperative function that can be called from anywhere — it does not require a hook or context.

The stack is capped at 3 visible toasts. Toasts auto-dismiss after the specified duration. Each toast has a left accent border in the variant colour.

**ToastContainer** takes no props.

**showToast signature:**
```ts
showToast(message: string, variant?: 'info' | 'warning' | 'error', duration?: number): void
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `message` | `string` | — | Toast message text. |
| `variant` | `'info' \| 'warning' \| 'error'` | `'info'` | Controls the left accent border colour. |
| `duration` | `number` | `5000` | Auto-dismiss delay in milliseconds. |

**Usage:**
```tsx
// In app root
<ToastContainer />

// Anywhere in the app
showToast('Order submitted', 'info');
showToast('Price limit exceeded', 'warning');
showToast('Order rejected', 'error', 8000);
```

**Tokens:** `--bg-surface`, `--border-default`, `--text-primary`, `--color-info`, `--color-warning`, `--color-negative`

---

### Modal

A centred dialog built on Radix UI Dialog. Renders with a blurred backdrop overlay. Includes an accessible title and a close button. The close button calls `onClose` when clicked.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Controls dialog visibility. |
| `onClose` | `() => void` | — | Called when the dialog is dismissed (close button or Escape key). |
| `title` | `string` | — | Dialog title rendered in the header. |
| `children` | `ReactNode` | — | Dialog body content. |

**Usage:**
```tsx
<Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm Order">
  <p>Submit market order for 500 AAPL?</p>
  <button onClick={handleSubmit}>Confirm</button>
</Modal>
```

**Tokens:** `--bg-surface`, `--border-default`, `--text-primary`, `--text-muted`

---

### NotificationFeed

A scrollable list of notification items. Each entry shows a timestamp, message text, an optional action label, and a dismiss button. Renders an empty state message when the list is empty.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `notifications` | `Array<{ id: string; message: string; timestamp: number; action?: string }>` | — | The list of notifications to display, newest first or ordered by the caller. |
| `onDismiss` | `(id: string) => void` | — | Called with the notification ID when the user clicks the dismiss button. |

**Usage:**
```tsx
<NotificationFeed
  notifications={alerts}
  onDismiss={(id) => dispatch({ type: 'DISMISS', id })}
/>
```

**Tokens:** `--text-muted`, `--text-primary`, `--color-info`, `--border-subtle`

---

## Command Palette

A pluggable, keyboard-driven command palette. The palette is a generic shell — consuming apps inject all commands via a registration API. Supports simple fire-and-forget actions, commands with async context-aware argument steps, custom item renderers, and frequency-based ranking.

Three components work together: `CommandPaletteProvider` (context), `CommandPalette` (UI overlay), and `useCommandPalette` (hook for registration and control).

---

### CommandPaletteProvider

Wraps the app tree. Owns the command registry, open/close state, global hotkey listener, and frequency tracking. All other command palette components must be descendants of this provider.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | App content. |
| `hotkey` | `string` | `'mod+k'` | Keyboard shortcut to toggle the palette. `mod` maps to Cmd on Mac, Ctrl elsewhere. Accepts `mod+<key>` syntax. |
| `initialFrequency` | `FrequencyMap` | — | Optional pre-hydrated frequency data for cross-session persistence. |

**Usage:**
```tsx
<CommandPaletteProvider hotkey="mod+k">
  <App />
</CommandPaletteProvider>
```

---

### CommandPalette

The UI overlay component. Renders a centred dialog at ~20% from the top of the viewport via Radix Dialog. Reads commands from the provider context and handles search input, fuzzy filtering, result rendering, arg stepping, and keyboard navigation.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxResults` | `number` | `12` | Maximum number of results displayed in the search list. Recents (empty query) are capped at 10 regardless. |

Place this component anywhere inside `CommandPaletteProvider` — it renders via a portal.

**Usage:**
```tsx
<CommandPaletteProvider>
  <CommandPalette maxResults={12} />
  <App />
</CommandPaletteProvider>
```

**Keyboard:**

| Key | Action |
|-----|--------|
| Configurable hotkey | Toggle palette open/close |
| `Escape` | Close palette (from any state) |
| `Arrow Down` / `Arrow Up` | Navigate results |
| `Enter` | Select active result (execute or advance to args) |
| `Backspace` (empty input) | Go back one arg step, or return to search from first arg |

**Tokens:** `--bg-surface`, `--border-default`, `--border-subtle`, `--bg-highlight`, `--text-primary`, `--text-secondary`, `--text-muted`, `--color-info`, `--color-negative`

---

### useCommandPalette

Hook for consuming code to interact with the palette. Must be called within a `CommandPaletteProvider`.

**Returns:** `CommandPaletteContextValue`

| Field | Type | Description |
|-------|------|-------------|
| `open` | `() => void` | Open the palette programmatically. |
| `close` | `() => void` | Close the palette. |
| `registerCommands` | `(commands: Command[]) => () => void` | Register commands; returns an unregister cleanup function. |
| `frequency` | `FrequencyMap` | Current frequency data. Consuming apps can persist this externally. |
| `isOpen` | `boolean` | Whether the palette is currently open. |
| `recordExecution` | `(commandId: string) => void` | Manually record a command execution for frequency tracking. |

**Usage:**
```tsx
function MyPanel() {
  const { registerCommands } = useCommandPalette();

  useEffect(() => {
    return registerCommands([
      {
        id: 'my-panel:do-thing',
        label: 'Do Thing',
        category: 'My Panel',
        execute: () => doThing(),
      },
    ]);
  }, []);
}
```

---

### Command

The shape of a command registered via `useCommandPalette().registerCommands()`.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier. Convention: `namespace:action` (e.g. `watchlist:add-instrument`). |
| `label` | `string` | Yes | Display name shown in the results list. |
| `description` | `string` | No | Secondary text shown below the label. Also included in fuzzy search. |
| `category` | `string` | No | Category badge shown at the right of the result row. |
| `icon` | `ReactNode` | No | Icon rendered at the left of the result row (20px wide). |
| `shortcut` | `string` | No | Display-only shortcut hint (e.g. `⌘T`). Does not register a listener. |
| `keywords` | `string[]` | No | Additional terms included in fuzzy search beyond label/description. |
| `args` | `ArgDefinition[]` | No | If present, the palette enters arg-stepping mode when this command is selected. |
| `execute` | `(args?: Record<string, string>) => void` | Yes | Called when the command is executed. Receives collected args if the command has arg definitions. |
| `renderItem` | `(props: ItemRenderProps) => ReactNode` | No | Custom renderer replacing the standard result row layout. |

---

### ArgDefinition

Defines a single argument step in a multi-step command.

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | Key used in the collected args record passed to `execute` and subsequent resolvers. |
| `label` | `string` | Display label shown as a placeholder in the input during this step. |
| `resolve` | `(context: Record<string, string>) => Promise<ArgOption[]>` | Async function returning available options. Receives args collected so far. |

**Usage:**
```tsx
{
  id: 'load-vol',
  label: 'Load Vol Surface',
  args: [
    { name: 'underlying', label: 'Underlying', resolve: async () => fetchUnderlyings() },
    { name: 'source', label: 'Source', resolve: async (ctx) => fetchSources(ctx.underlying) },
    { name: 'date', label: 'Date', resolve: async (ctx) => fetchDates(ctx.underlying, ctx.source) },
  ],
  execute: (args) => loadVolSurface(args!.underlying, args!.source, args!.date),
}
```

During arg stepping, a breadcrumb trail shows selections made so far. Each step resolves asynchronously — a loading skeleton appears while options are fetched. If resolution fails, the user can retry with Enter or go back with Backspace.

---

## Shortcuts

A global keyboard shortcut system. Independent of the command palette but designed to wire together easily. Components register shortcuts via a provider + hook pattern. A built-in overlay displays all registered shortcuts grouped by category.

---

### ShortcutProvider

Wraps the app tree. Owns the shortcut registry, a single global `keydown` listener, collision detection, and overlay open/close state.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | App content. |

**Usage:**
```tsx
<ShortcutProvider>
  <ShortcutOverlay />
  <App />
</ShortcutProvider>
```

---

### ShortcutOverlay

A Radix Dialog overlay showing all registered shortcuts grouped by category. Self-registers its own trigger shortcut.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hotkey` | `string` | `'?'` | Key combo to toggle the overlay open/close. |

Place anywhere inside `ShortcutProvider` — renders via portal.

**Keyboard:**

| Key | Action |
|-----|--------|
| `?` (configurable) | Toggle overlay |
| `Escape` | Close overlay |

**Tokens:** `--bg-surface`, `--border-default`, `--text-primary`, `--text-secondary`, `--text-muted`, `--bg-muted`, `--border-subtle`

---

### useShortcuts

Hook for consuming code to register shortcuts and control the overlay. Must be called within a `ShortcutProvider`.

**Returns:** `ShortcutContextValue`

| Field | Type | Description |
|-------|------|-------------|
| `register` | `(shortcuts: Shortcut[]) => () => void` | Register shortcuts; returns an unregister cleanup function. |
| `shortcuts` | `Shortcut[]` | The full registry (read-only). |
| `open` | `() => void` | Open the overlay programmatically. |
| `close` | `() => void` | Close the overlay. |
| `isOpen` | `boolean` | Whether the overlay is currently open. |

**Usage:**
```tsx
function MyPanel() {
  const { register } = useShortcuts();

  useEffect(() => {
    return register([
      {
        id: 'my-panel:refresh',
        key: 'mod+r',
        label: 'Refresh',
        category: 'My Panel',
        execute: () => refresh(),
      },
    ]);
  }, []);
}
```

---

### Shortcut

The shape of a shortcut registered via `useShortcuts().register()`.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier. Convention: `namespace:action`. |
| `key` | `string` | Yes | Key combo string, e.g. `mod+d`, `mod+shift+t`, `escape`, `?`. |
| `label` | `string` | Yes | Human-readable name shown in the overlay. |
| `category` | `string` | No | Grouping in the overlay. Shortcuts without a category go under "Other". |
| `description` | `string` | No | Optional longer description. |
| `execute` | `() => void` | Yes | Called when the shortcut is triggered. |
| `enabled` | `boolean` | No | Default `true`. When `false`, the listener skips this shortcut but it still appears (muted) in the overlay. |

**Hotkey syntax:** `modifier+modifier+key`. Supported modifiers: `mod` (Cmd/Ctrl), `shift`, `alt` (Option/Alt), `ctrl`. Matching uses `e.key` (produced character). Plain-key shortcuts are suppressed in input fields; modifier shortcuts work everywhere.

**Collision handling:** If two shortcuts register the same key combo, a `console.warn` is emitted in development and the last registered wins.

---

### KeyBadge

Renders a key combo string as styled `<kbd>` elements with platform-aware symbols (⌘/⇧/⌥ on Mac, Ctrl/Shift/Alt elsewhere).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hotkey` | `string` | — | Key combo string to render, e.g. `mod+shift+t`. |
| `muted` | `boolean` | `false` | When true, uses `--text-muted` for badge text colour. |

**Usage:**
```tsx
<KeyBadge hotkey="mod+shift+t" />
<KeyBadge hotkey="escape" muted />
```

**Tokens:** `--bg-muted`, `--text-primary`, `--text-muted`, `--border-subtle`
