# Session log: what was built (for the step-by-step walkthrough)

Walk through in this order. Each step is one merged branch; `git log --oneline` shows them.

1. **Brief and mockups** (`docs/brief.md`, `docs/mockups/`): scope for the Books shop; four mockups
   (home, listing, product, cart) drawn as HTML/CSS and rendered to PNG with Playwright. Chosen look:
   Bay Book Company (green bar, wooden shelf, staff picks, events), filter sidebar, stepped colour promo,
   "look inside" open book, and the goodbooks.io cover effect (multiply overlay + soft shadow).
2. **Workspace** (`package.json`, `pnpm-workspace.yaml`, `.nvmrc`): pnpm workspace, Node 24.
3. **`apps/api`**: plain copy of the DDD/Postgres API. Changes: `declaration` off for pnpm,
   `dev:db` (Postgres without Docker), integer **money in cents** (migration scales old data),
   ISBN/series/author search, `GET /books/facets`, `series`/`sample` columns, 40-book seed with
   demo customer, `reset-demo` (nightly), deterministic book ids `bk_<isbn>`, `e2e:serve`.
4. **`apps/web`**: Next.js 16 with Cache Components (Partial Prerendering). Tailwind v4 `@theme` tokens
   in `src/app/globals.css`, `.book-cover` effect, FSD folders (`shared`, `entities`, `features`, `widgets`, `app`).
   Pages: home, `/books` (GET-form filters), `/books/[id]` (cached shell + live stock/reviews holes),
   cart, checkout, fake gateway `/pay/[id]`, orders, reading list, login/register, admin
   (orders, stock/price, **new book form**), sitemap, robots, OG image, JSON-LD.
5. **Auth design**: server actions call the API, store tokens in the web app's own httpOnly cookies.
6. **Tests**: API Vitest (34, embedded Postgres), web Vitest (5), Playwright e2e (full purchase path,
   admin sees the order, admin creates a book) and axe checks on 6 pages. All run locally.
7. **Deploy and CI** (written, not run here): `apps/*/Dockerfile`, `deploy/` (compose with 3 containers,
   memory limits, loopback port, nginx site), `.github/workflows/ci.yml` (job `ci` = required check).

## Known gaps / next steps

- Docker images and the CI workflow have never run (no Docker daemon in the cloud sandbox, GitHub CI not awaited).
- Branch protection (required check `ci`) must be set by the owner in GitHub settings.
- "Look inside" samples exist for 6 public-domain books only.
- Star ratings are not shown on listing cards.
- Admin cannot edit or delete a book's other fields yet (only price/stock; creation is supported).
