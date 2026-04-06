import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PriceChange } from '../PriceChange';

describe('PriceChange', () => {
  it('renders positive value with up arrow and plus sign', () => {
    const { container } = render(<PriceChange value={2.5} />);
    const text = container.textContent ?? '';
    expect(text).toContain('▲');
    expect(text).toContain('+');
    expect(text).toContain('2.50');
  });

  it('renders negative value with down arrow and minus sign', () => {
    const { container } = render(<PriceChange value={-1.3} />);
    const text = container.textContent ?? '';
    expect(text).toContain('▼');
    expect(text).toContain('-');
    expect(text).toContain('1.30');
  });

  it('renders zero with dash', () => {
    const { container } = render(<PriceChange value={0} />);
    const text = container.textContent ?? '';
    expect(text).toContain('—');
  });

  it('applies positive color for positive value', () => {
    const { container } = render(<PriceChange value={1} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.color).toBe('var(--color-positive)');
  });

  it('applies negative color for negative value', () => {
    const { container } = render(<PriceChange value={-1} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.color).toBe('var(--color-negative)');
  });

  it('applies neutral color for zero', () => {
    const { container } = render(<PriceChange value={0} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.color).toBe('var(--color-neutral)');
  });

  it('respects custom decimals', () => {
    const { container } = render(<PriceChange value={1.234} decimals={3} />);
    const text = container.textContent ?? '';
    expect(text).toContain('1.234');
  });
});
