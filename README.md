# shop-books

A demo bookshop for a portfolio (Bay Book Company): a Next.js storefront with
Partial Prerendering and an Express + Prisma + Postgres API, in one pnpm workspace.

| Part | Stack |
| --- | --- |
| `apps/web` | Next.js 16 (App Router, Cache Components / PPR), Tailwind CSS 4, Feature-Sliced Design |
| `apps/api` | Express 5, Prisma, Domain-Driven Design (domain, application, infrastructure, interfaces) |
| Database | PostgreSQL 17 |
| Tests | Vitest (API unit + integration on an embedded Postgres, web units), Playwright E2E with axe |

Scope and decisions: [docs/brief.md](docs/brief.md). Approved design: [docs/mockups](docs/mockups).
What was built, step by step: [docs/session-log.md](docs/session-log.md).

## Features

- Warm, classic storefront: wooden shelf of staff picks, events, book covers
  with a paper effect
- Catalog of 200 books (covers from Open Library): search by title, author, genre and ISBN, series, filter
  sidebar, book pages with a cached shell and live stock and reviews
  (Partial Prerendering), "look inside" preview of the first pages
- Cart, checkout with discount codes (`WELCOME10`, `FLAT5`) and a simulated
  payment gateway page (approve or decline; no card data is read or stored)
- Accounts with order history, reading list (favorites), reviews
- Small admin: orders and their status, price and stock, new book form
- SEO: metadata, JSON-LD (Product, BreadcrumbList), sitemap, robots, Open Graph image
- Money in integer minor units (cents); deterministic book ids (`bk_<isbn>`)
- Nightly demo reset (`pnpm --filter @shop-books/api reset-demo`)

## Run locally

### Everything in Docker

Needs only Docker.

```bash
docker compose up -d --build              # Postgres, API and storefront
```

The schema and the demo data load on every start. The storefront builds when its
container starts (prerendering reads the API), so http://localhost:3000 answers a
minute or two after `up`; follow it with `docker compose logs -f web`. The API docs
are at http://localhost:4000/api/docs.
`docker compose down` stops everything (add `-v` to also delete the data).

### With pnpm (hot reload)

Needs Node 24, pnpm 12 and Docker.

```bash
pnpm install
pnpm db:up                                # Postgres in Docker on 127.0.0.1:54320 (stop: pnpm db:down)
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
pnpm migrate                              # create the tables
pnpm seed                                 # 200 books, demo accounts, discount codes
pnpm dev                                  # API on :4000 (docs: /api/docs) + web on :3000
```

No Docker? `pnpm db:embedded` starts the same database without it (an embedded
Postgres on the same port, data in `apps/api/.pgdata/dev`); keep it running in its
own terminal and use the steps above from `pnpm migrate` on. When running as root,
run `chmod 777 apps/api/.pgdata` first (embedded Postgres drops privileges).

To run one side only: `pnpm dev:api` or `pnpm dev:web`.

Demo accounts:

| Role | Email | Password |
| --- | --- | --- |
| Customer | `customer@bookstore.local` | `Customer123!` |
| Admin | `admin@bookstore.local` | `Admin123!` |

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm db:up` / `pnpm db:down` | start / stop Postgres in Docker (`127.0.0.1:54320`) |
| `pnpm db:embedded` | Postgres without Docker, same port |
| `pnpm migrate` | apply the Prisma migrations |
| `pnpm seed` | load the demo books and accounts (upserts, safe to repeat) |
| `pnpm dev` | API and storefront together, with hot reload |
| `pnpm dev:api` / `pnpm dev:web` | one side only |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` / `pnpm build` | checks for all workspaces |

## Checks

```bash
pnpm lint && pnpm typecheck && pnpm test   # all workspaces
pnpm --filter @shop-books/web build        # prerendering reads the API, so run the API first
pnpm --filter @shop-books/web test:e2e     # purchase path + axe
```

API tests start their own embedded Postgres, so they need no Docker. The E2E suite
starts its own API, database and production web build (ports 4100, 55499 and 3100;
free them with `fuser -k` if a run was interrupted).

CI (`.github/workflows/ci.yml`) runs the API checks, the web checks and the E2E
suite; the `ci` job is the single required check.

## Production notes

- Deployment: three containers (web, api, database) with memory limits; see
  [deploy/README.md](deploy/README.md).
- The browser talks only to the storefront: server actions call the API, and the
  API tokens live in the storefront's own httpOnly cookies (`sb_access`, `sb_refresh`).
  Keep the API port private.
- Nightly reset: run `reset-demo` from cron (command in deploy/README.md); it removes visitor data and re-seeds.
