// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from '../DatePicker';

afterEach(() => cleanup());

describe('DatePicker', () => {
  it('renders day/month/year segments with spinbutton role', () => {
    render(<DatePicker value={new Date(2024, 5, 15)} onChange={() => {}} />);
    const spinbuttons = screen.getAllByRole('spinbutton');
    expect(spinbuttons.length).toBe(3);
  });

  it('day segment has correct aria attributes', () => {
    render(<DatePicker value={new Date(2024, 5, 15)} onChange={() => {}} />);
    const day = screen.getByRole('spinbutton', { name: 'Day' });
    expect(day.getAttribute('aria-valuenow')).toBe('15');
    expect(day.getAttribute('aria-valuemin')).toBe('1');
    expect(day.getAttribute('aria-valuemax')).toBe('30'); // June has 30 days
  });

  it('renders label when provided', () => {
    render(<DatePicker value={new Date(2024, 0, 1)} onChange={() => {}} label="Start date" />);
    expect(screen.getByText('Start date')).toBeDefined();
  });

  it('label is connected via aria-labelledby', () => {
    render(<DatePicker value={new Date(2024, 0, 1)} onChange={() => {}} label="Start date" />);
    const group = screen.getByRole('group');
    const labelledBy = group.getAttribute('aria-labelledby');
    expect(labelledBy).toBeDefined();
    const labelEl = document.getElementById(labelledBy!);
    expect(labelEl).toBeDefined();
    expect(labelEl!.textContent).toBe('Start date');
  });

  it('container has role="group"', () => {
    render(<DatePicker value={new Date(2024, 0, 1)} onChange={() => {}} />);
    expect(screen.getByRole('group')).toBeDefined();
  });
});
