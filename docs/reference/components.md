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

An AG Grid Community table with Meridian theming applied via `ag-grid-meridian.css`. Supports three density modes and optional row click handling. Five built-in cell renderer types are registered automatically: `NumericCell`, `ChangeCell`, `BadgeCell`, `SparklineCell`, and `ActionCell`. Reference these by name in column `cellRenderer` definitions.

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

A thin wrapper around `react-mosaic-component` `<Mosaic>`. Manages a serialisable binary tree of panel tiles. The caller owns the layout state — use `useWorkspace` for persistence.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `layout` | `MosaicNode<string>` | — | The current mosaic layout tree. Panel IDs are strings. |
| `onChange` | `(layout: MosaicNode<string> \| null) => void` | — | Called whenever the user drags or resizes a panel. |
| `renderTile` | `(id: string) => ReactNode` | — | Factory function that maps a panel ID to its content node. |

**Usage:**
```tsx
const { layout, setLayout } = useWorkspace(defaultLayout, presets);

<Workspace
  layout={layout}
  onChange={setLayout}
  renderTile={(id) => <PanelRegistry id={id} />}
/>
```

**Tokens:** `workspace.css` applies `--bg-base`, `--border-subtle` to mosaic split bars and the container background.

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
<Chart
  data={[{ type: 'scatter', x: dates, y: prices, mode: 'lines' }]}
  layout={{ title: { text: 'AAPL' } }}
/>

<Chart
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
