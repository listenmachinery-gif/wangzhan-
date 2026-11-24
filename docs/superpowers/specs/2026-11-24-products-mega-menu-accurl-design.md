# PRODUCTS Mega Menu ACCURL-Inspired Design

## Intent

Refine the existing ZYRON `PRODUCTS` navigation into a compact, dark industrial product directory measured from ACCURL, while keeping ZYRON branding, product records, URLs, media, permissions, draft/publish history, and SEO intact. The public label and all user-facing CMS copy must say `PRODUCTS`, not `MACHINES`.

## Goals

- Match ACCURL's measured desktop density: dark full-width surface, 260px category rail, 40px rail-to-grid gap, four product columns, 24px grid gaps, 3:2 image stage, 17px/700 titles, and 15px/21px descriptions.
- Keep the eight existing ZYRON categories and real products, while preserving category and product URLs unless the editor supplies a navigation-only override.
- Keep the menu within the viewport; only the product panel scrolls for long categories.
- Open by hover/focus/click, switch categories with hover intent, close on outside click/Escape/route navigation, and preserve keyboard tab behavior.
- Keep the existing three-level mobile navigation, but label it `PRODUCTS` and share the same published data.
- Make common CMS work fast: search products, batch add/remove, reorder, move a navigation card to another menu category, override title/description/image/alt/link, preview, draft, publish, and rollback.

## Non-goals

- No separate navigation product database or destructive product/category operations.
- No changes to product slugs, canonical metadata, sitemap, detail content, or database schema.
- No ACCURL assets, logo, copy, or source code.
- No decorative card badges, shadows, large radii, gradients, or standalone detail buttons.

## Reference measurements

Measured on 2026-11-24 with Playwright against `https://www.accurl.com/`:

- Header/announcement bottom: 124px on the reference site; ZYRON retains its existing 72px header.
- Mega menu: full viewport width, near-black background, 40px top and 48px bottom padding.
- 1440px viewport: 1280px content, 260px category rail, 40px gap, 980px product panel.
- 1920px viewport: the same 1280px content width centered.
- 1280px viewport: 1152px content, 260px category rail, 40px gap, 852px product panel.
- Category row: 44px high, 17px/600 type, count right-aligned, 2px active line.
- Product grid: four columns, 24px row/column gaps.
- 1440/1920 card: 227px wide; image stage 227×151px, square corners, 1px dark border.
- 1280 card: 195px wide.
- Product name: 17px/700/21.25px; description: 15px/400/21px.

## Architecture and compatibility

Use the existing `NavigationSnapshot.machines` JSON configuration and `buildMachinesMenuView` resolver. Internal type names remain unchanged to avoid a risky migration; all public/admin labels become `PRODUCTS`. Add optional category and product navigation URL overrides to the existing JSON schema. Empty overrides continue to inherit the canonical catalogue URL.

Introduce a visual preset version in menu settings. Legacy published snapshots without this version hydrate to the new dark ACCURL-inspired defaults, preventing old light-theme values from keeping production on the previous design. New saves persist the preset version. No Prisma migration is required because navigation content is already versioned JSON.

## Approaches considered

1. **Reuse and extend the existing CMS snapshot (selected).** Lowest data risk, preserves versioning and permissions, and makes the public menu update immediately after publishing.
2. Build a new normalized navigation-product database. Rejected because it duplicates catalogue relationships and requires a production migration.
3. Restyle only the frontend. Rejected because it would not satisfy the required ongoing CMS control.

## Acceptance

- Public navigation displays `PRODUCTS`; no visible menu/editor heading says `MACHINES`.
- Desktop layout matches the measured proportions at 1920, 1440, and 1280 widths and does not overflow vertically or horizontally.
- Product cards contain only image, title, and description, plus one category-level footer link.
- Manual mode can search, batch add/remove, reorder, move, and override product menu content without deleting catalogue records.
- Published changes invalidate existing navigation cache through the current service.
- Typecheck, lint, unit tests, integration tests, production build, and responsive Playwright checks pass before production release.
