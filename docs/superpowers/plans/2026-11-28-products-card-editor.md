# Products Card Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-product title, summary, image, and Alt editing to the Products index page without changing product detail records.

**Architecture:** Store sparse display overrides in the existing `PRODUCT_EXPLORER` page node, keyed by the real database product id. Resolve those overrides only while building `/products`; the admin receives published product defaults and exposes them inside each selected category. Existing documents default to an empty override list, and the publication helper preserves any saved overrides.

**Tech Stack:** Next.js App Router, React, TypeScript, Zod, Prisma repositories, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-28-products-card-editor.md`

## Global Constraints

- Do not change product detail records, product ordering, category membership, detail URLs, or existing banner behavior.
- Keep old published page documents valid without a database migration.
- Use site-relative media paths and retain editable Alt text.
- Follow test-first RED→GREEN development for every behavior change.

## Review Focus

- A legacy document without `productCardOverrides` must parse to an empty override list.
- A partial override must not break the real product id, slug, category, or link.
- Selecting a new media asset must update both image and Alt while a manual Alt edit remains possible.
- Restoring defaults must remove only the selected product override.
- Re-running the publication helper must preserve saved product card overrides.

---

### Task 1: Override schema and storefront rendering

**Files:**
- Modify: `lib/product-explorer/config.ts`
- Modify: `app/(site)/products/page.tsx`
- Modify: `components/products/ProductExplorer.tsx`
- Modify: `components/products/ProductExplorer.module.css`
- Test: `tests/unit/product-explorer/config.test.ts`
- Test: `tests/unit/product-explorer/product-card-overrides.test.ts`
- Test: `tests/unit/product-explorer/ProductExplorer.test.tsx`

**Interfaces:**
- Produces: `ProductExplorerContent.productCardOverrides` and `resolveProductExplorerCard(product, overrides)`.
- Produces: `ProductExplorerViewProduct.imageAlt` consumed by the card renderer.

- [ ] Write failing tests for legacy defaults, safe display override resolution, visible summary, and custom Alt.
- [ ] Run the focused tests and confirm they fail for the missing override contract.
- [ ] Add the Zod schema, default list, pure resolver, storefront mapping, and visible card copy.
- [ ] Run the focused tests and confirm they pass.
- [ ] Commit the schema and storefront behavior.

### Task 2: Product-aware admin editor

**Files:**
- Modify: `app/admin/pages/[id]/edit/page.tsx`
- Modify: `components/admin/pages/PageBuilder.tsx`
- Modify: `components/admin/pages/ProductExplorerEditor.tsx`
- Test: `tests/unit/product-explorer/ProductExplorerEditor.test.tsx`
- Test: `tests/unit/page-builder/product-explorer-editor.test.tsx`

**Interfaces:**
- Consumes: `ProductExplorerContent.productCardOverrides` from Task 1.
- Produces: `ProductExplorerProductOption[]` passed from the admin route through `PageBuilder` to `ProductExplorerEditor`.

- [ ] Write failing editor tests for default values, title/summary/image/Alt updates, media replacement, and restore-default behavior.
- [ ] Run the focused tests and confirm they fail because no per-product editor exists.
- [ ] Load published product defaults for the admin page and add the per-category card editor UI.
- [ ] Run the focused tests and confirm they pass.
- [ ] Commit the admin editing flow.

### Task 3: Preservation, regression verification, and release

**Files:**
- Modify: `scripts/publish-products-explorer.ts`
- Modify: `tests/unit/scripts/publish-products-explorer.test.ts`

**Interfaces:**
- Consumes: `ProductExplorerContent.productCardOverrides` from Task 1.
- Produces: publication documents that preserve existing card overrides.

- [ ] Write a failing publisher test proving saved overrides survive document regeneration.
- [ ] Run the focused test and confirm it fails because the helper resets the explorer content.
- [ ] Preserve validated overrides while rebuilding category mappings.
- [ ] Run focused tests, full unit tests, typecheck, lint, and production build.
- [ ] Commit, review the complete branch, merge, deploy, and verify the public page and admin route.
