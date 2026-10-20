import { dbPort, port } from './e2e-env';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import app from '../app';
import { connectDb } from '../infrastructure/config/db';
import { runSeed } from './seed';

/**
 * Self-contained API for end-to-end tests: embedded Postgres, migrations, seed, then listen.
 * No Docker or external database needed.
 */
const dataDir = path.resolve(process.cwd(), '.pgdata/e2e');

async function main() {
  const EmbeddedPostgres = (await import('embedded-postgres')).default;
  fs.rmSync(dataDir, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(dataDir), { recursive: true });
  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: 'postgres',
    password: 'postgres',
    port: dbPort,
    persistent: false,
  });
  await pg.initialise();
  await pg.start();
  await pg.createDatabase('bookstore_e2e');

  execSync('npx prisma migrate deploy', { stdio: 'inherit', env: process.env });
  await connectDb();
  await runSeed();
  app.listen(port, () => console.log(`e2e api ready on :${port}`));

  const stop = async () => {
    await pg.stop().catch(() => undefined);
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
