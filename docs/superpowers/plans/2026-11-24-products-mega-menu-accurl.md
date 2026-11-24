# PRODUCTS Mega Menu ACCURL-Inspired Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a measured ACCURL-inspired ZYRON `PRODUCTS` mega menu and a faster CMS editing workflow without duplicating or deleting catalogue data.

**Architecture:** Extend the existing versioned navigation JSON with optional URL overrides and a visual preset version, then update the current public panel and CMS editor. Continue resolving all categories and products from the real catalogue repositories.

**Tech Stack:** Next.js 15, React, TypeScript, Tailwind CSS, Zod, Vitest, Testing Library, Playwright, Vercel

**Spec:** `docs/superpowers/specs/2026-11-24-products-mega-menu-accurl-design.md`

## Global Constraints

- Public and admin-visible naming is `PRODUCTS`.
- Preserve all existing product IDs, slugs, images, SEO, inquiries, database schema, and canonical links.
- Navigation removal only removes menu associations.
- Reuse existing auth, media, versioning, publish, rollback, and cache invalidation.
- Production release occurs only after Preview and responsive acceptance pass.

## Review Focus

- Legacy snapshots must hydrate to the dark preset without discarding product overrides.
- URL overrides must accept only the existing validated internal/HTTPS link rules.
- Moving a menu card must not change the product's real catalogue category.
- Empty and long product categories must remain usable without viewport overflow.
- Hover behavior must not break keyboard focus or mobile touch navigation.

---

### Task 1: Versioned menu data and URL overrides

**Files:**
- Modify: `lib/navigation/schema.ts`
- Modify: `lib/navigation/default-navigation.ts`
- Modify: `lib/navigation/machines-menu.ts`
- Test: `tests/unit/navigation/schema.test.ts`
- Test: `tests/unit/navigation/machines-menu.test.ts`

**Interfaces:**
- Produces optional `hrefOverride` fields and `settings.visualPresetVersion`.
- Produces legacy hydration that applies preset version 2 while preserving non-visual behavior.

- [ ] Write failing schema and view-model tests for URL inheritance/override and legacy preset hydration.
- [ ] Run the focused tests and confirm they fail for the missing fields/version.
- [ ] Implement the compatible schema, defaults, and resolver behavior.
- [ ] Run the focused tests until green.

### Task 2: ACCURL-measured public PRODUCTS menu

**Files:**
- Modify: `components/SiteHeader.tsx`
- Test: `tests/unit/site/site-navigation.test.tsx`
- Test: `tests/e2e/public-navigation-shipping.spec.ts`

**Interfaces:**
- Consumes the existing `MachinesMenuView` with preset-v2 settings.
- Preserves the public menu region, tab semantics, real links, and mobile drill-down.

- [ ] Write failing tests for public `PRODUCTS` naming, four-column dark presentation hooks, card content, hover opening, and category footer links.
- [ ] Run the focused test and confirm the expected failures.
- [ ] Implement the measured dark layout, hover intent, outside/route close behavior, and PRODUCTS mobile copy.
- [ ] Run the focused component and navigation E2E tests until green.

### Task 3: Faster PRODUCTS CMS management

**Files:**
- Modify: `components/admin/navigation/MachinesMenuEditor.tsx`
- Test: `tests/unit/admin/navigation-editor.test.tsx`

**Interfaces:**
- Consumes real `ProductCategory[]` and `Product[]` data.
- Saves search/batch/move/reorder operations and optional content/link overrides into the existing draft snapshot.

- [ ] Write failing editor tests for PRODUCTS naming, URL overrides, search, batch add/remove, and cross-category menu-card moves.
- [ ] Run the focused tests and confirm they fail for missing controls.
- [ ] Implement the editor workflow while retaining media-library replacement and non-destructive removal.
- [ ] Run focused editor tests until green.

### Task 4: Verification, Preview, production release

**Files:**
- Update: `docs/superpowers/plans/2026-11-24-products-mega-menu-accurl.md`

**Interfaces:**
- Produces verified Preview and Production deployment IDs, screenshots, and rollback information.

- [ ] Run typecheck, lint, unit tests, integration tests, and production build.
- [ ] Capture ACCURL and ZYRON at 1920, 1440, 1280, 1024, 768, 390, and 375 widths.
- [ ] Verify frontend category switching, long-list scrolling, mobile drill-down, admin login protection, and real page links.
- [ ] Commit, push, create/update PR, wait for Preview Ready, merge to `main`, and wait for Production Ready.
- [ ] Verify `www.zyroncnc.com` and document the retained rollback deployment.
