import { useEffect, useRef, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PaletteProps } from './types';
import { useSidebarContext } from './SidebarContext';

export function Palette({ id, title, icon, defaultExpanded = false, children }: PaletteProps) {
  const { state, dispatch, registerPalette, unregisterPalette } = useSidebarContext();
  const registeredRef = useRef(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const resizeCleanupRef = useRef<(() => void) | null>(null);

  const side = state.paletteLocations[id];
  const isExpanded = side ? state[side].expandedPalettes.includes(id) : false;
  const maxHeight = state.paletteHeights[id] ?? null;

  useEffect(() => {
    if (!registeredRef.current) {
      registerPalette({ id, title, icon, defaultExpanded }, side ?? 'left');
      registeredRef.current = true;
    }
    return () => {
      unregisterPalette(id);
      resizeCleanupRef.current?.();
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

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const el = bodyRef.current;
      if (!el) return;

      const startY = e.clientY;
      const startHeight = el.getBoundingClientRect().height;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientY - startY;
        const newHeight = Math.max(40, startHeight + delta);
        el.style.maxHeight = `${newHeight}px`;
      };

      const cleanup = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        resizeCleanupRef.current = null;
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
        cleanup();
        const delta = upEvent.clientY - startY;
        const finalHeight = Math.max(40, startHeight + delta);
        dispatch({ type: 'set-palette-height', paletteId: id, height: finalHeight });
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      resizeCleanupRef.current = cleanup;
    },
    [dispatch, id],
  );

  const handleDoubleClick = useCallback(() => {
    dispatch({ type: 'set-palette-height', paletteId: id, height: null });
    if (bodyRef.current) {
      bodyRef.current.style.maxHeight = '';
    }
  }, [dispatch, id]);

  const isConstrained = maxHeight !== null;
  const wrapperClass = [
    'meridian-palette__body-wrapper',
    isExpanded && !isConstrained ? 'meridian-palette__body-wrapper--expanded' : '',
    isExpanded && isConstrained ? 'meridian-palette__body-wrapper--constrained' : '',
  ].filter(Boolean).join(' ');

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
        {icon && <span className="meridian-palette__icon">{icon}</span>}
        <span className="meridian-palette__title">{title}</span>
      </div>
      <div className={wrapperClass}>
        <div
          ref={bodyRef}
          className="meridian-palette__body"
          style={isConstrained && isExpanded ? { maxHeight } : undefined}
        >
          <div className="meridian-palette__body-inner">
            {children}
          </div>
        </div>
      </div>
      {isExpanded && (
        <div
          className="meridian-palette__vresize"
          onMouseDown={handleResizeStart}
          onDoubleClick={handleDoubleClick}
        />
      )}
    </div>
  );
}
