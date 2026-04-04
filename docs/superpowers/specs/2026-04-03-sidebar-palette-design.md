# Sidebar / Palette System Design

## Overview

A sidebar and palette system for Meridian's component library. Sidebars are fixed rails that flank the workspace area (left, right, or both). They contain palettes -- collapsible, reorderable tool containers. Sidebars expand/collapse via a toggle button and are resizable when expanded. Palettes can be dragged to reorder within a sidebar or moved between sidebars.

This is a library-level feature: `SidebarProvider`, `Sidebar`, and `Palette` are exported as reusable components.

## Component API

### SidebarProvider

Wraps the layout area. Provides dnd-kit context and shared sidebar state. Renders children in a horizontal flex row. `Sidebar` components register themselves with the provider via context (keyed by `side` prop). Non-Sidebar children render in the center as the main content area. The provider applies `display: flex` with `flex: 1` on the content area so it fills remaining space.

Props:
- `children: ReactNode` -- expects `Sidebar` and content elements
- `onStateChange?: (state: SidebarState) => void` -- callback for persistence
- `state?: SidebarState` -- controlled mode for restoring saved layouts

### Sidebar

Renders either the collapsed icon strip or the expanded panel with palettes.

Props:
- `side: 'left' | 'right'` (required)
- `defaultExpanded?: boolean` (default `false`)
- `defaultWidth?: number` (default `260`)
- `minWidth?: number` (default `200`)
- `maxWidth?: number` (default `480`)
- `children: ReactNode` -- `Palette` elements

### Palette

A collapsible section within a sidebar. Draggable for reordering and cross-sidebar moves.

Props:
- `id: string` (required, unique identifier for drag/drop)
- `title: string` (required)
- `icon: ReactNode` (required, shown in collapsed sidebar icon strip)
- `defaultExpanded?: boolean` (default `false`)
- `children: ReactNode` -- palette content

### Usage

```tsx
<SidebarProvider>
  <Sidebar side="left" defaultExpanded={false}>
    <Palette id="watchlist" title="Watchlist" icon={<EyeIcon />}>
      <WatchlistControls />
    </Palette>
    <Palette id="alerts" title="Alerts" icon={<BellIcon />}>
      <AlertsPanel />
    </Palette>
  </Sidebar>

  <div className="workspace-area">
    {/* FlexLayout or any content */}
  </div>

  <Sidebar side="right" defaultExpanded={true} defaultWidth={260}>
    <Palette id="filters" title="Filters" icon={<FilterIcon />} defaultExpanded>
      <FilterControls />
    </Palette>
    <Palette id="actions" title="Quick Actions" icon={<ZapIcon />} defaultExpanded>
      <ActionButtons />
    </Palette>
  </Sidebar>
</SidebarProvider>
```

## State Management

SidebarProvider manages all state internally via React context:

```ts
interface SidebarState {
  left: {
    expanded: boolean;
    width: number;
    paletteOrder: string[];
    expandedPalettes: Set<string>;
  };
  right: {
    expanded: boolean;
    width: number;
    paletteOrder: string[];
    expandedPalettes: Set<string>;
  };
  paletteLocations: Record<string, 'left' | 'right'>;
}
```

Key behaviours:
- Palette order and locations update on dnd-kit drag end
- When a palette is dragged to the other sidebar, `paletteLocations` updates and the palette moves
- Sidebar expand/collapse is toggled via the chevron button
- Sidebar width is adjusted by dragging the inner edge
- Individual palette expand/collapse is toggled via the palette header chevron
- Clicking an icon in the collapsed strip expands the sidebar and expands that palette, scrolling to it if needed

### Persistence

No built-in persistence. State is ephemeral by default. The provider exposes `onStateChange` so consumers can persist to localStorage or wherever. An optional `state` prop allows controlled mode for restoring saved layouts.

## Collapsed Sidebar Behaviour

When collapsed, the sidebar renders as a narrow rail (~40px wide):

- A toggle chevron at the top (pointing toward the workspace: `>` for left, `<` for right)
- Below that, an icon for each palette in the current order
- Icons are the `icon` prop from each Palette, rendered at ~24px in a small rounded container
- Icons show a tooltip on hover with the palette title

**Clicking an icon:**
1. Expands the sidebar to its remembered width
2. Expands that specific palette if it was collapsed
3. Scrolls the palette into view if below the fold

**Clicking the toggle chevron:**
1. Expands the sidebar to its remembered width
2. Palette expand/collapse states are preserved from before collapse

**Collapsing via toggle:** Clicking the chevron on an expanded sidebar collapses it to the icon rail. Width is remembered for next expand.

**Collapsing via drag:** Dragging the resize handle below `minWidth` snaps to collapsed. The toggle button remains the primary mechanism.

## Drag and Drop

Uses `@dnd-kit/core` + `@dnd-kit/sortable`.

### Drag handle

The palette header bar acts as the drag handle. Cursor changes to `grab` on hover.

### Reordering within a sidebar

Palettes are wrapped in a `SortableContext` per sidebar. Dragging vertically reorders within the same sidebar. A subtle drop indicator line shows the insertion point.

### Moving between sidebars

Dragging a palette horizontally past the workspace toward the other sidebar transfers it to that sidebar's list. Uses dnd-kit's `DragOverlay` for the ghost preview and collision detection to determine the drop target sidebar.

### Constraints

- Palettes can only be dropped into sidebars, not into the workspace
- If only one `Sidebar` is rendered, cross-sidebar dragging is disabled (reorder only)
- Drag is disabled when the sidebar is collapsed

### Visual feedback during drag

- Dragged palette gets a semi-transparent overlay clone following the cursor
- Source position shows a placeholder gap
- Target sidebar highlights subtly when a palette is dragged over it

## Resize Handle

The resize handle sits on the sidebar's inner edge (facing the workspace):
- Left sidebar: handle on the right edge
- Right sidebar: handle on the left edge

Implementation: A thin invisible hit area (~6px wide) on the inner edge. Cursor changes to `col-resize` on hover.

Behaviour:
- Dragging adjusts sidebar width, clamped between `minWidth` and `maxWidth`
- Workspace flexes to fill remaining space via CSS flex
- Dragging below `minWidth` snaps to collapsed state
- Dragging out from collapsed state is not supported -- use toggle or icon click to expand

No library needed -- simple `mousedown`/`mousemove`/`mouseup` handlers.

## Styling

CSS custom properties with token references, following Meridian's existing approach.

### New tokens

- `--sidebar-width-collapsed: 40px`
- `--sidebar-width-default: 260px`
- `--sidebar-bg: var(--color-bg-surface)`
- `--sidebar-border: var(--color-border-subtle)`
- `--palette-header-bg: var(--color-bg-muted)`

### CSS file

Single `sidebar.css` in `src/components/layout/sidebar/`. Class names referencing token variables, same pattern as `workspace.css`.

### Palette header

28px height, matching `PanelHeader` convention for visual consistency.

### Animations

- Sidebar expand/collapse: CSS transition on width (~150ms ease)
- Palette expand/collapse: CSS transition using `grid-template-rows: 0fr` / `1fr` (~150ms ease)
- Resize dragging: no transition (immediate feedback)

### Theming

Dark/light theme inherited automatically through the token system.

## File Structure

```
src/components/layout/
  sidebar/
    SidebarProvider.tsx    -- context, dnd-kit setup, state management
    Sidebar.tsx            -- expanded/collapsed rendering, resize handle
    Palette.tsx            -- collapsible section with drag handle
    sidebar.css            -- all sidebar/palette styles
    index.ts               -- barrel export
```

Exported from main `src/components/index.ts` barrel:

```tsx
import { SidebarProvider, Sidebar, Palette } from '@meridian/components';
```

`SidebarState` type is also exported for consumers who need controlled mode.

## Dependencies

New: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
