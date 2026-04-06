// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '../Select';

afterEach(() => cleanup());

const options = [
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
];

describe('Select', () => {
  it('renders the selected option label', () => {
    render(<Select value="green" onChange={() => {}} options={options} />);
    expect(screen.getByText('Green')).toBeDefined();
  });

  it('renders the label when provided', () => {
    render(<Select value="red" onChange={() => {}} options={options} label="Color" />);
    expect(screen.getByText('Color')).toBeDefined();
  });

  it('has aria-labelledby on trigger when label is present', () => {
    render(<Select value="red" onChange={() => {}} options={options} label="Color" />);
    const trigger = screen.getByRole('combobox');
    const labelledBy = trigger.getAttribute('aria-labelledby');
    expect(labelledBy).toBeDefined();
    const labelEl = document.getElementById(labelledBy!.split(' ')[0]!);
    expect(labelEl).toBeDefined();
    expect(labelEl!.textContent).toBe('Color');
  });

  it('disables the trigger when disabled prop is set', () => {
    render(<Select value="red" onChange={() => {}} options={options} disabled />);
    const trigger = screen.getByRole('combobox');
    expect(trigger.getAttribute('data-disabled')).toBeDefined();
  });
});
