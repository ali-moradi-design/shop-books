import fs from 'node:fs';
import path from 'node:path';
import EmbeddedPostgres from 'embedded-postgres';

/** Local Postgres for development without Docker. Data lives in .pgdata/dev. */
const dataDir = path.resolve(process.cwd(), '.pgdata/dev');
const port = Number(process.env.DEV_DB_PORT ?? 5432);
const fresh = !fs.existsSync(path.join(dataDir, 'PG_VERSION'));

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: 'postgres',
  password: 'postgres',
  port,
  persistent: true,
});

async function main() {
  if (fresh) await pg.initialise();
  await pg.start();
  if (fresh) await pg.createDatabase('bookstore');
  console.log(`Postgres ready: postgresql://postgres:postgres@127.0.0.1:${port}/bookstore`);

  const stop = async () => {
    await pg.stop();
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

void main();
