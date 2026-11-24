# Machines Mega Menu Style and Media Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add safe typography, spacing, media-card management, scrolling, and category-specific navigation to the existing Machines Mega Menu.

**Architecture:** Extend the existing versioned navigation JSON with optional validated style fields and resolve them to required runtime defaults. Reuse the current media picker in the admin editor and apply the resulting values in the existing public menu component without a database migration.

**Tech Stack:** Next.js, React, TypeScript, Zod, Vitest/Testing Library, Playwright

**Spec:** `docs/superpowers/specs/2026-11-24-machines-menu-style-media-design.md`

## Global Constraints

- Preserve `PRODUCTS` as the public navigation label.
- Do not change product data, SEO, URLs, or database structure.
- Store only permanent internal media paths.
- Do not deploy production without a separate authorization.

## Review Focus

- Legacy published navigation without style keys must continue rendering with defaults.
- Malformed colors or out-of-range sizes must fail validation.
- Media selection must persist `/api/media/{id}` and never the preview URL.
- Long product lists must scroll without hiding the category header or footer actions.
- Switching categories must update the footer destination and label.

---

### Task 1: Backward-compatible style settings

**Files:**
- Modify: `lib/navigation/schema.ts`
- Modify: `lib/navigation/default-navigation.ts`
- Modify: `lib/navigation/machines-menu.ts`
- Test: `tests/unit/navigation/schema.test.ts`
- Test: `tests/unit/navigation/machines-menu.test.ts`

**Interfaces:**
- Produces: optional persisted style settings and a fully resolved `MachinesMenuView.settings`.

- [x] Write tests for legacy fallback and validation boundaries, then verify they fail for missing behavior.
- [x] Add schema fields, default values, and settings hydration/merge.
- [x] Run the focused navigation tests until green.

### Task 2: Public menu rendering and scrolling

**Files:**
- Modify: `components/SiteHeader.tsx`
- Test: `tests/unit/site/site-navigation.test.tsx`
- Test: `tests/e2e/public-navigation-shipping.spec.ts`

**Interfaces:**
- Consumes: resolved style settings from Task 1.
- Produces: accessible scroll region and active-category footer link.

- [x] Write tests for visible style changes, scroll-region semantics, and category-specific footer links; verify failure.
- [x] Apply runtime styles and restructure the right panel as a bounded flex/scroll layout.
- [x] Run focused public navigation tests until green.

### Task 3: Admin editor controls and media-backed cards

**Files:**
- Modify: `components/admin/navigation/MachinesMenuEditor.tsx`
- Test: `tests/unit/admin/navigation-editor.test.tsx`
- Test: `tests/e2e/admin-navigation.spec.ts`

**Interfaces:**
- Consumes: `MediaAssetPicker` and style settings from Task 1.
- Produces: Chinese controls, explicit selected-card removal, media selection, image preview, and restore-original action.

- [x] Write editor tests for style updates, permanent media selection, and explicit removal; verify failure.
- [x] Add grouped controls and card actions using existing editor update functions.
- [x] Run focused admin tests until green.

### Task 4: Full verification and Preview release

**Files:**
- Modify: `docs/superpowers/plans/2026-11-24-machines-menu-style-media.md` (check completed steps)

- [x] Run TypeScript, lint, full tests, production build, and targeted Playwright navigation checks.
- [x] Review the diff for accidental product, URL, SEO, secret, or database changes.
- [x] Commit to `codex/machines-menu-style-media-20261124`, push, update/create Draft PR, and verify a Vercel Preview deployment.
- [x] Record Preview URL and rollback instructions; do not promote to production.
