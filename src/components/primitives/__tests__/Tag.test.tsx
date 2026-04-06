import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tag } from '../Tag';

describe('Tag', () => {
  it('renders children text', () => {
    render(<Tag variant="pass">Active</Tag>);
    expect(screen.getByText('Active')).toBeDefined();
  });

  it('applies pass color', () => {
    const { container } = render(<Tag variant="pass">OK</Tag>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.color).toBe('var(--color-positive)');
  });

  it('applies warn color', () => {
    const { container } = render(<Tag variant="warn">Caution</Tag>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.color).toBe('var(--color-warning)');
  });

  it('applies fail color', () => {
    const { container } = render(<Tag variant="fail">Error</Tag>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.color).toBe('var(--color-negative)');
  });

  it('renders as inline-block span', () => {
    const { container } = render(<Tag variant="pass">OK</Tag>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe('SPAN');
    expect(el.style.display).toBe('inline-block');
  });
});
