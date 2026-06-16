import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth.js';
import { issueDemoSession, listDemoUsers } from './auth.service.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['SUPER_ADMIN', 'CLINIC_OWNER', 'DOCTOR', 'RECEPTIONIST', 'PATIENT']),
});

export const authRouter = Router();

authRouter.get('/roles', (_request, response) => {
  response.json({
    roles: listDemoUsers(),
  });
});

authRouter.post('/login', (request, response, next) => {
  try {
    const credentials = loginSchema.parse(request.body);
    response.json(issueDemoSession(credentials));
  } catch (error) {
    error.statusCode = 400;
    error.code = 'INVALID_LOGIN_PAYLOAD';
    next(error);
  }
});

authRouter.get('/me', authenticate, (request, response) => {
  response.json({
    user: request.user,
  });
});

authRouter.post('/logout', (_request, response) => {
  response.status(204).send();
});
