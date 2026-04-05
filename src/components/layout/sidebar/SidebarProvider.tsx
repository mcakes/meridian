import {
  useReducer,
  useCallback,
  useRef,
  useEffect,
  useState,
  cloneElement,
  Children,
  isValidElement,
} from 'react';
import type { ReactNode, ReactElement } from 'react';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragOverEvent, DragEndEvent, CollisionDetection } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { SidebarState, SidebarSide, PaletteDefinition, PaletteProps, SidebarProps } from './types';
import { sidebarReducer, buildInitialState } from './sidebarReducer';

import { SidebarContext } from './SidebarContext';
import { Sidebar } from './Sidebar';
import { Palette } from './Palette';
import './sidebar.css';

interface SidebarProviderProps {
  children: ReactNode;
  state?: SidebarState;
  onStateChange?: (state: SidebarState) => void;
}

interface PaletteInit {
  id: string;
  side: SidebarSide;
  defaultExpanded: boolean;
}

interface SidebarInit {
  defaultExpanded: boolean;
  defaultWidth: number;
}

/** Scan children tree to extract palette and sidebar init props for buildInitialState */
function extractInitFromChildren(
  children: ReactNode,
): {
  palettes: PaletteInit[];
  sidebars: Record<SidebarSide, SidebarInit>;
} {
  const palettes: PaletteInit[] = [];
  const sidebars: Record<SidebarSide, SidebarInit> = {
    left: { defaultExpanded: false, defaultWidth: 260 },
    right: { defaultExpanded: false, defaultWidth: 260 },
  };

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    if (child.type === Sidebar) {
      const props = child.props as SidebarProps;
      const side: SidebarSide = props.side;
      sidebars[side] = {
        defaultExpanded: props.defaultExpanded ?? false,
        defaultWidth: props.defaultWidth ?? 260,
      };
      // Scan palette children within the sidebar
      Children.forEach(props.children, (paletteChild) => {
        if (!isValidElement(paletteChild)) return;
        if (paletteChild.type === Palette) {
          const pp = paletteChild.props as PaletteProps;
          palettes.push({
            id: pp.id,
            side,
            defaultExpanded: pp.defaultExpanded ?? false,
          });
        }
      });
    }
  });

  return { palettes, sidebars };
}

export function SidebarProvider({ children, state: controlledState, onStateChange }: SidebarProviderProps) {
  const [activeSides, setActiveSides] = useState<Set<SidebarSide>>(new Set());
  const paletteRegistrations = useRef<Map<string, { palette: PaletteDefinition; side: SidebarSide }>>(new Map());
  const [paletteRegistry, setPaletteRegistry] = useState<Map<string, PaletteDefinition>>(new Map());

  const [internalState, rawDispatch] = useReducer(sidebarReducer, undefined, () => {
    const { palettes, sidebars } = extractInitFromChildren(children);
    return buildInitialState(palettes, sidebars);
  });

  const state = controlledState ?? internalState;

  const dispatch = rawDispatch;

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

  // Collision detection: use pointerWithin to find which sidebar the pointer is
  // inside, then closestCenter among that sidebar's palettes for sort position.
  // When pointer is outside all sidebars, only consider palette-level droppables
  // (not sidebar containers) to avoid spurious highlights from closestCenter.
  const collisionDetection: CollisionDetection = useCallback((args) => {
    const pointerHits = pointerWithin(args);
    const sidebarHit = pointerHits.find(
      (h) => String(h.id) === 'sidebar-left' || String(h.id) === 'sidebar-right',
    );
    if (sidebarHit) {
      const targetSide: SidebarSide = String(sidebarHit.id) === 'sidebar-left' ? 'left' : 'right';
      const palettesInTarget = state[targetSide].paletteOrder;
      const filtered = args.droppableContainers.filter(
        (c) => palettesInTarget.includes(String(c.id)),
      );
      if (filtered.length > 0) {
        const hits = closestCenter({ ...args, droppableContainers: filtered });
        if (hits.length > 0) return hits;
      }
      return [sidebarHit];
    }
    // Outside both sidebars: only match palettes, not sidebar containers
    const palettesOnly = args.droppableContainers.filter(
      (c) => String(c.id) !== 'sidebar-left' && String(c.id) !== 'sidebar-right',
    );
    return closestCenter({ ...args, droppableContainers: palettesOnly });
  }, [state]);

  /** Resolve which sidebar a drop target belongs to. */
  const resolveOverSide = useCallback((overId: string): SidebarSide | null => {
    if (overId === 'sidebar-left') return 'left';
    if (overId === 'sidebar-right') return 'right';
    return state.paletteLocations[overId] ?? null;
  }, [state]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  }, []);

  // Move palettes between containers in real-time during drag.
  // This is required for dnd-kit multi-container sortable — without it,
  // the source SortableContext still owns the item and snaps it back.
  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);
      const activeSide = state.paletteLocations[activeId];
      if (!activeSide) return;

      const overSide = resolveOverSide(overId);
      if (!overSide || overSide === activeSide) return;

      // Move the palette to the target sidebar
      const isSidebarDrop = overId === 'sidebar-left' || overId === 'sidebar-right';
      const toIndex = isSidebarDrop
        ? state[overSide].paletteOrder.length
        : Math.max(0, state[overSide].paletteOrder.indexOf(overId));

      dispatch({
        type: 'move-palette',
        paletteId: activeId,
        toSide: overSide,
        toIndex,
      });
    },
    [state, dispatch, resolveOverSide],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragId(null);
      const { active, over } = event;
      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);
      const activeSide = state.paletteLocations[activeId];
      if (!activeSide) return;

      // Reorder within same sidebar (cross-sidebar already handled in onDragOver)
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
      }
    },
    [state, dispatch],
  );

  // Extract palette elements from all sidebars, then redistribute based on state.
  // This is necessary because palettes can be dragged between sidebars — the React
  // elements must physically move to the target Sidebar's children.
  const paletteElements = new Map<string, ReactElement>();
  const sidebarShells: { side: SidebarSide; element: ReactElement }[] = [];
  const content: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === Sidebar) {
      const sidebarProps = child.props as SidebarProps;
      Children.forEach(sidebarProps.children, (paletteChild) => {
        if (isValidElement(paletteChild) && paletteChild.type === Palette) {
          const pp = paletteChild.props as PaletteProps;
          paletteElements.set(pp.id, paletteChild);
        }
      });
      sidebarShells.push({ side: sidebarProps.side, element: child });
    } else {
      content.push(child);
    }
  });

  // Rebuild each sidebar with palettes ordered by state
  const leftSidebar: ReactNode[] = [];
  const rightSidebar: ReactNode[] = [];

  for (const { side, element } of sidebarShells) {
    const order = state[side].paletteOrder;
    const palettes = order
      .map((id) => paletteElements.get(id))
      .filter((el): el is ReactElement => el !== undefined);
    const cloned = cloneElement(element as ReactElement<SidebarProps>, { key: side, children: palettes });
    if (side === 'left') leftSidebar.push(cloned);
    else rightSidebar.push(cloned);
  }

  return (
    <SidebarContext.Provider
      value={{ state, dispatch, registerPalette, unregisterPalette, paletteRegistry, activeSides, registerSide, unregisterSide }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
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
                <span className="meridian-palette__title">
                  {paletteRegistry.get(activeDragId)?.title ?? activeDragId}
                </span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </SidebarContext.Provider>
  );
}
