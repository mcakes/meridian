import { renderHook, act } from '@testing-library/react';
import { useFlash } from '../useFlash';

describe('useFlash', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null initially', () => {
    const { result } = renderHook(() => useFlash(100));
    expect(result.current).toBeNull();
  });

  it("returns 'up' when value increases", () => {
    const { result, rerender } = renderHook(({ value }) => useFlash(value), {
      initialProps: { value: 100 },
    });

    rerender({ value: 105 });

    expect(result.current).toBe('up');
  });

  it("returns 'down' when value decreases", () => {
    const { result, rerender } = renderHook(({ value }) => useFlash(value), {
      initialProps: { value: 100 },
    });

    rerender({ value: 95 });

    expect(result.current).toBe('down');
  });

  it('returns null after 350ms timeout', () => {
    const { result, rerender } = renderHook(({ value }) => useFlash(value), {
      initialProps: { value: 100 },
    });

    rerender({ value: 105 });
    expect(result.current).toBe('up');

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(result.current).toBeNull();
  });

  it('resets timer on rapid value changes', () => {
    const { result, rerender } = renderHook(({ value }) => useFlash(value), {
      initialProps: { value: 100 },
    });

    rerender({ value: 105 });
    expect(result.current).toBe('up');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Flash should still be active since only 300ms passed
    expect(result.current).toBe('up');

    // New value change resets the 350ms timer
    rerender({ value: 110 });
    expect(result.current).toBe('up');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Only 300ms since last change, flash should still be active
    expect(result.current).toBe('up');

    act(() => {
      vi.advanceTimersByTime(50);
    });

    // Now 350ms since last change, flash should clear
    expect(result.current).toBeNull();
  });

  it('clears timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

    const { rerender, unmount } = renderHook(
      ({ value }) => useFlash(value),
      { initialProps: { value: 100 } },
    );

    rerender({ value: 105 });

    clearTimeoutSpy.mockClear();
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
