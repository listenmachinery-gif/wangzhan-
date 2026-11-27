# Products Interactive Explorer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a CMS-managed, database-backed interactive product explorer at `/products`.

**Architecture:** Register a `PRODUCT_EXPLORER` node whose CMS JSON stores presentation and real category IDs, while the route supplies published products from Prisma. A client component owns tab/carousel interaction and preserves crawlable server-rendered links.

**Tech Stack:** Next.js App Router, React, TypeScript, Prisma/PostgreSQL, Zod, Tailwind/CSS Modules, Vitest, Testing Library, Playwright, Vercel.

**Spec:** `docs/superpowers/specs/2026-11-27-products-interactive-explorer-design.md`

## Global Constraints

- Keep existing products, categories, media, SEO, navigation, footer, inquiry data, database schema, and URLs.
- Use exactly eight fixed tabs and real database category IDs; never duplicate product records in PageBuilder JSON.
- Use published products only; never invent products, prices, ratings, certifications, or performance claims.
- Keep the page fully responsive, keyboard accessible, reduced-motion aware, and server-rendered for SEO.
- Do not run destructive database commands.

## Review Focus

- Missing/invalid category IDs must not crash the page or show another category's products.
- Empty categories must remain navigable with a useful empty state.
- Switching tabs must reset the product scroller and update all hero/product metadata together.
- CMS category mapping must keep fixed labels/order read-only and persist selected real IDs.
- New analytics events must not bypass consent or enter the incompatible first-party event bridge.

---

### Task 1: Product explorer contract and mapping

**Files:**
- Create: `lib/product-explorer/config.ts`
- Test: `tests/unit/product-explorer/config.test.ts`
- Modify: `lib/page-builder/schema.ts`
- Modify: `lib/page-builder/registry.ts`

**Interfaces:**
- Produces: `productExplorerContentSchema`, `DEFAULT_PRODUCT_EXPLORER_CONTENT`, `resolveProductExplorerData(content, categories)`.

- [ ] Write tests for the eight fixed slots, default Bending selection, strict schema, real-ID mapping, missing mapping, empty category, and migration fallback.
- [ ] Run the focused test and confirm it fails because the contract does not exist.
- [ ] Implement the config schema, defaults, mapping types, and registry definition.
- [ ] Run the focused test and confirm it passes.

### Task 2: Public interactive explorer and SEO

**Files:**
- Create: `components/products/ProductExplorer.tsx`
- Create: `components/products/ProductExplorer.module.css`
- Modify: `app/(site)/products/page.tsx`
- Modify: `lib/analytics/client-events.ts`
- Test: `tests/unit/product-explorer/ProductExplorer.test.tsx`
- Test: `tests/unit/analytics/client-events.test.ts`

**Interfaces:**
- Consumes: Task 1 config and resolved category data.
- Produces: accessible tabbed hero, real product carousel, JSON-LD, and four consent-aware GA events.

- [ ] Write interaction tests for initial Bending state, category switch, real links, scroll reset, empty state, aria tabs, and analytics.
- [ ] Run focused tests and confirm the new behavior fails.
- [ ] Implement the explorer component, scoped responsive typography, carousel, reduced motion, analytics, and route integration.
- [ ] Run focused tests and confirm they pass.

### Task 3: Specialized CMS editor

**Files:**
- Create: `components/admin/pages/ProductExplorerEditor.tsx`
- Modify: `components/admin/pages/PageBuilder.tsx`
- Modify: `app/admin/pages/[id]/edit/page.tsx`
- Test: `tests/unit/page-builder/product-explorer-editor.test.tsx`

**Interfaces:**
- Consumes: Task 1 schema/defaults and real category choices.
- Produces: category mapping, media picker, copy/style/card/responsive controls in existing PageBuilder persistence.

- [ ] Write editor tests proving fixed fields are read-only, database categories can be selected, media can be replaced, and updated content reaches PageBuilder state.
- [ ] Run focused tests and confirm they fail.
- [ ] Implement the specialized editor and pass authorized category options into PageBuilder.
- [ ] Run focused tests and confirm they pass.

### Task 4: Preview renderer and production publisher

**Files:**
- Modify: `components/page-builder/PageRenderer.tsx`
- Create: `scripts/publish-products-explorer.ts`
- Modify: `package.json`
- Test: `tests/unit/page-builder/registry.test.tsx`
- Test: `tests/unit/scripts/publish-products-explorer.test.ts`

**Interfaces:**
- Consumes: Tasks 1–3.
- Produces: valid PageBuilder preview and an idempotent authenticated publisher that maps current real category IDs and publishes the existing Products page.

- [ ] Write failing renderer and publisher behavior tests.
- [ ] Implement preview rendering and publisher payload construction without secret output.
- [ ] Run focused tests and confirm they pass.

### Task 5: Full verification and release

**Files:**
- Create: `tests/e2e/products-explorer.spec.ts`
- Create: `.impeccable/review/products-explorer-production.ts` (git-ignored release helper only if needed)

**Interfaces:**
- Consumes: complete implementation.
- Produces: verified Preview, merged production deployment, published CMS configuration, and desktop/tablet/mobile screenshots.

- [ ] Add Playwright checks for eight tabs, switching, true category/product links, responsive layouts, and admin controls.
- [ ] Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.
- [ ] Commit and push the feature branch, create/update a Draft PR, and create a Vercel Preview.
- [ ] Validate Preview at 1440, 1024, 768, and 390 px.
- [ ] Merge through the repository workflow, monitor Production, publish the Products CMS node with real category IDs, and verify `www.zyroncnc.com/products` plus rollback readiness.
