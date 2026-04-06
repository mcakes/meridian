import { useEffect, useRef, useCallback } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { SidebarProps } from './types';
import { useSidebarContext } from './SidebarContext';

export function Sidebar({
  side,
  defaultExpanded: _defaultExpanded = false,
  defaultWidth: _defaultWidth = 260,
  minWidth = 200,
  maxWidth = 480,
  togglePosition = 'top',
  children,
}: SidebarProps) {
  const { state, dispatch, registerSide, unregisterSide, paletteRegistry } = useSidebarContext();
  const sideState = state[side];
  const isExpanded = sideState.expanded;
  const sidebarRef = useRef<HTMLDivElement>(null);

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: `sidebar-${side}` });

  useEffect(() => {
    registerSide(side);
    return () => unregisterSide(side);
  }, [side]);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = sideState.width;
      const el = sidebarRef.current;

      // Disable CSS transition during drag for immediate feedback
      if (el) el.style.transition = 'none';

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const delta = side === 'left'
          ? moveEvent.clientX - startX
          : startX - moveEvent.clientX;
        const newWidth = Math.min(Math.max(startWidth + delta, minWidth), maxWidth);

        // Update DOM directly — skip React re-render during drag
        if (el) el.style.width = `${newWidth}px`;
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        // Re-enable transition
        if (el) el.style.transition = '';

        const delta = side === 'left'
          ? upEvent.clientX - startX
          : startX - upEvent.clientX;
        const finalWidth = startWidth + delta;

        if (finalWidth < minWidth) {
          // Reset DOM width so React owns it again
          if (el) el.style.width = '';
          dispatch({ type: 'collapse-sidebar', side });
        } else {
          dispatch({ type: 'set-width', side, width: Math.min(Math.max(finalWidth, minWidth), maxWidth) });
        }
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [side, sideState.width, minWidth, maxWidth, dispatch],
  );

  const paletteIds = sideState.paletteOrder;

  const toggleRow = togglePosition !== 'hidden' ? (
    <div className="meridian-sidebar__header">
      <button
        className="meridian-sidebar__toggle"
        onClick={() => dispatch({ type: 'toggle-sidebar', side })}
        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isExpanded
          ? (side === 'left' ? '\u25C0' : '\u25B6')
          : (side === 'left' ? '\u25B6' : '\u25C0')}
      </button>
    </div>
  ) : null;

  if (!isExpanded) {
    return (
      <div
        ref={(node) => {
          sidebarRef.current = node;
          setDroppableRef(node);
        }}
        className={`meridian-sidebar meridian-sidebar--${side} meridian-sidebar--collapsed`}
      >
        {togglePosition === 'top' && toggleRow}
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
        {togglePosition === 'bottom' && toggleRow}
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
      {togglePosition === 'top' && toggleRow}
      <div className="meridian-sidebar__palettes">
        <SortableContext items={paletteIds} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </div>
      {togglePosition === 'bottom' && toggleRow}
      <div
        className="meridian-sidebar__resize-handle"
        onMouseDown={handleResizeStart}
      />
    </div>
  );
}
