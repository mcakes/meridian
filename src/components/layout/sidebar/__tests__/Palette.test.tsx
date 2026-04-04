// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
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
    activeSides: new Set<'left' | 'right'>(['left', 'right']),
    registerSide: vi.fn(),
    unregisterSide: vi.fn(),
  };
}

function renderPalette(ctx: SidebarContextValue) {
  return render(
    <SidebarContext.Provider value={ctx}>
      <DndContext>
        <SortableContext items={['test-palette']}>
          <Palette id="test-palette" title="Test Palette" icon={<span>T</span>}>
            <div data-testid="palette-content">Hello</div>
          </Palette>
        </SortableContext>
      </DndContext>
    </SidebarContext.Provider>,
  );
}

describe('Palette', () => {
  afterEach(() => cleanup());

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
