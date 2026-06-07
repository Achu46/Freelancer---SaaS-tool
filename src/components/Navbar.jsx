import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, Zap, LogOut, LayoutDashboard, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleDark } = useDarkMode();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to log out');
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-indigo-500/10 bg-white/70 dark:bg-slate-950/60 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to={currentUser ? '/dashboard' : '/'} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Que<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
            </span>
          </Link>

          {/* Nav actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {currentUser ? (
              <>
                <Link
                  to="/dashboard"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
                <Link
                  to="/pricing"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  <DollarSign size={15} />
                  Pricing
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors whitespace-nowrap"
                  id="logout-btn"
                >
                  <LogOut size={15} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-2.5 py-1.5 sm:px-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                  id="nav-login-btn"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1.5 sm:px-4 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shadow-sm"
                  id="nav-signup-btn"
                >
                  Get started
                </Link>
              </>
            )}
            <button
              onClick={toggleDark}
              className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
              id="dark-mode-toggle"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
