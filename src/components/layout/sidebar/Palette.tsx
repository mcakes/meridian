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
