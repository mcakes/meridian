// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Panel } from '../Panel';

afterEach(() => cleanup());

describe('Panel', () => {
  it('renders children', () => {
    render(<Panel><span>Content</span></Panel>);
    expect(screen.getByText('Content')).toBeDefined();
  });

  it('renders toolbar when provided', () => {
    render(<Panel toolbar={<span>Toolbar content</span>}><span>Body</span></Panel>);
    expect(screen.getByText('Toolbar content')).toBeDefined();
  });

  it('does not render toolbar when omitted', () => {
    const { container } = render(<Panel><span>Body</span></Panel>);
    // Toolbar wrapper has height: 32px style; when omitted there should be no element with that style
    const divs = container.querySelectorAll('div');
    const toolbarDiv = Array.from(divs).find((d) => (d as HTMLElement).style.height === '32px');
    expect(toolbarDiv).toBeUndefined();
  });
});
