import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function authenticate(request, response, next) {
  const authorization = request.get('authorization');
  const token = authorization?.replace('Bearer ', '');

  if (!token) {
    request.user = {
      id: 'demo-user',
      role: request.get('x-demo-role') || 'CLINIC_OWNER',
      clinicId: request.get('x-clinic-id') || 'clinic_bluesky',
      permissions: ['appointments:write', 'patients:write', 'billing:write', 'notifications:write'],
    };
    return next();
  }

  try {
    request.user = jwt.verify(token, env.JWT_ACCESS_SECRET);
    return next();
  } catch (error) {
    error.statusCode = 401;
    error.code = 'INVALID_ACCESS_TOKEN';
    return next(error);
  }
}
