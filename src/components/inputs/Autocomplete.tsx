import { useRef, useState, useCallback, useEffect, useMemo, useId } from 'react';
import { fuzzyMatch } from '@/lib/format';
import './inputs.css';

interface AutocompleteItem {
  label: string;
  value: string;
  sublabel?: string;
}

interface AutocompleteProps {
  items: AutocompleteItem[];
  /** Called when the user selects an item. Alias: acts as the onChange handler. */
  onChange: (item: AutocompleteItem) => void;
  /** @deprecated Use `onChange` instead. */
  onSelect?: (item: AutocompleteItem) => void;
  placeholder?: string;
  label?: string;
}

interface HighlightedTextProps {
  text: string;
  ranges: { start: number; end: number }[];
}

function HighlightedText({ text, ranges }: HighlightedTextProps) {
  if (ranges.length === 0) {
    return <span>{text}</span>;
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;

  for (const range of ranges) {
    if (cursor < range.start) {
      parts.push(
        <span key={`plain-${cursor}`}>{text.slice(cursor, range.start)}</span>,
      );
    }
    parts.push(
      <mark
        key={`mark-${range.start}`}
        style={{
          background:
            'color-mix(in srgb, var(--color-info) 20%, transparent)',
          color: 'var(--color-info)',
          borderRadius: 1,
        }}
      >
        {text.slice(range.start, range.end)}
      </mark>,
    );
    cursor = range.end;
  }

  if (cursor < text.length) {
    parts.push(<span key={`plain-end`}>{text.slice(cursor)}</span>);
  }

  return <>{parts}</>;
}

export function Autocomplete({
  items,
  onChange,
  onSelect,
  placeholder,
  label,
}: AutocompleteProps) {
  if (onSelect && !onChange) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Autocomplete: `onSelect` is deprecated. Use `onChange` instead.');
    }
  }
  const handleChange = onChange ?? onSelect!;
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [openAbove, setOpenAbove] = useState(false);
  const labelId = useId();
  const listboxId = useId();

  useEffect(() => {
    return () => {
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    };
  }, []);

  const updateDirection = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setOpenAbove(spaceBelow < 220);
  }, []);

  useEffect(() => {
    if (!open) return;
    updateDirection();
  }, [open, updateDirection]);

  type MatchedItem = {
    item: AutocompleteItem;
    score: number;
    ranges: { start: number; end: number }[];
  };

  const matches: MatchedItem[] = useMemo(() => {
    if (!query) return [];
    return items
      .map((item) => {
        const result = fuzzyMatch(item.label, query);
        if (!result) return null;
        return { item, score: result.score, ranges: result.ranges };
      })
      .filter((x): x is MatchedItem => x !== null)
      .sort((a, b) => b.score - a.score);
  }, [items, query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setActiveIndex(-1);
    setOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, matches.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < matches.length) {
        const matched = matches[activeIndex];
        if (matched) {
          handleSelect(matched.item);
        }
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleSelect = (item: AutocompleteItem) => {
    setQuery(item.label);
    setOpen(false);
    setActiveIndex(-1);
    handleChange(item);
  };

  const handleFocus = () => {
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
    }
    if (query) setOpen(true);
  };

  const handleBlur = () => {
    blurTimerRef.current = setTimeout(() => {
      setOpen(false);
      setActiveIndex(-1);
    }, 150);
  };

  const showDropdown = open && query.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <span
          id={labelId}
          style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}
        >
          {label}
        </span>
      )}
      <div ref={containerRef} style={{ position: 'relative' }}>
        <input
          className="m-autocomplete-input"
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
          aria-labelledby={label ? labelId : undefined}
          aria-autocomplete="list"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
        />

        {showDropdown && (
          <div
            id={listboxId}
            role="listbox"
            style={{
              position: 'absolute',
              ...(openAbove
                ? { bottom: '100%', marginBottom: 4 }
                : { top: '100%', marginTop: 4 }),
              left: 0,
              right: 0,
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 4,
              maxHeight: 200,
              overflowY: 'auto',
              zIndex: 9999,
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            }}
          >
            {matches.length === 0 ? (
              <div
                style={{
                  padding: '8px 10px',
                  color: 'var(--text-muted)',
                  fontSize: 13,
                }}
              >
                No matches
              </div>
            ) : (
              matches.map(({ item, ranges }, i) => (
                <div
                  key={item.value}
                  id={`${listboxId}-option-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(item);
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(-1)}
                  style={{
                    padding: '6px 10px',
                    cursor: 'pointer',
                    backgroundColor:
                      i === activeIndex ? 'var(--bg-highlight)' : 'transparent',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 6,
                    color: 'var(--text-primary)',
                  }}
                >
                  <span>
                    <HighlightedText text={item.label} ranges={ranges} />
                  </span>
                  {item.sublabel && (
                    <span
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: 11,
                        flexShrink: 0,
                      }}
                    >
                      {item.sublabel}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
