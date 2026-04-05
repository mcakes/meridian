// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip, TooltipProvider } from '../Tooltip';

// Radix UI's positioning primitives use ResizeObserver which jsdom does not provide.
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => cleanup());

function renderTooltip(props?: { side?: 'top' | 'right' | 'bottom' | 'left'; content?: string }) {
  return render(
    <TooltipProvider delayDuration={0}>
      <Tooltip content={props?.content ?? 'Save layout'} side={props?.side}>
        <button>Save</button>
      </Tooltip>
    </TooltipProvider>,
  );
}

describe('Tooltip', () => {
  it('renders the trigger element', () => {
    renderTooltip();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDefined();
  });

  it('does not show tooltip content by default', () => {
    renderTooltip();
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('shows tooltip on hover', async () => {
    const user = userEvent.setup();
    renderTooltip();
    await user.hover(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('tooltip')).toBeDefined();
    expect(screen.getAllByText('Save layout').length).toBeGreaterThan(0);
  });

  it('hides tooltip on dismiss', async () => {
    const user = userEvent.setup();
    renderTooltip();
    await user.hover(screen.getByRole('button', { name: 'Save' }));
    await screen.findByRole('tooltip');
    // jsdom does not fire pointer events in a way that closes Radix tooltips on unhover;
    // pressing Escape is the reliable dismiss mechanism in test environments.
    await user.keyboard('{Escape}');
    await vi.waitFor(() => {
      expect(document.querySelector('[data-radix-popper-content-wrapper]')).toBeNull();
    });
  });

  it('shows tooltip on focus', async () => {
    const user = userEvent.setup();
    renderTooltip();
    await user.tab();
    expect(await screen.findByRole('tooltip')).toBeDefined();
  });

  it('renders custom content text', async () => {
    const user = userEvent.setup();
    renderTooltip({ content: 'Delete item' });
    await user.hover(screen.getByRole('button', { name: 'Save' }));
    expect((await screen.findAllByText('Delete item')).length).toBeGreaterThan(0);
  });
});
