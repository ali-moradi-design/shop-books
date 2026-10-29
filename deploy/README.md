# Deploy

Three containers (`web`, `api`, `db`) in `/srv/apps/shop-books/` on the VPS. Only `web` is published, on
`127.0.0.1:3101`; Nginx on the host proxies `shop-books.ali-moradi-develop.com` to it. The database sits on an
internal network (no internet, no published port). Server setup follows the deploy-kit checklist
(`dynamic/README.md` in `ali-moradi-design/deploy-kit`).

- `compose.yaml`: the production stack. The API runs as `node` on a read-only disk (only `uploads/` and `/tmp`
  are writable) and applies the Prisma migrations when it starts. Its image holds only build output: `dist`,
  the Prisma schema and migrations, and the production dependencies (no source code, no dev dependencies).
- `.env.example`: the variable names for `.env` on the server (`deploy:deploy`, 600). Secrets come from
  `openssl rand -hex 32`. `IMAGE_TAG=none` until the first deploy writes the commit SHA.
- `nginx.conf`: the Nginx site (`/etc/nginx/sites-available/shop-books`), before certbot adds TLS.

Every push to `main`: CI passes → `.github/workflows/docker.yml` builds `shop-books-{api,web}:<sha>`, pushes them
to ghcr.io and calls deploy-kit's `deploy-app.yml`, which runs `deploy-app shop-books <sha>` on the server
(pull, `up --wait`, automatic rollback when a container is not healthy). Nothing is built on the server.

Commands on the server (in `/srv/apps/shop-books`, as `deploy`); the scripts are compiled into `dist/scripts`:

```bash
docker compose exec -T api node dist/scripts/seed.js        # once, after the first deploy
docker compose exec -T api node dist/scripts/reset-demo.js  # nightly from cron
docker compose exec -T db pg_dump -U app bookstore | gzip > backup.sql.gz   # backup, copy it off the server
```
