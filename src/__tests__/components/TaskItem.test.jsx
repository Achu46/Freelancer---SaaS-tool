import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskItem from '../../components/TaskItem';

const baseTask = { id: 't1', title: 'Design homepage', status: 'pending', dueDate: '2025-04-05' };

describe('TaskItem', () => {
  it('renders task title and formatted due date', () => {
    render(<TaskItem task={baseTask} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Design homepage')).toBeInTheDocument();
    expect(screen.getByText(/Apr 5/)).toBeInTheDocument();
  });

  it('does not render due date when absent', () => {
    render(<TaskItem task={{ ...baseTask, dueDate: null }} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.queryByText(/Due/)).toBeNull();
  });

  it('cycles status on button click: pending -> in-progress', async () => {
    const onUpdate = vi.fn();
    const user = userEvent.setup();
    render(<TaskItem task={baseTask} onUpdate={onUpdate} onDelete={vi.fn()} />);

    await user.click(document.getElementById('task-status-t1'));
    expect(onUpdate).toHaveBeenCalledWith('t1', { status: 'in-progress' });
  });

  it('cycles status: in-progress -> done', async () => {
    const onUpdate = vi.fn();
    const user = userEvent.setup();
    render(<TaskItem task={{ ...baseTask, status: 'in-progress' }} onUpdate={onUpdate} onDelete={vi.fn()} />);

    await user.click(document.getElementById('task-status-t1'));
    expect(onUpdate).toHaveBeenCalledWith('t1', { status: 'done' });
  });

  it('cycles status: done -> pending (wraps around)', async () => {
    const onUpdate = vi.fn();
    const user = userEvent.setup();
    render(<TaskItem task={{ ...baseTask, status: 'done' }} onUpdate={onUpdate} onDelete={vi.fn()} />);

    await user.click(document.getElementById('task-status-t1'));
    expect(onUpdate).toHaveBeenCalledWith('t1', { status: 'pending' });
  });

  it('does not cycle status in readOnly mode', async () => {
    const onUpdate = vi.fn();
    const user = userEvent.setup();
    render(<TaskItem task={baseTask} onUpdate={onUpdate} onDelete={vi.fn()} readOnly />);

    await user.click(document.getElementById('task-status-t1'));
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('calls onDelete with task id when delete button clicked', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<TaskItem task={baseTask} onUpdate={vi.fn()} onDelete={onDelete} />);

    await user.click(document.getElementById('delete-task-t1'));
    expect(onDelete).toHaveBeenCalledWith('t1');
  });

  it('hides delete button in readOnly mode', () => {
    render(<TaskItem task={baseTask} onUpdate={vi.fn()} onDelete={vi.fn()} readOnly />);
    expect(document.getElementById('delete-task-t1')).toBeNull();
  });

  it('applies line-through style when task is done', () => {
    render(<TaskItem task={{ ...baseTask, status: 'done' }} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    const title = screen.getByText('Design homepage');
    expect(title.className).toContain('line-through');
  });
});
