import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock Firebase
const mockGetDocs = vi.fn();
const mockAddDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  getDocs: (...args) => mockGetDocs(...args),
  addDoc: (...args) => mockAddDoc(...args),
  updateDoc: (...args) => mockUpdateDoc(...args),
  deleteDoc: (...args) => mockDeleteDoc(...args),
  doc: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _type: 'serverTimestamp' })),
}));

vi.mock('../../lib/firebase', () => ({
  db: {},
}));

import { useTasks } from '../../hooks/useTasks';

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches tasks sorted by createdAt ascending', async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        { id: 't2', data: () => ({ title: 'Second', createdAt: { toMillis: () => 2000 } }) },
        { id: 't1', data: () => ({ title: 'First', createdAt: { toMillis: () => 1000 } }) },
      ],
    });

    const { result } = renderHook(() => useTasks('proj-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.tasks).toHaveLength(2);
    expect(result.current.tasks[0].id).toBe('t1');
    expect(result.current.tasks[1].id).toBe('t2');
  });

  it('does not fetch when projectId is falsy', () => {
    renderHook(() => useTasks(null));
    expect(mockGetDocs).not.toHaveBeenCalled();
  });

  it('falls back to demo tasks on error for demo projectIds', async () => {
    mockGetDocs.mockRejectedValue(new Error('permission-denied'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useTasks('demo-123'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tasks.length).toBeGreaterThan(0);
    expect(result.current.tasks[0].id).toBe('t1');
    consoleSpy.mockRestore();
  });

  it('addTask calls addDoc then refetches', async () => {
    mockGetDocs.mockResolvedValue({ docs: [] });
    mockAddDoc.mockResolvedValue({ id: 'new-task' });

    const { result } = renderHook(() => useTasks('proj-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addTask({ title: 'New task', dueDate: '2025-05-01' });
    });

    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    const docData = mockAddDoc.mock.calls[0][1];
    expect(docData.projectId).toBe('proj-1');
    expect(docData.title).toBe('New task');
    expect(docData.status).toBe('pending');
    // getDocs called twice: initial + refetch
    expect(mockGetDocs).toHaveBeenCalledTimes(2);
  });

  it('updateTask calls updateDoc and updates local state', async () => {
    mockGetDocs.mockResolvedValue({
      docs: [{ id: 't1', data: () => ({ title: 'Task', status: 'pending' }) }],
    });
    mockUpdateDoc.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTasks('proj-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateTask('t1', { status: 'done' });
    });

    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    expect(result.current.tasks[0].status).toBe('done');
  });

  it('deleteTask calls deleteDoc and removes from local state', async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        { id: 't1', data: () => ({ title: 'A' }) },
        { id: 't2', data: () => ({ title: 'B' }) },
      ],
    });
    mockDeleteDoc.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTasks('proj-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteTask('t1');
    });

    expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].id).toBe('t2');
  });
});
