# ZYRON CMS 2.0 Page Builder MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a production-oriented Page Builder MVP with draft, responsive preview, publish, public homepage rendering, version history, and rollback.

**Architecture:** Store a versioned, validated page document in PostgreSQL through Prisma. A shared component registry drives the admin editor and server-rendered public output, while the current homepage remains the fallback until a valid published document exists.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Prisma 7, PostgreSQL, Zod 4, Vitest, Playwright, Pragmatic Drag and Drop.

**Spec:** `docs/superpowers/specs/2026-11-15-zyron-cms-2-page-builder-design.md`

## Global Constraints

- Preserve all existing URLs, products, media, SEO data, homepage content, and public visual fallback.
- Do not write to or migrate the production database and do not deploy production.
- Do not accept arbitrary scripts, raw HTML, or unrestricted CSS.
- Public routes read published content only; drafts require authenticated admin access.
- Every mutation enforces server-side permission, same-origin validation, Zod validation, and optimistic concurrency.

## Review Focus

- Invalid or future document schema versions fail closed and fall back publicly.
- Stale version writes return conflict without overwriting newer drafts.
- A draft never appears on the public homepage before publish.
- Responsive overrides inherit Desktop values and only allow bounded style fields.
- Rollback creates a new draft version and preserves the immutable historical snapshot.

---

### Task 1: Page document contract and database foundation

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20261115233000_page_builder_mvp/migration.sql`
- Modify: `lib/auth/permissions.ts`
- Modify: `prisma/seed-rbac.ts`
- Create: `lib/page-builder/schema.ts`
- Test: `tests/unit/page-builder/schema.test.ts`

- [x] Write failing schema and permission tests.
- [x] Verify the new tests fail for missing page document contract.
- [x] Add `SitePage`, `PageVersion`, relations, indexes, permissions, and bounded Zod document/style schemas.
- [x] Generate Prisma Client and run unit tests.

### Task 2: Registry and server renderers

**Files:**
- Create: `lib/page-builder/registry.ts`
- Create: `lib/page-builder/default-homepage.ts`
- Create: `components/page-builder/PageRenderer.tsx`
- Create: `components/page-builder/renderers.tsx`
- Test: `tests/unit/page-builder/registry.test.tsx`

- [ ] Write failing tests requiring at least 25 registered, editable, renderable components and safe unknown-node fallback.
- [ ] Verify tests fail.
- [ ] Implement registry defaults, schemas and server renderers without raw HTML.
- [ ] Run focused and full unit tests.

### Task 3: Page service and APIs

**Files:**
- Create: `lib/services/page-service.ts`
- Create: `lib/http/page-response.ts`
- Create: `app/api/admin/pages/route.ts`
- Create: `app/api/admin/pages/[id]/route.ts`
- Create: `app/api/admin/pages/[id]/publish/route.ts`
- Create: `app/api/admin/pages/[id]/versions/route.ts`
- Create: `app/api/admin/pages/[id]/rollback/route.ts`
- Test: `tests/integration/pages/page-service.test.ts`

- [ ] Write failing integration tests for permission, conflict, draft isolation, publish, immutable history, rollback, audit and revalidation.
- [ ] Apply the migration only to the test database and verify expected failures.
- [ ] Implement transactional service and thin API routes.
- [ ] Run integration and unit suites.

### Task 4: Admin page center and editor

**Files:**
- Modify: `components/admin/AdminSidebar.tsx`
- Create: `app/admin/pages/page.tsx`
- Create: `app/admin/pages/new/page.tsx`
- Create: `app/admin/pages/[id]/edit/page.tsx`
- Create: `app/admin/pages/[id]/preview/page.tsx`
- Create: `components/admin/pages/PageList.tsx`
- Create: `components/admin/pages/PageCreateForm.tsx`
- Create: `components/admin/pages/PageBuilder.tsx`
- Modify: `package.json`
- Modify: `package-lock.json`
- Test: `tests/unit/page-builder/editor.test.tsx`

- [ ] Write failing navigation and editor-state tests for add, select, reorder, duplicate, delete, undo/redo and device mode.
- [ ] Verify tests fail.
- [ ] Add the maintained drag-and-drop dependency and implement the Chinese three-column editor with keyboard fallback.
- [ ] Run focused UI tests, lint and typecheck.

### Task 5: Homepage published-content integration

**Files:**
- Create: `lib/repositories/page-repository.ts`
- Modify: `app/(site)/page.tsx`
- Create: `components/site/ManagedCompanyStrength.tsx`
- Create: `components/site/ManagedWhyChoose.tsx`
- Test: `tests/unit/page-builder/homepage-rendering.test.tsx`

- [ ] Write failing tests proving published content wins and missing/invalid/draft data keeps exact fallback content.
- [ ] Verify tests fail.
- [ ] Integrate the two managed homepage modules and render additional valid published nodes in the managed region.
- [ ] Run homepage and full unit tests.

### Task 6: End-to-end verification and handoff

**Files:**
- Create: `tests/e2e/admin-pages.spec.ts`
- Update: `docs/zyron-cms/cms-2-audit-2026-11-15.md`

- [ ] Add the real admin edit-preview-publish-public-rollback E2E flow.
- [ ] Run Prisma validation/generation, typecheck, lint, unit, integration and Playwright.
- [ ] Run production build and inspect desktop/mobile editor plus homepage in Browser.
- [ ] Review diff for secrets, generated output, unrelated changes and production writes.
- [ ] Commit the verified branch; create Preview only after code checks pass. Do not deploy Production.
