import { createAppointment, listAppointments } from './appointments.repository.js';

export function getAppointments(request) {
  return listAppointments(request);
}

export function bookAppointment(request, payload) {
  return createAppointment(request, payload);
}
