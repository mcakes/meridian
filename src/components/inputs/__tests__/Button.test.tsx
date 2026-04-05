// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
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

  it('applies disabled styling', () => {
    render(<Button disabled>Click</Button>);
    const btn = screen.getByRole('button');
    expect(btn.style.opacity).toBe('0.5');
    expect(btn.style.cursor).toBe('default');
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

  describe('variant="default"', () => {
    it('has bordered styling', () => {
      render(<Button variant="default">Click</Button>);
      const btn = screen.getByRole('button');
      expect(btn.style.backgroundColor).toBe('var(--bg-surface)');
      expect(btn.style.border).toBe('1px solid var(--border-default)');
      expect(btn.style.color).toBe('var(--text-primary)');
    });

    it('changes border color on hover', () => {
      render(<Button>Click</Button>);
      const btn = screen.getByRole('button');
      fireEvent.mouseEnter(btn);
      expect(btn.style.borderColor).toBe('var(--border-active)');
      fireEvent.mouseLeave(btn);
      expect(btn.style.borderColor).toBe('var(--border-default)');
    });
  });

  describe('variant="ghost"', () => {
    it('has transparent styling', () => {
      render(<Button variant="ghost">Click</Button>);
      const btn = screen.getByRole('button');
      expect(btn.style.backgroundColor).toBe('transparent');
      expect(btn.style.borderStyle).toBe('none');
      expect(btn.style.color).toBe('var(--text-secondary)');
    });

    it('changes background on hover', () => {
      render(<Button variant="ghost">Click</Button>);
      const btn = screen.getByRole('button');
      fireEvent.mouseEnter(btn);
      expect(btn.style.backgroundColor).toBe('var(--bg-highlight)');
      fireEvent.mouseLeave(btn);
      expect(btn.style.backgroundColor).toBe('transparent');
    });
  });

  describe('variant="destructive"', () => {
    it('has destructive styling', () => {
      render(<Button variant="destructive">Delete</Button>);
      const btn = screen.getByRole('button');
      expect(btn.style.color).toBe('var(--color-negative)');
      expect(btn.style.border).toBe('1px solid var(--border-default)');
    });

    it('changes background and border on hover', () => {
      render(<Button variant="destructive">Delete</Button>);
      const btn = screen.getByRole('button');
      fireEvent.mouseEnter(btn);
      expect(btn.style.backgroundColor).toBe('color-mix(in srgb, var(--color-negative) 12%, transparent)');
      expect(btn.style.borderColor).toBe('var(--color-negative)');
    });
  });

  describe('size="sm"', () => {
    it('applies small sizing', () => {
      render(<Button size="sm">Click</Button>);
      const btn = screen.getByRole('button');
      expect(btn.style.fontSize).toBe('12px');
      expect(btn.style.padding).toBe('2px 8px');
    });
  });

  describe('size="md"', () => {
    it('applies medium sizing (default)', () => {
      render(<Button>Click</Button>);
      const btn = screen.getByRole('button');
      expect(btn.style.fontSize).toBe('13px');
      expect(btn.style.padding).toBe('4px 10px');
    });
  });

  describe('icon mode', () => {
    it('applies square dimensions for md', () => {
      render(<Button icon aria-label="Close">X</Button>);
      const btn = screen.getByRole('button');
      expect(btn.style.width).toBe('28px');
      expect(btn.style.height).toBe('28px');
      expect(btn.style.padding).toBe('0px');
    });

    it('applies square dimensions for sm', () => {
      render(<Button icon size="sm" aria-label="Close">X</Button>);
      const btn = screen.getByRole('button');
      expect(btn.style.width).toBe('24px');
      expect(btn.style.height).toBe('24px');
    });
  });

  it('shows focus ring on focus', () => {
    render(<Button>Click</Button>);
    const btn = screen.getByRole('button');
    fireEvent.focus(btn);
    expect(btn.style.boxShadow).toBe('0 0 0 2px var(--color-info)');
    fireEvent.blur(btn);
    expect(btn.style.boxShadow).toBe('none');
  });

  it('does not show hover effects when disabled', () => {
    render(<Button disabled>Click</Button>);
    const btn = screen.getByRole('button');
    fireEvent.mouseEnter(btn);
    expect(btn.style.borderColor).not.toBe('var(--border-active)');
  });
});
