import type { Request } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../../../../infrastructure/config/env';

const PRIVATE =
  /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|fc|fd|::ffff:(127|10|192\.168|172\.(1[6-9]|2\d|3[01]))\.)/i;

/**
 * The storefront server, calling for itself (page renders, cached catalog reads):
 * a private address and no X-Forwarded-For. The API is not published, so these
 * are not visitors; counting them would put every visitor into one bucket. The
 * storefront forwards the visitor's address on sign-in and similar calls, and
 * those are counted per visitor.
 */
export function isStorefrontServer(req: Request): boolean {
  if (req.headers['x-forwarded-for']) return false;
  return PRIVATE.test(req.socket.remoteAddress ?? '');
}

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // per visitor; RATE_LIMIT_MAX overrides
  max: env.RATE_LIMIT_MAX ?? (env.NODE_ENV === 'production' ? 3000 : 10_000),
  standardHeaders: true,
  legacyHeaders: false,
  skip: isStorefrontServer,
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'test' ? 10_000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isStorefrontServer,
  message: { message: 'Too many auth attempts, please try again later' },
});

export const securityMiddleware = {
  globalRateLimiter,
  authRateLimiter,
};
