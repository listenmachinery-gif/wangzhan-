# Codex: HARSLE-inspired page layout + Media Library editing, phase 2

Repository: listenmachinery-gif/wangzhan-
Branch: feat/harsle-layouts-media-picker-20261121
Reference: https://www.harsle.com/
Admin language: Chinese; website content: English.

## Critical scope: preserve previous work
Do NOT rework existing product photos, accurate specs, product copy, inquiry APIs, SEO, shipping records, brand assets, published content, or business logic. This phase focuses only on page layout fidelity and admin-editable sections with image/video replacement.

## Already implemented on this branch
- MediaAssetPicker UI in components/admin/pages/MediaAssetPicker.tsx uses the existing /api/admin/media and persists a stable /api/media/{id} URL, never a temporary signed preview URL.
- Media kind filtering in validation/media.ts and services/media-service.ts.
- PageBuilder supports media picker for HERO, IMAGE, VIDEO, split sections and individual gallery/card image slots, and offers additional reference layout presets.
- MEDIA_HERO (full bleed or split image/video) and MEDIA_SHOWCASE (mixed photo/video grid) added to CMS schema, registry and renderer.
- Nine additional layout templates in lib/page-builder/harsle-layout-templates.ts: Home, Company, Products, Series, editorial Product Detail, catalog Product Detail, Support, Showcase, Contact.
- New template validation unit tests.
Review these files and fix any type, lint, runtime and UX problems; do not recreate them.

## A. Reference website analysis
Browse the HARSLE home, company, product center, shearing series, long-form product landing, catalog product, support, showcase and contact pages. Capture desktop/tablet/mobile layout and document section order, margins, hero alignment, navigation, product gallery, grids, footer, responsive differences and typography. Borrow information architecture and layout composition; never copy their logo, copyrighted images, proprietary copy or source code.

## B. Frontend layout fidelity and modular system
Preserve existing page contents by default. Add a per-page layout mode or template selection that only changes on explicit draft edit and publish.

Home: hero, company intro, statistics, machine series, why choose, manufacturing media, service and final inquiry.
Company: hero, overview, engineering, authentic numbers, history, team, certificates, factory media.
Products: product category series as large image/text rows (alternating sides), not just a uniform card grid, plus optional product cards and inquiry.
Series: hero, series intro, subseries, comparison, benefits, applications, selection guidance, FAQs.
Editorial detail: immersive machine image/video, alternating feature panels, controls, tooling, real specifications, real image gallery, inquiry, related products.
Catalog detail: image gallery left, product details right, mobile stack, model selection, specs, options, inquiry.
Support: topics, documentation, tutorial media, customer service contact, FAQ.
Showcase: projects, videos, manufacturing photos, verified customer cases.
Contact: clear hero, real working form, verified company contact info, support path.

Use dynamic product/category/technical data from existing Prisma tables. Do not introduce fake statistics, certificates, customer feedback, specifications or service claims.

## C. Fully editable CMS
Every module supports add, remove, duplicate, reorder (drag and buttons), hide/show, draft, preview, publish, rollback; repeated module types allowed. Build nested blocks and manageable card repeaters without requiring users to manually edit JSON.
Expose per-element (eyebrow, h1/h2, body, CTA) font color, font size, font weight, font family, line height, letter spacing, text alignment, including mobile/tablet overrides. Provide background color/image and section width, spacing, image aspect ratio, object-fit and object-position controls.

For ALL images/video: user can click Replace > Media Library; search and filter images or videos, paginate, inspect preview, select. Cover hero desktop/tablet/mobile, slideshow, section art, background, cards, gallery, feature parts, posters, factory and company video. Preserve stable media IDs or site-relative /api/media/{id} URLs; never save expiring signed preview URLs.
Keep current media RBAC and upload policies. Add accessible dialog focus management and ESC handling. For repeated gallery/card slots enable add/delete/reorder and independent media replacement. Update MediaReference ownership on saved/published content so assets in use cannot be unintentionally deleted.

## D. Important pre-existing limitations to finish
- Several legacy pages have CMS modules only appended at the bottom. Implement inner insertion slots and arbitrary positioning before/between/after legacy content, especially individual product pages. Do not overwrite legacy content during migration.
- ProductSection currently restricts repeated types in older data model. Provide safe, backward-compatible migration if needed; do not erase data.
- Published route invalidation must cover real paths /, /factory, /products, /products/series/[id], /products/[id], /support, /showcase, /contact, not only synthetic CMS page slugs.
- Preserve real inquiries, product tracking, SEO/canonical/schema, sitemap, published navigation, factory pages and mobile menus.
- User must be able to edit every new module from /admin/pages; all media slots must connect to /admin/media.
- Existing navigation/footer changes from prior stage must be preserved, not reworked unless necessary for layout compatibility.

## E. Tests and acceptance
Run npm ci, npm run typecheck, npm run lint, npm test, npm run build, Playwright desktop 1440, laptop 1024, tablet 768, mobile 390.
Verify all 9 layouts, test replacing hero/gallery and video from Media Library, test independent title/body font settings, module duplication/deletion/reorder, draft publish rollback, concurrent edits, actual front-end updates and no broken asset paths.
Validate form submission still reaches existing /api/inquiry and conversion tracking; avoid duplicate forms. Ensure no loss of published product specs, imagery and URLs. Fix all known failures, report any inability to test.
When done: commit to this phase-2 feature branch and update the PR targeting phase-1 branch. Do not merge/deploy/live DB migrate without explicit approval.

Provide concise Chinese summary with: changed files, screenshots, passing tests, unresolved items, how to open editor, how to swap media, deployment safety and rollback.