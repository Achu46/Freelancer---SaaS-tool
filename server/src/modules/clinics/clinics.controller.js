import { Router } from 'express';
import { requirePermission } from '../../middleware/rbac.js';

export const clinicRouter = Router();

clinicRouter.get('/me', requirePermission('clinic:read'), (request, response) => {
  response.json({
    id: request.tenant.clinicId,
    name: 'BlueSky Multispeciality Clinic',
    plan: request.tenant.plan,
    branches: 2,
    featureFlags: ['queue_management', 'razorpay_payments', 'advanced_analytics'],
  });
});

clinicRouter.get('/audit', requirePermission('audit:read'), (request, response) => {
  response.json([
    { action: 'PATIENT_REGISTERED', clinicId: request.tenant.clinicId, actorId: request.user.id },
    { action: 'APPOINTMENT_BOOKED', clinicId: request.tenant.clinicId, actorId: request.user.id },
  ]);
});
