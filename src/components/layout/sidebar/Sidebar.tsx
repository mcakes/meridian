import { useEffect, useRef, useCallback } from 'react';
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
