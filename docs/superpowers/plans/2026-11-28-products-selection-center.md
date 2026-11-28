# Products Selection Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an editable, production-grade Products selection, filtering, comparison, and inquiry module backed by real published machine data.

**Architecture:** A new page-builder node stores validated module configuration. Server code creates a compact real catalogue index; a client component owns URL-backed interaction and local comparison state while preserving server-rendered links.

**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma, Zod, CSS Modules, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-28-products-selection-center-design.md`

## Global Constraints

- Preserve all existing URLs, Header, Footer, modules, product data, SEO, permissions, and publishing behavior.
- Use only published products and active models; never invent missing specifications.
- Keep the existing premium search design and align its default typography to homepage section sizes.
- All module settings must pass bounded Zod validation and media paths must remain site-relative.

## Review Focus

- Multiple filters must be satisfied by one model, not a synthetic combination across models.
- Empty and nonnumeric specification values must never match numeric requirements.
- URL search state must restore without causing hydration mismatch or horizontal overflow.
- Compare persistence must reject stale/malformed storage and enforce configured limits.
- Missing images/specifications must render safe fallbacks without layout shift.

---

### Task 1: Selection data and matching engine

**Files:** Create `lib/product-selection/config.ts`; modify `lib/repositories/category-repository.ts`; test `tests/unit/product-selection/config.test.ts`.

- [ ] Write failing tests for schema defaults, synonym search, same-model AND matching, missing numeric values, sorting, and pagination.
- [ ] Run the focused test and confirm missing-module failures.
- [ ] Implement validated configuration, server index construction, unit parsing, and pure matching helpers.
- [ ] Run focused tests to green.

### Task 2: Accessible responsive explorer UI

**Files:** Create `components/products/ProductSelectionCenter.tsx`, focused subcomponents, and CSS module; test `tests/unit/product-selection/ProductSelectionCenter.test.tsx`.

- [ ] Write failing behavior tests for SSR cards, search, category/filter linkage, URL state, empty reset, mobile drawer, sort, pagination, and comparison.
- [ ] Implement the smallest accessible UI that passes the tests.
- [ ] Add restrained responsive styling and reduced-motion behavior.
- [ ] Run focused tests to green.

### Task 3: Page integration and shared search handoff

**Files:** Modify Products page, premium search config/component, page-builder schema/registry/renderer, and publisher tests.

- [ ] Write failing tests for component registration, shared query handoff, homepage typography scale, and publishing preservation.
- [ ] Add `PRODUCT_SELECTION_CENTER`, render after the premium search, and pass real published data.
- [ ] Update premium search defaults and handoff URL.
- [ ] Run focused tests to green.

### Task 4: Existing-admin configuration

**Files:** Create `components/admin/pages/ProductSelectionEditor.tsx`; modify PageBuilder and Products editor loader; test editor behavior.

- [ ] Write failing tests for text/design edits, filter/synonym add-remove-reorder, media selection, comparison limits, restore defaults, and save payload.
- [ ] Implement the dedicated editor in the current page-management workflow.
- [ ] Run focused tests to green.

### Task 5: Verification and release

- [ ] Run typecheck, lint, full unit suite, changed integration tests, and production build.
- [ ] Perform desktop/tablet/mobile browser checks and real production search/filter/compare smoke tests.
- [ ] Commit, push, merge after checks, wait for production deployment, and verify live URLs/admin route.

