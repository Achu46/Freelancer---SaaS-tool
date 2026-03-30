import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection, doc, updateDoc, query, orderBy, onSnapshot,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import {
  Users, Shield, Crown, Zap, Search, LogOut, TrendingUp,
  CheckCircle2, XCircle, Clock, MoreVertical, RefreshCw,
  ChevronDown, FolderOpen, AlertTriangle, Star, Activity,
  PieChart, BarChart3, ArrowUpRight, Menu, X, DollarSign,
  Calendar, CreditCard,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PLAN_COLORS = {
  free:    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  starter: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  pro:     'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
};

const STATUS_COLORS = {
  active:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  suspended: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const PLANS = ['free', 'starter', 'pro'];

function StatCard({ icon, label, value, sub, color = 'indigo' }) {
  const colors = {
    indigo:  'from-indigo-500/20 to-indigo-600/5 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-500/20',
    violet:  'from-violet-500/20 to-violet-600/5 text-violet-600 dark:text-violet-400 border-violet-200/50 dark:border-violet-500/20',
    emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20',
    amber:   'from-amber-500/20 to-amber-600/5 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20',
  };

  const iconGradients = {
    indigo:  'from-indigo-500 to-indigo-600 shadow-indigo-500/20',
    violet:  'from-violet-500 to-violet-600 shadow-violet-500/20',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/20',
    amber:   'from-amber-500 to-amber-600 shadow-amber-500/20',
  };

  return (
    <div className={`relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border ${colors[color]} rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group`}>
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br opacity-5 rounded-full group-hover:scale-150 transition-transform duration-700" />
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconGradients[color]} flex items-center justify-center shadow-lg flex-shrink-0 text-white`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">{value}</p>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
        </div>
      </div>
      {sub && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/50">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-500 flex items-center gap-1.5 line-clamp-1">
            <TrendingUp size={12} className="opacity-70" />
            {sub}
          </p>
        </div>
      )}
    </div>
  );
}

export default function AdminPanel() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ── Live Synchronization ──────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    
    // Listen to Users (Live) - Simple query to avoid index/missing field issues
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        status: d.data().status || 'active',
      })).sort((a, b) => {
        // Sort in memory safely
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      setUsers(usersData);
      setLoading(false);
    }, (err) => {
      console.error('Users listener error:', err);
      toast.error('Real-time sync failed for users');
    });

    // Listen to Projects (Live)
    const unsubscribeProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const projectsData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProjects(projectsData);
    });

    // Listen to Transactions (Live)
    const unsubscribeTransactions = onSnapshot(query(collection(db, 'transactions'), orderBy('createdAt', 'desc')), (snapshot) => {
      const transData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTransactions(transData);
    }, (err) => {
      console.warn('Transactions listener error (likely empty/no permission):', err);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeProjects();
      unsubscribeTransactions();
    };
  }, []);

  // Removed manual fetchData since we are now in Live Mode

  // ── Update user plan ─────────────────────────────────────────────
  async function changePlan(userId, newPlan) {
    setUpdatingId(userId);
    try {
      await updateDoc(doc(db, 'users', userId), { plan: newPlan });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, plan: newPlan } : u));
      toast.success(`Plan updated to ${newPlan}`);
    } catch (err) {
      toast.error('Failed to update plan');
    } finally {
      setUpdatingId(null);
      setOpenMenuId(null);
    }
  }

  // ── Toggle user status ───────────────────────────────────────────
  async function toggleStatus(userId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setUpdatingId(userId);
    try {
      await updateDoc(doc(db, 'users', userId), { status: newStatus });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: newStatus } : u));
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'}`);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
      setOpenMenuId(null);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    navigate('/login'); // Fixed redirect to unified login
  }

  // ── Derived stats ────────────────────────────────────────────────
  const realUsers = users.filter((u) => u.email !== (import.meta.env.VITE_ADMIN_EMAIL || 'admin@queflow.com'));
  const paidUsers = realUsers.filter((u) => u.plan !== 'free');
  const suspended = realUsers.filter((u) => u.status === 'suspended');
  const mrr = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  // ── Filter & search ──────────────────────────────────────────────
  const filtered = realUsers.filter((u) => {
    const matchSearch =
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === 'all' || u.plan === planFilter;
    return matchSearch && matchPlan;
  });

  const projectCountFor = (uid) => projects.filter((p) => p.userId === uid).length;

  const formatDate = (ts) => {
    const d = ts?.toDate?.();
    if (!d) return '—';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] selection:bg-indigo-100 dark:selection:bg-indigo-500/30 overflow-x-hidden relative">
      {/* Dynamic Background Glows for Desktop */}
      <div className="hidden lg:block absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Admin Topbar */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-[#020617]/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-6 transition-transform">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Admin Panel
              </span>
              <div className="flex items-center gap-1.5 overflow-hidden">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse flex-shrink-0" />
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest truncate">
                  QueFlow Live
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
               <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Live Monitoring</span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
            <div className="flex items-center gap-3 pl-1">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-none mb-0.5">Administrator</span>
                <span className="text-[10px] font-medium text-slate-500">{currentUser?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                id="admin-logout-btn"
                className="px-4 py-2 flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all active:scale-95 border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-[#020617] border-b border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-top-4 duration-300">
            <div className="px-4 py-6 space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[2px]">System Live</span>
                </div>
                <div className="text-[10px] font-bold text-slate-400">NOMINAL</div>
              </div>

              <div className="space-y-4 px-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Signed in as</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{currentUser?.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full h-12 flex items-center justify-center gap-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl font-bold text-sm hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                >
                  <LogOut size={18} />
                  Sign Out of Oversight
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">System Oversight</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Real-time management for the QueFlow ecosystem.
            </p>
          </div>
          <div className="flex bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-1 rounded-xl border border-slate-200 dark:border-slate-800">
             <div className="px-4 py-2 text-center">
               <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
               <p className="text-sm font-bold text-emerald-500">All Systems Nominal</p>
             </div>
          </div>
        </div>

        {/* Analytics Status Section */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Activity size={18} className="text-indigo-500" />
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">Analytics Status</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Plan Distribution Chart-let */}
            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Subscription Pulse</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">Tier Distribution</p>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                  <PieChart size={20} />
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { label: 'Pro Tier', count: realUsers.filter(u => u.plan === 'pro').length, color: 'bg-violet-500', icon: <Star size={12} /> },
                  { label: 'Starter Tier', count: realUsers.filter(u => u.plan === 'starter').length, color: 'bg-indigo-500', icon: <Zap size={12} /> },
                  { label: 'Free Tier', count: realUsers.filter(u => u.plan === 'free').length, color: 'bg-slate-400 dark:bg-slate-600', icon: <Clock size={12} /> },
                ].map((tier) => (
                  <div key={tier.label}>
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <span className={`w-2 h-2 rounded-full ${tier.color}`} />
                        {tier.label}
                      </div>
                      <span className="text-slate-900 dark:text-white">{tier.count} users</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${tier.color} transition-all duration-1000 ease-out`} 
                        style={{ width: `${(tier.count / (realUsers.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
               <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">System Health</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">Engagement Ratio</p>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <BarChart3 size={20} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 group-hover:border-indigo-500/20 transition-colors">
                  <p className="text-2xl font-black text-indigo-500 tracking-tight">
                    {(projects.length / (realUsers.length || 1)).toFixed(1)}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-tight mt-1">Assets per User</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 group-hover:border-emerald-500/20 transition-colors">
                  <p className="text-2xl font-black text-emerald-500 tracking-tight">
                    {realUsers.filter(u => u.status === 'active').length}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-tight mt-1">Active Status</p>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between px-1">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Growth Velocity</p>
                  <div className="flex items-center gap-1.5 text-emerald-500 font-black text-lg">
                    <ArrowUpRight size={18} />
                    <span>+{(realUsers.length * 10).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="h-10 w-24 bg-gradient-to-t from-emerald-500/20 to-transparent rounded-lg relative overflow-hidden">
                   <div className="absolute inset-0 flex items-center justify-around translate-y-2 opacity-50">
                     {[4,7,3,9,5,8,6].map((h, i) => <div key={i} className="w-1 bg-emerald-500 rounded-full" style={{ height: `${h * 10}%` }} />)}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8 bg-white/40 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 transition-all focus-within:shadow-lg focus-within:border-indigo-500/50">
          <div className="relative flex-1 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Query system by name or email identity…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="admin-search"
              className="w-full pl-12 pr-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400/70 focus:outline-none focus:ring-0 transition-all font-medium"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {['all', 'free', 'starter', 'pro'].map((p) => (
              <button
                key={p}
                onClick={() => setPlanFilter(p)}
                className={`px-5 py-2.5 text-xs font-bold rounded-xl border-2 transition-all capitalize whitespace-nowrap ${
                  planFilter === p
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-900/50'
                }`}
              >
                {p} Tier
              </button>
            ))}
          </div>
        </div>

        {/* Data Rendering */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white/30 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <div className="absolute inset-x-0 bottom-0 translate-y-12 whitespace-nowrap text-xs font-bold text-indigo-500 uppercase tracking-widest animate-pulse">Synchronizing Data…</div>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Users size={32} className="opacity-30" />
              </div>
              <p className="font-bold">Entry not located</p>
              <p className="text-sm opacity-60">Adjust your criteria and try again.</p>
            </div>
          ) : (
            <>
              {/* ✨ Mobile Card View (Visible on small screens) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
                {filtered.map((user) => (
                  <div key={user.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm relative group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-lg font-extrabold shadow-md">
                        {(user.displayName || user.email || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate text-lg">{user.displayName || 'Unnamed User'}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <MoreVertical size={20} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Plan</p>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-lg capitalize ${PLAN_COLORS[user.plan] || PLAN_COLORS.free}`}>
                          {user.plan === 'pro' ? <Star size={10} /> : user.plan === 'starter' ? <Zap size={10} /> : <Clock size={10} />}
                          {user.plan}
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-lg ${STATUS_COLORS[user.status] || STATUS_COLORS.active}`}>
                          {user.status === 'suspended' ? <XCircle size={10} /> : <CheckCircle2 size={10} />}
                          {user.status || 'active'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60">
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-400 italic">
                        Joined {formatDate(user.createdAt)}
                      </div>
                      <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold text-xs bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-lg">
                        <FolderOpen size={12} />
                        {projectCountFor(user.id)} Projects
                      </div>
                    </div>
                    
                    {/* Floating Menu for Mobile */}
                    {openMenuId === user.id && (
                      <div className="absolute right-4 top-16 z-30 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in duration-150">
                         <div className="space-y-1">
                           <p className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase underline decoration-indigo-500/30">Tier Adjustment</p>
                           {PLANS.map((plan) => (
                              <button
                                key={plan}
                                onClick={() => changePlan(user.id, plan)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                  user.plan === plan ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                <span className="capitalize">{plan}</span>
                                {user.plan === plan && <CheckCircle2 size={14} />}
                              </button>
                           ))}
                           <div className="h-px bg-slate-100 dark:bg-slate-700 my-1.5" />
                           <button
                             onClick={() => toggleStatus(user.id, user.status)}
                             className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
                               user.status === 'active' ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-500 hover:bg-emerald-50'
                             }`}
                           >
                             {user.status === 'active' ? <><XCircle size={14} /> Suspend Access</> : <><CheckCircle2 size={14} /> Restore Access</>}
                           </button>
                         </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* ✨ Desktop Table View (Visible on large screens) */}
              <div className="hidden lg:block bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-xl shadow-black/5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
                      <th className="text-left px-8 py-5 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-[2px]">Identity Info</th>
                      <th className="text-left px-4 py-5 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-[2px]">Subscription</th>
                      <th className="text-left px-4 py-5 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-[2px]">Status</th>
                      <th className="text-left px-4 py-5 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-[2px]">Assets</th>
                      <th className="text-left px-4 py-5 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-[2px]">Timeline</th>
                      <th className="px-8 py-5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filtered.map((user) => {
                      const projCount = projectCountFor(user.id);
                      const isUpdating = updatingId === user.id;
                      const isMenuOpen = openMenuId === user.id;

                      return (
                        <tr key={user.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-base font-extrabold shadow-md transform group-hover:scale-110 transition-transform">
                                {(user.displayName || user.email || '?')[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white leading-tight">{user.displayName || '—'}</p>
                                <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-5">
                            <span className={`inline-flex items-center gap-2 text-[10px] font-bold px-3 py-1 rounded-xl capitalize shadow-sm ${PLAN_COLORS[user.plan] || PLAN_COLORS.free}`}>
                              {user.plan === 'pro' ? <Star size={12} className="animate-pulse" /> : user.plan === 'starter' ? <Zap size={12} /> : <Clock size={12} />}
                              {user.plan}
                            </span>
                          </td>
                          <td className="px-4 py-5">
                            <span className={`inline-flex items-center gap-2 text-[10px] font-bold px-3 py-1 rounded-xl shadow-sm ${STATUS_COLORS[user.status] || STATUS_COLORS.active}`}>
                              {user.status === 'active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                              {user.status || 'active'}
                            </span>
                          </td>
                          <td className="px-4 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300">{projCount}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Projects</span>
                            </div>
                          </td>
                          <td className="px-4 py-5 whitespace-nowrap">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 italic">{formatDate(user.createdAt)}</p>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <div className="relative inline-block text-left">
                                <button
                                  onClick={() => setOpenMenuId(isMenuOpen ? null : user.id)}
                                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95"
                                >
                                  {isUpdating ? <RefreshCw size={18} className="animate-spin text-indigo-500" /> : <MoreVertical size={20} />}
                                </button>
                                {isMenuOpen && (
                                  <div className="absolute right-0 top-full mt-2 z-[60] w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-2 animate-in slide-in-from-top-2 duration-200">
                                     <div className="space-y-1">
                                       <p className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 mb-1">Authorization Tier</p>
                                       {PLANS.map((plan) => (
                                          <button
                                            key={plan}
                                            onClick={() => changePlan(user.id, plan)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                              user.plan === plan ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                            }`}
                                          >
                                            <span className="capitalize">{plan} Profile</span>
                                            {user.plan === plan && <CheckCircle2 size={12} />}
                                          </button>
                                       ))}
                                       <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />
                                       <button
                                         onClick={() => toggleStatus(user.id, user.status)}
                                         className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                           user.status === 'active' ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/40' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/40'
                                         }`}
                                       >
                                         {user.status === 'active' ? <><XCircle size={14} /> Suspend Permission</> : <><CheckCircle2 size={14} /> Restore Permission</>}
                                       </button>
                                     </div>
                                  </div>
                                )}
                             </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="px-8 py-5 bg-slate-50/30 dark:bg-slate-800/10 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center">
                   <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Showing filtered set of {filtered.length} unique identities</p>
                </div>
              </div>
            </>
          )}
        </div>
        {/* Real-time Transactions Section */}
        <div className="mt-16 mb-10">
          <div className="flex items-center gap-2 mb-6 px-1">
             <CreditCard size={18} className="text-emerald-500" />
             <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500">System Revenue Events</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Live Event Stream */}
            <div className="lg:col-span-2 space-y-4">
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
                  <RefreshCw size={32} className="opacity-20 mb-3" />
                  <p className="font-bold text-sm">Awaiting first transaction event…</p>
                  <p className="text-xs opacity-60">Revenue data will appear here in real-time.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between group hover:shadow-lg hover:shadow-emerald-500/5 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                          <DollarSign size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{tx.userEmail || 'System Payment'}</p>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                            <Calendar size={10} />
                            {formatDate(tx.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-black text-slate-900 dark:text-white">${parseFloat(tx.amount || 0).toFixed(2)}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase ${tx.status === 'success' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30'}`}>
                          {tx.status || 'Processed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats Helper */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20">
                <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Targeted Growth</p>
                <p className="text-3xl font-black mb-1">${(mrr * 1.2).toFixed(2)}</p>
                <p className="text-[10px] font-bold opacity-60">Projected 20% growth next cycle</p>
                
                <div className="mt-6 pt-6 border-t border-white/10 space-y-3 font-bold text-xs">
                   <div className="flex justify-between items-center opacity-80">
                     <span>Current MRR</span>
                     <span>${mrr.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between items-center opacity-80">
                     <span>Conversion Rate</span>
                     <span>{(paidUsers.length / (realUsers.length || 1) * 100).toFixed(1)}%</span>
                   </div>
                </div>
              </div>
              
              <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-5">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Plan Pricing Status</p>
                 <div className="space-y-3">
                   <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Starter Plan</span>
                     <span className="text-xs font-black text-indigo-500">$5.00</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Pro Plan</span>
                     <span className="text-xs font-black text-violet-500">$9.99</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
        {/* Real-time Transactions Section */}
        <div className="mt-16 mb-10">
          <div className="flex items-center gap-2 mb-6 px-1">
             <CreditCard size={18} className="text-emerald-500" />
             <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500">System Revenue Events</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Live Event Stream */}
            <div className="lg:col-span-2 space-y-4">
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
                  <RefreshCw size={32} className="opacity-20 mb-3" />
                  <p className="font-bold text-sm">Awaiting first transaction event…</p>
                  <p className="text-xs opacity-60">Revenue data will appear here in real-time.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between group hover:shadow-lg hover:shadow-emerald-500/5 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                          <DollarSign size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{tx.userEmail || 'System Payment'}</p>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                            <Calendar size={10} />
                            {formatDate(tx.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-black text-slate-900 dark:text-white">${parseFloat(tx.amount || 0).toFixed(2)}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase ${tx.status === 'success' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30'}`}>
                          {tx.status || 'Processed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats Helper */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20">
                <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Targeted Growth</p>
                <p className="text-3xl font-black mb-1">${(mrr * 1.2).toFixed(2)}</p>
                <p className="text-[10px] font-bold opacity-60">Projected 20% growth next cycle</p>
                
                <div className="mt-6 pt-6 border-t border-white/10 space-y-3 font-bold text-xs">
                   <div className="flex justify-between items-center opacity-80">
                     <span>Current MRR</span>
                     <span>${mrr.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between items-center opacity-80">
                     <span>Conversion Rate</span>
                     <span>{(paidUsers.length / (realUsers.length || 1) * 100).toFixed(1)}%</span>
                   </div>
                </div>
              </div>
              
              <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-5">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Plan Pricing Status</p>
                 <div className="space-y-3">
                   <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Starter Plan</span>
                     <span className="text-xs font-black text-indigo-500">$5.00</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Pro Plan</span>
                     <span className="text-xs font-black text-violet-500">$9.99</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Global Context Click Handler */}
      {openMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
      )}
    </div>
  );
}

