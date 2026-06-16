import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(),
  addDoc: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _type: 'serverTimestamp' })),
}));

vi.mock('../../lib/firebase', () => ({
  db: {},
}));

import { onSnapshot, addDoc } from 'firebase/firestore';
import { useMessages } from '../../hooks/useMessages';

describe('useMessages', () => {
  let snapshotCallback;
  let errorCallback;

  beforeEach(() => {
    vi.clearAllMocks();
    onSnapshot.mockImplementation((q, onNext, onError) => {
      snapshotCallback = onNext;
      errorCallback = onError;
      return vi.fn(); // unsubscribe
    });
  });

  it('returns messages sorted by timestamp ascending', () => {
    const { result } = renderHook(() => useMessages('proj-1'));

    act(() => {
      snapshotCallback({
        docs: [
          { id: 'm2', data: () => ({ text: 'Later', timestamp: { toMillis: () => 2000 } }) },
          { id: 'm1', data: () => ({ text: 'Earlier', timestamp: { toMillis: () => 1000 } }) },
        ],
      });
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].id).toBe('m1');
    expect(result.current.messages[1].id).toBe('m2');
    expect(result.current.loading).toBe(false);
  });

  it('sets loading false immediately when projectId is falsy', () => {
    const { result } = renderHook(() => useMessages(null));
    expect(result.current.loading).toBe(false);
    expect(result.current.messages).toEqual([]);
  });

  it('sets error and falls back to demo messages on snapshot error for demo projects', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useMessages('demo-proj'));

    act(() => {
      errorCallback({ code: 'unavailable', message: 'Firestore offline' });
    });

    expect(result.current.error).toBe('Firestore offline');
    expect(result.current.loading).toBe(false);
    // Should have fallback demo messages
    expect(result.current.messages.length).toBeGreaterThan(0);
    consoleSpy.mockRestore();
  });

  it('sendMessage calls addDoc with correct data', async () => {
    addDoc.mockResolvedValue({ id: 'new-msg' });
    const { result } = renderHook(() => useMessages('proj-1'));

    act(() => snapshotCallback({ docs: [] }));

    await act(async () => {
      await result.current.sendMessage({ text: '  Hello!  ', sender: 'freelancer' });
    });

    expect(addDoc).toHaveBeenCalledTimes(1);
    const data = addDoc.mock.calls[0][1];
    expect(data.projectId).toBe('proj-1');
    expect(data.text).toBe('Hello!');
    expect(data.sender).toBe('freelancer');
  });

  it('sendMessage throws when projectId is not set', async () => {
    const { result } = renderHook(() => useMessages(null));

    await expect(
      result.current.sendMessage({ text: 'Hi', sender: 'client' })
    ).rejects.toThrow('No projectId');
  });
});
