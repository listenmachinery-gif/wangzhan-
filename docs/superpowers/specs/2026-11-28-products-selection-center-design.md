# Products Selection Center Design

## Intent

Add a fourth Products-page module that helps international buyers find, filter, compare, and inquire about real published ZYRON machine series. Preserve the existing Header, Footer, hero, and premium search module. Bring the premium search typography down to the homepage section scale.

## Architecture

- Add a dedicated `PRODUCT_SELECTION_CENTER` managed page node. Its JSON content owns module copy, safe design tokens, dynamic filter definitions, search synonyms, comparison rules, CTA copy, and product-card overrides.
- Extend the existing published catalogue query to return active model specification values. Build a compact server-rendered selection index from published categories, series, models, and values; no new product database or duplicate search index.
- Render real product links and initial cards on the server. A focused client component manages URL-backed search/filter/sort/page state, a mobile filter drawer, and versioned local comparison state.
- The premium search module remains visually and functionally intact, but its submit/view-all action passes the query into the selection center and its default typography matches homepage H2/body sizing.

## Safety and SEO

- No destructive schema migration. Missing specifications remain `Not provided` / `By Model` and never become zero.
- Filtering requires one real model to satisfy every active technical condition; values from different models are never combined.
- Internal search/filter states are client URL state and do not create sitemap entries. Product names remain crawlable anchors and the default product list remains server-rendered.
- All colors, dimensions, paths, IDs, and enumerations are Zod validated. No HTML/CSS/script input is accepted.

## UX

- 1440px maximum container, 272px desktop filter rail, three-column product grid, two-column tablet grid, and one-column mobile grid.
- White, restrained industrial cards with 3:2 contain images, verified values only, clear empty states, and visible focus states.
- Compare supports 2–3 series by default, persists locally, and shows a keyboard-accessible comparison dialog. The bottom consultation CTA links to the existing inquiry system with selection context in safe query parameters.

## Admin

The existing Products page builder exposes a dedicated editor for general copy, design settings, synonyms, dynamic filter definitions, product-card overrides, comparison limits, CTA settings, media selection, preview, draft, and publish. Existing page roles and versioned publishing remain authoritative.

## Approaches Considered

1. **Managed page node + existing product/specification tables (selected):** fits current architecture, remains versioned/publishable, and avoids duplicate product data.
2. New standalone explorer tables and admin application: rejected because it duplicates the existing CMS and adds migration risk.
3. Static client catalogue derived from legacy files: rejected because it would not automatically reflect published database changes.

