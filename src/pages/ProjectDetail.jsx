import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Copy, ExternalLink, Plus, Loader2,
  FileText, Image, File, Download, MessageSquare,
  CheckSquare, Paperclip, Trash2, MoreVertical, Edit3,
  Clock, CheckCircle2, RefreshCw,
} from 'lucide-react';
import {
  collection, query, where, getDocs, doc, getDoc, updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { useMessages } from '../hooks/useMessages';
import { useFiles } from '../hooks/useFiles';
import TaskItem from '../components/TaskItem';
import Modal from '../components/Modal';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={15} /> },
  { id: 'messages', label: 'Messages', icon: <MessageSquare size={15} /> },
  { id: 'files', label: 'Files', icon: <Paperclip size={15} /> },
];

function FileIcon({ type }) {
  if (type?.startsWith('image/')) return <Image size={16} className="text-indigo-500" />;
  if (type === 'application/pdf') return <FileText size={16} className="text-rose-500" />;
  return <File size={16} className="text-slate-400" />;
}

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ProjectDetail() {
  const { projectId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [tab, setTab] = useState('tasks');
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', dueDate: '' });
  const [addingTask, setAddingTask] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  const { tasks, loading: tasksLoading, addTask, updateTask, deleteTask } = useTasks(projectId);
  const { messages, loading: msgsLoading, sendMessage, refetch: refetchMsgs } = useMessages(projectId);
  const { files, loading: filesLoading, uploading, uploadProgress, uploadFile } = useFiles(projectId);

  // Load project
  useEffect(() => {
    async function load() {
      setLoadingProject(true);
      try {
        const snap = await getDoc(doc(db, 'projects', projectId));
        if (!snap.exists() || snap.data().userId !== currentUser.uid) {
          navigate('/dashboard');
          return;
        }
        setProject({ id: snap.id, ...snap.data() });
      } catch {
        navigate('/dashboard');
      } finally {
        setLoadingProject(false);
      }
    }
    if (currentUser && projectId) load();
  }, [projectId, currentUser, navigate]);

  const publicUrl = project ? `${window.location.origin}/p/${project.publicLinkId}` : '';

  function copyLink() {
    navigator.clipboard.writeText(publicUrl);
    toast.success('Client link copied!');
  }

  async function changeStatus(status) {
    try {
      await updateDoc(doc(db, 'projects', projectId), { status });
      setProject((p) => ({ ...p, status }));
      setStatusOpen(false);
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  }

  async function handleAddTask(e) {
    e.preventDefault();
    setAddingTask(true);
    try {
      await addTask(taskForm);
      setTaskForm({ title: '', dueDate: '' });
      setShowAddTask(false);
      toast.success('Task added');
    } catch {
      toast.error('Failed to add task');
    } finally {
      setAddingTask(false);
    }
  }

  async function handleSendMsg(e) {
    e.preventDefault();
    if (!msgText.trim()) return;
    setSendingMsg(true);
    try {
      await sendMessage({ text: msgText.trim(), sender: 'freelancer' });
      setMsgText('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSendingMsg(false);
    }
  }

  const STATUS_OPTIONS = ['active', 'completed', 'paused'];
  const STATUS_CSS = { active: 'status-active', completed: 'status-completed', paused: 'status-paused' };

  if (loadingProject) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="text-indigo-500 animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 mb-6 transition-colors w-fit"
          id="back-to-dashboard"
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </Link>

        {/* Project Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{project?.clientName}</h1>
                {/* Status badge with dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setStatusOpen((v) => !v)}
                    className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer ${STATUS_CSS[project?.status] || 'status-active'}`}
                    id="project-status-badge"
                  >
                    {project?.status}
                    <MoreVertical size={11} />
                  </button>
                  {statusOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-1 z-10 min-w-36">
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => changeStatus(s)}
                          className="block w-full text-left text-xs px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 capitalize transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{project?.clientEmail}</p>
              {project?.description && (
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{project?.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={copyLink}
                id="copy-project-link"
                className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl px-3 py-2 transition-colors"
              >
                <Copy size={14} />
                Copy client link
              </button>
               <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                id="open-client-portal"
                className="flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-xl px-3 py-2 transition-colors"
              >
                <ExternalLink size={14} />
                View portal
              </a>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-1.5 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              id={`tab-${t.id}`}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl transition-all ${
                tab === t.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t.icon}
              {t.label}
              {t.id === 'tasks' && tasks.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === 'tasks' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {tasks.length}
                </span>
              )}
              {t.id === 'messages' && messages.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === 'messages' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {messages.length}
                </span>
              )}
              {t.id === 'files' && files.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === 'files' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {files.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6">

          {/* Tasks Tab */}
          {tab === 'tasks' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Project Tasks</h2>
                <button
                  onClick={() => setShowAddTask(true)}
                  id="add-task-btn"
                  className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  <Plus size={15} />
                  Add Task
                </button>
              </div>

              {tasksLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-500" size={24} /></div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                  <CheckSquare size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No tasks yet. Add one to get started.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onUpdate={updateTask}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              )}

              {/* Progress */}
              {tasks.length > 0 && (
                <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-xs text-slate-500 mb-2">
                    <span>{tasks.filter((t) => t.status === 'done').length} of {tasks.length} done</span>
                    <span>{Math.round((tasks.filter((t) => t.status === 'done').length / tasks.length) * 100)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all"
                      style={{ width: `${(tasks.filter((t) => t.status === 'done').length / tasks.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Messages Tab */}
          {tab === 'messages' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Conversation</h2>
                <button onClick={refetchMsgs} className="p-1.5 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Refresh">
                  <RefreshCw size={14} />
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto mb-5 pr-1">
                {msgsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-500" size={24} /></div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                    <MessageSquare size={32} className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No messages yet.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isFreelancer = msg.sender === 'freelancer';
                    const ts = msg.timestamp?.toDate?.()?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={msg.id} className={`flex ${isFreelancer ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs sm:max-w-sm rounded-2xl px-4 py-2.5 ${
                          isFreelancer
                            ? 'bg-indigo-500 text-slate-900 rounded-br-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <p className={`text-xs mt-1 ${isFreelancer ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {isFreelancer ? 'You' : 'Client'} · {ts}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleSendMsg} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message…"
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  id="send-message-input"
                  className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
                <button
                  type="submit"
                  disabled={sendingMsg || !msgText.trim()}
                  id="send-msg-btn"
                  className="px-4 py-2.5 text-sm font-medium text-slate-900 bg-indigo-500 hover:bg-indigo-400 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMsg ? <Loader2 size={16} className="animate-spin" /> : 'Send'}
                </button>
              </form>
            </div>
          )}

          {/* Files Tab */}
          {tab === 'files' && (
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-5">Uploaded Files</h2>

              {filesLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-500" size={24} /></div>
              ) : files.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                  <Paperclip size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No files yet. Clients can upload via the portal.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => {
                    const ts = file.timestamp?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    const isImage = file.fileType?.startsWith('image/');
                    return (
                      <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group">
                        {isImage ? (
                          <img src={file.fileUrl} alt={file.fileName} className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                            <FileIcon type={file.fileType} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{file.fileName}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {formatBytes(file.fileSize)} · {file.uploadedBy === 'client' ? 'Client' : 'You'} · {ts}
                          </p>
                        </div>
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                          title="Download"
                        >
                          <Download size={15} />
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add Task Modal */}
      <Modal isOpen={showAddTask} onClose={() => setShowAddTask(false)} title="Add Task" size="sm">
        <form onSubmit={handleAddTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="task-title">
              Task title *
            </label>
            <input
              id="task-title"
              type="text"
              placeholder="e.g. Design homepage mockup"
              required
              value={taskForm.title}
              onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="task-due">
              Due date (optional)
            </label>
            <input
              id="task-due"
              type="date"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm((f) => ({ ...f, dueDate: e.target.value }))}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
          <button
            type="submit"
            disabled={addingTask}
            id="confirm-add-task"
            className="w-full py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {addingTask ? <><Loader2 size={16} className="animate-spin" />Adding…</> : 'Add Task'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
