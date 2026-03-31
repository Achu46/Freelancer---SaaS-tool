import { ExternalLink, Copy, Trash2, Users, CheckCircle2, Clock, MoreVertical, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  active: 'status-active',
  completed: 'status-completed',
  paused: 'status-paused',
};

const STATUS_ICONS = {
  active: <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />,
  completed: <CheckCircle2 size={12} />,
  paused: <Clock size={12} />,
};

export default function ProjectCard({ project, onDelete, onStatusChange }) {
  const publicUrl = `${window.location.origin}/p/${project.publicLinkId}`;

  function copyLink() {
    navigator.clipboard.writeText(publicUrl);
    toast.success('Client link copied!');
  }

  const createdDate = project.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }) ?? '—';

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 hover:shadow-lg hover:shadow-indigo-500/5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 overflow-hidden card-shine">
      {/* Glow accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-indigo-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

      <div className="relative">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <Link
              to={`/project/${project.id}`}
              className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate block"
            >
              {project.clientName}
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{project.clientEmail}</p>
          </div>
          <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_STYLES[project.status] || 'status-active'}`}>
            {STATUS_ICONS[project.status]}
            {project.status}
          </span>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{project.description}</p>
        )}

        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-4">
          <Calendar size={12} />
          <span>Created {createdDate}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            to={`/project/${project.id}`}
            className="flex-1 text-center text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg px-3 py-2 transition-colors"
            id={`view-project-${project.id}`}
          >
            View Project
          </Link>
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg px-3 py-2 transition-colors"
            id={`copy-link-${project.id}`}
            title="Copy client link"
          >
            <Copy size={14} />
            Copy Link
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
            id={`delete-project-${project.id}`}
            title="Delete project"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
