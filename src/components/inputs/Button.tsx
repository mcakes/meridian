import { forwardRef, useCallback } from 'react';
import type { ReactNode, CSSProperties, ButtonHTMLAttributes } from 'react';

type Variant = 'default' | 'ghost' | 'destructive';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: boolean;
  children: ReactNode;
}

const sizeConfig = {
  sm: { fontSize: 12, padding: '2px 8px', iconSize: 24 },
  md: { fontSize: 13, padding: '4px 10px', iconSize: 28 },
} as const;

const variantConfig = {
  default: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
  },
  ghost: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
  },
  destructive: {
    backgroundColor: 'transparent',
    border: '1px solid var(--border-default)',
    color: 'var(--color-negative)',
  },
} as const;

function getBaseStyle(variant: Variant, size: Size, icon: boolean, disabled: boolean): CSSProperties {
  const v = variantConfig[variant];
  const s = sizeConfig[size];

  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: icon ? 'center' : undefined,
    gap: icon ? undefined : 4,
    backgroundColor: v.backgroundColor,
    border: v.border,
    color: v.color,
    fontSize: s.fontSize,
    padding: icon ? 0 : s.padding,
    width: icon ? s.iconSize : undefined,
    height: icon ? s.iconSize : undefined,
    borderRadius: 2,
    cursor: disabled ? 'default' : 'pointer',
    outline: 'none',
    opacity: disabled ? 0.5 : 1,
    transition: 'border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease',
  };
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'default', size = 'md', icon = false, disabled = false, style, children, ...rest },
  ref,
) {
  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      const el = e.currentTarget;
      if (variant === 'default') {
        el.style.borderColor = 'var(--border-active)';
      } else if (variant === 'ghost') {
        el.style.backgroundColor = 'var(--bg-highlight)';
      } else if (variant === 'destructive') {
        el.style.backgroundColor = 'color-mix(in srgb, var(--color-negative) 12%, transparent)';
        el.style.borderColor = 'var(--color-negative)';
      }
    },
    [variant, disabled],
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const el = e.currentTarget;
      const v = variantConfig[variant];
      el.style.backgroundColor = v.backgroundColor;
      if (variant === 'default' || variant === 'destructive') {
        el.style.borderColor = '';
      }
    },
    [variant],
  );

  const handleFocus = useCallback((e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-info)';
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = 'none';
  }, []);

  return (
    <button
      ref={ref}
      disabled={disabled}
      style={{ ...getBaseStyle(variant, size, icon, disabled), ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...rest}
    >
      {children}
    </button>
  );
});

export type { ButtonProps };
