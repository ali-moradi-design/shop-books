# Mockups

Four pages (home, listing, product, cart) in the chosen look: Bay Book Company
(green bar, wooden shelf, staff picks, events) with the filter sidebar, stepped
colour promo and "look inside" open book borrowed from the reference sites.

`generate.mjs` writes the HTML; PNGs are rendered with Playwright (1440 px wide).
Covers come from the Open Library covers API by ISBN and are not stored in the repo.

Book-cover effect (as on goodbooks.io/books): every cover gets a soft shadow
(`0 24px 24px -12px rgba(38,38,38,.2)`, deeper on hover) and a spine-hinge overlay
blended with `mix-blend-mode: multiply`. Here the overlay is drawn in CSS (`.bk:after`)
instead of copying their image.
