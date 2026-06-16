import { z } from 'zod';

export const sendNotificationSchema = z.object({
  patientId: z.string().min(1),
  channel: z.enum(['WHATSAPP', 'EMAIL', 'SMS']),
  template: z.string().min(2),
  variables: z.record(z.string(), z.string()).default({}),
});
