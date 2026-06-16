import { Router } from 'express';
import { requirePermission } from '../../middleware/rbac.js';
import { sendNotificationSchema } from './notifications.dto.js';
import { listTemplates, sendNotification } from './notifications.service.js';

export const notificationRouter = Router();

notificationRouter.get('/templates', requirePermission('notifications:read'), (request, response) => {
  response.json(listTemplates(request));
});

notificationRouter.post('/send', requirePermission('notifications:write'), (request, response) => {
  const payload = sendNotificationSchema.parse(request.body);
  response.status(202).json(sendNotification(request, payload));
});
