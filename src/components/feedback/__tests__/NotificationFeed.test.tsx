// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationFeed } from '../NotificationFeed';

afterEach(() => cleanup());

describe('NotificationFeed', () => {
  it('shows "No notifications" when empty', () => {
    render(<NotificationFeed notifications={[]} onDismiss={() => {}} />);
    expect(screen.getByText('No notifications')).toBeDefined();
  });

  it('renders notification messages', () => {
    const notifications = [
      { id: '1', message: 'Order filled', timestamp: Date.now() },
      { id: '2', message: 'Price alert', timestamp: Date.now() },
    ];
    render(<NotificationFeed notifications={notifications} onDismiss={() => {}} />);
    expect(screen.getByText('Order filled')).toBeDefined();
    expect(screen.getByText('Price alert')).toBeDefined();
  });

  it('dismiss button calls onDismiss with correct id', async () => {
    const onDismiss = vi.fn();
    const user = userEvent.setup();
    const notifications = [
      { id: 'abc', message: 'Order filled', timestamp: Date.now() },
    ];
    render(<NotificationFeed notifications={notifications} onDismiss={onDismiss} />);
    // The dismiss button has class m-close and text "x"
    const buttons = screen.getAllByRole('button');
    const dismissBtn = buttons.find((b) => b.classList.contains('m-close'))!;
    await user.click(dismissBtn);
    expect(onDismiss).toHaveBeenCalledWith('abc');
  });

  it('action button calls onAction with correct id when action exists', async () => {
    const onAction = vi.fn();
    const user = userEvent.setup();
    const notifications = [
      { id: 'xyz', message: 'Price alert', timestamp: Date.now(), action: 'View' },
    ];
    render(
      <NotificationFeed notifications={notifications} onDismiss={() => {}} onAction={onAction} />,
    );
    await user.click(screen.getByRole('button', { name: 'View' }));
    expect(onAction).toHaveBeenCalledWith('xyz');
  });

  it('does not render action button when no action on notification', () => {
    const notifications = [
      { id: '1', message: 'Order filled', timestamp: Date.now() },
    ];
    render(<NotificationFeed notifications={notifications} onDismiss={() => {}} />);
    // Only the dismiss button should exist, no action button
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(1);
    expect(buttons[0].classList.contains('m-close')).toBe(true);
  });
});
