# Products Card Ordering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Products-index product cards sortable, removable, and re-addable per category without changing real product records.

**Architecture:** Add backward-compatible per-category layout records to `PRODUCT_EXPLORER` content. A pure resolver applies saved order and hidden ids to published products while appending new products; the existing admin editor mutates the same layout records with accessible controls.

**Tech Stack:** Next.js, React, TypeScript, Zod, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-28-products-card-ordering-design.md`

## Global Constraints

- Only real published products from the selected database category may be shown or re-added.
- Removing a card must not delete or modify its product record, link, text override, image override, or SEO configuration.
- Legacy page documents must parse without migration.
- Newly published products must append after an existing manual order unless explicitly hidden.

## Review Focus

- Unknown or stale saved ids must be ignored without hiding valid products.
- Duplicate ids must not produce duplicate cards.
- A hidden product must stay hidden even if it is present in the saved order.
- Restoring defaults must remove only the selected category layout.
- Card text and image overrides must continue to follow product identity after reordering.

---

### Task 1: Layout schema and storefront ordering

**Files:**
- Modify: `lib/product-explorer/config.ts`
- Modify: `app/(site)/products/page.tsx`
- Test: `tests/unit/product-explorer/config.test.ts`
- Test: `tests/unit/product-explorer/product-card-layout.test.ts`

**Interfaces:**
- Produces: `ProductExplorerContent.productCardLayouts` and `resolveProductExplorerCardLayout(categoryKey, products, layouts)`.

- [ ] Write failing tests for legacy defaulting, order, hiding, stale/duplicate ids, and automatic append.
- [ ] Run focused tests and confirm failure from the missing layout contract.
- [ ] Add the Zod schema, defaults, resolver, and storefront integration.
- [ ] Run focused tests and confirm they pass.
- [ ] Commit the storefront behavior.

### Task 2: Admin sorting and add/remove controls

**Files:**
- Modify: `components/admin/pages/ProductExplorerEditor.tsx`
- Modify: `tests/unit/product-explorer/ProductExplorerEditor.test.tsx`
- Modify: `tests/unit/page-builder/product-explorer-editor.test.tsx`

**Interfaces:**
- Consumes: `productCardLayouts` and `resolveProductExplorerCardLayout` from Task 1.

- [ ] Write failing editor tests for move up/down, remove, re-add, restore defaults, and persisted payload.
- [ ] Run focused tests and confirm the controls do not exist.
- [ ] Add accessible layout controls while preserving existing card override editors.
- [ ] Run focused tests and confirm they pass.
- [ ] Commit the admin behavior.

### Task 3: Publication preservation and production release

**Files:**
- Modify: `scripts/publish-products-explorer.ts`
- Modify: `tests/unit/scripts/publish-products-explorer.test.ts`

**Interfaces:**
- Consumes: `ProductExplorerContent.productCardLayouts` from Task 1.

- [ ] Write a failing test proving saved layouts survive document regeneration.
- [ ] Preserve validated layouts in the publication helper and make the test pass.
- [ ] Run full tests, typecheck, lint, and production build.
- [ ] Review, merge, deploy, and verify the public page and admin route.
