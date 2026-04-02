# FlexLayout React Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace react-mosaic-component with FlexLayout React, adding tabbed panels, drag-between-tabsets, dynamic panel add/close, and custom Meridian tab chrome.

**Architecture:** FlexLayout React provides the layout engine (tiling, tabs, drag). Its default chrome is overridden via CSS class targeting and render callbacks to match Meridian's design tokens. A panel registry enables dynamic panel creation. State management adapts from Mosaic's plain JSON tree to FlexLayout's mutable Model object.

**Tech Stack:** React 19, TypeScript, FlexLayout React, Vite, Vitest

**Spec:** `docs/superpowers/specs/2026-04-02-flexlayout-migration-design.md`

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `src/components/layout/Workspace.tsx` | FlexLayout `<Layout>` wrapper with factory and render callbacks | Rewrite |
| `src/components/layout/workspace.css` | FlexLayout CSS overrides with Meridian tokens | Rewrite |
| `src/hooks/useWorkspace.ts` | FlexLayout Model state, persistence, presets, addPanel | Rewrite |
| `src/demo/panels/workspace-presets.ts` | IJsonModel preset definitions | Rewrite |
| `src/demo/panels/panel-registry.tsx` | PanelDefinition array and factory function | Create |
| `src/demo/App.tsx` | Wire Workspace, registry, NavBar | Modify |
| `src/demo/NavBar.tsx` | Add "Add Panel" button | Modify |
| `src/components/layout/Panel.tsx` | Remove PanelHeader (title now in tab strip) | Simplify |
| `src/demo/panels/WatchlistPanel.tsx` | Drop title prop from Panel | Light touch |
| `src/demo/panels/ChartPanel.tsx` | Drop title prop from Panel | Light touch |
| `src/demo/panels/PricerPanel.tsx` | Drop title prop from Panel | Light touch |
| `package.json` | Swap dependencies | Modify |

---

## Task 1: Swap Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Remove react-mosaic-component, add flexlayout-react**

```bash
cd /Users/matthewchivers/Repos/meridian && npm uninstall react-mosaic-component && npm install flexlayout-react
```

- [ ] **Step 2: Verify install succeeded and check React 19 compatibility**

```bash
cd /Users/matthewchivers/Repos/meridian && node -e "require.resolve('flexlayout-react')" && echo "OK" && npm ls flexlayout-react
```

Expected: prints a path, "OK", and the resolved version. Check for any peer dependency warnings about React 19. If warnings appear, verify the app still builds before proceeding.

- [ ] **Step 3: Commit**

```bash
cd /Users/matthewchivers/Repos/meridian && git add package.json package-lock.json && git commit -m "chore: swap react-mosaic-component for flexlayout-react"
```

---

## Task 2: Write Layout Presets as FlexLayout IJsonModel

**Files:**
- Rewrite: `src/demo/panels/workspace-presets.ts`

- [ ] **Step 1: Rewrite workspace-presets.ts**

Replace the entire file. The two presets preserve the same spatial arrangements but use FlexLayout's `IJsonModel` schema. Each leaf is a tabset containing a single tab.

```ts
import type { IJsonModel } from 'flexlayout-react';

export const THREE_PANEL: IJsonModel = {
  global: {
    tabEnableClose: true,
    tabSetEnableMaximize: false,
  },
  layout: {
    type: 'row',
    weight: 100,
    children: [
      {
        type: 'tabset',
        weight: 35,
        children: [
          { type: 'tab', name: 'Watchlist', component: 'watchlist' },
        ],
      },
      {
        type: 'row',
        weight: 65,
        children: [
          {
            type: 'tabset',
            weight: 60,
            children: [
              { type: 'tab', name: 'Chart', component: 'chart' },
            ],
          },
          {
            type: 'tabset',
            weight: 40,
            children: [
              { type: 'tab', name: 'Pricer', component: 'pricer' },
            ],
          },
        ],
      },
    ],
  },
};

export const STACKED: IJsonModel = {
  global: {
    tabEnableClose: true,
    tabSetEnableMaximize: false,
  },
  layout: {
    type: 'row',
    weight: 100,
    children: [
      {
        type: 'row',
        weight: 55,
        children: [
          {
            type: 'tabset',
            weight: 40,
            children: [
              { type: 'tab', name: 'Watchlist', component: 'watchlist' },
            ],
          },
          {
            type: 'tabset',
            weight: 60,
            children: [
              { type: 'tab', name: 'Pricer', component: 'pricer' },
            ],
          },
        ],
      },
      {
        type: 'tabset',
        weight: 45,
        children: [
          { type: 'tab', name: 'Chart', component: 'chart' },
        ],
      },
    ],
  },
};

export const PRESETS: Record<string, IJsonModel> = {
  'Three Panel': THREE_PANEL,
  'Stacked': STACKED,
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/matthewchivers/Repos/meridian && npx tsc --noEmit --pretty 2>&1 | head -30
```

Expected: `tsc` will exit non-zero. This is expected — the project will be in a non-compilable state from Task 2 through Task 7 because files are being migrated incrementally. Verify that errors are only from files still importing Mosaic (Workspace.tsx, useWorkspace.ts, App.tsx) and that the old `EQUITY_TRADING`/`OPTIONS_DESK` export removal causes expected import errors in App.tsx. No errors should come from workspace-presets.ts itself.

- [ ] **Step 3: Commit**

```bash
cd /Users/matthewchivers/Repos/meridian && git add src/demo/panels/workspace-presets.ts && git commit -m "feat: rewrite workspace presets as FlexLayout IJsonModel"
```

---

## Task 3: Create Panel Registry

**Files:**
- Create: `src/demo/panels/panel-registry.tsx`

- [ ] **Step 1: Create panel-registry.tsx**

This extracts the panel mapping from App.tsx into a dedicated file with the `PanelDefinition` interface and `factory` function.

```tsx
import type { ReactNode } from 'react';
import { TabNode } from 'flexlayout-react';
import { WatchlistPanel } from './WatchlistPanel';
import { ChartPanel } from './ChartPanel';
import { PricerPanel } from './PricerPanel';

export interface PanelDefinition {
  type: string;
  title: string;
  component: () => ReactNode;
}

export const PANEL_REGISTRY: PanelDefinition[] = [
  { type: 'watchlist', title: 'Watchlist', component: () => <WatchlistPanel /> },
  { type: 'chart',     title: 'Chart',     component: () => <ChartPanel /> },
  { type: 'pricer',    title: 'Pricer',    component: () => <PricerPanel /> },
];

export function panelFactory(node: TabNode): ReactNode {
  const componentType = node.getComponent();
  const def = PANEL_REGISTRY.find((p) => p.type === componentType);
  return def ? def.component() : <div>Unknown panel: {componentType}</div>;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/matthewchivers/Repos/meridian && npx tsc --noEmit --pretty 2>&1 | head -30
```

Expected: no new errors from panel-registry.tsx.

- [ ] **Step 3: Commit**

```bash
cd /Users/matthewchivers/Repos/meridian && git add src/demo/panels/panel-registry.tsx && git commit -m "feat: add panel registry with factory function for FlexLayout"
```

---

## Task 4: Rewrite useWorkspace Hook

**Files:**
- Rewrite: `src/hooks/useWorkspace.ts`

- [ ] **Step 1: Write test for useWorkspace**

Create `src/hooks/useWorkspace.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { Model } from 'flexlayout-react';
import { THREE_PANEL, STACKED, PRESETS } from '@/demo/panels/workspace-presets';

// Test that presets produce valid models
describe('useWorkspace presets', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates a valid Model from THREE_PANEL preset', () => {
    const model = Model.fromJson(THREE_PANEL);
    expect(model).toBeDefined();
    expect(model.toJson()).toBeTruthy();
  });

  it('creates a valid Model from STACKED preset', () => {
    const model = Model.fromJson(STACKED);
    expect(model).toBeDefined();
    expect(model.toJson()).toBeTruthy();
  });

  it('round-trips through JSON serialisation', () => {
    const model = Model.fromJson(THREE_PANEL);
    const json = model.toJson();
    const restored = Model.fromJson(json);
    expect(restored.toJson()).toEqual(json);
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

```bash
cd /Users/matthewchivers/Repos/meridian && npx vitest run src/hooks/useWorkspace.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 3: Rewrite useWorkspace.ts**

Replace the entire file:

```ts
import { useState, useCallback } from 'react';
import { Model, Actions, DockLocation } from 'flexlayout-react';
import type { IJsonModel } from 'flexlayout-react';

const STORAGE_KEY = 'meridian-workspace';

function createModel(json: IJsonModel): Model {
  return Model.fromJson(json);
}

export function useWorkspace(
  defaultPreset: IJsonModel,
  builtInPresets: Record<string, IJsonModel>,
) {
  const [model, setModel] = useState<Model>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return createModel(JSON.parse(stored));
      } catch {
        /* corrupted or invalid — fall through to default */
      }
    }
    return createModel(defaultPreset);
  });

  const [activePreset, setActivePreset] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY) ? null : 'Three Panel';
  });

  // FlexLayout's onModelChange passes the same mutable Model instance, not a new one.
  // The model has already been mutated by the time this fires — we just persist and clear preset.
  const handleModelChange = useCallback((model: Model) => {
    setActivePreset(null);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(model.toJson()));
  }, []);

  const loadPreset = useCallback((name: string) => {
    const preset = builtInPresets[name];
    if (preset) {
      const newModel = createModel(preset);
      setModel(newModel);
      setActivePreset(name);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newModel.toJson()));
    }
  }, [builtInPresets]);

  const resetLayout = useCallback(() => {
    const newModel = createModel(defaultPreset);
    setModel(newModel);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newModel.toJson()));
  }, [defaultPreset]);

  const addPanel = useCallback((type: string, title: string) => {
    const activeTabset = model.getActiveTabset();
    const targetId = activeTabset
      ? activeTabset.getId()
      : model.getRoot().getId();
    const dockLocation = activeTabset
      ? DockLocation.CENTER
      : DockLocation.RIGHT;
    model.doAction(
      Actions.addNode(
        { type: 'tab', name: title, component: type },
        targetId,
        dockLocation,
        -1,
      ),
    );
  }, [model]);

  return {
    model,
    handleModelChange,
    presets: builtInPresets,
    activePreset,
    loadPreset,
    resetLayout,
    addPanel,
  };
}
```

- [ ] **Step 4: Run tests**

```bash
cd /Users/matthewchivers/Repos/meridian && npx vitest run src/hooks/useWorkspace.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
cd /Users/matthewchivers/Repos/meridian && git add src/hooks/useWorkspace.ts src/hooks/useWorkspace.test.ts && git commit -m "feat: rewrite useWorkspace hook for FlexLayout Model"
```

---

## Task 5: Rewrite Workspace Component

**Files:**
- Rewrite: `src/components/layout/Workspace.tsx`

- [ ] **Step 1: Rewrite Workspace.tsx**

Replace the entire file. This uses FlexLayout's `gray.css` (neutral/minimal base) rather than `light.css` or `dark.css`, since Meridian's CSS overrides handle both themes via CSS custom properties. The `onRenderTabSet` callback augments the tabset header with per-tabset styling; `onRenderTab` augments individual tab buttons.

```tsx
import type { ReactNode } from 'react';
import {
  Layout,
  type Model,
  type TabNode,
  type TabSetNode,
  type ITabSetRenderValues,
  type ITabRenderValues,
} from 'flexlayout-react';
import 'flexlayout-react/style/gray.css';
import './workspace.css';

interface WorkspaceProps {
  model: Model;
  factory: (node: TabNode) => ReactNode;
  onModelChange: (model: Model) => void;
}

function handleRenderTabSet(
  _tabSetNode: TabSetNode,
  _renderValues: ITabSetRenderValues,
) {
  // Augment the tabset header — styling is handled via CSS overrides in workspace.css.
  // This callback is available for adding per-tabset action buttons in the future.
}

function handleRenderTab(node: TabNode, renderValues: ITabRenderValues) {
  // Augment individual tab rendering — styling handled via CSS overrides.
  // This callback is available for adding icons or badges per tab in the future.
}

export function Workspace({ model, factory, onModelChange }: WorkspaceProps) {
  return (
    <Layout
      model={model}
      factory={factory}
      onModelChange={onModelChange}
      onRenderTabSet={handleRenderTabSet}
      onRenderTab={handleRenderTab}
    />
  );
}
```

Note: The `onRenderTabSet` and `onRenderTab` callbacks are wired up as no-op stubs for now. They provide the hooks for future customisation (per-tabset action buttons, tab icons/badges). All visual styling is handled by CSS class overrides in `workspace.css`. The underscore-prefixed params satisfy `noUnusedParameters`. If FlexLayout doesn't accept empty callbacks, remove these props entirely — the CSS overrides are the primary theming mechanism.

- [ ] **Step 2: Verify TypeScript compiles (expect errors only in App.tsx due to prop changes)**

```bash
cd /Users/matthewchivers/Repos/meridian && npx tsc --noEmit --pretty 2>&1 | head -30
```

Expected: errors in `App.tsx` (old Workspace props), no errors in `Workspace.tsx`.

- [ ] **Step 3: Commit**

```bash
cd /Users/matthewchivers/Repos/meridian && git add src/components/layout/Workspace.tsx && git commit -m "feat: rewrite Workspace component for FlexLayout"
```

---

## Task 6: Rewrite Workspace CSS

**Files:**
- Rewrite: `src/components/layout/workspace.css`

- [ ] **Step 1: Replace workspace.css**

Replace the entire file with FlexLayout class overrides using Meridian tokens:

```css
/* FlexLayout base overrides — Meridian design tokens */

/* Tab strip (tabset header) */
.flexlayout__tabset_header {
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
}

/* Individual tabs */
.flexlayout__tab_button {
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  padding: 0 12px;
  border: none;
  background: transparent;
}

.flexlayout__tab_button--selected {
  color: var(--text-primary);
  font-weight: 600;
}

.flexlayout__tab_button:hover {
  color: var(--text-primary);
}

/* Tab close button */
.flexlayout__tab_button_trailing {
  color: var(--text-muted);
  margin-left: 4px;
}

.flexlayout__tab_button_trailing:hover {
  color: var(--text-primary);
}

/* Tab content area */
.flexlayout__tab {
  background: var(--bg-base);
  overflow: hidden;
}

/* Splitters */
.flexlayout__splitter {
  background: var(--border-subtle);
}

.flexlayout__splitter:hover {
  background: var(--border-active);
}

/* Tabset */
.flexlayout__tabset {
  background: var(--bg-base);
  overflow: hidden;
}

/* Drag indicator */
.flexlayout__outline_rect {
  border: 2px solid var(--border-active);
}

/* Tab strip bar (the row containing tab buttons) */
.flexlayout__tabset_tabbar_outer {
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
}

/* Remove default border-radius */
.flexlayout__tabset,
.flexlayout__tab {
  border-radius: 0;
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/matthewchivers/Repos/meridian && git add src/components/layout/workspace.css && git commit -m "feat: FlexLayout CSS overrides with Meridian design tokens"
```

---

## Task 7: Simplify Panel Component & Update Demo Panels

**Files:**
- Simplify: `src/components/layout/Panel.tsx`
- Modify: `src/demo/panels/WatchlistPanel.tsx`
- Modify: `src/demo/panels/ChartPanel.tsx`
- Modify: `src/demo/panels/PricerPanel.tsx`

- [ ] **Step 1: Simplify Panel.tsx — remove title/PanelHeader**

Replace the entire file. Panel no longer renders PanelHeader (title is in the tab strip now). It keeps optional toolbar + content area.

Note: This also removes the `title` and `actions` props. None of the current demo panels use `actions`, so this is safe. `PanelHeader` remains in the design system for non-workspace use cases that need a title bar with actions. The `Workspace` public API (exported from `src/components/index.ts`) is also a breaking change — props change from `{layout, onChange, renderTile}` to `{model, factory, onModelChange}`. Acceptable since Meridian is pre-1.0 with no external consumers.

```tsx
import type { ReactNode } from 'react';
import { Toolbar } from './Toolbar';

interface PanelProps {
  toolbar?: ReactNode;
  children: ReactNode;
}

export function Panel({ toolbar, children }: PanelProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {toolbar !== undefined && <Toolbar>{toolbar}</Toolbar>}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          minHeight: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update WatchlistPanel.tsx — drop title prop**

In `src/demo/panels/WatchlistPanel.tsx`, change line 130:

```
Old: <Panel title="Watchlist">
New: <Panel>
```

- [ ] **Step 3: Update ChartPanel.tsx — drop title prop**

In `src/demo/panels/ChartPanel.tsx`, remove the `title` variable (line 21) and change line 24:

```
Old: const title = `Chart — ${selectedSymbol ?? ''}`;
     ...
     <Panel title={title}>
New: <Panel>
```

- [ ] **Step 4: Update PricerPanel.tsx — drop title prop**

In `src/demo/panels/PricerPanel.tsx`, remove the `title` variable (line 62) and change line 65:

```
Old: const title = `Pricer — ${selectedSymbol ?? ''}`;
     ...
     <Panel title={title}>
New: <Panel>
```

- [ ] **Step 5: Verify TypeScript compiles (expect errors only in App.tsx)**

```bash
cd /Users/matthewchivers/Repos/meridian && npx tsc --noEmit --pretty 2>&1 | head -30
```

- [ ] **Step 6: Commit**

```bash
cd /Users/matthewchivers/Repos/meridian && git add src/components/layout/Panel.tsx src/demo/panels/WatchlistPanel.tsx src/demo/panels/ChartPanel.tsx src/demo/panels/PricerPanel.tsx && git commit -m "refactor: simplify Panel, move title to tab strip"
```

---

## Task 8: Wire Up App.tsx and NavBar.tsx

**Files:**
- Modify: `src/demo/App.tsx`
- Modify: `src/demo/NavBar.tsx`

- [ ] **Step 1: Rewrite App.tsx**

Replace the entire file:

```tsx
import { Workspace } from '@/components/layout/Workspace';
import { useWorkspace } from '@/hooks/useWorkspace';
import { NavBar } from './NavBar';
import { panelFactory, PANEL_REGISTRY } from './panels/panel-registry';
import { ToastContainer } from '@/components/feedback/Toast';
import { PRESETS, THREE_PANEL } from './panels/workspace-presets';

export function App() {
  const { model, handleModelChange, presets, activePreset, loadPreset, addPanel } =
    useWorkspace(THREE_PANEL, PRESETS);

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-base)',
      }}
    >
      <NavBar
        currentPreset={activePreset}
        presets={Object.keys(presets)}
        onPresetChange={loadPreset}
        panelTypes={PANEL_REGISTRY}
        onAddPanel={addPanel}
      />
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <Workspace
          model={model}
          factory={panelFactory}
          onModelChange={handleModelChange}
        />
      </div>
      <ToastContainer />
    </div>
  );
}
```

- [ ] **Step 2: Update NavBar.tsx — add "Add Panel" button**

Replace the entire file:

```tsx
import { useTheme } from '@/hooks/useTheme';
import type { PanelDefinition } from './panels/panel-registry';

interface NavBarProps {
  currentPreset: string | null;
  presets: string[];
  onPresetChange: (name: string) => void;
  panelTypes: PanelDefinition[];
  onAddPanel: (type: string, title: string) => void;
}

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
        padding: '0 12px',
        gap: 16,
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
        <select
          value={currentPreset ?? ''}
          onChange={(e) => onPresetChange(e.target.value)}
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            fontSize: 13,
            padding: '2px 8px',
            borderRadius: 4,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {currentPreset === null && (
            <option value="" disabled>
              Custom layout
            </option>
          )}
          {presets.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <select
          value=""
          onChange={(e) => {
            const def = panelTypes.find((p) => p.type === e.target.value);
            if (def) onAddPanel(def.type, def.title);
          }}
          style={{
            backgroundColor: 'var(--bg-muted)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            fontSize: 13,
            padding: '2px 8px',
            borderRadius: 4,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="" disabled>
            + Add Panel
          </option>
          {panelTypes.map((def) => (
            <option key={def.type} value={def.type}>
              {def.title}
            </option>
          ))}
        </select>
      </div>

      {/* Right: Theme toggle */}
      <button
        onClick={toggle}
        style={{
          backgroundColor: 'var(--bg-muted)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-primary)',
          fontSize: 12,
          padding: '3px 10px',
          borderRadius: 4,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {theme === 'dark' ? '☀ Light' : '☾ Dark'}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles with no errors**

```bash
cd /Users/matthewchivers/Repos/meridian && npx tsc --noEmit --pretty
```

Expected: no errors.

- [ ] **Step 4: Verify app builds**

```bash
cd /Users/matthewchivers/Repos/meridian && npm run build
```

Expected: clean build, no errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/matthewchivers/Repos/meridian && git add src/demo/App.tsx src/demo/NavBar.tsx && git commit -m "feat: wire FlexLayout workspace with panel registry and add-panel UI"
```

---

## Task 9: Manual Smoke Test

- [ ] **Step 1: Start dev server**

```bash
cd /Users/matthewchivers/Repos/meridian && npm run dev
```

- [ ] **Step 2: Verify in browser**

Open the dev server URL. Check:
- Three-panel layout renders (Watchlist left, Chart top-right, Pricer bottom-right)
- Dragging splitters resizes panels
- Tab strips visible on each panel
- Dragging a tab to another panel's tab strip moves it
- "Add Panel" dropdown adds a new tab to the active tabset
- Closing a tab (X button) removes it
- Preset selector switches between "Three Panel" and "Stacked"
- Refreshing the page restores the last layout from localStorage
- Theme toggle (light/dark) still works
- Watchlist data, Chart, and Pricer all render correctly

- [ ] **Step 3: Run full test suite**

```bash
cd /Users/matthewchivers/Repos/meridian && npm test
```

Expected: all tests pass.

---

## Task 10: Update Documentation

**Files:**
- Modify: `meridian-implementation.md`
- Modify: `meridian-research.md`
- Modify: `docs/research/meridian-research.md`
- Modify: `docs/reference/patterns.md`
- Modify: `docs/reference/components.md`
- Modify: `docs/philosophy/workspace-layout.md`
- Modify: `docs/philosophy/overview.md`
- Modify: `docs/superpowers/plans/2026-03-31-meridian-implementation.md`
- Modify: `docs/superpowers/specs/2026-03-31-meridian-design-system-design.md`

- [ ] **Step 1: Update all nine docs**

In each file, replace references to `react-mosaic-component` / `Mosaic` with `FlexLayout React` / `flexlayout-react`. Update any descriptions of the workspace layout to mention tabbed panels, drag-between-tabsets, and dynamic panel add/close. Preserve the surrounding context and document structure.

Key replacements across all files:
- `react-mosaic-component` -> `flexlayout-react`
- `Mosaic` (referring to the library) -> `FlexLayout React`
- `MosaicNode` -> `IJsonModel` / `Model`
- `binary tree of split containers` -> `tree of rows, tabsets, and tabs`
- Add mentions of tab support where layout capabilities are described

- [ ] **Step 2: Verify no stale Mosaic references remain in docs**

```bash
cd /Users/matthewchivers/Repos/meridian && grep -ri "mosaic" --include="*.md" -l
```

Expected: only the migration spec and this plan file should reference Mosaic (for historical context).

- [ ] **Step 3: Commit**

```bash
cd /Users/matthewchivers/Repos/meridian && git add "*.md" docs/ && git commit -m "docs: update all references from react-mosaic to FlexLayout React"
```

---

## Task 11: Clean Up Stale localStorage

- [ ] **Step 1: Clear old Mosaic layout from localStorage on first load**

The `useWorkspace` hook already handles this — `Model.fromJson()` will throw on old Mosaic JSON (it's not a valid `IJsonModel`), and the try/catch falls back to the default preset. Verify this is the case by checking the hook code. No code change needed if the try/catch is in place.

- [ ] **Step 2: Final full test run**

```bash
cd /Users/matthewchivers/Repos/meridian && npm test
```

Expected: all tests pass.

- [ ] **Step 3: Final build check**

```bash
cd /Users/matthewchivers/Repos/meridian && npm run build
```

Expected: clean build.
