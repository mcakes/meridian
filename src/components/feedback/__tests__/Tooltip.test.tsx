// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip, TooltipProvider } from '../Tooltip';

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
    expect(screen.getByText('Save layout')).toBeDefined();
  });

  it('hides tooltip on unhover', async () => {
    const user = userEvent.setup();
    renderTooltip();
    await user.hover(screen.getByRole('button', { name: 'Save' }));
    await screen.findByRole('tooltip');
    await user.unhover(screen.getByRole('button', { name: 'Save' }));
    // Radix removes the tooltip from DOM after close
    await vi.waitFor(() => {
      expect(screen.queryByRole('tooltip')).toBeNull();
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
    expect(await screen.findByText('Delete item')).toBeDefined();
  });
});
