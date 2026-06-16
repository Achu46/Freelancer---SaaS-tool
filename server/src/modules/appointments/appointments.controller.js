import { Router } from 'express';
import { requirePermission } from '../../middleware/rbac.js';
import { createAppointmentSchema } from './appointments.dto.js';
import { bookAppointment, getAppointments } from './appointments.service.js';

export const appointmentRouter = Router();

appointmentRouter.get('/', requirePermission('appointments:read'), (request, response) => {
  response.json(getAppointments(request));
});

appointmentRouter.post('/', requirePermission('appointments:create'), (request, response) => {
  const payload = createAppointmentSchema.parse(request.body);
  response.status(201).json(bookAppointment(request, payload));
});
