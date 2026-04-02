# FlexLayout React Migration Design

**Date:** 2026-04-02
**Status:** Draft
**Scope:** Replace react-mosaic-component with FlexLayout React, adding tabbed panels, drag-between-tabsets, and dynamic panel add/close.

---

## Motivation

Meridian's workspace currently uses react-mosaic-component for tiling layout. The implementation spec calls for tabs within panels, but Mosaic has no tab support. Rather than building a custom tab layer over Mosaic (which would require synchronising two state models and implementing drag-between-tabsets from scratch), we migrate to FlexLayout React, which provides tabs, drag-between-tabsets, dynamic panel add/close, and serialisation natively.

---

## Approach

**FlexLayout for the layout engine, custom Meridian tab chrome.** FlexLayout handles the layout model, drag logic, split resizing, and tab management. Its default tab strip and panel chrome are replaced via render callbacks (`onRenderTabSet`, `onRenderTab`) to match Meridian's design tokens and visual language.

---

## Design

### 1. Layout Model

FlexLayout uses a JSON model (`IJsonModel`) containing three node types:

- **Row/Column** — split containers (equivalent to Mosaic's `direction: 'row'|'column'`)
- **Tabset** — container holding one or more tabs with a tab strip (no Mosaic equivalent)
- **Tab** — leaf node referencing a panel component by a `component` type string

The `Workspace` component creates a FlexLayout `Model` from JSON and renders `<Layout model={model} factory={factory} />`, where `factory` maps tab component strings to React components.

Unlike Mosaic's plain JSON tree managed by React state, FlexLayout uses a mutable `Model` object. Mutations happen via `model.doAction(Actions.addNode(...))`, and `onModelChange` fires for persistence.

### 2. Panel Registry & Dynamic Panels

A panel registry replaces the static `PANEL_MAP`:

```ts
interface PanelDefinition {
  type: string;        // e.g. 'watchlist', 'chart', 'pricer'
  title: string;       // display name for tab strip
  component: () => ReactNode;
}

const PANEL_REGISTRY: PanelDefinition[] = [
  { type: 'watchlist', title: 'Watchlist', component: () => <WatchlistPanel /> },
  { type: 'chart',     title: 'Chart',     component: () => <ChartPanel /> },
  { type: 'pricer',    title: 'Pricer',    component: () => <PricerPanel /> },
];
```

The FlexLayout `factory` callback receives a `TabNode` and looks up the registry by component type:

```ts
function factory(node: TabNode): ReactNode {
  const componentType = node.getComponent();
  const def = PANEL_REGISTRY.find((p) => p.type === componentType);
  return def ? def.component() : <div>Unknown panel: {componentType}</div>;
}
```

Multiple tabs of the same type are supported natively (e.g., two Chart tabs) — FlexLayout assigns unique node IDs internally.

An **"Add Panel" button** in the NavBar uses the registry to show available panel types and calls `model.doAction(Actions.addNode(...))` to insert a new tab into the active tabset. The active tabset is determined via `model.getActiveTabset()`. If no tabset exists (all panels closed), a new tabset is created.

### 3. Custom Tab Chrome

FlexLayout's render override callbacks augment its default UI with Meridian styling:

- **`onRenderTabSet`** — augments the tabset header (does not replace it). Used to add per-tabset action buttons (e.g., an "add tab" button). The tab strip itself is styled via CSS class overrides.
- **`onRenderTab`** — augments individual tab rendering to apply Meridian tokens: `--text-primary` for active, `--text-muted` for inactive, with a subtle active indicator.

**CSS theming strategy:** FlexLayout's base CSS is imported but overridden via `workspace.css` targeting FlexLayout's class names (`.flexlayout__tab`, `.flexlayout__splitter`, `.flexlayout__tabset-header`, etc.) with Meridian design tokens. This is the same approach currently used for Mosaic — class overrides in a dedicated CSS file. FlexLayout's `classNameMapper` prop is not used; direct class overrides are simpler and sufficient.

**Title migration:** The `Panel` component currently renders its own `PanelHeader` with the title. After migration, the title moves to the tab strip (managed by FlexLayout chrome). `Panel` simplifies to just optional `Toolbar` + content area. `PanelHeader` remains in the design system for non-workspace use cases.

**Close button:** Each tab gets a close button (X) styled with `--text-muted`, hover `--text-primary`, using FlexLayout's built-in close action.

**Split handles:** Styled with `--border-subtle` background, `--border-active` on hover — same treatment as the current Mosaic overrides.

### 4. Presets & State Management

**Presets** are rewritten as FlexLayout `IJsonModel` JSON objects with generic demo names:

- **"Three Panel"** — row split: Watchlist tabset left (35%), column split right with Chart tabset (60%) over Pricer tabset (40%). Same spatial arrangement as the former "Equity Trading" preset.
- **"Stacked"** — column split: top row with Watchlist + Pricer tabsets side by side (40/60%), Chart tabset below (55%). Same arrangement as the former "Options Desk" preset.

**`useWorkspace` hook** adapts to FlexLayout's `Model`:

- **Init:** Load serialised JSON from localStorage, or fall back to default preset. Create `Model` via `Model.fromJson()`. The init logic wraps `Model.fromJson()` in a try/catch — if the stored JSON is valid JSON but an invalid `IJsonModel` (e.g., corrupted or from an older schema), it falls back to the default preset.
- **On change:** `onModelChange` callback serialises with `model.toJson()` and persists to localStorage.
- **`loadPreset(name)`:** Create a fresh `Model.fromJson(presetJson)`, replace current model, persist.
- **`resetLayout()`:** Same as `loadPreset` with the default.
- **`addPanel(type)`:** New method — calls `model.doAction(Actions.addNode(...))` to insert a tab of the given type into the active tabset (or creates a new tabset if none exists).

The hook returns the `Model` instance directly instead of a `MosaicNode<string>` + `onChange`.

---

## Files Changed

### Replace (full rewrite)

| File | Change |
|---|---|
| `src/components/layout/Workspace.tsx` | Mosaic `<Mosaic>` becomes FlexLayout `<Layout>` with `factory`, custom render callbacks |
| `src/components/layout/workspace.css` | Mosaic class overrides become FlexLayout theming (splitters, tab strip, tab buttons) |
| `src/hooks/useWorkspace.ts` | `MosaicNode` state becomes FlexLayout `Model`, adds `addPanel()` |
| `src/demo/panels/workspace-presets.ts` | `MosaicNode` trees become `IJsonModel` JSON, renamed to "Three Panel" / "Stacked" |

### Modify

| File | Change |
|---|---|
| `src/demo/App.tsx` | `PANEL_MAP` becomes `PANEL_REGISTRY`, passes `Model` to Workspace, wires `addPanel` to NavBar |
| `src/demo/NavBar.tsx` | Adds "Add Panel" button showing available panel types from registry |
| `package.json` | Remove `react-mosaic-component`, add `flexlayout-react` |

### Simplify

| File | Change |
|---|---|
| `src/components/layout/Panel.tsx` | Remove `PanelHeader` rendering — title now lives in tab strip. Panel becomes optional Toolbar + content area. |

### Light touch

| File | Change |
|---|---|
| `src/demo/panels/WatchlistPanel.tsx` | Drop `title` prop from `<Panel>` |
| `src/demo/panels/ChartPanel.tsx` | Drop `title` prop from `<Panel>` |
| `src/demo/panels/PricerPanel.tsx` | Drop `title` prop from `<Panel>` |

### Documentation updates

All nine markdown files that reference Mosaic are updated to reflect the FlexLayout migration:

| File | Change |
|---|---|
| `meridian-implementation.md` | Update technology stack and workspace layout sections |
| `meridian-research.md` | Update layout library reference (research rationale unchanged) |
| `docs/research/meridian-research.md` | Same |
| `docs/reference/patterns.md` | Update workspace pattern references |
| `docs/reference/components.md` | Update Workspace component documentation |
| `docs/philosophy/workspace-layout.md` | Update to reflect tabs + FlexLayout |
| `docs/philosophy/overview.md` | Update library reference |
| `docs/superpowers/plans/2026-03-31-meridian-implementation.md` | Update plan references |
| `docs/superpowers/specs/2026-03-31-meridian-design-system-design.md` | Update spec references |

### No changes

- `src/components/layout/PanelHeader.tsx` — stays in design system
- `src/components/layout/Toolbar.tsx` — stays in design system
- `src/components/index.ts` — exports unchanged (Workspace still exported). Note: this is a **breaking change** to the `Workspace` public API — its props change from `layout`/`onChange`/`renderTile` to a `model`-based interface. This is acceptable since Meridian is pre-1.0 and has no external consumers yet.
- All other components, hooks, providers, tokens

---

## Dependencies

### Remove
- `react-mosaic-component` (^6.1.0)

### Add
- `flexlayout-react` (latest)

---

## Out of Scope

- Popout/detach panels to separate windows
- Custom user-created presets (existing `savePreset` stub remains)
- Multi-monitor support
