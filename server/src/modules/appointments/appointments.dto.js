import { z } from 'zod';

export const createAppointmentSchema = z.object({
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  startsAt: z.coerce.date(),
  reason: z.string().min(3),
  channel: z.enum(['IN_PERSON', 'VIDEO', 'PHONE']).default('IN_PERSON'),
});
