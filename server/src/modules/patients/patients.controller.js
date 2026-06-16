import { Router } from 'express';
import { requirePermission } from '../../middleware/rbac.js';
import { registerPatientSchema } from './patients.dto.js';
import { getPatients, registerPatient } from './patients.service.js';

export const patientRouter = Router();

patientRouter.get('/', requirePermission('patients:read'), (request, response) => {
  response.json(getPatients(request));
});

patientRouter.post('/', requirePermission('patients:create'), (request, response) => {
  const payload = registerPatientSchema.parse(request.body);
  response.status(201).json(registerPatient(request, payload));
});
