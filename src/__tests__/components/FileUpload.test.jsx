import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileUpload from '../../components/FileUpload';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

import toast from 'react-hot-toast';

describe('FileUpload', () => {
  const onUpload = vi.fn().mockResolvedValue('https://url.test/file');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the drop zone prompt when no file is selected', () => {
    render(<FileUpload onUpload={onUpload} uploading={false} isCompressing={false} uploadProgress={0} />);
    expect(screen.getByText(/Drop a file or click to browse/)).toBeInTheDocument();
    expect(screen.getByText(/Max 20 MB/)).toBeInTheDocument();
  });

  it('shows the selected file name after choosing a file', async () => {
    const user = userEvent.setup();
    render(<FileUpload onUpload={onUpload} uploading={false} isCompressing={false} uploadProgress={0} />);

    const file = new File(['hello'], 'readme.txt', { type: 'text/plain' });
    const input = document.getElementById('file-upload-input');
    await user.upload(input, file);

    expect(screen.getByText('readme.txt')).toBeInTheDocument();
    expect(screen.getByText(/Upload to Cloud/)).toBeInTheDocument();
  });

  it('rejects files over 20 MB with a toast error', async () => {
    const user = userEvent.setup();
    render(<FileUpload onUpload={onUpload} uploading={false} isCompressing={false} uploadProgress={0} />);

    const bigFile = new File(['x'.repeat(100)], 'big.bin', { type: 'application/octet-stream' });
    Object.defineProperty(bigFile, 'size', { value: 21 * 1024 * 1024 });

    const input = document.getElementById('file-upload-input');
    await user.upload(input, bigFile);

    expect(toast.error).toHaveBeenCalledWith('File exceeds 20 MB limit');
    // Upload button should NOT appear
    expect(screen.queryByText('Upload to Cloud')).toBeNull();
  });

  it('calls onUpload when the upload button is clicked', async () => {
    const user = userEvent.setup();
    render(<FileUpload onUpload={onUpload} uploading={false} isCompressing={false} uploadProgress={0} />);

    const file = new File(['data'], 'doc.pdf', { type: 'application/pdf' });
    const input = document.getElementById('file-upload-input');
    await user.upload(input, file);
    await user.click(screen.getByText('Upload to Cloud'));

    expect(onUpload).toHaveBeenCalledWith(file);
  });

  it('shows progress bar when uploading', () => {
    render(<FileUpload onUpload={onUpload} uploading={true} isCompressing={false} uploadProgress={50} />);
    expect(screen.getByText('Uploading...')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('shows compressing state when isCompressing is true', () => {
    render(<FileUpload onUpload={onUpload} uploading={true} isCompressing={true} uploadProgress={0} />);
    expect(screen.getByText('Optimizing Image...')).toBeInTheDocument();
  });

  it('shows Finalizing when progress is 100', () => {
    render(<FileUpload onUpload={onUpload} uploading={true} isCompressing={false} uploadProgress={100} />);
    expect(screen.getByText('Finalizing...')).toBeInTheDocument();
  });

  it('handles file drop via drag and drop', () => {
    render(<FileUpload onUpload={onUpload} uploading={false} isCompressing={false} uploadProgress={0} />);

    const dropZone = screen.getByText(/Drop a file or click to browse/).closest('div');
    const file = new File(['dropped'], 'dropped.txt', { type: 'text/plain' });

    fireEvent.dragOver(dropZone, { dataTransfer: { files: [file] } });
    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });

    expect(screen.getByText('dropped.txt')).toBeInTheDocument();
  });

  it('displays upload error via toast', async () => {
    onUpload.mockRejectedValueOnce(new Error('Network error'));
    const user = userEvent.setup();
    render(<FileUpload onUpload={onUpload} uploading={false} isCompressing={false} uploadProgress={0} />);

    const file = new File(['data'], 'doc.pdf', { type: 'application/pdf' });
    const input = document.getElementById('file-upload-input');
    await user.upload(input, file);
    await user.click(screen.getByText('Upload to Cloud'));

    expect(toast.error).toHaveBeenCalledWith('Network error');
  });
});
