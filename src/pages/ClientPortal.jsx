import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  collection, query, where, getDocs, doc, getDoc,
} from 'firebase/firestore';
import { db, IS_DEMO_MODE } from '../lib/firebase';
import {
  Upload, MessageSquare, CheckCircle2, Clock, Loader2,
  Zap, FileText, Image, File, Send, AlertCircle,
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useMessages } from '../hooks/useMessages';
import { useFiles } from '../hooks/useFiles';
import FileUpload from '../components/FileUpload';
import { notifyFreelancer } from '../lib/emailjs';
import toast, { Toaster } from 'react-hot-toast';

function FileIcon({ type }) {
  if (type?.startsWith('image/')) return <Image size={15} className="text-indigo-500" />;
  if (type === 'application/pdf') return <FileText size={15} className="text-rose-500" />;
  return <File size={15} className="text-slate-400" />;
}

const STATUS_CONFIG = {
  active: { label: 'Active', css: 'status-active' },
  completed: { label: 'Completed', css: 'status-completed' },
  paused: { label: 'Paused', css: 'status-paused' },
};

const TASK_STATUS = {
  pending: { label: 'Pending', css: 'status-pending', icon: <Clock size={12} /> },
  'in-progress': { label: 'In Progress', css: 'status-progress', icon: <Loader2 size={12} className="animate-spin" /> },
  done: { label: 'Done', css: 'status-done', icon: <CheckCircle2 size={12} /> },
};

const DEMO_PROJECT = {
  id: 'demo-project-id',
  clientName: 'Demo Client',
  clientEmail: 'client@example.com',
  description: 'This is a sample project portal. Once you connect your Firebase, your real project data will appear here.',
  status: 'active',
  userId: 'demo-user-id',
  createdAt: { toDate: () => new Date() },
};

export default function ClientPortal() {
  const { publicLinkId } = useParams();
  const [project, setProject] = useState(null);
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [msgText, setMsgText] = useState('');
  const [clientName, setClientName] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Load project by publicLinkId
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Fallback for Demo Mode
        if (IS_DEMO_MODE) {
          setProject(DEMO_PROJECT);
          setFreelancer({ displayName: 'Demo Freelancer', email: 'freelancer@example.com' });
          setLoading(false);
          return;
        }

        const q = query(collection(db, 'projects'), where('publicLinkId', '==', publicLinkId));
        const snap = await getDocs(q);
        
        if (snap.empty) { 
          // If in development and no project found, show demo project instead of error
          if (import.meta.env.DEV) {
            setProject(DEMO_PROJECT);
            setFreelancer({ displayName: 'Demo Freelancer', email: 'freelancer@example.com' });
          } else {
            setNotFound(true); 
          }
          return; 
        }

        const projectData = { id: snap.docs[0].id, ...snap.docs[0].data() };
        setProject(projectData);

        // Load freelancer profile for notification
        const userSnap = await getDoc(doc(db, 'users', projectData.userId));
        if (userSnap.exists()) setFreelancer(userSnap.data());
      } catch (err) {
        console.error(err);
        if (import.meta.env.DEV || IS_DEMO_MODE) {
          setProject(DEMO_PROJECT);
        } else {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [publicLinkId]);

  const { tasks, loading: tasksLoading } = useTasks(project?.id);
  const { messages, sendMessage } = useMessages(project?.id);
  const { files, uploading, isCompressing, uploadProgress, uploadFile } = useFiles(project?.id);

  async function handleFileUpload(file) {
    try {
      await uploadFile(file, 'client');
      toast.success('File uploaded successfully!');
  
      // Background Notification (non-blocking)
      if (freelancer?.email) {
        notifyFreelancer({
          toEmail: freelancer.email,
          toName: freelancer.displayName || 'Freelancer',
          clientName: project.clientName,
          projectName: project.clientName,
          eventType: 'file_upload',
          details: file.name,
          portalUrl: window.location.href,
        }).catch(err => console.error('Notification error:', err));
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    }
  }

  async function handleSendMsg(e) {
    e.preventDefault();
    if (!msgText.trim()) return;
    setSendingMsg(true);
    try {
      await sendMessage({ text: msgText.trim(), sender: 'client' });

      // Notify freelancer
      if (freelancer?.email) {
        await notifyFreelancer({
          toEmail: freelancer.email,
          toName: freelancer.displayName || 'Freelancer',
          clientName: project.clientName,
          projectName: project.clientName,
          eventType: 'new_message',
          details: msgText.slice(0, 100),
          portalUrl: window.location.href,
        });
      }

      setMsgText('');
      toast.success('Message sent!');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSendingMsg(false);
    }
  }

  const statusCfg = STATUS_CONFIG[project?.status] || STATUS_CONFIG.active;
  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 size={36} className="text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-center px-4">
        <AlertCircle size={48} className="text-slate-400 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Portal not found</h1>
        <p className="text-slate-500 dark:text-slate-400">This link is invalid or the project has been removed.</p>
      </div>
    );
  }

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'files', label: `Files (${files.length})` },
    { id: 'messages', label: `Messages (${messages.length})` },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Toaster position="top-center" />

      {/* Portal Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                  <Zap size={12} className="text-white" />
                </div>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">QueFlow Portal</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{project.clientName}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{project.clientEmail}</p>
            </div>
            <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 ${statusCfg.css}`}>
              {statusCfg.label}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-1.5 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              id={`portal-tab-${t.id}`}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${
                activeTab === t.id
                  ? 'bg-indigo-500 text-slate-900 shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Progress */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-slate-900 dark:text-white">Project Progress</h2>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{progress}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">{doneCount} of {tasks.length} tasks completed</p>
            </div>

            {/* Tasks */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Tasks</h2>
              {tasksLoading ? (
                <div className="flex justify-center py-6"><Loader2 className="animate-spin text-indigo-500" size={20} /></div>
              ) : tasks.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No tasks added yet.</p>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => {
                    const cfg = TASK_STATUS[task.status] || TASK_STATUS.pending;
                    const due = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;
                    return (
                      <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${cfg.css}`}>
                          {cfg.icon}
                          <span>{cfg.label}</span>
                        </div>
                        <p className={`flex-1 text-sm ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                          {task.title}
                        </p>
                        {due && <span className="text-xs text-slate-400">{due}</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setActiveTab('files')}
                id="portal-go-files"
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 text-left hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group"
              >
                <Upload size={22} className="text-indigo-500 mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-semibold text-slate-900 dark:text-white text-sm">Upload Files</p>
                <p className="text-xs text-slate-400 mt-1">Share documents, assets & deliverables</p>
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                id="portal-go-messages"
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 text-left hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group"
              >
                <MessageSquare size={22} className="text-indigo-500 mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-semibold text-slate-900 dark:text-white text-sm">Leave a Message</p>
                <p className="text-xs text-slate-400 mt-1">Send feedback or questions directly</p>
              </button>
            </div>
          </div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-5">Upload a File</h2>

            <FileUpload 
              onUpload={handleFileUpload} 
              uploading={uploading} 
              isCompressing={isCompressing}
              uploadProgress={uploadProgress} 
            />

            {files.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Uploaded Files</h3>
                <div className="space-y-2">
                  {files.map((file) => {
                    const isImage = file.fileType?.startsWith('image/');
                    const ts = file.timestamp?.toDate?.()?.toLocaleDateString();
                    return (
                      <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
                        {isImage ? (
                          <img src={file.fileUrl} alt={file.fileName} className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                            <FileIcon type={file.fileType} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{file.fileName}</p>
                          <p className="text-xs text-slate-400">{ts}</p>
                        </div>
                        <a href={file.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-500 hover:text-indigo-700 text-xs font-medium">View</a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-6">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-5">Messages</h2>

            <div className="space-y-3 max-h-96 overflow-y-auto mb-5 pr-1">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <MessageSquare size={28} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isClient = msg.sender === 'client';
                  const ts = msg.timestamp?.toDate?.()?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={msg.id} className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs sm:max-w-sm rounded-2xl px-4 py-2.5 ${
                        isClient
                          ? 'bg-indigo-500 text-slate-900 rounded-br-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <p className={`text-xs mt-1 ${isClient ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {isClient ? 'You' : 'Freelancer'} · {ts}
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
                placeholder="Type your message…"
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                id="client-msg-input"
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
              <button
                type="submit"
                disabled={sendingMsg || !msgText.trim()}
                id="client-send-btn"
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-900 bg-indigo-500 hover:bg-indigo-400 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={14} />
                Send
              </button>
            </form>
          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
          Powered by{' '}
          <a href="/" className="text-indigo-500 hover:underline">QueFlow</a>{' '}
          · Secure client portal
        </p>
      </main>
    </div>
  );
}
