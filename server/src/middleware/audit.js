export function auditRequest(request, _response, next) {
  request.audit = {
    actorId: request.user?.id,
    clinicId: request.tenant?.clinicId,
    ipAddress: request.ip,
    userAgent: request.get('user-agent'),
    startedAt: new Date(),
  };

  next();
}
