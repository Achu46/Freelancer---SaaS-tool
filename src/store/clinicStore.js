import { configureStore, createSlice } from '@reduxjs/toolkit';

const authStorageKey = 'clinicos.auth';

const demoUsers = {
  SUPER_ADMIN: {
    id: 'usr_super_admin',
    name: 'Platform Admin',
    email: 'admin@clinicos.test',
    role: 'SUPER_ADMIN',
    clinicId: 'platform',
    plan: 'ENTERPRISE',
  },
  CLINIC_OWNER: {
    id: 'usr_clinic_owner',
    name: 'Clinic Owner',
    email: 'owner@clinicos.test',
    role: 'CLINIC_OWNER',
    clinicId: 'clinic_bluesky',
    plan: 'PRO',
  },
  DOCTOR: {
    id: 'usr_doctor',
    name: 'Dr. Meera Iyer',
    email: 'doctor@clinicos.test',
    role: 'DOCTOR',
    clinicId: 'clinic_bluesky',
    plan: 'PRO',
  },
  RECEPTIONIST: {
    id: 'usr_receptionist',
    name: 'Reception Desk',
    email: 'reception@clinicos.test',
    role: 'RECEPTIONIST',
    clinicId: 'clinic_bluesky',
    plan: 'STARTER',
  },
  PATIENT: {
    id: 'usr_patient',
    name: 'Aarav Shah',
    email: 'patient@clinicos.test',
    role: 'PATIENT',
    clinicId: 'clinic_bluesky',
    plan: 'PRO',
  },
};

function readStoredAuth() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(authStorageKey);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function writeStoredAuth(session) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(authStorageKey, JSON.stringify(session));
  }
}

function clearStoredAuth() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(authStorageKey);
  }
}

const storedAuth = readStoredAuth();

const clinicSessionSlice = createSlice({
  name: 'clinicSession',
  initialState: {
    activeClinicId: storedAuth?.user?.clinicId || 'clinic_bluesky',
    activeRole: storedAuth?.user?.role || 'CLINIC_OWNER',
    activePlan: storedAuth?.user?.plan || 'PRO',
    isAuthenticated: Boolean(storedAuth?.accessToken),
    accessToken: storedAuth?.accessToken || null,
    user: storedAuth?.user || null,
  },
  reducers: {
    loginWithRole(state, action) {
      const user = demoUsers[action.payload.role] || demoUsers.CLINIC_OWNER;
      const session = {
        accessToken: `demo-${user.role.toLowerCase()}-token`,
        user: {
          ...user,
          email: action.payload.email || user.email,
        },
      };

      state.activeClinicId = session.user.clinicId;
      state.activeRole = session.user.role;
      state.activePlan = session.user.plan;
      state.isAuthenticated = true;
      state.accessToken = session.accessToken;
      state.user = session.user;
      writeStoredAuth(session);
    },
    logout(state) {
      state.activeClinicId = 'clinic_bluesky';
      state.activeRole = 'CLINIC_OWNER';
      state.activePlan = 'PRO';
      state.isAuthenticated = false;
      state.accessToken = null;
      state.user = null;
      clearStoredAuth();
    },
    switchClinic(state, action) {
      state.activeClinicId = action.payload;
    },
    switchRole(state, action) {
      state.activeRole = action.payload;
    },
    switchPlan(state, action) {
      state.activePlan = action.payload;
    },
  },
});

export const { loginWithRole, logout, switchClinic, switchRole, switchPlan } = clinicSessionSlice.actions;
export const demoClinicUsers = Object.values(demoUsers);

export const clinicStore = configureStore({
  reducer: {
    clinicSession: clinicSessionSlice.reducer,
  },
});
