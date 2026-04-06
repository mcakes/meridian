import { useRef, useState, useCallback, useEffect, useMemo, useId } from 'react';
import * as Popover from '@radix-ui/react-popover';
import './inputs.css';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  label?: string;
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function matchMonth(prefix: string): { index: number; exact: boolean } | null {
  const lower = prefix.toLowerCase();
  const matches = MONTH_ABBR
    .map((name, i) => ({ name, i }))
    .filter(({ name }) => name.toLowerCase().startsWith(lower));
  if (matches.length === 0) return null;
  if (matches.length === 1 || lower.length >= 3) {
    return { index: matches[0]!.i, exact: true };
  }
  return { index: matches[0]!.i, exact: false };
}

type Segment = 'day' | 'month' | 'year';
const SEGMENTS: Segment[] = ['day', 'month', 'year'];

function daysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function clampDay(day: number, month: number, year: number): number {
  return Math.max(1, Math.min(day, daysInMonth(month, year)));
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getCalendarDays(year: number, month: number): { date: Date; inMonth: boolean }[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();
  const days: { date: Date; inMonth: boolean }[] = [];

  for (let i = startDow - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month, -i), inMonth: false });
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(year, month, d), inMonth: true });
  }

  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: new Date(year, month + 1, d), inMonth: false });
    }
  }

  return days;
}

export function DatePicker({ value, onChange, label }: DatePickerProps) {
  const todayRef = useRef(new Date());
  const today = todayRef.current;
  const initial = value ?? today;

  const [day, setDay] = useState(initial.getDate());
  const [month, setMonth] = useState(initial.getMonth());
  const [year, setYear] = useState(initial.getFullYear());
  const [activeSegment, setActiveSegment] = useState<Segment | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [digitBuffer, setDigitBuffer] = useState('');
  const bufferTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLSpanElement>(null);
  const monthRef = useRef<HTMLSpanElement>(null);
  const yearRef = useRef<HTMLSpanElement>(null);
  const labelId = useId();

  const segmentRefs = useMemo<Record<Segment, React.RefObject<HTMLSpanElement | null>>>(() => ({
    day: dayRef,
    month: monthRef,
    year: yearRef,
  }), []);

  // Clean up buffer timer on unmount or when segment changes
  useEffect(() => {
    return () => {
      if (bufferTimerRef.current) clearTimeout(bufferTimerRef.current);
      setDigitBuffer('');
    };
  }, [activeSegment]);

  // Sync internal state when value prop changes externally
  useEffect(() => {
    if (value) {
      setDay(value.getDate());
      setMonth(value.getMonth());
      setYear(value.getFullYear());
    }
  }, [value]);

  const commit = useCallback((d: number, m: number, y: number) => {
    const clamped = clampDay(d, m, y);
    setDay(clamped);
    onChange(new Date(y, m, clamped));
  }, [onChange]);

  const focusSegment = useCallback((seg: Segment) => {
    setActiveSegment(seg);
    setDigitBuffer('');
    segmentRefs[seg].current?.focus();
  }, [segmentRefs]);

  const moveSegment = useCallback((direction: -1 | 1) => {
    const idx = activeSegment ? SEGMENTS.indexOf(activeSegment) : 0;
    const next = idx + direction;
    const seg = SEGMENTS[next];
    if (next >= 0 && next < SEGMENTS.length && seg) {
      focusSegment(seg);
    }
  }, [activeSegment, focusSegment]);

  const adjustSegment = useCallback((direction: -1 | 1) => {
    if (!activeSegment) return;
    let d = day, m = month, y = year;
    if (activeSegment === 'day') {
      const max = daysInMonth(m, y);
      d = d + direction;
      if (d < 1) d = max;
      else if (d > max) d = 1;
      setDay(d);
    } else if (activeSegment === 'month') {
      m = m + direction;
      if (m < 0) m = 11;
      if (m > 11) m = 0;
      setMonth(m);
      d = clampDay(d, m, y);
      setDay(d);
    } else {
      y = y + direction;
      setYear(y);
      d = clampDay(d, m, y);
      setDay(d);
    }
    commit(d, m, y);
  }, [activeSegment, day, month, year, commit]);

  const adjustWholeDate = useCallback((direction: 1 | -1) => {
    const current = new Date(year, month, day);
    current.setDate(current.getDate() + direction);
    const d = current.getDate();
    const m = current.getMonth();
    const y = current.getFullYear();
    setDay(d);
    setMonth(m);
    setYear(y);
    commit(d, m, y);
  }, [day, month, year, commit]);

  const handleDigit = useCallback((digit: string) => {
    if (!activeSegment) return;

    if (bufferTimerRef.current) clearTimeout(bufferTimerRef.current);

    const newBuffer = digitBuffer + digit;

    if (activeSegment === 'day') {
      const num = parseInt(newBuffer, 10);
      if (newBuffer.length >= 2 || num > 3) {
        const clamped = clampDay(num || 1, month, year);
        setDay(clamped);
        commit(clamped, month, year);
        setDigitBuffer('');
        moveSegment(1);
        return;
      }
      setDigitBuffer(newBuffer);
    } else if (activeSegment === 'month') {
      const num = parseInt(newBuffer, 10);
      if (newBuffer.length >= 2 || num > 1) {
        const m = Math.max(0, Math.min(11, num - 1));
        setMonth(m);
        const d = clampDay(day, m, year);
        setDay(d);
        commit(d, m, year);
        setDigitBuffer('');
        moveSegment(1);
        return;
      }
      setDigitBuffer(newBuffer);
    } else {
      if (newBuffer.length >= 4) {
        const y = parseInt(newBuffer, 10) || year;
        setYear(y);
        const d = clampDay(day, month, y);
        setDay(d);
        commit(d, month, y);
        setDigitBuffer('');
        return;
      }
      setDigitBuffer(newBuffer);
    }

    // Auto-commit buffer after a pause
    bufferTimerRef.current = setTimeout(() => {
      const num = parseInt(newBuffer, 10);
      if (activeSegment === 'day') {
        const clamped = clampDay(num || 1, month, year);
        setDay(clamped);
        commit(clamped, month, year);
      } else if (activeSegment === 'month') {
        const m = Math.max(0, Math.min(11, num - 1));
        setMonth(m);
        commit(clampDay(day, m, year), m, year);
      }
      setDigitBuffer('');
    }, 800);
  }, [activeSegment, digitBuffer, day, month, year, commit, moveSegment]);

  const handleLetter = useCallback((letter: string) => {
    if (activeSegment !== 'month') return;

    if (bufferTimerRef.current) clearTimeout(bufferTimerRef.current);

    const newBuffer = digitBuffer + letter;
    setDigitBuffer(newBuffer);

    const result = matchMonth(newBuffer);
    if (result && result.exact) {
      setMonth(result.index);
      const d = clampDay(day, result.index, year);
      setDay(d);
      commit(d, result.index, year);
      setDigitBuffer('');
      moveSegment(1);
      return;
    }

    // Auto-commit best match after a pause
    bufferTimerRef.current = setTimeout(() => {
      const r = matchMonth(newBuffer);
      if (r) {
        setMonth(r.index);
        const d = clampDay(day, r.index, year);
        setDay(d);
        commit(d, r.index, year);
      }
      setDigitBuffer('');
    }, 800);
  }, [activeSegment, digitBuffer, day, year, commit, moveSegment]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      moveSegment(-1);
    } else if (e.key === 'ArrowRight' || e.key === '/' || e.key === '-' || e.key === ' ' || (e.key === 'Tab' && !e.shiftKey)) {
      // Tab: only intercept if there's a next segment to move to
      if (e.key === 'Tab') {
        const idx = activeSegment ? SEGMENTS.indexOf(activeSegment) : 0;
        if (idx >= SEGMENTS.length - 1) return; // let Tab leave the component
      }
      e.preventDefault();
      moveSegment(1);
    } else if (e.key === 'Tab' && e.shiftKey) {
      const idx = activeSegment ? SEGMENTS.indexOf(activeSegment) : 0;
      if (idx <= 0) return; // let Shift+Tab leave the component
      e.preventDefault();
      moveSegment(-1);
    } else if (e.key === 'ArrowUp' && e.shiftKey) {
      e.preventDefault();
      adjustWholeDate(1);
    } else if (e.key === 'ArrowDown' && e.shiftKey) {
      e.preventDefault();
      adjustWholeDate(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      adjustSegment(1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      adjustSegment(-1);
    } else if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      handleDigit(e.key);
    } else if (/^[a-zA-Z]$/.test(e.key) && activeSegment === 'month') {
      e.preventDefault();
      handleLetter(e.key);
    }
  }, [activeSegment, moveSegment, adjustSegment, handleDigit, handleLetter]);

  const handleContainerFocus = () => {
    if (!activeSegment) {
      focusSegment('day');
    }
  };

  const handleContainerBlur = (e: React.FocusEvent) => {
    // Check if focus is moving to another element within the container
    if (containerRef.current?.contains(e.relatedTarget as Node)) return;
    setActiveSegment(null);
    setDigitBuffer('');
  };

  const handleSelectDay = (date: Date) => {
    setDay(date.getDate());
    setMonth(date.getMonth());
    setYear(date.getFullYear());
    onChange(date);
    setCalendarOpen(false);
  };

  // Calendar display state derived from current segments
  const calDays = useMemo(() => getCalendarDays(year, month), [year, month]);

  const segmentStyle = (seg: Segment): React.CSSProperties => ({
    padding: '2px 2px',
    borderRadius: 2,
    outline: 'none',
    cursor: 'text',
    backgroundColor: activeSegment === seg
      ? 'var(--bg-highlight)'
      : 'transparent',
    color: activeSegment === seg
      ? 'var(--text-primary)'
      : 'var(--text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    minWidth: seg === 'year' ? '2.6em' : seg === 'month' ? '2em' : '1.4em',
    textAlign: 'center',
  });

  function segmentDisplay(seg: Segment): string {
    const isActive = activeSegment === seg;
    const hasBuffer = isActive && digitBuffer.length > 0;
    if (seg === 'day') {
      return hasBuffer ? digitBuffer.padStart(2, '\u2007') : pad2(day);
    }
    if (seg === 'month') {
      if (hasBuffer) {
        // Letters: show typed prefix, capitalize first letter
        if (/[a-zA-Z]/.test(digitBuffer)) {
          const display = digitBuffer.charAt(0).toUpperCase() + digitBuffer.slice(1).toLowerCase();
          return display.padEnd(3, '\u2007');
        }
        // Digits: show numeric input
        return digitBuffer.padStart(2, '\u2007');
      }
      return MONTH_ABBR[month] ?? 'Jan';
    }
    // year
    if (hasBuffer) return digitBuffer.padStart(4, '\u2007');
    return String(year);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label
          id={labelId}
          style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}
        >
          {label}
        </label>
      )}
      <Popover.Root open={calendarOpen} onOpenChange={setCalendarOpen}>
        <div
          ref={containerRef}
          className="m-input-wrap"
          role="group"
          aria-labelledby={label ? labelId : undefined}
          onFocus={handleContainerFocus}
          onBlur={handleContainerBlur}
          onKeyDown={handleKeyDown}
          onClick={(e) => {
            if (e.target === e.currentTarget || !(e.target as HTMLElement).closest('span[role], button')) {
              focusSegment(activeSegment ?? 'day');
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 32,
            padding: '0 4px 0 8px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 2,
            fontSize: 13,
            cursor: 'text',
            gap: 4,
          }}
        >
          {/* Day segment */}
          <span
            ref={dayRef}
            tabIndex={0}
            role="spinbutton"
            aria-label="Day"
            aria-valuenow={day}
            aria-valuemin={1}
            aria-valuemax={daysInMonth(month, year)}
            style={segmentStyle('day')}
            onFocus={() => setActiveSegment('day')}
            onClick={() => focusSegment('day')}
          >
            {segmentDisplay('day')}
          </span>
          {/* Month segment */}
          <span
            ref={monthRef}
            tabIndex={-1}
            role="spinbutton"
            aria-label="Month"
            aria-valuenow={month + 1}
            aria-valuemin={1}
            aria-valuemax={12}
            style={segmentStyle('month')}
            onFocus={() => setActiveSegment('month')}
            onClick={() => focusSegment('month')}
          >
            {segmentDisplay('month')}
          </span>
          {/* Year segment */}
          <span
            ref={yearRef}
            tabIndex={-1}
            role="spinbutton"
            aria-label="Year"
            aria-valuenow={year}
            aria-valuemin={1900}
            aria-valuemax={2100}
            style={segmentStyle('year')}
            onFocus={() => setActiveSegment('year')}
            onClick={() => focusSegment('year')}
          >
            {segmentDisplay('year')}
          </span>

          <div style={{ flex: 1 }} />

          {/* Calendar toggle */}
          <Popover.Trigger asChild>
            <button
              className="m-cal-toggle"
              type="button"
              tabIndex={-1}
              aria-label="Open calendar"
            >
              ▼
            </button>
          </Popover.Trigger>
        </div>

        <Popover.Portal>
          <Popover.Content
            sideOffset={4}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 4,
              padding: 12,
              zIndex: 9999,
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            }}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {/* Month/Year header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <button
                className="m-cal-nav"
                type="button"
                onClick={() => {
                  const m = month === 0 ? 11 : month - 1;
                  const y = month === 0 ? year - 1 : year;
                  setMonth(m);
                  setYear(y);
                }}
                aria-label="Previous month"
              >
                ‹
              </button>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                {MONTH_NAMES[month]} {year}
              </span>
              <button
                className="m-cal-nav"
                type="button"
                onClick={() => {
                  const m = month === 11 ? 0 : month + 1;
                  const y = month === 11 ? year + 1 : year;
                  setMonth(m);
                  setYear(y);
                }}
                aria-label="Next month"
              >
                ›
              </button>
            </div>

            {/* Day-of-week headers */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 32px)',
                gap: 2,
                marginBottom: 4,
              }}
            >
              {DAYS_OF_WEEK.map((d) => (
                <div
                  key={d}
                  style={{
                    width: 32,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 32px)',
                gap: 2,
              }}
            >
              {calDays.map(({ date, inMonth }, i) => {
                const isToday = isSameDay(date, today);
                const currentDate = new Date(year, month, day);
                const isSelected = isSameDay(date, currentDate);

                let cellColor = inMonth ? 'var(--text-primary)' : 'var(--text-muted)';
                if (isToday && !isSelected) cellColor = 'var(--color-info)';
                if (isSelected) cellColor = 'var(--text-inverse)';

                return (
                  <button
                    key={i}
                    className="m-cal-day"
                    type="button"
                    tabIndex={-1}
                    data-selected={isSelected}
                    onClick={() => handleSelectDay(date)}
                    style={{
                      backgroundColor: isSelected
                        ? 'var(--color-info)'
                        : 'transparent',
                      color: cellColor,
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
