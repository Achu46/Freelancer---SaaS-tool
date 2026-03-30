import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus, FolderOpen, Loader2, Search, Sparkles, Crown,
  ArrowUpRight, CheckCircle2, TrendingUp,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../hooks/useProjects';
import { PLANS } from '../lib/lemonsqueezy';

import ProjectCard from '../components/ProjectCard';
import Modal from '../components/Modal';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { currentUser, userProfile } = useAuth();
  const { projects, loading, createProject, deleteProject } = useProjects();
  const [searchParams] = useSearchParams();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ clientName: '', clientEmail: '', description: '' });

  const plan = userProfile?.plan || 'free';
  const planConfig = PLANS[plan];
  const projectLimit = planConfig?.projectLimit ?? 1;
  const canCreate = projects.length < projectLimit;

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      toast.success('🎉 Subscription activated! Thank you.');
    }
  }, [searchParams]);

  const filtered = projects.filter(
    (p) =>
      p.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      p.clientEmail?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate(e) {
    e.preventDefault();
    if (!canCreate) {
      toast.error(`You've reached the ${plan} plan limit. Upgrade to add more projects.`);
      return;
    }
    setCreating(true);
    try {
      await createProject(form);
      setShowCreate(false);
      setForm({ clientName: '', clientEmail: '', description: '' });
      toast.success('🎉 Project created! Share the client link.');
    } catch (err) {
      console.error('Project creation error:', err);
      if (err.code === 'permission-denied') {
        toast.error('❌ Firebase permissions error — please publish the Firestore rules (see instructions below).');
      } else {
        toast.error(`Failed to create project: ${err.message}`);
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    try {
      await deleteProject(id);
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    }
  }

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: <FolderOpen size={18} className="text-indigo-500" /> },
    { label: 'Active', value: projects.filter((p) => p.status === 'active').length, icon: <TrendingUp size={18} className="text-emerald-500" /> },
    { label: 'Completed', value: projects.filter((p) => p.status === 'completed').length, icon: <CheckCircle2 size={18} className="text-violet-500" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome back, {currentUser?.displayName?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Manage your client projects and portals from here.
            </p>
          </div>
          <button
            onClick={() => canCreate ? setShowCreate(true) : toast.error('Upgrade your plan to create more projects.')}
            id="create-project-btn"
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30"
          >
            <Plus size={17} />
            New Project
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Plan banner */}
        {plan === 'free' && (
          <div className="mb-6 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border border-indigo-200 dark:border-indigo-700/40 rounded-2xl px-5 py-4">
            <div className="flex items-center gap-3">
              <Crown size={20} className="text-amber-500" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">You're on the Free plan</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">1 project included · Upgrade for more</p>
              </div>
            </div>
            <Link
              to="/pricing"
              id="upgrade-banner-btn"
              className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              Upgrade <ArrowUpRight size={14} />
            </Link>
          </div>
        )}

        {/* Search */}
        {projects.length > 0 && (
          <div className="relative mb-6">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="search-projects"
              className="w-full max-w-md pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
        )}

        {/* Projects */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-indigo-500 animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mb-6">
              <Sparkles size={32} className="text-indigo-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No projects yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm text-sm">
              Create your first project and share the client link. Clients can upload files and leave feedback instantly.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              id="empty-create-btn"
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl transition-all shadow-md"
            >
              <Plus size={17} />
              Create your first project
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400">
            No projects match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="new-client-name">
              Client Name *
            </label>
            <input
              id="new-client-name"
              type="text"
              placeholder="e.g. Acme Corp"
              required
              value={form.clientName}
              onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="new-client-email">
              Client Email *
            </label>
            <input
              id="new-client-email"
              type="email"
              placeholder="client@company.com"
              required
              value={form.clientEmail}
              onChange={(e) => setForm((f) => ({ ...f, clientEmail: e.target.value }))}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="new-project-desc">
              Description (optional)
            </label>
            <textarea
              id="new-project-desc"
              placeholder="Brief description of the project…"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            id="confirm-create-project"
            className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {creating ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : 'Create Project'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
