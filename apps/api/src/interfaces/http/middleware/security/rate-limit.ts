import rateLimit from 'express-rate-limit';
import { env } from '../../../../infrastructure/config/env';

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // Development and tests: a storefront build alone renders 200+ book pages from one IP.
  max: env.RATE_LIMIT_MAX ?? (env.NODE_ENV === 'production' ? 300 : 10_000),
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'test' ? 10_000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts, please try again later' },
});

export const securityMiddleware = {
  globalRateLimiter,
  authRateLimiter,
};
