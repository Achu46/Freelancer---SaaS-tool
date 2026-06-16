import axios from 'axios';
import {
  adminMetrics,
  appointmentTimeline,
  auditEvents,
  chartData,
  clinicMetrics,
  invoices,
  patientMetrics,
  queueTokens,
  rbacMatrix,
  subscriptionPlans,
} from '../data/clinicPlatform';

export const clinicApiClient = axios.create({
  baseURL: import.meta.env.VITE_CLINIC_API_URL || '/api',
  timeout: 12_000,
  headers: {
    'X-Clinic-Id': 'clinic_bluesky',
  },
});

export async function getClinicCommandCenter() {
  return {
    metrics: clinicMetrics,
    appointments: appointmentTimeline,
    queue: queueTokens,
    invoices,
    chartData,
  };
}

export async function getPatientWorkspace() {
  return {
    metrics: patientMetrics,
    appointments: appointmentTimeline.slice(0, 3),
    invoices: invoices.filter((invoice) => invoice.patient === 'Aarav Shah' || invoice.status !== 'Paid'),
  };
}

export async function getAdminWorkspace() {
  return {
    metrics: adminMetrics,
    plans: subscriptionPlans,
    auditEvents,
    rbacMatrix,
    chartData,
  };
}
