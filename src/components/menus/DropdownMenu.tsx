import * as Radix from '@radix-ui/react-dropdown-menu';
import type { ReactNode, CSSProperties } from 'react';

/* ------------------------------------------------------------------ */
/* Root                                                                */
/* ------------------------------------------------------------------ */

interface RootProps {
  children: ReactNode;
}

function Root({ children }: RootProps) {
  return <Radix.Root>{children}</Radix.Root>;
}

/* ------------------------------------------------------------------ */
/* Trigger                                                             */
/* ------------------------------------------------------------------ */

interface TriggerProps {
  children: ReactNode;
}

function Trigger({ children }: TriggerProps) {
  return <Radix.Trigger asChild>{children}</Radix.Trigger>;
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

interface ContentProps {
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

const contentStyle: CSSProperties = {
  backgroundColor: 'var(--bg-surface)',
  border: '1px solid var(--border-default)',
  borderRadius: 6,
  padding: '4px 0',
  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
  zIndex: 9999,
  minWidth: 160,
};

function Content({ children, side = 'bottom', align = 'start', sideOffset = 4 }: ContentProps) {
  return (
    <Radix.Portal>
      <Radix.Content side={side} align={align} sideOffset={sideOffset} style={contentStyle}>
        {children}
      </Radix.Content>
    </Radix.Portal>
  );
}

/* ------------------------------------------------------------------ */
/* Label                                                               */
/* ------------------------------------------------------------------ */

interface LabelProps {
  children: ReactNode;
}

const labelStyle: CSSProperties = {
  padding: '6px 12px',
  fontSize: 11,
  lineHeight: '14px',
  fontWeight: 400,
  color: 'var(--text-muted)',
  userSelect: 'none',
};

function Label({ children }: LabelProps) {
  return <Radix.Label style={labelStyle}>{children}</Radix.Label>;
}

/* ------------------------------------------------------------------ */
/* Separator                                                           */
/* ------------------------------------------------------------------ */

const separatorStyle: CSSProperties = {
  height: 1,
  backgroundColor: 'var(--border-subtle)',
  margin: '4px 0',
};

function Separator() {
  return <Radix.Separator style={separatorStyle} />;
}

/* ------------------------------------------------------------------ */
/* Item                                                                */
/* ------------------------------------------------------------------ */

interface ItemProps {
  children: ReactNode;
  onSelect: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive';
  shortcut?: string;
}

function itemStyle(variant: 'default' | 'destructive', disabled: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 8px',
    margin: '0 4px',
    borderRadius: 4,
    fontSize: 13,
    lineHeight: '18px',
    cursor: disabled ? 'default' : 'pointer',
    outline: 'none',
    color: variant === 'destructive' ? 'var(--color-negative)' : 'var(--text-primary)',
    opacity: disabled ? 0.5 : 1,
    userSelect: 'none',
    transition: 'background-color 150ms ease',
  };
}

const shortcutStyle: CSSProperties = {
  fontSize: 11,
  lineHeight: '14px',
  color: 'var(--text-muted)',
  marginLeft: 16,
};

function Item({ children, onSelect, disabled = false, variant = 'default', shortcut }: ItemProps) {
  return (
    <Radix.Item
      disabled={disabled}
      onSelect={onSelect}
      style={itemStyle(variant, disabled)}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLDivElement).style.backgroundColor =
            variant === 'destructive'
              ? 'color-mix(in srgb, var(--color-negative) 12%, transparent)'
              : 'var(--bg-highlight)';
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
      }}
    >
      <span>{children}</span>
      {shortcut && <span style={shortcutStyle}>{shortcut}</span>}
    </Radix.Item>
  );
}

/* ------------------------------------------------------------------ */
/* Compound export                                                     */
/* ------------------------------------------------------------------ */

export const DropdownMenu = Object.assign(Root, {
  Trigger,
  Content,
  Label,
  Item,
  Separator,
});
