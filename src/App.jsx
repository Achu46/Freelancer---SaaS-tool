import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider, useSelector } from 'react-redux';
import {
  AccessDenied,
  AuthPage,
  ClinicLanding,
  ClinicPanel,
  PatientPanel,
  PlatformArchitecture,
  SuperAdminPanel,
} from './pages/ClinicSuite';
import { clinicStore } from './store/clinicStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

const routeRoles = {
  patient: ['PATIENT'],
  clinic: ['SUPER_ADMIN', 'CLINIC_OWNER', 'DOCTOR', 'RECEPTIONIST'],
  superAdmin: ['SUPER_ADMIN'],
  architecture: ['SUPER_ADMIN', 'CLINIC_OWNER'],
};

function ProtectedRoute({ children, allowedRoles }) {
  const session = useSelector((state) => state.clinicSession);

  if (!session.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(session.activeRole)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ClinicLanding />} />
      <Route path="/login" element={<AuthPage />} />
      <Route
        path="/patient"
        element={(
          <ProtectedRoute allowedRoles={routeRoles.patient}>
            <PatientPanel />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/clinic"
        element={(
          <ProtectedRoute allowedRoles={routeRoles.clinic}>
            <ClinicPanel />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/super-admin"
        element={(
          <ProtectedRoute allowedRoles={routeRoles.superAdmin}>
            <SuperAdminPanel />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/architecture"
        element={(
          <ProtectedRoute allowedRoles={routeRoles.architecture}>
            <PlatformArchitecture />
          </ProtectedRoute>
        )}
      />
      <Route path="/access-denied" element={<AccessDenied />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={clinicStore}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </Provider>
    </QueryClientProvider>
  );
}
