import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// Mock Firebase
const mockGetDocs = vi.fn();
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  getDocs: (...args) => mockGetDocs(...args),
  addDoc: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _type: 'serverTimestamp' })),
}));

vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytesResumable: vi.fn(),
  getDownloadURL: vi.fn(),
}));

vi.mock('../../lib/firebase', () => ({
  db: {},
  storage: {},
}));

vi.mock('browser-image-compression', () => ({
  default: vi.fn((file) => Promise.resolve(file)),
}));

import { useFiles } from '../../hooks/useFiles';

describe('useFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches files on mount when projectId is provided', async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        { id: 'f1', data: () => ({ fileName: 'doc.pdf', fileUrl: 'https://url/doc.pdf' }) },
        { id: 'f2', data: () => ({ fileName: 'img.png', fileUrl: 'https://url/img.png' }) },
      ],
    });

    const { result } = renderHook(() => useFiles('proj-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.files).toHaveLength(2);
    expect(result.current.files[0].fileName).toBe('doc.pdf');
    expect(result.current.files[1].fileName).toBe('img.png');
  });

  it('does not fetch when projectId is falsy', () => {
    renderHook(() => useFiles(null));
    expect(mockGetDocs).not.toHaveBeenCalled();
  });

  it('handles fetch error gracefully', async () => {
    mockGetDocs.mockRejectedValue(new Error('permission-denied'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useFiles('proj-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.files).toEqual([]);
    consoleSpy.mockRestore();
  });

  it('uploadFile rejects files over 20MB', async () => {
    mockGetDocs.mockResolvedValue({ docs: [] });
    const { result } = renderHook(() => useFiles('proj-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    const bigFile = new File(['x'], 'big.bin', { type: 'application/octet-stream' });
    Object.defineProperty(bigFile, 'size', { value: 21 * 1024 * 1024 });

    await expect(result.current.uploadFile(bigFile)).rejects.toThrow(/exceeds.*20 MB/);
  });

  it('exposes initial state correctly', () => {
    mockGetDocs.mockResolvedValue({ docs: [] });
    const { result } = renderHook(() => useFiles('proj-1'));

    expect(result.current.uploading).toBe(false);
    expect(result.current.isCompressing).toBe(false);
    expect(result.current.uploadProgress).toBe(0);
  });
});
