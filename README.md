# shop-books

Books demo shop: Express 5 + Prisma + Postgres API (`apps/api`) and a Next.js
storefront (`apps/web`) in one pnpm workspace. Requirements: Node 24, pnpm 12.

```bash
pnpm install
pnpm --filter @shop-books/api test   # uses an embedded Postgres, no Docker needed
```

See `docs/brief.md` for the scope and `docs/mockups/` for the approved design.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm --filter @shop-books/api dev:db` | Postgres without Docker (embedded), data in `apps/api/.pgdata/dev` |
| `pnpm --filter @shop-books/api migrate` / `seed` / `dev` | schema, 40 books + demo accounts, API on :4000 |
| `pnpm --filter @shop-books/web dev` | storefront on :3000 (needs the API) |
| `pnpm --filter @shop-books/web test:e2e` | purchase path + axe, on its own embedded Postgres |
| `pnpm --filter @shop-books/api reset-demo` | remove visitor data and re-seed (nightly on the server) |

Demo accounts: `customer@bookstore.local` / `Customer123!`, admin `admin@bookstore.local` / `Admin123!`.
Money is integer minor units (cents). English only. Book ids are deterministic (`bk_<isbn>`).
Deployment: see `deploy/README.md`.
