import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env, resolveCorsOrigin } from './infrastructure/config/env';
import { openApiSpec } from './interfaces/http/docs/openapi';
import { errorHandler, notFoundHandler } from './interfaces/http/middleware/errorHandler';
import { requestIdMiddleware } from './interfaces/http/middleware/requestId';
import { globalRateLimiter } from './interfaces/http/middleware/security/rate-limit';
import apiV1Routes from './interfaces/http/v1/routes';
import { registerPaymentWebhook } from './interfaces/http/v1/routes/payments.routes';
import { registerEmailNotifications } from './infrastructure/notifications/email-notifications';

registerEmailNotifications();

const app = express();
// rate limits use the visitor's address that the storefront forwards
if (env.TRUST_PROXY > 0) app.set('trust proxy', env.TRUST_PROXY);

app.use(requestIdMiddleware);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: resolveCorsOrigin(),
    credentials: true,
  }),
);
// before express.json: the Stripe signature covers the raw body
registerPaymentWebhook(app);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

if (env.NODE_ENV !== 'test') {
  app.use(globalRateLimiter);
}

// the API is never meant to show up in search results
app.use((_req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  next();
});
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send('User-agent: *\nDisallow: /\n');
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.get('/api/docs.json', (_req, res) => {
  res.json(openApiSpec);
});

app.use('/uploads', express.static(env.UPLOAD_DIR_ABS));

app.use('/api/v1', apiV1Routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
