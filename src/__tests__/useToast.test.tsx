import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useEffect } from 'react';
import { render } from '@testing-library/react';
import { useToast } from '../hooks/useToast';
import { useToastStore } from '../store/toastStore';

function TestComponent() {
  const { success } = useToast();
  useEffect(() => {
    success('Test title', 'Test message', 1000);
  }, []);
  return null;
}

describe('useToast hook', () => {
  beforeEach(() => {
    // Reset store
    useToastStore.setState({ toasts: [] });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds a toast and auto-removes after duration', async () => {
    render(<TestComponent />);

    const toasts = useToastStore.getState().toasts;
    expect(toasts.length).toBe(1);
    expect(toasts[0].title).toBe('Test title');
    expect(toasts[0].type).toBe('success');

    // Advance timers to trigger auto-remove
    vi.advanceTimersByTime(1000);

    const after = useToastStore.getState().toasts;
    expect(after.length).toBe(0);
  });
});
