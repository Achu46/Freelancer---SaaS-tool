import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { isAdminUser } from '../components/AdminRoute';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@queflow.com';
const ADMIN_PASS  = import.meta.env.VITE_ADMIN_PASSWORD || '12345678';

export default function Auth({ mode = 'login' }) {
  const [tab, setTab] = useState(mode);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { login, signup, setUserProfile } = useAuth();
  const navigate = useNavigate();

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function ensureAdminAccount(uid) {
    try {
      // If the email matches the admin email, ensure the record exists in Firestore
      if (form.email === ADMIN_EMAIL) {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', uid), {
            email: ADMIN_EMAIL,
            displayName: 'Admin',
            role: 'admin',
            plan: 'pro',
            isAdmin: true,
            createdAt: serverTimestamp(),
          });
        }
        return 'admin';
      }
      return 'freelancer';
    } catch (err) {
      console.error('Error ensuring admin account:', err);
      return 'freelancer';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'login') {
        const result = await login(form.email, form.password);
        toast.success('Welcome back!');
        
        // Check for admin role
        let role = 'freelancer';
        if (form.email === ADMIN_EMAIL) {
          role = await ensureAdminAccount(result.user.uid);
        } else {
          const userDoc = await getDoc(doc(db, 'users', result.user.uid));
          role = userDoc.data()?.role || 'freelancer';
        }


        // Redirect based on role
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        if (!form.name.trim()) {
          toast.error('Please enter your name');
          return;
        }
        await signup(form.email, form.password, form.name);
        toast.success('Account created! Welcome to QueFlow 🎉');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Auth error:', err);

      const msg =
        err.code === 'auth/user-not-found' ? 'No account found with this email.' :
        err.code === 'auth/wrong-password' ? 'Incorrect password.' :
        err.code === 'auth/email-already-in-use' ? 'An account with this email already exists.' :
        err.code === 'auth/weak-password' ? 'Password must be at least 6 characters.' :
        err.code === 'auth/invalid-email' ? 'Invalid email address.' :
        'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 gradient-bg p-12 text-white">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
            <Zap size={16} />
          </div>
          <span className="text-lg font-bold tracking-tight">QueFlow</span>
        </Link>
        <div>
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            One link.<br />Zero friction.<br />Happy clients.
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Share a secure portal with every client. They upload, you deliver.
            No email chains, no confusion.
          </p>
          <div className="mt-10 space-y-4">
            {['No client sign-up required', 'Real-time file uploads', 'Built-in task tracking'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-white/80">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <ArrowRight size={10} />
                </div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/40 text-xs">© 2025 QueFlow</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-slate-950">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">QueFlow</span>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800/60 rounded-xl p-1 mb-8">
            {['login', 'signup'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                id={`auth-tab-${t}`}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all capitalize ${
                  tab === t
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {t === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {tab === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            {tab === 'login' ? 'Enter your credentials to continue.' : 'Get started free — no credit card needed.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="auth-name">
                  Full name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={update('name')}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="auth-email">
                Email address
              </label>
              <input
                id="auth-email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={update('email')}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="auth-password">
                Password
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={update('password')}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="auth-submit-btn"
              className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl transition-all shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/35 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Processing…</>
              ) : tab === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-slate-500 dark:text-slate-400">
            {tab === 'login' ? (
              <>Don't have an account?{' '}
                <button onClick={() => setTab('signup')} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline" id="switch-to-signup">
                  Sign up free
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => setTab('login')} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline" id="switch-to-login">
                  Log in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
