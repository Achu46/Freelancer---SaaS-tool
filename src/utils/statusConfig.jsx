import { Clock, Zap, CheckCircle2 } from 'lucide-react';

export const TASK_STATUSES = ['pending', 'in-progress', 'done'];

export const TASK_STATUS_CONFIG = {
  pending: { label: 'Pending', css: 'status-pending', icon: <Clock size={12} /> },
  'in-progress': { label: 'In Progress', css: 'status-progress', icon: <Zap size={12} className="thunder-loader" /> },
  done: { label: 'Done', css: 'status-done', icon: <CheckCircle2 size={12} /> },
};

export const PROJECT_STATUS_CONFIG = {
  active: { label: 'Active', css: 'status-active' },
  completed: { label: 'Completed', css: 'status-completed' },
  paused: { label: 'Paused', css: 'status-paused' },
};

export const PROJECT_STATUSES = ['active', 'completed', 'paused'];
