import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { auditRequest } from './middleware/audit.js';
import { authenticate } from './middleware/auth.js';
import { resolveTenant } from './middleware/tenant.js';
import { authRouter } from './modules/auth/auth.controller.js';
import { appointmentRouter } from './modules/appointments/appointments.controller.js';
import { billingRouter } from './modules/billing/billing.controller.js';
import { clinicRouter } from './modules/clinics/clinics.controller.js';
import { notificationRouter } from './modules/notifications/notifications.controller.js';
import { patientRouter } from './modules/patients/patients.controller.js';
import { subscriptionRouter } from './modules/subscriptions/subscriptions.controller.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan('combined'));

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok', service: 'clinicos-api' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api', authenticate, resolveTenant, auditRequest);
  app.use('/api/clinics', clinicRouter);
  app.use('/api/patients', patientRouter);
  app.use('/api/appointments', appointmentRouter);
  app.use('/api/billing', billingRouter);
  app.use('/api/subscriptions', subscriptionRouter);
  app.use('/api/notifications', notificationRouter);

  app.use((error, _request, response, _next) => {
    response.status(error.statusCode || 500).json({
      error: error.code || 'INTERNAL_SERVER_ERROR',
      message: error.message || 'Unexpected server error',
    });
  });

  return app;
}
