# shop-books

Books demo shop: Express 5 + Prisma + Postgres API (`apps/api`) and a Next.js
storefront (`apps/web`) in one pnpm workspace. Requirements: Node 24, pnpm 10.

```bash
pnpm install
pnpm --filter @shop-books/api test   # uses an embedded Postgres, no Docker needed
```

See `docs/brief.md` for the scope and `docs/mockups/` for the approved design.
