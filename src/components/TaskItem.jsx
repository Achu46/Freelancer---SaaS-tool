import { Check, Clock, Loader2, Trash2, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const STATUSES = ['pending', 'in-progress', 'done'];

const STATUS_CONFIG = {
  pending: { label: 'Pending', css: 'status-pending' },
  'in-progress': { label: 'In Progress', css: 'status-progress' },
  done: { label: 'Done', css: 'status-done' },
};

export default function TaskItem({ task, onUpdate, onDelete, readOnly = false }) {
  const [open, setOpen] = useState(false);

  const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;

  function cycleStatus() {
    if (readOnly) return;
    const idx = STATUSES.indexOf(task.status);
    const next = STATUSES[(idx + 1) % STATUSES.length];
    onUpdate(task.id, { status: next });
  }

  const dueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group">
      {/* Status toggle */}
      <button
        onClick={cycleStatus}
        disabled={readOnly}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          task.status === 'done'
            ? 'bg-emerald-500 border-emerald-500'
            : task.status === 'in-progress'
            ? 'bg-blue-500 border-blue-500'
            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'
        } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
        id={`task-status-${task.id}`}
        title={readOnly ? cfg.label : 'Click to cycle status'}
      >
        {task.status === 'done' && <Check size={12} className="text-white" />}
        {task.status === 'in-progress' && <Loader2 size={10} className="text-white animate-spin" />}
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
          {task.title}
        </p>
        {dueDate && (
          <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
            <Clock size={10} />
            Due {dueDate}
          </p>
        )}
      </div>

      {/* Badge */}
      <span className={`hidden sm:flex text-xs px-2 py-0.5 rounded-full font-medium ${cfg.css}`}>
        {cfg.label}
      </span>

      {/* Delete */}
      {!readOnly && (
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
          id={`delete-task-${task.id}`}
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}
