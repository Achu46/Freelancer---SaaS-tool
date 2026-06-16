import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().default('postgresql://clinicos:clinicos@localhost:5432/clinicos'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_ACCESS_SECRET: z.string().default('replace-in-production'),
  JWT_REFRESH_SECRET: z.string().default('replace-in-production-refresh'),
  S3_BUCKET: z.string().default('clinic-documents'),
  RAZORPAY_KEY_ID: z.string().default(''),
  RAZORPAY_KEY_SECRET: z.string().default(''),
});

export const env = envSchema.parse(process.env);
