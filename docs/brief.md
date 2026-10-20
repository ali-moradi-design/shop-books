# Books shop: brief

Copied from the roadmap brief (decisions of 2026-10-20): the common part plus the
Books section. This repo is one of three independent shops (books, clothes, tools)
with separate code, repos and databases.

## Stack

| Shop | Repo | Backend start | Database | Storefront |
| --- | --- | --- | --- | --- |
| Books | `shop-books` | `nodejs-bookshop-ddd-postgres` (Express 5, Prisma, DDD) | Postgres | Next.js, Partial Prerendering / Cache Components (start from `nodejs-bookshop-web-next-ppr`) |

- Copy the old code WITHOUT history (plain copy); do not change the old repos.
- The repo holds `apps/api` and `apps/web` (pnpm workspace).
- Generalize "book" to "product" only as far as the shop needs.
- Rendering: static shell + live stock (Partial Prerendering).

## Common to all shops

- Features: catalog with categories and filters, search, product page, cart,
  checkout with a fake payment gateway (a simulated gateway page), customer
  account and order history, favorites, reviews, discount codes, a small admin
  (products, orders, stock), demo accounts, nightly demo-data reset.
- Payments: one payment interface with the fake gateway as the only implementation.
- SEO: metadata, JSON-LD (Product, BreadcrumbList), sitemap, OG images.
- Languages: English, German, Spanish, Persian, Arabic (Persian and Arabic RTL;
  logical CSS; native digits by default with a Latin-digit setting; Gregorian
  calendar; Vazirmatn for Persian/Arabic; German text ~30% longer). The UI is in
  all five languages; product content (names, descriptions, categories) is in
  English, Spanish and Arabic, with English as the fallback for German and Persian.
- Money in minor units with a currency code; formatting with `Intl`.
- UI: its own, clearly different look. Mockups first as images (HTML/CSS rendered
  to PNG with Playwright); no UI code before the user approves.
- Quality: TypeScript strict, ESLint + Prettier, FSD in the web app, Vitest,
  Playwright E2E for the full purchase path (browse → cart → fake payment →
  order visible in admin), axe checks; CI on GitHub Actions with a required check.
- Deploy (roadmap phase 8): three containers (web, api, database) with memory
  limits.
- No blog for now.

## Books-specific

- Search by author, genre and ISBN; series; "look inside" preview of the first
  pages; reading-list favorites.
- Look: warm and classic (serif headings, paper tones).

## Decided

- Repo `shop-books` (public); subdomain `shop-books.ali-moradi-develop.com`.
- Product content in English, Spanish and Arabic.
