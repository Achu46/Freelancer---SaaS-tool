import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@queflow.com';

export function isAdminUser(user, profile) {
  // Use the database role as the primary source of truth
  if (profile?.role === 'admin') return true;
  // Fallback to the legacy isAdmin flag
  if (profile?.isAdmin === true) return true;
  // Fallback to the hardcoded admin email (only if no profile yet)
  return user?.email === ADMIN_EMAIL;
}


export default function AdminRoute({ children }) {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Check role-based access. If no profile yet, fallback to email check.
  const isAllowed = isAdminUser(currentUser, userProfile);

  if (!currentUser || !isAllowed) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

