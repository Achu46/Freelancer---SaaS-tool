export function sendNotification(request, payload) {
  return {
    id: 'notif_new',
    clinicId: request.tenant.clinicId,
    status: 'QUEUED',
    ...payload,
  };
}

export function listTemplates(request) {
  return [
    { id: 'tpl_appointment_reminder', clinicId: request.tenant.clinicId, channel: 'WHATSAPP' },
    { id: 'tpl_invoice_due', clinicId: request.tenant.clinicId, channel: 'SMS' },
    { id: 'tpl_follow_up', clinicId: request.tenant.clinicId, channel: 'EMAIL' },
  ];
}
