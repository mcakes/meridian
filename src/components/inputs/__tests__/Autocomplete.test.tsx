// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Autocomplete } from '../Autocomplete';

afterEach(() => cleanup());

const items = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Avocado', value: 'avocado' },
];

describe('Autocomplete', () => {
  it('renders input with combobox role', () => {
    render(<Autocomplete items={items} onChange={() => {}} />);
    expect(screen.getByRole('combobox')).toBeDefined();
  });

  it('typing shows dropdown with matching items', async () => {
    const user = userEvent.setup();
    render(<Autocomplete items={items} onChange={() => {}} />);
    await user.type(screen.getByRole('combobox'), 'ap');
    expect(screen.getByRole('listbox')).toBeDefined();
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(0);
  });

  it('items have role="option"', async () => {
    const user = userEvent.setup();
    render(<Autocomplete items={items} onChange={() => {}} />);
    await user.type(screen.getByRole('combobox'), 'ban');
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(0);
  });

  it('clicking an item calls onChange', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Autocomplete items={items} onChange={onChange} />);
    await user.type(screen.getByRole('combobox'), 'ban');
    const options = screen.getAllByRole('option');
    await user.click(options[0]!);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: 'banana' }));
  });

  it('escape closes dropdown', async () => {
    const user = userEvent.setup();
    render(<Autocomplete items={items} onChange={() => {}} />);
    await user.type(screen.getByRole('combobox'), 'ap');
    expect(screen.getByRole('listbox')).toBeDefined();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('renders label when provided', () => {
    render(<Autocomplete items={items} onChange={() => {}} label="Fruit" />);
    expect(screen.getByText('Fruit')).toBeDefined();
  });

  it('empty query shows no dropdown', () => {
    render(<Autocomplete items={items} onChange={() => {}} />);
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});
