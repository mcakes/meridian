import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CatDot } from '../CatDot';

describe('CatDot', () => {
  it('renders with default size of 8px', () => {
    const { container } = render(<CatDot index={0} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe('8px');
    expect(el.style.height).toBe('8px');
  });

  it('renders with custom size', () => {
    const { container } = render(<CatDot index={2} size={12} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe('12px');
    expect(el.style.height).toBe('12px');
  });

  it('uses the correct CSS variable for background color', () => {
    const { container } = render(<CatDot index={3} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.backgroundColor).toBe('var(--color-cat-3)');
  });

  it('renders as inline-block span', () => {
    const { container } = render(<CatDot index={0} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe('SPAN');
    expect(el.style.display).toBe('inline-block');
  });
});
