import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _type: 'serverTimestamp' })),
}));

vi.mock('../../lib/firebase', () => ({
  db: {},
}));

// Mock useAuth
const mockCurrentUser = { uid: 'user-123' };
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ currentUser: mockCurrentUser })),
}));

vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'abc1234567'),
}));

import { onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useProjects } from '../../hooks/useProjects';

describe('useProjects', () => {
  let snapshotCallback;
  let errorCallback;

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ currentUser: mockCurrentUser });
    onSnapshot.mockImplementation((q, onNext, onError) => {
      snapshotCallback = onNext;
      errorCallback = onError;
      return vi.fn(); // unsubscribe
    });
  });

  it('subscribes to Firestore on mount and returns projects sorted by createdAt desc', async () => {
    const { result } = renderHook(() => useProjects());

    expect(result.current.loading).toBe(true);

    // Simulate Firestore snapshot
    act(() => {
      snapshotCallback({
        docs: [
          { id: 'p1', data: () => ({ clientName: 'Alice', createdAt: { toMillis: () => 1000 } }) },
          { id: 'p2', data: () => ({ clientName: 'Bob', createdAt: { toMillis: () => 2000 } }) },
        ],
      });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.projects).toHaveLength(2);
    // p2 (newer) should come first
    expect(result.current.projects[0].id).toBe('p2');
    expect(result.current.projects[1].id).toBe('p1');
  });

  it('sets error on Firestore failure', () => {
    const { result } = renderHook(() => useProjects());
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    act(() => {
      errorCallback({ code: 'unavailable', message: 'Firestore offline' });
    });

    expect(result.current.error).toBe('Firestore offline');
    expect(result.current.loading).toBe(false);
    consoleSpy.mockRestore();
  });

  it('sets loading to false when no user is authenticated', async () => {
    useAuth.mockReturnValue({ currentUser: null });
    const { result } = renderHook(() => useProjects());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.projects).toEqual([]);
  });

  it('createProject calls addDoc and returns id + publicLinkId', async () => {
    addDoc.mockResolvedValue({ id: 'new-project-id' });
    const { result } = renderHook(() => useProjects());

    // Trigger snapshot to finish loading
    act(() => snapshotCallback({ docs: [] }));

    const res = await result.current.createProject({
      clientName: ' Alice ',
      clientEmail: ' Alice@Test.COM ',
      description: ' desc ',
    });

    expect(addDoc).toHaveBeenCalledTimes(1);
    const docData = addDoc.mock.calls[0][1];
    expect(docData.clientName).toBe('Alice');
    expect(docData.clientEmail).toBe('alice@test.com');
    expect(docData.description).toBe('desc');
    expect(docData.status).toBe('active');
    expect(docData.publicLinkId).toBe('abc1234567');
    expect(res).toEqual({ id: 'new-project-id', publicLinkId: 'abc1234567' });
  });

  it('createProject throws when not authenticated', async () => {
    useAuth.mockReturnValue({ currentUser: null });
    const { result } = renderHook(() => useProjects());

    await expect(result.current.createProject({
      clientName: 'X',
      clientEmail: 'x@x.com',
    })).rejects.toThrow('Not authenticated');
  });

  it('updateProject calls updateDoc', async () => {
    updateDoc.mockResolvedValue(undefined);
    const { result } = renderHook(() => useProjects());
    act(() => snapshotCallback({ docs: [] }));

    await result.current.updateProject('p1', { status: 'completed' });
    expect(updateDoc).toHaveBeenCalledTimes(1);
  });

  it('deleteProject calls deleteDoc', async () => {
    deleteDoc.mockResolvedValue(undefined);
    const { result } = renderHook(() => useProjects());
    act(() => snapshotCallback({ docs: [] }));

    await result.current.deleteProject('p1');
    expect(deleteDoc).toHaveBeenCalledTimes(1);
  });
});
