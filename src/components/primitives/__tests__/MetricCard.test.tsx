import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricCard } from '../MetricCard';

describe('MetricCard', () => {
  it('renders label and value', () => {
    render(<MetricCard label="Volume" value="1,234" />);
    expect(screen.getByText('Volume')).toBeDefined();
    expect(screen.getByText('1,234')).toBeDefined();
  });

  it('renders numeric value', () => {
    render(<MetricCard label="Count" value={42} />);
    expect(screen.getByText('42')).toBeDefined();
  });

  it('renders sublabel when provided', () => {
    render(<MetricCard label="PnL" value="$500" sublabel="+2.5%" />);
    expect(screen.getByText('+2.5%')).toBeDefined();
  });

  it('does not render sublabel when not provided', () => {
    const { container } = render(<MetricCard label="PnL" value="$500" />);
    const spans = container.querySelectorAll('span');
    expect(spans.length).toBe(2); // label + value, no sublabel
  });
});
