import 'dotenv/config';
import { z } from 'zod';

export const envValidationSchema = z.object({
  // App
  PORT: z.coerce.number().optional().default(3000),
  NODE_ENV: z
    .enum(['development', 'production', 'test', 'provision'])
    .optional()
    .default('development'),

  // Database
  DB_HOST: z.preprocess((v) => (v === '' ? undefined : v), z.string().default('localhost')),
  DB_PORT: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().default(5432)),
  DB_USER: z.preprocess((v) => (v === '' ? undefined : v), z.string().default('nutriai')),
  DB_PASS: z.string().optional().default(''),
  DB_NAME: z.preprocess((v) => (v === '' ? undefined : v), z.string().default('nutriai')),

  // JWT
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string().default('15min'),

  // Google Cloud
  GOOGLE_CLOUD_PROJECT_ID: z.string(),
  GOOGLE_CLOUD_CLIENT_EMAIL: z.string(),
  GOOGLE_CLOUD_STORAGE_BUCKET: z.string(),
  GOOGLE_CLOUD_PRIVATE_KEY: z.string(),

  TOKEN_ACCESS_SECRET: z.string(),
  TOKEN_ACCESS_EXPIRES_IN: z.string().default('7d'),
  TOKEN_REFRESH_SECRET: z.string(),
  TOKEN_REFRESH_EXPIRES_IN: z.string().default('1h'),
  TOKEN_RECOVER_PASSWORD_SECRET: z.string(),
  TOKEN_RECOVER_PASSWORD_EXPIRES_IN: z.string().default('15min'),

  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string().url(),

  SENDGRID_API_KEY: z.string(),
  SENDGRID_FROM_EMAIL: z.string(),
  SENDGRID_FROM_NAME: z.string(),
  SENDGRID_TEMPLATE_RECOVER_PASSWORD: z.string(),
  SENDGRID_TEMPLATE_ORGANIZATION_INVITE: z.string(),
  SENDGRID_TEMPLATE_SUPPORT_ASSIGNED: z.string(),

  OPENROUTER_API_KEY: z.string(),

  FRONTEND_URL: z.string().url(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  REDIS_PASSWORD: z.string(),

  // Qdrant (Vector DB)
  QDRANT_HOST: z.string().default('localhost'),
  QDRANT_PORT: z.coerce.number().default(6333),
  QDRANT_API_KEY: z.string().optional(),
});

export const env = envValidationSchema.parse(process.env);
