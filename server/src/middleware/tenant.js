export function resolveTenant(request, response, next) {
  const clinicId = request.user?.role === 'SUPER_ADMIN'
    ? request.get('x-clinic-id') || request.user.clinicId
    : request.user?.clinicId;

  if (!clinicId) {
    response.status(400).json({ error: 'TENANT_REQUIRED', message: 'Clinic tenant context is required' });
    return;
  }

  request.tenant = {
    clinicId,
    plan: request.get('x-plan') || 'PRO',
  };

  next();
}
