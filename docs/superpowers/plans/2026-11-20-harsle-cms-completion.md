# HARSLE-inspired CMS Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the remaining product-page, footer-management, publish-lifecycle, Preview database, and browser-acceptance gaps without replacing the existing CMS or changing Production.

**Architecture:** Extend the existing versioned `SitePage` and `NavigationSnapshot` documents with backward-compatible optional fields. A published product page may explicitly take over the legacy body while the dedicated React implementation remains the safe fallback. Footer sections remain part of the versioned navigation document, and all database changes use the existing non-destructive migration chain.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5, Prisma 7, PostgreSQL, Zod, Vitest, Testing Library, Playwright, Vercel Preview.

**Spec:** `docs/CODEX_HARSLE_SITE_CMS_BRIEF.md` and `docs/superpowers/specs/2026-11-17-zyron-frontend-cms-comprehensive-upgrade-design.md`

## Global Constraints

- Reuse the existing Page Builder, product modules, navigation publishing, RBAC, media, inquiry, SEO, and audit systems.
- Preserve every existing public URL, published product, image, specification, inquiry, and SEO record.
- Do not copy HARSLE assets, trademarks, source code, or distinctive copy.
- Do not invent equipment specifications, customer counts, certifications, warranties, or shipping claims.
- Do not merge `main`, mutate Production database state, or deploy Production without a separate explicit approval.
- Preview and test database work must remain isolated from Production.

## Review Focus

- Older page documents without a render mode must retain their current before/after legacy behavior.
- A complete product-page takeover must preserve tracking and route-level SEO while replacing only the body.
- Old navigation snapshots without new footer settings must still parse and render the current fallback footer.
- Footer links and calls to action must reject unsafe protocols and must not render a non-functional subscription form.
- Publishing a product or series page must invalidate the exact public route and the product catalogue route.

---

### Task 1: Complete product-page takeover and editor entry point

**Files:**
- Modify: `lib/page-builder/schema.ts`
- Create: `lib/page-builder/product-page-layout.ts`
- Modify: `lib/page-builder/industrial-templates.ts`
- Modify: `app/(site)/products/[id]/page.tsx`
- Modify: `components/admin/pages/PageBuilder.tsx`
- Modify: `components/admin/pages/PageCreateForm.tsx`
- Modify: `app/admin/pages/new/page.tsx`
- Modify: `app/admin/products/[id]/page.tsx`
- Modify: `components/admin/products/ProductEditor.tsx`
- Test: `tests/unit/page-builder/product-page-layout.test.ts`
- Test: `tests/unit/page-builder/schema.test.ts`
- Test: `tests/unit/admin/page-create-form.test.tsx`
- Test: `tests/unit/admin/product-editor.test.tsx`

**Interfaces:**
- Produces: `PageDocument.renderMode?: "AUGMENT_LEGACY" | "REPLACE_LEGACY"`.
- Produces: `resolveProductPageLayout(document)` returning ordered `before`, `replacement`, and `after` node arrays.
- Produces: an authenticated product editor link to the existing page designer or a prefilled product page creation flow.

- [ ] Write failing schema and layout tests proving old documents augment legacy content and takeover documents render every node in order as replacement content.
- [ ] Run the focused tests and confirm they fail because `renderMode` and `resolveProductPageLayout` do not exist.
- [ ] Add the backward-compatible document field and layout resolver, then update the product route to use it without changing trackers or metadata.
- [ ] Add an editor-level render-mode control and make the product-detail template a full takeover document.
- [ ] Write failing admin tests for prefilled product-page creation and the product editor's page-designer entry point.
- [ ] Add query-prefill support and server-side lookup of an existing `product-{slug}` page.
- [ ] Run the focused tests and the complete unit suite.

### Task 2: Make the complete footer versioned and editable

**Files:**
- Modify: `lib/navigation/schema.ts`
- Modify: `lib/navigation/default-navigation.ts`
- Modify: `components/admin/navigation/NavigationEditor.tsx`
- Modify: `components/SiteFooter.tsx`
- Test: `tests/unit/navigation/schema.test.ts`
- Test: `tests/unit/admin/navigation-editor.test.tsx`
- Test: `tests/unit/site/site-navigation.test.tsx`

**Interfaces:**
- Extends `NavigationSnapshot.footer` with optional product-category visibility/label, managed action-link groups, newsletter CTA configuration, and legal links.
- Older snapshots continue to parse through defaults.

- [ ] Write failing tests for managed product-category visibility, managed action links, managed newsletter CTA, and legal links.
- [ ] Run the tests and confirm the footer still uses hard-coded groups and a non-functional subscription form.
- [ ] Extend the schema and defaults with safe optional footer fields.
- [ ] Add Chinese editor controls for every new footer field.
- [ ] Render only the published footer snapshot and replace the fake subscription form with a configured link CTA or a hidden section.
- [ ] Run focused tests and the complete unit suite.

### Task 3: Prove draft, publish, rollback, duplicate modules, and cache invalidation

**Files:**
- Modify: `tests/integration/page-builder/page-service.test.ts`
- Modify: `tests/integration/products/product-admin.test.ts`
- Modify: `tests/unit/page-builder/page-service-errors.test.ts`
- Modify: `tests/e2e/admin-products.spec.ts`
- Create: `tests/e2e/admin-page-publishing.spec.ts`

**Interfaces:**
- Consumes existing `PageService`, `ProductAdminService`, page API routes, and published repositories.
- Produces regression coverage for draft isolation, publish snapshots, rollback-to-draft, repeated product module types, and route invalidation.

- [ ] Add failing integration coverage for the missing lifecycle and duplicate-module cases.
- [ ] Run focused tests and confirm each failure represents an observable gap rather than a mock assertion.
- [ ] Make only the minimum service or route changes required by failing behavior tests.
- [ ] Add authenticated browser coverage for save, preview, publish, rollback, and front-end refresh using an isolated database.
- [ ] Run focused integration and E2E suites.

### Task 4: Validate migrations and complete the public acceptance matrix

**Files:**
- Modify: `tests/e2e/harsle-cms-public.spec.ts`
- Modify: `docs/HARSLE_INFORMATION_ARCHITECTURE_AUDIT.md`
- Modify: `docs/CODEX_HARSLE_SITE_CMS_BRIEF.md` only if the acceptance record needs an implementation note.

**Interfaces:**
- Consumes the existing non-destructive ProductSection migration and the isolated `zyron_cms_test` database.
- Produces responsive evidence for eight public page types at 1440, 1024, 768, and 390 pixels, plus long-title, empty-content, inquiry, canonical, and no-horizontal-overflow checks.

- [ ] Apply all migrations only to the isolated test database and verify schema/data integrity.
- [ ] Add failing browser assertions for extreme titles, empty managed content fallback, inquiry behavior, and SEO canonical output.
- [ ] Fix only genuine application failures uncovered by the acceptance tests.
- [ ] Run the full acceptance matrix and save screenshots outside Git.

### Task 5: Full verification, Preview rollout, and Draft PR update

**Files:**
- Modify: this plan checklist and the existing PR description only; no Production files or data.

**Interfaces:**
- Produces a clean feature branch commit, updated Draft PR, successful Vercel Preview, and a deployment/rollback report.

- [ ] Run `npm ci`, `npx prisma validate`, `npx prisma generate`, `npm run typecheck`, `npm run lint`, `npm test`, safe integration tests, relevant Playwright tests, and `npm run build`.
- [ ] Review the complete branch diff for secrets, generated files, fake data, broken media paths, and accidental Production changes.
- [ ] Commit and push only the feature branch, then update Draft PR #2.
- [ ] Confirm Vercel Preview checks are successful and verify public routes.
- [ ] Apply the migration to Preview only after confirming database isolation; do not touch Production.
- [ ] Report remaining manual approvals, deployment order, and rollback steps.
