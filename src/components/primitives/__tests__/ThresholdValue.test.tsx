import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ThresholdValue } from '../ThresholdValue';

describe('ThresholdValue', () => {
  it('renders normal severity below warn threshold', () => {
    const { container } = render(<ThresholdValue value={50} warnAt={70} errorAt={90} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.color).toBe('var(--color-positive)');
    expect(el.textContent).toContain('●');
    expect(el.textContent).toContain('50');
  });

  it('renders warn severity at warn threshold', () => {
    const { container } = render(<ThresholdValue value={75} warnAt={70} errorAt={90} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.color).toBe('var(--color-warning)');
    expect(el.textContent).toContain('▲');
  });

  it('renders error severity at error threshold', () => {
    const { container } = render(<ThresholdValue value={95} warnAt={70} errorAt={90} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.color).toBe('var(--color-negative)');
    expect(el.textContent).toContain('⬥');
  });

  it('inverts thresholds when invert is true', () => {
    const { container } = render(<ThresholdValue value={5} warnAt={30} errorAt={10} invert />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.color).toBe('var(--color-negative)');
  });

  it('uses custom format function', () => {
    const format = (n: number) => `${n}%`;
    const { container } = render(<ThresholdValue value={42} warnAt={70} errorAt={90} format={format} />);
    expect(container.textContent).toContain('42%');
  });
});
