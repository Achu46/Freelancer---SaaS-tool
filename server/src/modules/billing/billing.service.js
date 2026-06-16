export function listInvoices(request) {
  return [
    { id: 'inv_001', clinicId: request.tenant.clinicId, patientId: 'pat_001', amount: 2400, status: 'PENDING' },
    { id: 'inv_002', clinicId: request.tenant.clinicId, patientId: 'pat_002', amount: 6800, status: 'PAID' },
  ];
}

export function createInvoice(request, payload) {
  const amount = payload.lineItems.reduce((total, item) => total + item.quantity * item.unitAmount, 0);

  return {
    id: 'inv_new',
    clinicId: request.tenant.clinicId,
    amount,
    status: 'DRAFT',
    ...payload,
  };
}

export function createRazorpayOrder(request, invoiceId) {
  return {
    id: 'order_demo',
    invoiceId,
    clinicId: request.tenant.clinicId,
    provider: 'RAZORPAY',
    status: 'CREATED',
  };
}
