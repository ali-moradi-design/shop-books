# Deploy

Three containers (`web`, `api`, `db`) with memory limits; only `web` is published, on `127.0.0.1`.

1. First time on the VPS: create `/srv/apps/shop-books/`, copy `compose.yaml` and `.env.example`
   (rename to `.env`, fill the secrets), add the Nginx site from `nginx-shop-books.conf`,
   run certbot.
2. Every deploy (CI does this over SSH): `docker compose pull && docker compose up -d`.
3. First run and every night: `docker compose exec -T api pnpm seed` once, then a nightly cron
   `0 4 * * * cd /srv/apps/shop-books && docker compose exec -T api pnpm reset-demo`
   to remove visitor data and restore stock.
4. Backups: `docker compose exec -T db pg_dump -U postgres bookstore | gzip > backup.sql.gz`, copied off the server.

The images are built in CI (`.github/workflows/ci.yml`) and pushed to ghcr.io; nothing is built on the server.
