// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, act, fireEvent } from '@testing-library/react';
import { ToastContainer, showToast } from '../Toast';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  // Advance timers to clear all toasts from global state
  act(() => { vi.advanceTimersByTime(60000); });
  cleanup();
  vi.useRealTimers();
});

describe('Toast', () => {
  it('ToastContainer renders nothing when no toasts', () => {
    const { container } = render(<ToastContainer />);
    expect(container.innerHTML).toBe('');
  });

  it('showToast adds a toast that renders in ToastContainer', () => {
    render(<ToastContainer />);
    act(() => {
      showToast('Order filled', 'info');
    });
    expect(screen.getByText('Order filled')).toBeDefined();
  });

  it('dismiss button removes toast', () => {
    render(<ToastContainer />);
    act(() => {
      showToast('Order filled', 'info');
    });
    expect(screen.getByText('Order filled')).toBeDefined();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByText('Order filled')).toBeNull();
  });

  it('max 3 toasts visible (oldest dropped)', () => {
    render(<ToastContainer />);
    act(() => {
      showToast('Toast 1', 'info');
      showToast('Toast 2', 'info');
      showToast('Toast 3', 'info');
      showToast('Toast 4', 'info');
    });
    expect(screen.queryByText('Toast 1')).toBeNull();
    expect(screen.getByText('Toast 2')).toBeDefined();
    expect(screen.getByText('Toast 3')).toBeDefined();
    expect(screen.getByText('Toast 4')).toBeDefined();
  });
});
