// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NumberInput } from '../NumberInput';

afterEach(() => cleanup());

describe('NumberInput', () => {
  it('renders the current value', () => {
    render(<NumberInput value={42} onChange={() => {}} />);
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    expect(input.value).toBe('42');
  });

  it('clicking + increments by step', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<NumberInput value={10} onChange={onChange} step={5} />);
    await user.click(screen.getByLabelText('Increase'));
    expect(onChange).toHaveBeenCalledWith(15);
  });

  it('clicking - decrements by step', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<NumberInput value={10} onChange={onChange} step={5} />);
    await user.click(screen.getByLabelText('Decrease'));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('clamps to max', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<NumberInput value={9} onChange={onChange} step={5} max={10} />);
    await user.click(screen.getByLabelText('Increase'));
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it('clamps to min', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<NumberInput value={2} onChange={onChange} step={5} min={0} />);
    await user.click(screen.getByLabelText('Decrease'));
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('renders label when provided', () => {
    render(<NumberInput value={0} onChange={() => {}} label="Quantity" />);
    expect(screen.getByText('Quantity')).toBeDefined();
  });

  it('renders suffix when provided', () => {
    render(<NumberInput value={50} onChange={() => {}} suffix="px" />);
    expect(screen.getByText('px')).toBeDefined();
  });

  it('has aria-labelledby connecting label to input', () => {
    render(<NumberInput value={0} onChange={() => {}} label="Quantity" />);
    const input = screen.getByRole('spinbutton');
    const labelledBy = input.getAttribute('aria-labelledby');
    expect(labelledBy).toBeDefined();
    const labelEl = document.getElementById(labelledBy!);
    expect(labelEl).toBeDefined();
    expect(labelEl!.textContent).toBe('Quantity');
  });
});
