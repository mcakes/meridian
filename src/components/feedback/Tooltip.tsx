import * as Radix from '@radix-ui/react-tooltip';
import type { ReactNode, CSSProperties } from 'react';

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

interface TooltipProviderProps {
  children: ReactNode;
  delayDuration?: number;
}

export function TooltipProvider({ children, delayDuration = 700 }: TooltipProviderProps) {
  return (
    <Radix.Provider delayDuration={delayDuration}>
      {children}
    </Radix.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Tooltip                                                             */
/* ------------------------------------------------------------------ */

interface TooltipProps {
  children: ReactNode;
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

const contentStyle: CSSProperties = {
  backgroundColor: 'var(--bg-overlay)',
  color: 'var(--text-primary)',
  fontSize: 11,
  lineHeight: '14px',
  padding: '4px 8px',
  borderRadius: 4,
  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
  zIndex: 9999,
  userSelect: 'none',
};

const arrowStyle: CSSProperties = {
  fill: 'var(--bg-overlay)',
};

export function Tooltip({ children, content, side = 'top', align = 'center', sideOffset = 4 }: TooltipProps) {
  return (
    <Radix.Root>
      <Radix.Trigger asChild>
        {children}
      </Radix.Trigger>
      <Radix.Portal>
        <Radix.Content side={side} align={align} sideOffset={sideOffset} style={contentStyle}>
          {content}
          <Radix.Arrow style={arrowStyle} width={8} height={4} />
        </Radix.Content>
      </Radix.Portal>
    </Radix.Root>
  );
}
