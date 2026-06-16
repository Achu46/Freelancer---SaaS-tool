import { tenantWhere } from '../../lib/prisma.js';

export function listPatients(request) {
  return {
    where: tenantWhere(request),
    rows: [
      { id: 'pat_001', fullName: 'Aarav Shah', phone: '+91 90000 00001', clinicId: request.tenant.clinicId },
      { id: 'pat_002', fullName: 'Fatima Khan', phone: '+91 90000 00002', clinicId: request.tenant.clinicId },
    ],
  };
}

export function createPatient(request, payload) {
  return {
    id: 'pat_new',
    clinicId: request.tenant.clinicId,
    ...payload,
  };
}
