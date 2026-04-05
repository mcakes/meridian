import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Spinner } from '../Spinner';

describe('Spinner', () => {
  it('renders with default size (sm = 14px)', () => {
    const { container } = render(<Spinner />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe('14px');
    expect(el.style.height).toBe('14px');
  });

  it('renders xs size (12px)', () => {
    const { container } = render(<Spinner size="xs" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe('12px');
    expect(el.style.height).toBe('12px');
  });

  it('renders md size (18px)', () => {
    const { container } = render(<Spinner size="md" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe('18px');
    expect(el.style.height).toBe('18px');
  });

  it('applies custom color', () => {
    const { container } = render(<Spinner color="var(--color-info)" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.borderTopColor).toBe('var(--color-info)');
  });

  it('has role="status"', () => {
    const { container } = render(<Spinner />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute('role')).toBe('status');
  });

  it('has default aria-label "Loading"', () => {
    const { container } = render(<Spinner />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute('aria-label')).toBe('Loading');
  });

  it('accepts custom aria-label', () => {
    const { container } = render(<Spinner label="Refreshing positions" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute('aria-label')).toBe('Refreshing positions');
  });
});
