import { Router } from 'express';
import { requirePermission } from '../../middleware/rbac.js';

export const subscriptionRouter = Router();

subscriptionRouter.get('/plans', requirePermission('subscriptions:read'), (_request, response) => {
  response.json([
    { code: 'TRIAL', monthlyPrice: 0, doctorLimit: 2, recordLimit: 100 },
    { code: 'STARTER', monthlyPrice: 2999, doctorLimit: 3, recordLimit: 1000 },
    { code: 'PRO', monthlyPrice: 7999, doctorLimit: 15, recordLimit: 10000 },
    { code: 'ENTERPRISE', monthlyPrice: null, doctorLimit: null, recordLimit: null },
  ]);
});

subscriptionRouter.post('/webhooks/razorpay', (request, response) => {
  response.json({ received: true, event: request.body.event || 'demo.subscription.updated' });
});
