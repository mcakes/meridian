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
