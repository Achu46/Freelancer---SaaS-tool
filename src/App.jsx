import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { IS_DEMO_MODE } from './lib/firebase';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import ClientPortal from './pages/ClientPortal';
import Pricing from './pages/Pricing';
import AdminPanel from './pages/AdminPanel';

function AppContent() {
  const { isDark } = useTheme();

  const toastStyle = isDark
    ? { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155', borderRadius: '12px', fontSize: '14px' }
    : { background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px' };

  return (
    <div className={IS_DEMO_MODE ? 'pt-8' : ''}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: toastStyle,
          success: { iconTheme: { primary: '#f59e0b', secondary: '#fff' } },
          error: { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/signup" element={<Auth mode="signup" />} />
        <Route path="/pricing" element={<Pricing />} />

        {/* Public client portal — no auth required */}
        <Route path="/p/:publicLinkId" element={<ClientPortal />} />

        {/* Protected freelancer routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:projectId"
          element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />

        {/* ── Admin routes ──────────────────────────────── */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />
      </Routes>
    </div>
  );
}


export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          {IS_DEMO_MODE && (
            <div className="fixed top-0 left-0 right-0 z-50 bg-indigo-500 text-indigo-950 text-center text-xs font-semibold py-2 px-4 shadow-md">
              ⚠️ Demo Mode — Firebase credentials not configured. Copy{' '}
              <code className="font-mono bg-indigo-400 px-1 rounded">.env.example</code> to{' '}
              <code className="font-mono bg-indigo-400 px-1 rounded">.env</code>{' '}
              and add your keys to enable full functionality.
            </div>
          )}
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}


