import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';

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

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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

  // Fill in days from previous month
  for (let i = startDow - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month, -i),
      inMonth: false,
    });
  }

  // Current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(year, month, d), inMonth: true });
  }

  // Fill remaining cells to complete the last week
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: new Date(year, month + 1, d), inMonth: false });
    }
  }

  return days;
}

export function DatePicker({ value, onChange, label }: DatePickerProps) {
  const today = new Date();
  const initial = value ?? today;

  const [displayYear, setDisplayYear] = useState(initial.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(initial.getMonth());
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const days = getCalendarDays(displayYear, displayMonth);

  const prevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear((y) => y - 1);
    } else {
      setDisplayMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear((y) => y + 1);
    } else {
      setDisplayMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (date: Date) => {
    onChange(date);
    setOpen(false);
  };

  const triggerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 32,
    padding: '0 8px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: 2,
    color: value ? 'var(--text-primary)' : 'var(--text-muted)',
    fontSize: 13,
    cursor: 'pointer',
    outline: 'none',
    boxShadow: focused ? '0 0 0 2px var(--color-info)' : 'none',
    transition: 'box-shadow 150ms ease',
    textAlign: 'left',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <span
          style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}
        >
          {label}
        </span>
      )}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            style={triggerStyle}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          >
            <span>{value ? formatDate(value) : 'Select date'}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>▼</span>
          </button>
        </Popover.Trigger>

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
                type="button"
                onClick={prevMonth}
                aria-label="Previous month"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 16,
                  padding: '2px 6px',
                  borderRadius: 2,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    'var(--bg-highlight)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    'transparent';
                }}
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
                {MONTH_NAMES[displayMonth]} {displayYear}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                aria-label="Next month"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 16,
                  padding: '2px 6px',
                  borderRadius: 2,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    'var(--bg-highlight)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    'transparent';
                }}
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
              {days.map(({ date, inMonth }, i) => {
                const isToday = isSameDay(date, today);
                const isSelected = value ? isSameDay(date, value) : false;

                let cellColor = inMonth ? 'var(--text-primary)' : 'var(--text-muted)';
                if (isToday && !isSelected) cellColor = 'var(--color-info)';
                if (isSelected) cellColor = '#ffffff';

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectDay(date)}
                    style={{
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      borderRadius: 2,
                      backgroundColor: isSelected
                        ? 'var(--color-info)'
                        : 'transparent',
                      color: cellColor,
                      fontSize: 12,
                      cursor: 'pointer',
                      fontWeight: isSelected ? 600 : 400,
                      outline: 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          'var(--bg-highlight)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          'transparent';
                      }
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
