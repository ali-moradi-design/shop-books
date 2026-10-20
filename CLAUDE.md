# Project instructions

Books demo shop (`shop-books`): `apps/api` (Express 5, Prisma, Postgres, DDD) and
`apps/web` (Next.js, Partial Prerendering). Scope: `docs/brief.md`. Approved design: `docs/mockups/`.

## Workflow

- Node 24, pnpm 10. Small PRs: branch → local tests → fast-forward merge into `main` → push.
  Do not wait for GitHub CI; the CI workflow is added last.
- Local checks: `pnpm --filter @shop-books/api test` (embedded Postgres), `tsc --noEmit`, `pnpm build`.
  Web build needs the API running (`pnpm dev:db`, `pnpm migrate`, `pnpm seed`, `pnpm dev` in `apps/api`).
- Running as root: `chmod 777 apps/api/.pgdata` before tests (embedded Postgres drops privileges).
- Use graphify to save tokens: query `graphify-out/graph.json` (`graphify query "..."`) before
  reading many files. Rebuild with `/graphify . --update`. `graphify-out/` is not committed.

## Language

- Explain in Persian. Put every English word or code name inside parentheses and backticks.
  Never start a line with an English word. Files in this repo are written in English.
