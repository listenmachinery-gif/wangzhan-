# About ZYRON Reference Modules Implementation Plan

> **For implementer:** REQUIRED SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver and publish the refined eight-module About ZYRON page and matching CMS controls.

**Architecture:** Extend the existing PageBuilder registry with five About-specific component contracts and renderers. Reuse the existing JSON page document, media-library URL workflow, real inquiry form, SEO route and versioned publication API; no new database tables are needed.

**Tech Stack:** Next.js, React, TypeScript, Zod, CSS Modules, Vitest, Testing Library, Playwright, Prisma-backed PageBuilder publication.

---

### Task 1: Define the five CMS component contracts

- [ ] Add failing schema/registry/default-document tests.
- [ ] Add the five component types to `lib/page-builder/schema.ts`.
- [ ] Add strict Zod schemas, safe defaults and Chinese editor fields in `lib/page-builder/registry.ts`.
- [ ] Replace generic nodes four through eight in `lib/page-builder/about-zyron-content.ts` with publish-safe About-specific nodes.
- [ ] Run targeted unit tests.

### Task 2: Build the high-fidelity responsive sections

- [ ] Add failing rendering tests for eight-section hierarchy, layout markers, alt text, links and real inquiry form.
- [ ] Constrain hero copy and reverse the company overview desktop composition.
- [ ] Implement modules four through eight with semantic headings and responsive CSS.
- [ ] Wire the new renderers into `components/page-builder/renderers.tsx`.
- [ ] Run targeted rendering tests.

### Task 3: Preserve publishing, SEO and compatibility

- [ ] Extend route, publisher and verifier tests for the new eight-module document.
- [ ] Keep the existing URL, metadata, structured data, versioning and cache invalidation behavior.
- [ ] Confirm no migration or production data reset is needed.
- [ ] Run all About-focused unit and integration tests.

### Task 4: Verify, review and release

- [ ] Run dependency install, typecheck, lint, unit tests, integration tests and production build.
- [ ] Inspect screenshots at 1440, 1024, 768 and 390 pixels and correct visual defects.
- [ ] Run the final UI detector and independent finish review.
- [ ] Commit and push the feature branch, validate Preview, merge through the repository workflow, deploy production, publish the new CMS document and verify `/factory` plus `/admin/about`.
