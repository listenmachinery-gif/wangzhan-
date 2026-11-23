# HARSLE Layout & Media Phase 2 Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with TDD and a persistent ledger.

**Goal:** Complete the nine existing HARSLE-inspired editable layouts, make every supported media/repeater slot manageable without raw JSON, preserve all existing product content, and ensure save/publish/rollback updates the real public routes safely.

**Architecture:** Extend the existing PageBuilder, component registry, MediaAssetPicker, PageService and product-module system instead of introducing a second editor. Page documents remain backward-compatible schema version 1. Durable `/api/media/{id}` references are synchronized to `MediaReference` inside the same page transaction. Existing product pages remain the source of truth; CMS layout modes are opt-in drafts and never overwrite live product content automatically.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Prisma 7/PostgreSQL, Zod, Vitest/Testing Library, Playwright.

**Spec:** `docs/CODEX_HARSLE_LAYOUT_MEDIA_PHASE2.md`

## Global constraints

- Work only on `feat/harsle-layouts-media-picker-20261121`.
- Do not merge `main`, deploy production, mutate production data, or run destructive migrations.
- Preserve existing URLs, product records, technical specifications, media, SEO, inquiries and navigation/footer data.
- New templates are explicit draft choices; they must not silently replace existing content.
- Use failing tests before each production-code change.

### Task 1: Restore the safe builder baseline

**Files:**
- Modify: `components/admin/pages/PageBuilder.tsx`
- Test: `tests/unit/page-builder/editor.test.tsx`

1. Run the existing failing nested-layout advertisement test and confirm RED.
2. Hide generic layout containers until nested editing is genuinely supported; retain all purpose-built HARSLE modules.
3. Run the focused editor test and confirm GREEN.

### Task 2: Accessible, durable media selection

**Files:**
- Modify: `components/admin/pages/MediaAssetPicker.tsx`
- Create: `tests/unit/page-builder/media-asset-picker.test.tsx`

1. Add tests for opening focus, focus trapping, Escape close, focus restoration, image/video filtering, search, pagination and durable `/api/media/{id}` selection.
2. Implement dialog refs and keyboard handling without changing media RBAC or API contracts.
3. Run the focused test and confirm GREEN.

### Task 3: Structured repeater and full media-slot editing

**Files:**
- Modify: `components/admin/pages/PageBuilder.tsx`
- Test: `tests/unit/page-builder/editor.test.tsx`

1. Add failing tests for gallery/card item add, remove, move and independent image/video replacement.
2. Replace raw JSON-only media repeaters with a structured item editor while retaining a safe advanced JSON fallback for non-media data.
3. Add background-image media selection, explicit module hide/show, width/spacing/image-fit controls, and preserve manual site-relative URL compatibility.
4. Run focused builder tests and confirm GREEN.

### Task 4: Per-device, per-element typography

**Files:**
- Modify: `lib/page-builder/schema.ts`
- Modify: `components/page-builder/PageRenderer.tsx`
- Modify: `components/admin/pages/PageBuilder.tsx`
- Test: `tests/unit/page-builder/schema.test.ts`
- Test: `tests/unit/page-builder/registry.test.tsx`
- Test: `tests/unit/page-builder/editor.test.tsx`

1. Add failing tests that tablet/mobile text overrides validate, render and edit independently.
2. Add optional responsive text-style records to PageNode without changing schemaVersion.
3. Render device-scoped selectors and bind the editor to the active device.
4. Confirm legacy documents parse unchanged and all focused tests pass.

### Task 5: Transactional SitePage media ownership

**Files:**
- Modify: `lib/services/page-service.ts`
- Modify: `tests/integration/pages/page-service.test.ts`

1. Add an integration test proving save/create/rollback synchronize valid page media references and reject missing/deleted assets.
2. Implement recursive durable-media extraction and reference reconciliation within each existing page transaction.
3. Confirm conflict handling, immutable versions and publishing behavior remain unchanged.

### Task 6: Non-destructive product layout integration and real route publication

**Files:**
- Modify: `lib/page-builder/harsle-layout-templates.ts`
- Modify: `app/(site)/products/[id]/page.tsx`
- Modify supporting product renderer/editor files only when required by tests.
- Test: `tests/unit/page-builder/harsle-layouts.test.ts`
- Test: existing product page/unit/integration tests.

1. Add failing tests that product templates default to augmentation and contain no invented specification rows.
2. Keep real ProductSection/legacy product content as the source of truth; make CMS takeover explicit and reversible.
3. Verify product/series/general slug invalidation maps to real routes and preserves SEO/tracking/inquiry wrappers.
4. Confirm repeated product modules and existing data migrations are already safe; do not add a duplicate migration.

### Task 7: Full verification, responsive screenshots and Draft PR

**Files:**
- Modify only defects found by verification.
- Store screenshots outside the repository under `.superpowers/sdd/.../screenshots`.

1. Run `npm run typecheck`, `npm run lint`, `npm test`, safe integration tests when a test database is available, and `npm run build`.
2. Run Playwright for the nine layouts and core inquiry/media/publish paths at 1440, 1024, 768 and 390 widths; capture representative screenshots.
3. Inspect the complete diff for secrets, build artifacts, unintended data/URL/SEO changes and production-side effects.
4. Commit the changes to the current feature branch and push/update the existing Draft PR targeting the phase-1 branch.
5. Perform a final self-review because subagent delegation was not requested; fix Critical/Important findings with RED→GREEN tests.

## Review focus

- Stable media references only; no signed preview URL persisted.
- Existing published products never replaced merely by opening/applying an editor.
- Repeater edits do not corrupt unknown optional fields.
- Responsive styles cascade correctly and legacy documents remain valid.
- Media references are reconciled atomically with page versions.
- Publish invalidates real public routes and leaves inquiry, analytics, SEO and product tracking intact.
