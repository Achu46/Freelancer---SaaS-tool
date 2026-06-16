import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../../components/Modal';

describe('Modal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = '';
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={onClose} title="Test">
        <p>body</p>
      </Modal>
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders title and children when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="My Title">
        <p>modal body</p>
      </Modal>
    );
    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('modal body')).toBeInTheDocument();
  });

  it('sets body overflow to hidden when open', () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="T">
        content
      </Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('resets body overflow when closed', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={onClose} title="T">
        content
      </Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');
    rerender(
      <Modal isOpen={false} onClose={onClose} title="T">
        content
      </Modal>
    );
    expect(document.body.style.overflow).toBe('');
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Modal isOpen={true} onClose={onClose} title="T">
        content
      </Modal>
    );
    // Click the outer overlay div (first child that wraps everything)
    const overlay = screen.getByText('content').closest('.fixed');
    await user.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when modal content is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Modal isOpen={true} onClose={onClose} title="T">
        <span>inner</span>
      </Modal>
    );
    await user.click(screen.getByText('inner'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Modal isOpen={true} onClose={onClose} title="T">
        content
      </Modal>
    );
    await user.click(document.getElementById('modal-close-btn'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
