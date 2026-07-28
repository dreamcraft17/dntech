import { renderHook, act } from '@testing-library/react';
import { useExitIntent } from '@/hooks/useExitIntent';

describe('useExitIntent', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('shows modal when mouse leaves viewport from top', () => {
    const onExit = jest.fn();
    const { result } = renderHook(() =>
      useExitIntent({ onExit, enableMobile: true, sessionKey: 'test-exit-intent' })
    );

    act(() => {
      document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 0 }));
    });

    expect(result.current.showModal).toBe(true);
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('dismisses modal', () => {
    const { result } = renderHook(() =>
      useExitIntent({ enableMobile: true, sessionKey: 'test-exit-intent-2' })
    );

    act(() => {
      document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 0 }));
    });
    expect(result.current.showModal).toBe(true);

    act(() => {
      result.current.dismiss();
    });
    expect(result.current.showModal).toBe(false);
  });
});
