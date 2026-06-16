import { tenantWhere } from '../../lib/prisma.js';

export function listAppointments(request) {
  return {
    where: tenantWhere(request),
    rows: [
      { id: 'appt_001', patientId: 'pat_001', doctorId: 'doc_001', status: 'CHECKED_IN', clinicId: request.tenant.clinicId },
      { id: 'appt_002', patientId: 'pat_002', doctorId: 'doc_002', status: 'WAITING', clinicId: request.tenant.clinicId },
    ],
  };
}

export function createAppointment(request, payload) {
  return {
    id: 'appt_new',
    clinicId: request.tenant.clinicId,
    status: 'BOOKED',
    ...payload,
  };
}
