// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { PanelHeader } from '../PanelHeader';

afterEach(() => cleanup());

describe('PanelHeader', () => {
  it('renders title text', () => {
    render(<PanelHeader title="Portfolio" />);
    expect(screen.getByText('Portfolio')).toBeDefined();
  });

  it('renders actions when provided', () => {
    render(<PanelHeader title="Portfolio" actions={<button>Edit</button>} />);
    expect(screen.getByRole('button', { name: 'Edit' })).toBeDefined();
  });

  it('does not render actions container when omitted', () => {
    const { container } = render(<PanelHeader title="Portfolio" />);
    // The actions container is a div with gap: 4px; when no actions it should not exist
    const spans = container.querySelectorAll('span');
    // Only the title span should exist; no sibling div for actions
    expect(spans.length).toBe(1);
    const parentDiv = spans[0].parentElement!;
    expect(parentDiv.children.length).toBe(1);
  });
});
