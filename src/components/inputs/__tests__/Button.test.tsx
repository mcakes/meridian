// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

afterEach(() => cleanup());

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeDefined();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick} disabled>Click</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies the m-btn class', () => {
    render(<Button>Click</Button>);
    const btn = screen.getByRole('button');
    expect(btn.classList.contains('m-btn')).toBe(true);
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Click</Button>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });

  it('passes through HTML attributes', () => {
    render(<Button aria-label="Close" type="submit">X</Button>);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-label')).toBe('Close');
    expect(btn.getAttribute('type')).toBe('submit');
  });

  it('merges custom className', () => {
    render(<Button className="custom">Click</Button>);
    const btn = screen.getByRole('button');
    expect(btn.classList.contains('m-btn')).toBe(true);
    expect(btn.classList.contains('custom')).toBe(true);
  });

  it('applies custom style without being overridden', () => {
    render(<Button style={{ color: 'red' }}>Click</Button>);
    const btn = screen.getByRole('button');
    expect(btn.style.color).toBe('red');
  });

  describe('variants', () => {
    it('sets data-variant="default" by default', () => {
      render(<Button>Click</Button>);
      expect(screen.getByRole('button').getAttribute('data-variant')).toBe('default');
    });

    it('sets data-variant="ghost"', () => {
      render(<Button variant="ghost">Click</Button>);
      expect(screen.getByRole('button').getAttribute('data-variant')).toBe('ghost');
    });

    it('sets data-variant="destructive"', () => {
      render(<Button variant="destructive">Delete</Button>);
      expect(screen.getByRole('button').getAttribute('data-variant')).toBe('destructive');
    });
  });

  describe('sizes', () => {
    it('sets data-size="md" by default', () => {
      render(<Button>Click</Button>);
      expect(screen.getByRole('button').getAttribute('data-size')).toBe('md');
    });

    it('sets data-size="sm"', () => {
      render(<Button size="sm">Click</Button>);
      expect(screen.getByRole('button').getAttribute('data-size')).toBe('sm');
    });
  });

  describe('icon mode', () => {
    it('sets data-icon="true"', () => {
      render(<Button icon aria-label="Close">X</Button>);
      expect(screen.getByRole('button').getAttribute('data-icon')).toBe('true');
    });

    it('sets data-icon="false" by default', () => {
      render(<Button>Click</Button>);
      expect(screen.getByRole('button').getAttribute('data-icon')).toBe('false');
    });
  });

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Click</Button>);
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
  });
});
