// Starts the production web build against the e2e API (waits for it first).
import { spawn, spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';

const api = process.env.API_URL ?? 'http://localhost:4100';
const port = process.env.E2E_WEB_PORT ?? '3100';

for (let i = 0; i < 180; i++) {
  try {
    if ((await fetch(`${api}/api/health`)).ok) break;
  } catch {}
  await new Promise((r) => setTimeout(r, 1000));
  if (i === 179) throw new Error('e2e API did not become ready');
}

const env = {
  ...process.env,
  API_URL: api,
  NEXT_PUBLIC_API_URL: api,
  NEXT_PUBLIC_SITE_URL: `http://localhost:${port}`,
};
rmSync('.next', { recursive: true, force: true }); // the fetch cache would serve ids from an earlier database
const build = spawnSync('pnpm', ['exec', 'next', 'build'], { stdio: 'inherit', env });
if (build.status !== 0) process.exit(build.status ?? 1);
const server = spawn('pnpm', ['exec', 'next', 'start', '-p', port], { stdio: 'inherit', env });
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => server.kill(sig));
server.on('exit', (code) => process.exit(code ?? 0));
