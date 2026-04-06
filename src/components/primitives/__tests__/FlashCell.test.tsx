import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { FlashCell } from '../FlashCell';

afterEach(() => cleanup());

describe('FlashCell', () => {
  it('renders formatted value', () => {
    const { container } = render(<FlashCell value={42} />);
    expect(container.textContent).toBe('42');
  });

  it('uses custom format function', () => {
    const format = (n: number) => `$${n.toFixed(2)}`;
    const { container } = render(<FlashCell value={10} format={format} />);
    expect(container.textContent).toBe('$10.00');
  });

  it('shows transparent background initially', () => {
    const { container } = render(<FlashCell value={100} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.backgroundColor).toBe('transparent');
  });

  it('renders as inline-block span', () => {
    const { container } = render(<FlashCell value={100} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe('SPAN');
    expect(el.style.display).toBe('inline-block');
  });
});
