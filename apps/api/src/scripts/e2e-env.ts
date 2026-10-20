/** Environment for the e2e API. Imported first so config modules see it. */
const port = Number(process.env.E2E_API_PORT ?? 4100);
export const dbPort = Number(process.env.E2E_DB_PORT ?? 55499);

Object.assign(process.env, {
  NODE_ENV: 'development',
  PORT: String(port),
  DATABASE_URL: `postgresql://postgres:postgres@127.0.0.1:${dbPort}/bookstore_e2e?schema=public`,
  JWT_ACCESS_SECRET: 'e2e-access-secret-key',
  JWT_REFRESH_SECRET: 'e2e-refresh-secret-key',
  ACCESS_TOKEN_TTL: '12h',
  CORS_ORIGIN: '*',
  COOKIE_SECURE: 'false',
});

export { port };
