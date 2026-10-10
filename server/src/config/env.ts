import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().int().min(1).max(65_535),
  MONGODB_URI: z
    .string()
    .regex(/^mongodb(?:\+srv)?:\/\//, 'MONGODB_URI must be a MongoDB connection URI'),
  REDIS_URL: z.string().default('redis://127.0.0.1:6379'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().min(1),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1),
  CLIENT_URL: z.string().url(),
  RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .positive()
    .default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  SEAT_LOCK_TTL_SECONDS: z.coerce.number().int().positive().default(600),
  MAX_SEAT_LOCK_DURATION_SECONDS: z.coerce.number().int().positive().default(900),

  // Public Social & Contact URLs
  PUBLIC_FACEBOOK_PAGE_URL: z.string().trim().optional(),
  PUBLIC_INSTAGRAM_URL: z.string().trim().optional(),
  PUBLIC_WHATSAPP_NUMBER: z.string().trim().optional(),
  PUBLIC_TELEGRAM_URL: z.string().trim().optional(),

  // Meta / Facebook / WhatsApp / Instagram Integration
  META_APP_SECRET: z.string().trim().optional(),
  META_VERIFY_TOKEN: z.string().trim().optional(),
  META_PAGE_ACCESS_TOKEN: z.string().trim().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().trim().optional(),
  WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().trim().optional(),

  // Telegram Bot Integration
  TELEGRAM_BOT_TOKEN: z.string().trim().optional(),
  TELEGRAM_WEBHOOK_SECRET: z.string().trim().optional(),

  // AI Assistant Configuration
  AI_PROVIDER: z.enum(['local', 'gemini', 'openai']).default('local'),
  AI_MODEL: z.string().trim().optional(),
  AI_API_KEY: z.string().trim().optional(),
  AI_ENABLED: z.coerce.boolean().default(true),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
