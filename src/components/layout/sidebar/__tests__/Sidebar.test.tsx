// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { Sidebar } from '../Sidebar';
import { SidebarContext } from '../SidebarContext';
import type { SidebarContextValue } from '../SidebarContext';
import type { SidebarState, PaletteDefinition } from '../types';

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
    paletteRegistry: new Map<string, PaletteDefinition>([
      ['a', { id: 'a', title: 'Palette A', icon: null as any, defaultExpanded: false }],
      ['b', { id: 'b', title: 'Palette B', icon: null as any, defaultExpanded: false }],
    ]),
    activeSides: new Set<'left' | 'right'>(['left', 'right']),
    registerSide: vi.fn(),
    unregisterSide: vi.fn(),
  };
}

function renderSidebar(ctx: SidebarContextValue, side: 'left' | 'right' = 'left') {
  return render(
    <SidebarContext.Provider value={ctx}>
      <DndContext>
        <Sidebar side={side}><div>child</div></Sidebar>
      </DndContext>
    </SidebarContext.Provider>,
  );
}

describe('Sidebar', () => {
  afterEach(() => cleanup());

  it('renders expanded with correct width', () => {
    const ctx = makeCtx();
    const { container } = renderSidebar(ctx);
    const sidebar = container.querySelector('.meridian-sidebar');
    expect(sidebar?.classList.contains('meridian-sidebar--expanded')).toBe(true);
    expect((sidebar as HTMLElement)?.style.width).toBe('260px');
  });

  it('renders collapsed as icon rail', () => {
    const ctx = makeCtx({
      left: { expanded: false, width: 260, paletteOrder: ['a', 'b'], expandedPalettes: [] },
      paletteLocations: { a: 'left', b: 'left' },
    });
    const { container } = renderSidebar(ctx);
    const sidebar = container.querySelector('.meridian-sidebar');
    expect(sidebar?.classList.contains('meridian-sidebar--collapsed')).toBe(true);
    expect(container.querySelector('.meridian-sidebar__icon-strip')).not.toBeNull();
  });

  it('dispatches toggle-sidebar when chevron clicked (expanded)', () => {
    const ctx = makeCtx();
    const { container } = renderSidebar(ctx);
    const toggle = within(container).getByRole('button', { name: /collapse/i });
    fireEvent.click(toggle);
    expect(ctx.dispatch).toHaveBeenCalledWith({ type: 'toggle-sidebar', side: 'left' });
  });

  it('dispatches toggle-sidebar when chevron clicked (collapsed)', () => {
    const ctx = makeCtx({
      left: { expanded: false, width: 260, paletteOrder: [], expandedPalettes: [] },
    });
    const { container } = renderSidebar(ctx);
    const toggle = within(container).getByRole('button', { name: /expand/i });
    fireEvent.click(toggle);
    expect(ctx.dispatch).toHaveBeenCalledWith({ type: 'toggle-sidebar', side: 'left' });
  });

  it('dispatches focus-palette when icon clicked in collapsed state', () => {
    const ctx = makeCtx({
      left: { expanded: false, width: 260, paletteOrder: ['a'], expandedPalettes: [] },
      paletteLocations: { a: 'left' },
    });
    const { container } = renderSidebar(ctx);
    const iconButton = within(container).getAllByRole('button').find(
      (btn) => btn.classList.contains('meridian-sidebar__icon-button')
    );
    expect(iconButton).toBeDefined();
    if (iconButton) {
      fireEvent.click(iconButton);
      expect(ctx.dispatch).toHaveBeenCalledWith({ type: 'focus-palette', paletteId: 'a' });
    }
  });

  it('registers and unregisters side on mount/unmount', () => {
    const ctx = makeCtx();
    const { unmount } = renderSidebar(ctx);
    expect(ctx.registerSide).toHaveBeenCalledWith('left');
    unmount();
    expect(ctx.unregisterSide).toHaveBeenCalledWith('left');
  });

  it('renders resize handle when expanded', () => {
    const ctx = makeCtx();
    const { container } = renderSidebar(ctx);
    expect(container.querySelector('.meridian-sidebar__resize-handle')).not.toBeNull();
  });

  it('does not render resize handle when collapsed', () => {
    const ctx = makeCtx({
      left: { expanded: false, width: 260, paletteOrder: [], expandedPalettes: [] },
    });
    const { container } = renderSidebar(ctx);
    expect(container.querySelector('.meridian-sidebar__resize-handle')).toBeNull();
  });

  it('applies correct side class', () => {
    const ctx = makeCtx();
    const { container } = renderSidebar(ctx, 'left');
    expect(container.querySelector('.meridian-sidebar--left')).not.toBeNull();
  });
});
