# About ZYRON Content Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match the requested About module content/layout changes and make CMS text styles, line breaks, and the global map image work end to end.

**Architecture:** Extend the existing About component schemas and renderers. Preserve the current page document and publication path, while repairing the DOM-to-style selector contract and reusing the existing media library picker.

**Tech Stack:** Next.js, React, TypeScript, Zod, Vitest, Testing Library, CSS Modules, Vercel.

**Spec:** `docs/superpowers/specs/2026-11-26-about-zyron-content-controls-design.md`

## Global Constraints

- Preserve all routes, SEO routing, inquiry behavior, and database schema.
- Keep modules 3, 5, 6, and 8 structurally unchanged.
- Use durable local or `/api/media/:id` media URLs.
- Publish only after the full verification sequence passes.

## Review Focus

- Explicit newlines remain visible on desktop, tablet, and mobile.
- Text style selectors target only the selected text field.
- The global image picker updates image URL and matching alt text.
- Existing About documents without the new map fields fail safely or receive defaults through publication.
- Mobile grids remain readable after forced multi-line labels.

---

### Task 1: Lock requested content and rendering behavior

**Files:**
- Modify: `tests/unit/page-builder/about-zyron-content.test.ts`
- Modify: `tests/unit/page-builder/registry.test.tsx`
- Modify: `tests/unit/page-builder/editor.test.tsx`

- [ ] Write failing tests for exact module 1/2 line breaks, module 4 copy/data, module 7 map media fields, About text-style selectors, and multiline editors.
- [ ] Run the focused tests and confirm they fail for the missing behavior.

### Task 2: Implement content, map media, and typography bindings

**Files:**
- Modify: `lib/page-builder/about-zyron-content.ts`
- Modify: `lib/page-builder/registry.ts`
- Modify: `components/company/cms/AboutHeroSection.tsx`
- Modify: `components/company/cms/AboutCompanyOverviewSection.tsx`
- Modify: `components/company/cms/AboutManufacturingSection.tsx`
- Modify: `components/company/cms/AboutReferenceSections.tsx`
- Modify: `components/company/cms/IndustrialCta.tsx`
- Modify: `components/InquiryForm.tsx`
- Modify: `components/company/cms/about-sections.module.css`
- Modify: `components/company/cms/about-reference-sections.module.css`

- [ ] Implement the requested copy, explicit line breaks, equal label alignment, exact numbers layout, and replaceable global map image.
- [ ] Add precise `data-page-text` bindings to every scalar editable About text field.
- [ ] Run the focused renderer/content tests until green.

### Task 3: Repair editor multiline and media contracts

**Files:**
- Modify: `components/admin/pages/PageBuilder.tsx`
- Modify: `components/page-builder/PageRenderer.tsx`

- [ ] Render text fields and repeater text fields as multiline controls while preserving URLs and enum controls.
- [ ] Recognize `mapImage` as a media field and synchronize `mapImageAlt`.
- [ ] Preserve newlines globally for CMS text nodes.
- [ ] Run editor tests until green.

### Task 4: Verify, review, and release

- [ ] Run typecheck, lint, all tests, and production build.
- [ ] Visually inspect the About page at desktop and mobile widths.
- [ ] Review the full diff for unintended changes and secrets.
- [ ] Commit, push, create/update PR, verify Preview, merge, verify production deployment, and publish the About CMS document.

