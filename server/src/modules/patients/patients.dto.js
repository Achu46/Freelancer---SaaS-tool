import { z } from 'zod';

export const registerPatientSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(['FEMALE', 'MALE', 'OTHER', 'UNDISCLOSED']).default('UNDISCLOSED'),
});
