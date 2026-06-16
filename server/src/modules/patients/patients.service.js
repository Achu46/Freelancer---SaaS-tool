import { createPatient, listPatients } from './patients.repository.js';

export function getPatients(request) {
  return listPatients(request);
}

export function registerPatient(request, payload) {
  return createPatient(request, payload);
}
