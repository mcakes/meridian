// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Sparkline } from '../Sparkline';

afterEach(() => cleanup());

describe('Sparkline', () => {
  it('renders empty SVG when data is empty', () => {
    const { container } = render(<Sparkline data={[]} />);
    const svg = container.querySelector('svg')!;
    expect(svg).toBeDefined();
    expect(svg.querySelector('polyline')).toBeNull();
    expect(svg.querySelector('polygon')).toBeNull();
  });

  it('renders SVG with correct width/height', () => {
    const { container } = render(<Sparkline data={[1, 2, 3]} width={100} height={40} />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('100');
    expect(svg.getAttribute('height')).toBe('40');
  });

  it('renders polyline with correct stroke color', () => {
    const { container } = render(<Sparkline data={[1, 2, 3]} color="red" />);
    const polyline = container.querySelector('polyline')!;
    expect(polyline.getAttribute('stroke')).toBe('red');
  });

  it('renders polygon area when showArea is true', () => {
    const { container } = render(<Sparkline data={[1, 2, 3]} showArea />);
    const polygon = container.querySelector('polygon');
    expect(polygon).toBeDefined();
    expect(polygon).not.toBeNull();
  });

  it('does not render polygon when showArea is false (default)', () => {
    const { container } = render(<Sparkline data={[1, 2, 3]} />);
    const polygon = container.querySelector('polygon');
    expect(polygon).toBeNull();
  });

  it('handles single data point without NaN (places at center)', () => {
    const { container } = render(<Sparkline data={[5]} width={60} height={20} />);
    const polyline = container.querySelector('polyline')!;
    const points = polyline.getAttribute('points')!;
    // Single data point: x = width/2 = 30, y = height - ((5-5)/1)*height = 0
    expect(points).toContain('30,');
    expect(points).not.toContain('NaN');
  });

  it('uses default dimensions (60x20)', () => {
    const { container } = render(<Sparkline data={[1, 2]} />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('60');
    expect(svg.getAttribute('height')).toBe('20');
  });
});
