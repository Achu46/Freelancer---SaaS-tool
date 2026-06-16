import { configureStore, createSlice } from '@reduxjs/toolkit';

const clinicSessionSlice = createSlice({
  name: 'clinicSession',
  initialState: {
    activeClinicId: 'clinic_bluesky',
    activeRole: 'CLINIC_OWNER',
    activePlan: 'PRO',
  },
  reducers: {
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

export const { switchClinic, switchRole, switchPlan } = clinicSessionSlice.actions;

export const clinicStore = configureStore({
  reducer: {
    clinicSession: clinicSessionSlice.reducer,
  },
});
