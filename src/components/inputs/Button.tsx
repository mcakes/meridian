import { forwardRef } from 'react';
import type { ReactNode, ButtonHTMLAttributes } from 'react';
import './button.css';

type Variant = 'default' | 'ghost' | 'destructive';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'default', size = 'md', icon = false, disabled = false, type = 'button', className, style, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`m-btn${className ? ` ${className}` : ''}`}
      data-variant={variant}
      data-size={size}
      data-icon={icon}
      type={type}
      disabled={disabled}
      style={style}
      {...rest}
    >
      {children}
    </button>
  );
});

export type { ButtonProps };
