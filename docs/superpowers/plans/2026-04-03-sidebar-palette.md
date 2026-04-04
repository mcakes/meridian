# Sidebar / Palette System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable sidebar/palette system to Meridian's component library — fixed rails flanking the workspace with collapsible, reorderable tool palettes.

**Architecture:** Composition-first approach with `SidebarProvider` (context + dnd-kit), `Sidebar` (expanded/collapsed rail with resize), and `Palette` (collapsible draggable section). State lives in the provider; components register via context. CSS file with custom properties for styling.

**Tech Stack:** React 19, TypeScript, @dnd-kit/core + @dnd-kit/sortable, CSS custom properties, Vitest

---

## File Structure

```
src/components/layout/sidebar/
  types.ts              -- SidebarState, SidebarSide, PaletteRegistration types
  SidebarContext.ts      -- React context definition + hook
  sidebarReducer.ts      -- Pure reducer for all state transitions (testable)
  SidebarProvider.tsx     -- Context provider, dnd-kit setup, children layout
  Sidebar.tsx            -- Expanded/collapsed rendering, resize handle
  Palette.tsx            -- Collapsible section with drag handle
  sidebar.css            -- All sidebar/palette styles
  index.ts               -- Barrel export
  __tests__/
    sidebarReducer.test.ts  -- Reducer unit tests
    Palette.test.tsx        -- Palette rendering + collapse tests
    Sidebar.test.tsx        -- Sidebar expand/collapse + resize tests
    SidebarProvider.test.tsx -- Integration tests for full system
```

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install dnd-kit packages**

Run: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`

- [ ] **Step 2: Install @testing-library/react for component tests**

Run: `npm install -D @testing-library/react`

- [ ] **Step 3: Verify install succeeded**

Run: `npm ls @dnd-kit/core @dnd-kit/sortable @testing-library/react`
Expected: All three packages listed without errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add dnd-kit and testing-library dependencies"
```

---

### Task 2: Types and CSS Foundation

**Files:**
- Create: `src/components/layout/sidebar/types.ts`
- Create: `src/components/layout/sidebar/sidebar.css`

- [ ] **Step 1: Create types file**

```ts
// src/components/layout/sidebar/types.ts
import type { ReactNode } from 'react';

export type SidebarSide = 'left' | 'right';

export interface SidebarState {
  left: SidebarSideState;
  right: SidebarSideState;
  paletteLocations: Record<string, SidebarSide>;
}

export interface SidebarSideState {
  expanded: boolean;
  width: number;
  paletteOrder: string[];
  expandedPalettes: string[];
}

export interface PaletteDefinition {
  id: string;
  title: string;
  icon: ReactNode;
  defaultExpanded: boolean;
}

export interface SidebarProps {
  side: SidebarSide;
  defaultExpanded?: boolean;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  children: ReactNode;
}

export interface PaletteProps {
  id: string;
  title: string;
  icon: ReactNode;
  defaultExpanded?: boolean;
  children: ReactNode;
}
```

- [ ] **Step 2: Create sidebar.css**

```css
/* src/components/layout/sidebar/sidebar.css */

/* Sidebar tokens */
:root {
  --sidebar-width-collapsed: 40px;
  --sidebar-width-default: 260px;
  --sidebar-bg: var(--bg-surface);
  --sidebar-border: var(--border-subtle);
  --palette-header-bg: var(--bg-muted);
}

/* Provider layout */
.meridian-sidebar-layout {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.meridian-sidebar-layout__content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

/* Sidebar — expanded */
.meridian-sidebar {
  display: flex;
  flex-direction: column;
  background: var(--sidebar-bg);
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}

.meridian-sidebar--left {
  border-right: 1px solid var(--sidebar-border);
}

.meridian-sidebar--right {
  border-left: 1px solid var(--sidebar-border);
}

.meridian-sidebar--expanded {
  transition: width 150ms ease;
}

/* Sidebar — collapsed (icon rail) */
.meridian-sidebar--collapsed {
  width: var(--sidebar-width-collapsed);
  transition: width 150ms ease;
}

/* Sidebar header (toggle row) */
.meridian-sidebar__header {
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--sidebar-border);
  flex-shrink: 0;
}

.meridian-sidebar__toggle {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 1;
}

.meridian-sidebar__toggle:hover {
  color: var(--text-primary);
}

/* Collapsed icon strip */
.meridian-sidebar__icon-strip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  overflow-y: auto;
}

.meridian-sidebar__icon-button {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  background: var(--bg-muted);
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  padding: 0;
  position: relative;
}

.meridian-sidebar__icon-button:hover {
  background: var(--bg-highlight);
  color: var(--text-primary);
}

/* Tooltip for icon buttons */
.meridian-sidebar__icon-button[title]:hover::after {
  content: attr(title);
  position: absolute;
  white-space: nowrap;
  background: var(--bg-overlay);
  color: var(--text-primary);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 10;
}

.meridian-sidebar--left .meridian-sidebar__icon-button[title]:hover::after {
  left: calc(100% + 6px);
}

.meridian-sidebar--right .meridian-sidebar__icon-button[title]:hover::after {
  right: calc(100% + 6px);
}

/* Expanded palette list area */
.meridian-sidebar__palettes {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

/* Resize handle */
.meridian-sidebar__resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  z-index: 5;
}

.meridian-sidebar--left .meridian-sidebar__resize-handle {
  right: -3px;
}

.meridian-sidebar--right .meridian-sidebar__resize-handle {
  left: -3px;
}

.meridian-sidebar__resize-handle:hover {
  background: var(--border-active);
  opacity: 0.5;
}

/* Palette */
.meridian-palette {
  border-bottom: 1px solid var(--sidebar-border);
}

.meridian-palette__header {
  height: 28px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  background: var(--palette-header-bg);
  cursor: grab;
  user-select: none;
  flex-shrink: 0;
}

.meridian-palette__header:active {
  cursor: grabbing;
}

.meridian-palette__chevron {
  color: var(--text-muted);
  font-size: 10px;
  flex-shrink: 0;
  transition: transform 150ms ease;
  line-height: 1;
}

.meridian-palette__chevron--expanded {
  transform: rotate(90deg);
}

.meridian-palette__title {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

/* Palette body — animated expand/collapse via grid trick */
.meridian-palette__body-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 150ms ease;
}

.meridian-palette__body-wrapper--expanded {
  grid-template-rows: 1fr;
}

.meridian-palette__body {
  overflow: hidden;
  min-height: 0;
}

.meridian-palette__body-inner {
  padding: 8px;
}

/* Drag overlay styles */
.meridian-palette--drag-overlay {
  opacity: 0.85;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  background: var(--sidebar-bg);
}

.meridian-palette--drag-placeholder {
  opacity: 0.3;
}

/* Sidebar drop highlight during cross-sidebar drag */
.meridian-sidebar--drop-target {
  outline: 2px solid var(--border-active);
  outline-offset: -2px;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/sidebar/types.ts src/components/layout/sidebar/sidebar.css
git commit -m "feat(sidebar): add types and CSS foundation"
```

---

### Task 3: Sidebar Reducer (Pure State Logic)

**Files:**
- Create: `src/components/layout/sidebar/__tests__/sidebarReducer.test.ts`
- Create: `src/components/layout/sidebar/sidebarReducer.ts`

- [ ] **Step 1: Write failing tests for the reducer**

```ts
// src/components/layout/sidebar/__tests__/sidebarReducer.test.ts
import { describe, it, expect } from 'vitest';
import { sidebarReducer, buildInitialState } from '../sidebarReducer';
import type { SidebarState } from '../types';

function makeState(overrides?: Partial<SidebarState>): SidebarState {
  return {
    left: { expanded: false, width: 260, paletteOrder: [], expandedPalettes: [] },
    right: { expanded: true, width: 260, paletteOrder: [], expandedPalettes: [] },
    paletteLocations: {},
    ...overrides,
  };
}

describe('buildInitialState', () => {
  it('builds state from palette registrations', () => {
    const state = buildInitialState([
      { id: 'a', side: 'left', defaultExpanded: true },
      { id: 'b', side: 'left', defaultExpanded: false },
      { id: 'c', side: 'right', defaultExpanded: true },
    ], {
      left: { defaultExpanded: false, defaultWidth: 260 },
      right: { defaultExpanded: true, defaultWidth: 300 },
    });

    expect(state.left.paletteOrder).toEqual(['a', 'b']);
    expect(state.left.expandedPalettes).toEqual(['a']);
    expect(state.left.expanded).toBe(false);
    expect(state.left.width).toBe(260);
    expect(state.right.paletteOrder).toEqual(['c']);
    expect(state.right.expandedPalettes).toEqual(['c']);
    expect(state.right.expanded).toBe(true);
    expect(state.right.width).toBe(300);
    expect(state.paletteLocations).toEqual({ a: 'left', b: 'left', c: 'right' });
  });
});

describe('sidebarReducer', () => {
  it('toggles sidebar expanded state', () => {
    const state = makeState();
    const result = sidebarReducer(state, { type: 'toggle-sidebar', side: 'left' });
    expect(result.left.expanded).toBe(true);
  });

  it('toggles palette expanded state', () => {
    const state = makeState({
      left: { expanded: true, width: 260, paletteOrder: ['a'], expandedPalettes: [] },
      paletteLocations: { a: 'left' },
    });
    const result = sidebarReducer(state, { type: 'toggle-palette', paletteId: 'a' });
    expect(result.left.expandedPalettes).toEqual(['a']);

    const result2 = sidebarReducer(result, { type: 'toggle-palette', paletteId: 'a' });
    expect(result2.left.expandedPalettes).toEqual([]);
  });

  it('focuses a palette — expands sidebar and palette', () => {
    const state = makeState({
      left: { expanded: false, width: 260, paletteOrder: ['a', 'b'], expandedPalettes: [] },
      paletteLocations: { a: 'left', b: 'left' },
    });
    const result = sidebarReducer(state, { type: 'focus-palette', paletteId: 'b' });
    expect(result.left.expanded).toBe(true);
    expect(result.left.expandedPalettes).toContain('b');
  });

  it('sets sidebar width', () => {
    const state = makeState({
      left: { expanded: true, width: 260, paletteOrder: [], expandedPalettes: [] },
    });
    const result = sidebarReducer(state, { type: 'set-width', side: 'left', width: 320 });
    expect(result.left.width).toBe(320);
  });

  it('reorders palettes within a sidebar', () => {
    const state = makeState({
      left: { expanded: true, width: 260, paletteOrder: ['a', 'b', 'c'], expandedPalettes: [] },
      paletteLocations: { a: 'left', b: 'left', c: 'left' },
    });
    const result = sidebarReducer(state, {
      type: 'reorder',
      side: 'left',
      paletteOrder: ['c', 'a', 'b'],
    });
    expect(result.left.paletteOrder).toEqual(['c', 'a', 'b']);
  });

  it('moves a palette to the other sidebar', () => {
    const state = makeState({
      left: { expanded: true, width: 260, paletteOrder: ['a', 'b'], expandedPalettes: ['a'] },
      right: { expanded: true, width: 260, paletteOrder: ['c'], expandedPalettes: [] },
      paletteLocations: { a: 'left', b: 'left', c: 'right' },
    });
    const result = sidebarReducer(state, {
      type: 'move-palette',
      paletteId: 'a',
      toSide: 'right',
      toIndex: 0,
    });
    expect(result.left.paletteOrder).toEqual(['b']);
    expect(result.left.expandedPalettes).toEqual([]);
    expect(result.right.paletteOrder).toEqual(['a', 'c']);
    expect(result.right.expandedPalettes).toEqual(['a']);
    expect(result.paletteLocations.a).toBe('right');
  });

  it('collapses sidebar when width set below minimum via collapse-sidebar', () => {
    const state = makeState({
      left: { expanded: true, width: 260, paletteOrder: [], expandedPalettes: [] },
    });
    const result = sidebarReducer(state, { type: 'collapse-sidebar', side: 'left' });
    expect(result.left.expanded).toBe(false);
    // width is preserved for re-expansion
    expect(result.left.width).toBe(260);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/layout/sidebar/__tests__/sidebarReducer.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the reducer**

```ts
// src/components/layout/sidebar/sidebarReducer.ts
import type { SidebarState, SidebarSide, SidebarSideState } from './types';

interface PaletteInit {
  id: string;
  side: SidebarSide;
  defaultExpanded: boolean;
}

interface SidebarInit {
  defaultExpanded: boolean;
  defaultWidth: number;
}

export function buildInitialState(
  palettes: PaletteInit[],
  sidebars: Record<SidebarSide, SidebarInit>,
): SidebarState {
  const paletteLocations: Record<string, SidebarSide> = {};
  const left: SidebarSideState = {
    expanded: sidebars.left.defaultExpanded,
    width: sidebars.left.defaultWidth,
    paletteOrder: [],
    expandedPalettes: [],
  };
  const right: SidebarSideState = {
    expanded: sidebars.right.defaultExpanded,
    width: sidebars.right.defaultWidth,
    paletteOrder: [],
    expandedPalettes: [],
  };

  for (const p of palettes) {
    paletteLocations[p.id] = p.side;
    const sideState = p.side === 'left' ? left : right;
    sideState.paletteOrder.push(p.id);
    if (p.defaultExpanded) {
      sideState.expandedPalettes.push(p.id);
    }
  }

  return { left, right, paletteLocations };
}

export type SidebarAction =
  | { type: 'toggle-sidebar'; side: SidebarSide }
  | { type: 'collapse-sidebar'; side: SidebarSide }
  | { type: 'toggle-palette'; paletteId: string }
  | { type: 'focus-palette'; paletteId: string }
  | { type: 'set-width'; side: SidebarSide; width: number }
  | { type: 'reorder'; side: SidebarSide; paletteOrder: string[] }
  | { type: 'move-palette'; paletteId: string; toSide: SidebarSide; toIndex: number };

export function sidebarReducer(state: SidebarState, action: SidebarAction): SidebarState {
  switch (action.type) {
    case 'toggle-sidebar': {
      const side = state[action.side];
      return {
        ...state,
        [action.side]: { ...side, expanded: !side.expanded },
      };
    }

    case 'collapse-sidebar': {
      const side = state[action.side];
      return {
        ...state,
        [action.side]: { ...side, expanded: false },
      };
    }

    case 'toggle-palette': {
      const location = state.paletteLocations[action.paletteId];
      if (!location) return state;
      const side = state[location];
      const isExpanded = side.expandedPalettes.includes(action.paletteId);
      return {
        ...state,
        [location]: {
          ...side,
          expandedPalettes: isExpanded
            ? side.expandedPalettes.filter((id) => id !== action.paletteId)
            : [...side.expandedPalettes, action.paletteId],
        },
      };
    }

    case 'focus-palette': {
      const location = state.paletteLocations[action.paletteId];
      if (!location) return state;
      const side = state[location];
      const expandedPalettes = side.expandedPalettes.includes(action.paletteId)
        ? side.expandedPalettes
        : [...side.expandedPalettes, action.paletteId];
      return {
        ...state,
        [location]: { ...side, expanded: true, expandedPalettes },
      };
    }

    case 'set-width': {
      const side = state[action.side];
      return {
        ...state,
        [action.side]: { ...side, width: action.width },
      };
    }

    case 'reorder': {
      const side = state[action.side];
      return {
        ...state,
        [action.side]: { ...side, paletteOrder: action.paletteOrder },
      };
    }

    case 'move-palette': {
      const fromSide = state.paletteLocations[action.paletteId];
      if (!fromSide) return state;
      const from = state[fromSide];
      const to = state[action.toSide];
      const wasExpanded = from.expandedPalettes.includes(action.paletteId);

      const newFromOrder = from.paletteOrder.filter((id) => id !== action.paletteId);
      const newFromExpanded = from.expandedPalettes.filter((id) => id !== action.paletteId);

      const newToOrder = [...to.paletteOrder];
      newToOrder.splice(action.toIndex, 0, action.paletteId);
      const newToExpanded = wasExpanded
        ? [...to.expandedPalettes, action.paletteId]
        : to.expandedPalettes;

      return {
        ...state,
        [fromSide]: { ...from, paletteOrder: newFromOrder, expandedPalettes: newFromExpanded },
        [action.toSide]: { ...to, paletteOrder: newToOrder, expandedPalettes: newToExpanded },
        paletteLocations: { ...state.paletteLocations, [action.paletteId]: action.toSide },
      };
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/layout/sidebar/__tests__/sidebarReducer.test.ts`
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/sidebar/sidebarReducer.ts src/components/layout/sidebar/__tests__/sidebarReducer.test.ts
git commit -m "feat(sidebar): add sidebar state reducer with tests"
```

---

### Task 4: Sidebar Context

**Files:**
- Create: `src/components/layout/sidebar/SidebarContext.ts`

- [ ] **Step 1: Create the context**

```ts
// src/components/layout/sidebar/SidebarContext.ts
import { createContext, useContext } from 'react';
import type { SidebarState, SidebarSide, PaletteDefinition } from './types';
import type { SidebarAction } from './sidebarReducer';

export interface SidebarContextValue {
  state: SidebarState;
  dispatch: (action: SidebarAction) => void;
  registerPalette: (palette: PaletteDefinition, side: SidebarSide) => void;
  unregisterPalette: (id: string) => void;
  /** Palette metadata keyed by id — used by Sidebar to render collapsed icon strip */
  paletteRegistry: Map<string, PaletteDefinition>;
  /** Which sides have a Sidebar rendered */
  activeSides: Set<SidebarSide>;
  registerSide: (side: SidebarSide) => void;
  unregisterSide: (side: SidebarSide) => void;
}

export const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebarContext(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/sidebar/SidebarContext.ts
git commit -m "feat(sidebar): add SidebarContext and hook"
```

---

### Task 5: Palette Component

**Files:**
- Create: `src/components/layout/sidebar/__tests__/Palette.test.tsx`
- Create: `src/components/layout/sidebar/Palette.tsx`

- [ ] **Step 1: Write failing tests for Palette**

```tsx
// src/components/layout/sidebar/__tests__/Palette.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Palette } from '../Palette';
import { SidebarContext } from '../SidebarContext';
import type { SidebarContextValue } from '../SidebarContext';
import type { SidebarState } from '../types';

function makeCtx(overrides?: Partial<SidebarState>): SidebarContextValue {
  const state: SidebarState = {
    left: { expanded: true, width: 260, paletteOrder: ['test-palette'], expandedPalettes: [] },
    right: { expanded: true, width: 260, paletteOrder: [], expandedPalettes: [] },
    paletteLocations: { 'test-palette': 'left' },
    ...overrides,
  };
  return {
    state,
    dispatch: vi.fn(),
    registerPalette: vi.fn(),
    unregisterPalette: vi.fn(),
    paletteRegistry: new Map(),
    activeSides: new Set(['left', 'right']),
    registerSide: vi.fn(),
    unregisterSide: vi.fn(),
  };
}

function renderPalette(ctx: SidebarContextValue, expanded = false) {
  return render(
    <SidebarContext.Provider value={ctx}>
      <Palette id="test-palette" title="Test Palette" icon={<span>T</span>} defaultExpanded={expanded}>
        <div data-testid="palette-content">Hello</div>
      </Palette>
    </SidebarContext.Provider>,
  );
}

describe('Palette', () => {
  it('renders the title', () => {
    const ctx = makeCtx();
    renderPalette(ctx);
    expect(screen.getByText('Test Palette')).toBeDefined();
  });

  it('renders collapsed by default (content hidden)', () => {
    const ctx = makeCtx();
    renderPalette(ctx);
    const wrapper = screen.getByTestId('palette-content').closest('.meridian-palette__body-wrapper');
    expect(wrapper?.classList.contains('meridian-palette__body-wrapper--expanded')).toBe(false);
  });

  it('dispatches toggle-palette on header click', () => {
    const ctx = makeCtx();
    renderPalette(ctx);
    fireEvent.click(screen.getByText('Test Palette'));
    expect(ctx.dispatch).toHaveBeenCalledWith({ type: 'toggle-palette', paletteId: 'test-palette' });
  });

  it('shows expanded body when palette is in expandedPalettes', () => {
    const ctx = makeCtx({
      left: { expanded: true, width: 260, paletteOrder: ['test-palette'], expandedPalettes: ['test-palette'] },
      paletteLocations: { 'test-palette': 'left' },
    });
    renderPalette(ctx);
    const wrapper = screen.getByTestId('palette-content').closest('.meridian-palette__body-wrapper');
    expect(wrapper?.classList.contains('meridian-palette__body-wrapper--expanded')).toBe(true);
  });

  it('registers and unregisters on mount/unmount', () => {
    const ctx = makeCtx();
    const { unmount } = renderPalette(ctx);
    expect(ctx.registerPalette).toHaveBeenCalled();
    unmount();
    expect(ctx.unregisterPalette).toHaveBeenCalledWith('test-palette');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/layout/sidebar/__tests__/Palette.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the Palette component**

```tsx
// src/components/layout/sidebar/Palette.tsx
import { useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PaletteProps } from './types';
import { useSidebarContext } from './SidebarContext';

export function Palette({ id, title, icon, defaultExpanded = false, children }: PaletteProps) {
  const { state, dispatch, registerPalette, unregisterPalette } = useSidebarContext();
  const registeredRef = useRef(false);

  const side = state.paletteLocations[id];
  const isExpanded = side ? state[side].expandedPalettes.includes(id) : false;

  useEffect(() => {
    if (!registeredRef.current) {
      registerPalette({ id, title, icon, defaultExpanded }, side ?? 'left');
      registeredRef.current = true;
    }
    return () => {
      unregisterPalette(id);
    };
  }, [id]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      className={`meridian-palette${isDragging ? ' meridian-palette--drag-placeholder' : ''}`}
      style={style}
    >
      <div
        className="meridian-palette__header"
        onClick={() => dispatch({ type: 'toggle-palette', paletteId: id })}
        {...attributes}
        {...listeners}
      >
        <span className={`meridian-palette__chevron${isExpanded ? ' meridian-palette__chevron--expanded' : ''}`}>
          &#9654;
        </span>
        <span className="meridian-palette__title">{title}</span>
      </div>
      <div className={`meridian-palette__body-wrapper${isExpanded ? ' meridian-palette__body-wrapper--expanded' : ''}`}>
        <div className="meridian-palette__body">
          <div className="meridian-palette__body-inner">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/layout/sidebar/__tests__/Palette.test.tsx`
Expected: All tests PASS. (Note: useSortable may need a DndContext wrapper in tests. If tests fail because of missing DndContext, wrap the test render in `<DndContext><SortableContext items={['test-palette']}>...</SortableContext></DndContext>`. Update the `renderPalette` helper accordingly.)

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/sidebar/Palette.tsx src/components/layout/sidebar/__tests__/Palette.test.tsx
git commit -m "feat(sidebar): add Palette component with tests"
```

---

### Task 6: Sidebar Component

**Files:**
- Create: `src/components/layout/sidebar/__tests__/Sidebar.test.tsx`
- Create: `src/components/layout/sidebar/Sidebar.tsx`

- [ ] **Step 1: Write failing tests for Sidebar**

```tsx
// src/components/layout/sidebar/__tests__/Sidebar.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../Sidebar';
import { SidebarContext } from '../SidebarContext';
import type { SidebarContextValue } from '../SidebarContext';
import type { SidebarState } from '../types';

function makeCtx(overrides?: Partial<SidebarState>): SidebarContextValue {
  const state: SidebarState = {
    left: { expanded: true, width: 260, paletteOrder: ['a', 'b'], expandedPalettes: [] },
    right: { expanded: true, width: 260, paletteOrder: [], expandedPalettes: [] },
    paletteLocations: { a: 'left', b: 'left' },
    ...overrides,
  };
  return {
    state,
    dispatch: vi.fn(),
    registerPalette: vi.fn(),
    unregisterPalette: vi.fn(),
    paletteRegistry: new Map([['a', { id: 'a', title: 'Palette A', icon: null, defaultExpanded: false }], ['b', { id: 'b', title: 'Palette B', icon: null, defaultExpanded: false }]]),
    activeSides: new Set(['left', 'right']),
    registerSide: vi.fn(),
    unregisterSide: vi.fn(),
  };
}

describe('Sidebar', () => {
  it('renders expanded with correct width', () => {
    const ctx = makeCtx();
    const { container } = render(
      <SidebarContext.Provider value={ctx}>
        <Sidebar side="left"><div>child</div></Sidebar>
      </SidebarContext.Provider>,
    );
    const sidebar = container.querySelector('.meridian-sidebar');
    expect(sidebar?.classList.contains('meridian-sidebar--expanded')).toBe(true);
    expect((sidebar as HTMLElement)?.style.width).toBe('260px');
  });

  it('renders collapsed as icon rail', () => {
    const ctx = makeCtx({
      left: { expanded: false, width: 260, paletteOrder: ['a', 'b'], expandedPalettes: [] },
      paletteLocations: { a: 'left', b: 'left' },
    });
    const { container } = render(
      <SidebarContext.Provider value={ctx}>
        <Sidebar side="left"><div>child</div></Sidebar>
      </SidebarContext.Provider>,
    );
    const sidebar = container.querySelector('.meridian-sidebar');
    expect(sidebar?.classList.contains('meridian-sidebar--collapsed')).toBe(true);
    expect(container.querySelector('.meridian-sidebar__icon-strip')).not.toBeNull();
  });

  it('dispatches toggle-sidebar when chevron clicked', () => {
    const ctx = makeCtx();
    render(
      <SidebarContext.Provider value={ctx}>
        <Sidebar side="left"><div>child</div></Sidebar>
      </SidebarContext.Provider>,
    );
    const toggle = screen.getByRole('button', { name: /collapse/i });
    fireEvent.click(toggle);
    expect(ctx.dispatch).toHaveBeenCalledWith({ type: 'toggle-sidebar', side: 'left' });
  });

  it('dispatches focus-palette when icon clicked in collapsed state', () => {
    const ctx = makeCtx({
      left: { expanded: false, width: 260, paletteOrder: ['a'], expandedPalettes: [] },
      paletteLocations: { a: 'left' },
    });
    // Register palette info so icons can render
    ctx.state = {
      ...ctx.state,
      left: { ...ctx.state.left, paletteOrder: ['a'] },
    };
    render(
      <SidebarContext.Provider value={ctx}>
        <Sidebar side="left"><div>child</div></Sidebar>
      </SidebarContext.Provider>,
    );
    const icons = screen.getAllByRole('button');
    // First button is the toggle, subsequent are palette icons
    const paletteIcon = icons.find((btn) => btn.classList.contains('meridian-sidebar__icon-button'));
    if (paletteIcon) {
      fireEvent.click(paletteIcon);
      expect(ctx.dispatch).toHaveBeenCalledWith({ type: 'focus-palette', paletteId: 'a' });
    }
  });

  it('registers and unregisters side on mount/unmount', () => {
    const ctx = makeCtx();
    const { unmount } = render(
      <SidebarContext.Provider value={ctx}>
        <Sidebar side="left"><div>child</div></Sidebar>
      </SidebarContext.Provider>,
    );
    expect(ctx.registerSide).toHaveBeenCalledWith('left');
    unmount();
    expect(ctx.unregisterSide).toHaveBeenCalledWith('left');
  });

  it('renders resize handle when expanded', () => {
    const ctx = makeCtx();
    const { container } = render(
      <SidebarContext.Provider value={ctx}>
        <Sidebar side="left"><div>child</div></Sidebar>
      </SidebarContext.Provider>,
    );
    expect(container.querySelector('.meridian-sidebar__resize-handle')).not.toBeNull();
  });

  it('does not render resize handle when collapsed', () => {
    const ctx = makeCtx({
      left: { expanded: false, width: 260, paletteOrder: [], expandedPalettes: [] },
    });
    const { container } = render(
      <SidebarContext.Provider value={ctx}>
        <Sidebar side="left"><div>child</div></Sidebar>
      </SidebarContext.Provider>,
    );
    expect(container.querySelector('.meridian-sidebar__resize-handle')).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/layout/sidebar/__tests__/Sidebar.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the Sidebar component**

```tsx
// src/components/layout/sidebar/Sidebar.tsx
import { useEffect, useRef, useCallback, Children } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { SidebarProps } from './types';
import { useSidebarContext } from './SidebarContext';

export function Sidebar({
  side,
  defaultExpanded = false,
  defaultWidth = 260,
  minWidth = 200,
  maxWidth = 480,
  children,
}: SidebarProps) {
  const { state, dispatch, registerSide, unregisterSide, paletteRegistry } = useSidebarContext();
  const sideState = state[side];
  const isExpanded = sideState.expanded;
  const resizeRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: `sidebar-${side}` });

  useEffect(() => {
    registerSide(side);
    return () => unregisterSide(side);
  }, [side]);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      resizeRef.current = { startX: e.clientX, startWidth: sideState.width };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!resizeRef.current) return;
        const delta = side === 'left'
          ? moveEvent.clientX - resizeRef.current.startX
          : resizeRef.current.startX - moveEvent.clientX;
        const newWidth = resizeRef.current.startWidth + delta;

        if (newWidth < minWidth) {
          dispatch({ type: 'collapse-sidebar', side });
          resizeRef.current = null;
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          return;
        }

        dispatch({ type: 'set-width', side, width: Math.min(newWidth, maxWidth) });
      };

      const handleMouseUp = () => {
        resizeRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [side, sideState.width, minWidth, maxWidth, dispatch],
  );

  // Collect palette icons for collapsed view from registered palettes in state
  const paletteIds = sideState.paletteOrder;

  if (!isExpanded) {
    return (
      <div
        ref={sidebarRef}
        className={`meridian-sidebar meridian-sidebar--${side} meridian-sidebar--collapsed`}
      >
        <div className="meridian-sidebar__header">
          <button
            className="meridian-sidebar__toggle"
            onClick={() => dispatch({ type: 'toggle-sidebar', side })}
            aria-label="Expand sidebar"
          >
            {side === 'left' ? '\u25B6' : '\u25C0'}
          </button>
        </div>
        <div className="meridian-sidebar__icon-strip">
          {paletteIds.map((id) => {
            const meta = paletteRegistry.get(id);
            return (
              <button
                key={id}
                className="meridian-sidebar__icon-button"
                title={meta?.title ?? id}
                onClick={() => dispatch({ type: 'focus-palette', paletteId: id })}
              >
                {meta?.icon}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={(node) => {
        sidebarRef.current = node;
        setDroppableRef(node);
      }}
      className={`meridian-sidebar meridian-sidebar--${side} meridian-sidebar--expanded${isOver ? ' meridian-sidebar--drop-target' : ''}`}
      style={{ width: sideState.width }}
    >
      <div className="meridian-sidebar__header">
        <button
          className="meridian-sidebar__toggle"
          onClick={() => dispatch({ type: 'toggle-sidebar', side })}
          aria-label="Collapse sidebar"
        >
          {side === 'left' ? '\u25C0' : '\u25B6'}
        </button>
      </div>
      <div className="meridian-sidebar__palettes">
        <SortableContext items={paletteIds} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </div>
      <div
        className="meridian-sidebar__resize-handle"
        onMouseDown={handleResizeStart}
      />
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/layout/sidebar/__tests__/Sidebar.test.tsx`
Expected: All tests PASS. (Note: SortableContext and useDroppable need a DndContext parent. If tests fail, wrap the test render in `<DndContext>...</DndContext>` from `@dnd-kit/core`.)

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/sidebar/Sidebar.tsx src/components/layout/sidebar/__tests__/Sidebar.test.tsx
git commit -m "feat(sidebar): add Sidebar component with expand/collapse and resize"
```

---

### Task 7: SidebarProvider Component

**Files:**
- Create: `src/components/layout/sidebar/__tests__/SidebarProvider.test.tsx`
- Create: `src/components/layout/sidebar/SidebarProvider.tsx`

- [ ] **Step 1: Write failing tests for SidebarProvider**

```tsx
// src/components/layout/sidebar/__tests__/SidebarProvider.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarProvider } from '../SidebarProvider';
import { Sidebar } from '../Sidebar';
import { Palette } from '../Palette';

describe('SidebarProvider', () => {
  it('renders children in a flex row layout', () => {
    const { container } = render(
      <SidebarProvider>
        <div data-testid="content">Content</div>
      </SidebarProvider>,
    );
    const layout = container.querySelector('.meridian-sidebar-layout');
    expect(layout).not.toBeNull();
    expect(screen.getByTestId('content')).toBeDefined();
  });

  it('renders left sidebar, content, and right sidebar in correct order', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar side="left" defaultExpanded>
          <Palette id="p1" title="P1" icon={<span>1</span>}>
            <div>Left content</div>
          </Palette>
        </Sidebar>
        <div data-testid="workspace">Workspace</div>
        <Sidebar side="right" defaultExpanded>
          <Palette id="p2" title="P2" icon={<span>2</span>}>
            <div>Right content</div>
          </Palette>
        </Sidebar>
      </SidebarProvider>,
    );
    const layout = container.querySelector('.meridian-sidebar-layout');
    expect(layout).not.toBeNull();
    expect(screen.getByText('P1')).toBeDefined();
    expect(screen.getByTestId('workspace')).toBeDefined();
    expect(screen.getByText('P2')).toBeDefined();
  });

  it('calls onStateChange when state changes', () => {
    const onChange = vi.fn();
    render(
      <SidebarProvider onStateChange={onChange}>
        <Sidebar side="left" defaultExpanded>
          <Palette id="p1" title="P1" icon={<span>1</span>}>
            <div>Content</div>
          </Palette>
        </Sidebar>
        <div>Main</div>
      </SidebarProvider>,
    );
    // Click palette header to toggle it
    fireEvent.click(screen.getByText('P1'));
    expect(onChange).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/layout/sidebar/__tests__/SidebarProvider.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the SidebarProvider component**

```tsx
// src/components/layout/sidebar/SidebarProvider.tsx
import {
  useReducer,
  useCallback,
  useRef,
  useEffect,
  useState,
  Children,
  isValidElement,
} from 'react';
import type { ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { SidebarState, SidebarSide, PaletteDefinition } from './types';
import { sidebarReducer, buildInitialState } from './sidebarReducer';
import type { SidebarAction } from './sidebarReducer';
import { SidebarContext } from './SidebarContext';
import { Sidebar } from './Sidebar';
import './sidebar.css';

interface SidebarProviderProps {
  children: ReactNode;
  state?: SidebarState;
  onStateChange?: (state: SidebarState) => void;
}

export function SidebarProvider({ children, state: controlledState, onStateChange }: SidebarProviderProps) {
  const [activeSides, setActiveSides] = useState<Set<SidebarSide>>(new Set());
  const paletteRegistrations = useRef<Map<string, { palette: PaletteDefinition; side: SidebarSide }>>(new Map());
  const [paletteRegistry, setPaletteRegistry] = useState<Map<string, PaletteDefinition>>(new Map());
  const isInitialised = useRef(false);

  const [internalState, rawDispatch] = useReducer(sidebarReducer, undefined, () =>
    buildInitialState([], {
      left: { defaultExpanded: false, defaultWidth: 260 },
      right: { defaultExpanded: false, defaultWidth: 260 },
    }),
  );

  const state = controlledState ?? internalState;

  const dispatch = useCallback(
    (action: SidebarAction) => {
      rawDispatch(action);
      // onStateChange is called in the effect below after state updates
    },
    [],
  );

  // Fire onStateChange after internal state changes
  const prevStateRef = useRef(state);
  useEffect(() => {
    if (prevStateRef.current !== internalState && onStateChange) {
      onStateChange(internalState);
    }
    prevStateRef.current = internalState;
  }, [internalState, onStateChange]);

  const registerPalette = useCallback((palette: PaletteDefinition, side: SidebarSide) => {
    paletteRegistrations.current.set(palette.id, { palette, side });
    setPaletteRegistry((prev) => {
      const next = new Map(prev);
      next.set(palette.id, palette);
      return next;
    });
  }, []);

  const unregisterPalette = useCallback((id: string) => {
    paletteRegistrations.current.delete(id);
    setPaletteRegistry((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const registerSide = useCallback((side: SidebarSide) => {
    setActiveSides((prev) => {
      const next = new Set(prev);
      next.add(side);
      return next;
    });
  }, []);

  const unregisterSide = useCallback((side: SidebarSide) => {
    setActiveSides((prev) => {
      const next = new Set(prev);
      next.delete(side);
      return next;
    });
  }, []);

  // Drag state
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragId(null);
      const { active, over } = event;
      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);
      const activeSide = state.paletteLocations[activeId];
      if (!activeSide) return;

      // Check if dropped on the other sidebar's droppable
      if (overId === 'sidebar-left' || overId === 'sidebar-right') {
        const toSide = overId === 'sidebar-left' ? 'left' : 'right' as SidebarSide;
        if (toSide !== activeSide) {
          dispatch({
            type: 'move-palette',
            paletteId: activeId,
            toSide,
            toIndex: state[toSide].paletteOrder.length,
          });
        }
        return;
      }

      // Reorder within same sidebar
      const overSide = state.paletteLocations[overId];
      if (overSide && overSide === activeSide) {
        const order = state[activeSide].paletteOrder;
        const oldIndex = order.indexOf(activeId);
        const newIndex = order.indexOf(overId);
        if (oldIndex !== newIndex) {
          dispatch({
            type: 'reorder',
            side: activeSide,
            paletteOrder: arrayMove(order, oldIndex, newIndex),
          });
        }
      } else if (overSide && overSide !== activeSide) {
        // Dropped on a palette in the other sidebar
        const toIndex = state[overSide].paletteOrder.indexOf(overId);
        dispatch({
          type: 'move-palette',
          paletteId: activeId,
          toSide: overSide,
          toIndex: toIndex >= 0 ? toIndex : state[overSide].paletteOrder.length,
        });
      }
    },
    [state, dispatch],
  );

  // Separate Sidebar children from content children
  const leftSidebar: ReactNode[] = [];
  const rightSidebar: ReactNode[] = [];
  const content: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === Sidebar) {
      const side = (child.props as { side: SidebarSide }).side;
      if (side === 'left') leftSidebar.push(child);
      else rightSidebar.push(child);
    } else {
      content.push(child);
    }
  });

  return (
    <SidebarContext.Provider
      value={{ state, dispatch, registerPalette, unregisterPalette, paletteRegistry, activeSides, registerSide, unregisterSide }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="meridian-sidebar-layout">
          {leftSidebar}
          <div className="meridian-sidebar-layout__content">
            {content}
          </div>
          {rightSidebar}
        </div>
        <DragOverlay>
          {activeDragId ? (
            <div className="meridian-palette meridian-palette--drag-overlay">
              <div className="meridian-palette__header">
                <span className="meridian-palette__title">{activeDragId}</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </SidebarContext.Provider>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/layout/sidebar/__tests__/SidebarProvider.test.tsx`
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/sidebar/SidebarProvider.tsx src/components/layout/sidebar/__tests__/SidebarProvider.test.tsx
git commit -m "feat(sidebar): add SidebarProvider with dnd-kit integration"
```

---

### Task 8: Barrel Exports

**Files:**
- Create: `src/components/layout/sidebar/index.ts`
- Modify: `src/components/index.ts`

- [ ] **Step 1: Create sidebar barrel export**

```ts
// src/components/layout/sidebar/index.ts
export { SidebarProvider } from './SidebarProvider';
export { Sidebar } from './Sidebar';
export { Palette } from './Palette';
export type { SidebarState, SidebarSide, SidebarProps, PaletteProps } from './types';
```

- [ ] **Step 2: Add sidebar exports to main barrel**

Add the following to `src/components/index.ts` after the existing Layout section:

```ts
// Sidebar
export { SidebarProvider, Sidebar, Palette } from './layout/sidebar';
export type { SidebarState, SidebarSide } from './layout/sidebar';
```

- [ ] **Step 3: Verify the build compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/sidebar/index.ts src/components/index.ts
git commit -m "feat(sidebar): add barrel exports for sidebar components"
```

---

### Task 9: Run Full Test Suite

**Files:** None (verification only)

- [ ] **Step 1: Run all sidebar tests**

Run: `npx vitest run src/components/layout/sidebar/`
Expected: All tests PASS.

- [ ] **Step 2: Run full project test suite**

Run: `npm test`
Expected: All tests PASS, no regressions.

- [ ] **Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit any fixes needed**

If any fixes were required, commit them:
```bash
git add -A
git commit -m "fix(sidebar): address test/type issues from integration"
```
