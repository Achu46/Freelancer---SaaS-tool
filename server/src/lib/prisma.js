import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export function tenantWhere(request, filters = {}) {
  return {
    ...filters,
    clinicId: request.tenant.clinicId,
  };
}
