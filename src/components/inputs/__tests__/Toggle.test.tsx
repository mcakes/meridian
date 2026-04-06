// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from '../Toggle';

afterEach(() => cleanup());

describe('Toggle', () => {
  it('renders a switch with aria-checked', () => {
    render(<Toggle value={false} onChange={() => {}} />);
    const sw = screen.getByRole('switch');
    expect(sw).toBeDefined();
    expect(sw.getAttribute('aria-checked')).toBe('false');
  });

  it('reflects aria-checked when value is true', () => {
    render(<Toggle value={true} onChange={() => {}} />);
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true');
  });

  it('calls onChange with opposite boolean when clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Toggle value={false} onChange={onChange} />);
    await user.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when value is true and clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Toggle value={true} onChange={onChange} />);
    await user.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('renders label text when provided', () => {
    render(<Toggle value={false} onChange={() => {}} label="Dark mode" />);
    expect(screen.getByText('Dark mode')).toBeDefined();
  });

  it('does not render label when omitted', () => {
    render(<Toggle value={false} onChange={() => {}} />);
    expect(screen.queryByText('Dark mode')).toBeNull();
  });
});
