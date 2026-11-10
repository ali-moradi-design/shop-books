import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

dotenv.config();

const optionalBool = z
  .string()
  .optional()
  .transform((v) => {
    if (v === undefined || v.trim() === '') return undefined;
    return ['true', '1', 'yes'].includes(v.trim().toLowerCase());
  });

const optionalString = z
  .string()
  .optional()
  .transform((v) => v?.trim() || undefined);

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(8),
  JWT_REFRESH_SECRET: z.string().min(8),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('7d'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // Requests per IP per 15 minutes. The storefront's server renders (and its build) share one IP.
  RATE_LIMIT_MAX: z.coerce.number().int().positive().optional(),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  UPLOAD_DIR: z.string().default('uploads'),
  COOKIE_SECURE: optionalBool,
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  COOKIE_DOMAIN: z
    .string()
    .optional()
    .transform((v) => {
      const trimmed = v?.trim();
      return trimmed ? trimmed : undefined;
    }),
  // Payments: Stripe Checkout in test mode. With no key the API simulates Stripe,
  // including signed webhooks, so the whole flow works without an account.
  STOREFRONT_URL: z.string().url().default('http://localhost:3000'),
  STRIPE_SECRET_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString,
  PAYMENT_CURRENCY: z.string().length(3).toLowerCase().default('usd'),
  // Email: without SMTP_URL messages are kept in the outbox (admin → Emails) instead of sent.
  SMTP_URL: optionalString,
  MAIL_FROM: z.string().default('Bay Book Company <shop@baybooks.local>'),
  ADMIN_ALERT_EMAIL: optionalString,
  SENTRY_DSN: optionalString,
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const data = parsed.data;

// This shop only takes test payments: a live key would charge real cards.
if (data.STRIPE_SECRET_KEY && !data.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
  console.error('STRIPE_SECRET_KEY must be a test key (sk_test_...)');
  process.exit(1);
}
if (data.STRIPE_SECRET_KEY && !data.STRIPE_WEBHOOK_SECRET) {
  console.error('STRIPE_WEBHOOK_SECRET is required when STRIPE_SECRET_KEY is set');
  process.exit(1);
}

/**
 * CORS with credentials cannot use `Access-Control-Allow-Origin: *`.
 * If CORS_ORIGIN is `*`, reflect the request origin in development/test.
 * Production must set an explicit origin (e.g. https://app.example.com).
 */
export function resolveCorsOrigin(): boolean | string | string[] {
  const raw = data.CORS_ORIGIN.trim();
  if (raw === '*') {
    return data.NODE_ENV === 'production' ? false : true;
  }
  const list = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (list.length === 0) return false;
  if (list.length === 1) return list[0];
  return list;
}

export const env = {
  ...data,
  COOKIE_SECURE: data.COOKIE_SECURE ?? data.NODE_ENV === 'production',
  UPLOAD_DIR_ABS: path.isAbsolute(data.UPLOAD_DIR)
    ? data.UPLOAD_DIR
    : path.resolve(process.cwd(), data.UPLOAD_DIR),
};
