import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HealthBar } from '../HealthBar';

describe('HealthBar', () => {
  it('renders with role="meter" and aria attributes', () => {
    const { container } = render(<HealthBar value={0.75} label="CPU usage" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute('role')).toBe('meter');
    expect(el.getAttribute('aria-valuenow')).toBe('0.75');
    expect(el.getAttribute('aria-valuemin')).toBe('0');
    expect(el.getAttribute('aria-valuemax')).toBe('1');
    expect(el.getAttribute('aria-label')).toBe('CPU usage');
  });

  it('clamps value to 0-1 range', () => {
    const { container } = render(<HealthBar value={1.5} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute('aria-valuenow')).toBe('1');
  });

  it('clamps negative values to 0', () => {
    const { container } = render(<HealthBar value={-0.5} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute('aria-valuenow')).toBe('0');
  });

  it('sets fill width as percentage', () => {
    const { container } = render(<HealthBar value={0.5} />);
    const fill = container.firstElementChild!.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe('50%');
  });

  it('renders with custom height', () => {
    const { container } = render(<HealthBar value={0.5} height={8} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.height).toBe('8px');
  });

  it('defaults to ok status', () => {
    const { container } = render(<HealthBar value={0.5} />);
    const fill = container.firstElementChild!.firstElementChild as HTMLElement;
    expect(fill.style.backgroundColor).toBe('var(--color-positive)');
  });

  it('applies warn status color', () => {
    const { container } = render(<HealthBar value={0.5} status="warn" />);
    const fill = container.firstElementChild!.firstElementChild as HTMLElement;
    expect(fill.style.backgroundColor).toBe('var(--color-warning)');
  });

  it('applies error status color', () => {
    const { container } = render(<HealthBar value={0.5} status="error" />);
    const fill = container.firstElementChild!.firstElementChild as HTMLElement;
    expect(fill.style.backgroundColor).toBe('var(--color-negative)');
  });
});
