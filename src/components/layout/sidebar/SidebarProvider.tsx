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
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { SidebarState, SidebarSide, PaletteDefinition, PaletteProps, SidebarProps } from './types';
import { sidebarReducer, buildInitialState } from './sidebarReducer';
import type { SidebarAction } from './sidebarReducer';
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

  const dispatch = useCallback(
    (action: SidebarAction) => {
      rawDispatch(action);
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
