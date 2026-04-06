// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Toolbar } from '../Toolbar';

afterEach(() => cleanup());

describe('Toolbar', () => {
  it('renders children', () => {
    render(<Toolbar><span>Filter</span></Toolbar>);
    expect(screen.getByText('Filter')).toBeDefined();
  });

  it('applies correct height (32px)', () => {
    const { container } = render(<Toolbar><span>Filter</span></Toolbar>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.height).toBe('32px');
  });
});
