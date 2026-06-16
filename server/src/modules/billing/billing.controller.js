import { Router } from 'express';
import { requirePermission } from '../../middleware/rbac.js';
import { createInvoiceSchema } from './billing.dto.js';
import { createInvoice, createRazorpayOrder, listInvoices } from './billing.service.js';

export const billingRouter = Router();

billingRouter.get('/invoices', requirePermission('billing:read'), (request, response) => {
  response.json(listInvoices(request));
});

billingRouter.post('/invoices', requirePermission('billing:create'), (request, response) => {
  const payload = createInvoiceSchema.parse(request.body);
  response.status(201).json(createInvoice(request, payload));
});

billingRouter.post('/invoices/:invoiceId/razorpay-order', requirePermission('billing:create'), (request, response) => {
  response.status(201).json(createRazorpayOrder(request, request.params.invoiceId));
});
