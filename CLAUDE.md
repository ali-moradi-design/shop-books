# Project instructions

Books demo shop (`shop-books`): `apps/api` (Express 5, Prisma, Postgres, DDD) and
`apps/web` (Next.js, Partial Prerendering). Scope: `docs/brief.md`. Approved design: `docs/mockups/`.

## Workflow

- Node 24, pnpm 12. Small PRs: branch → local tests → fast-forward merge into `main` → push.
  Do not wait for GitHub CI; the CI workflow is added last.
- CI is `.github/workflows/ci.yml` (job `ci` is the one to mark as required in branch protection).
- Local checks: `pnpm --filter @shop-books/api test` (embedded Postgres), `tsc --noEmit`, `pnpm build`, and `pnpm --filter @shop-books/web test:e2e`
  (purchase path + axe; starts its own API/Postgres/web, ports 4100/3100/55499; free them with `fuser -k`).
  Web build needs the API running (`pnpm db:up` or `pnpm db:embedded`, then `pnpm migrate`, `pnpm seed`, `pnpm dev:api` at the root).
- Running as root: `chmod 777 apps/api/.pgdata` before tests (embedded Postgres drops privileges).
- Use graphify to save tokens: query `graphify-out/graph.json` (`graphify query "..."`) before
  reading many files. Rebuild with `/graphify . --update`. `graphify-out/` is not committed.

## Decisions

- English only (no i18n). Money is integer minor units. Book ids are `bk_<isbn>`.
- Auth: the web app stores the API tokens in its own httpOnly cookies (`sb_access`, `sb_refresh`).
- Local Docker: root `compose.yaml` (Postgres on 127.0.0.1:54320; `docker compose up -d --build` runs the whole stack).
  Production compose is in `deploy/`. The sandbox may need `sudo dockerd` started first.

## Language

- Explain in Persian. Put every English word or code name inside parentheses and backticks.
  Never start a line with an English word. Files in this repo are written in English.
