import { defineConfig, devices } from '@playwright/test';

const webPort = process.env.E2E_WEB_PORT ?? '3100';
const apiPort = process.env.E2E_API_PORT ?? '4100';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  timeout: 60_000,
  use: { baseURL: `http://localhost:${webPort}`, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'pnpm --filter @shop-books/api e2e:serve',
      url: `http://localhost:${apiPort}/api/health`,
      timeout: 180_000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'node scripts/e2e-web.mjs',
      url: `http://localhost:${webPort}`,
      timeout: 300_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
