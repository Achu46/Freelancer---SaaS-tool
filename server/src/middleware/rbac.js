const rolePermissions = {
  SUPER_ADMIN: ['platform:*', 'clinics:*', 'subscriptions:*', 'audit:read'],
  CLINIC_OWNER: ['clinic:*', 'appointments:*', 'patients:*', 'billing:*', 'staff:*'],
  DOCTOR: ['appointments:read', 'patients:read', 'medical-records:*', 'prescriptions:*'],
  RECEPTIONIST: ['appointments:*', 'patients:create', 'billing:create', 'queue:*'],
  PATIENT: ['profile:read', 'appointments:create', 'records:read', 'payments:create'],
};

export function requirePermission(permission) {
  return (request, response, next) => {
    const permissions = rolePermissions[request.user?.role] || [];
    const allowed = permissions.some((candidate) => {
      const scope = candidate.replace(':*', '');
      return candidate === permission || permission.startsWith(`${scope}:`);
    });

    if (!allowed) {
      response.status(403).json({ error: 'FORBIDDEN', message: 'Role does not have permission for this action' });
      return;
    }

    next();
  };
}
