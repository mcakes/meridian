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
    expect(result.left.width).toBe(260);
  });
});
