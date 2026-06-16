import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import {
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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ClinicLanding />} />
      <Route path="/patient" element={<PatientPanel />} />
      <Route path="/clinic" element={<ClinicPanel />} />
      <Route path="/super-admin" element={<SuperAdminPanel />} />
      <Route path="/architecture" element={<PlatformArchitecture />} />
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

