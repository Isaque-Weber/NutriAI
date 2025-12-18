import { z } from 'zod';

export const envValidationSchema = z.object({
  // Database
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string(),
  DB_PASS: z.string().optional().default(''),
  DB_NAME: z.string(),

  // JWT
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Google Cloud
  GOOGLE_CLOUD_PROJECT_ID: z.string(),
  GOOGLE_CLOUD_CLIENT_EMAIL: z.string(),
  GOOGLE_CLOUD_STORAGE_BUCKET: z.string(),
  GOOGLE_CLOUD_PRIVATE_KEY: z.string(),

  TOKEN_ACCESS_SECRET: z.string(),
  TOKEN_ACCESS_EXPIRES_IN: z.coerce.number(),
  TOKEN_REFRESH_SECRET: z.string(),
  TOKEN_REFRESH_EXPIRES_IN: z.coerce.number(),
  TOKEN_RECOVER_PASSWORD_SECRET: z.string(),
  TOKEN_RECOVER_PASSWORD_EXPIRES_IN: z.coerce.number(),

  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string().url(),

  SENDGRID_API_KEY: z.string(),
  SENDGRID_FROM_EMAIL: z.string(),
  SENDGRID_FROM_NAME: z.string(),
  SENDGRID_TEMPLATE_RECOVER_PASSWORD: z.string(),
  SENDGRID_TEMPLATE_ORGANIZATION_INVITE: z.string(),
  SENDGRID_TEMPLATE_SUPPORT_ASSIGNED: z.string(),

  FRONTEND_URL: z.string().url(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  REDIS_PASSWORD: z.string(),
});

export const env = envValidationSchema.parse(process.env);
