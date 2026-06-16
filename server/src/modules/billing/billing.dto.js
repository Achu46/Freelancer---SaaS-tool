import { z } from 'zod';

export const createInvoiceSchema = z.object({
  patientId: z.string().min(1),
  lineItems: z.array(z.object({
    description: z.string().min(2),
    quantity: z.number().positive(),
    unitAmount: z.number().nonnegative(),
  })).min(1),
  dueDate: z.coerce.date().optional(),
});
