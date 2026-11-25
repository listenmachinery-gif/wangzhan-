# About ZYRON CMS Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/factory` fallback with a premium, responsive About ZYRON experience driven by the existing CMS, with editable media, safe factual copy, complete SEO, and production publication.

**Architecture:** Add three purpose-built PageBuilder components for the supplied hero, company overview, and manufacturing references, then compose the remaining About journey from existing safe CMS components. The public route renders the published `company` document when it uses the new About component types and otherwise renders the versioned default document, preserving rollback and avoiding a second content system.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS/CSS Modules, Prisma/PostgreSQL, Zod, Vitest, Playwright, Vercel.

**Spec:** `/Users/zhangmingwei/Desktop/关于我们首页.docx`

## Global Constraints

- Keep `/factory` as the public URL and preserve the shared Header, navigation, inquiry workflow, permissions, and production data.
- Use `#80C900`, `#0B0D10`, `#1A1D21`, `#595E66`, `#FFFFFF`, and `#D1D5DB` as the About visual palette.
- Do not publish unverified company size, certification, customer, or ranking claims.
- Store CMS media as durable site-relative URLs and retain draft, preview, publish, and rollback behavior.
- The page must have one H1, semantic H2/H3 structure, canonical metadata, Open Graph data, and structured data.
- No database schema migration is required; production content changes must create version/audit history.

## Review Focus

- A legacy `company` record without the new About hero must not suppress the upgraded default page.
- A CMS image URL from `/api/media/<id>` must render and remain tracked by the existing media-reference mechanism.
- Mobile widths must not inherit the desktop diagonal geometry in a way that clips text or causes horizontal scrolling.
- Publishing slug `company` must invalidate `/factory`, not a non-existent `/company` route.
- Production publication must preserve the previous page snapshot for rollback and avoid unverified statistics/certifications.

---

### Task 1: About document contract and optimized assets

**Files:**
- Create: `lib/page-builder/about-zyron-content.ts`
- Modify: `lib/page-builder/schema.ts`
- Modify: `lib/page-builder/registry.ts`
- Create: `tests/unit/page-builder/about-zyron-content.test.ts`
- Create: `public/images/about/*.webp`

**Interfaces:**
- Produces: `aboutZyronDocument: PageDocument` and PageBuilder component types `ABOUT_HERO`, `ABOUT_COMPANY_OVERVIEW`, `ABOUT_MANUFACTURING`.

- [ ] Write tests asserting the three custom nodes, safe copy, valid media paths, unique IDs, and absence of unverified numeric/certification claims.
- [ ] Run the test and verify it fails because the document and types do not exist.
- [ ] Add the schema and registry definitions, default content, editable fields, and optimized WebP assets from the user-supplied originals.
- [ ] Run the focused test and verify it passes.

### Task 2: High-fidelity responsive About sections

**Files:**
- Create: `components/company/cms/IndustrialCta.tsx`
- Create: `components/company/cms/AboutHeroSection.tsx`
- Create: `components/company/cms/AboutCompanyOverviewSection.tsx`
- Create: `components/company/cms/AboutManufacturingSection.tsx`
- Create: `components/company/cms/about-sections.module.css`
- Modify: `components/page-builder/renderers.tsx`
- Create: `tests/unit/page-builder/about-zyron-rendering.test.tsx`

**Interfaces:**
- Consumes: the content shapes from Task 1.
- Produces: accessible, semantic renderers with one H1, responsive diagonal geometry, shared CTA, and media-library-compatible images.

- [ ] Write rendering tests for semantic headings, exact approved copy, image alt text, CTA routes, and hidden decorative layers.
- [ ] Run the test and verify it fails because renderers do not exist.
- [ ] Implement the three components and connect them to `renderNodeContent`.
- [ ] Run rendering tests and verify they pass.

### Task 3: Public route, SEO, structured data, and admin shortcut

**Files:**
- Modify: `app/(site)/factory/page.tsx`
- Create: `components/company/CompanyStructuredData.tsx`
- Modify: `components/company/CompanyPage.tsx`
- Create: `app/admin/about/page.tsx`
- Modify: `components/admin/AdminSidebar.tsx`
- Modify: `lib/services/page-service.ts`
- Modify: `tests/integration/pages/page-service.test.ts`
- Modify: `scripts/verify-about-zyron-page.mjs`

**Interfaces:**
- Consumes: `aboutZyronDocument` and published `company` records.
- Produces: `/factory`, `/admin/about`, and correct cache invalidation for the `company` slug.

- [ ] Add failing tests for default-vs-published selection, `/factory` revalidation, one H1, structured data, canonical metadata, and the Chinese admin navigation entry.
- [ ] Run the tests and verify the expected failures.
- [ ] Implement the public selection rule, structured data extraction, metadata improvements, admin shortcut, and revalidation mapping.
- [ ] Run the focused tests and verifier and verify they pass.

### Task 4: Safe production bootstrap and SEO publication

**Files:**
- Create: `scripts/publish-about-zyron.ts`
- Modify: `package.json`
- Create: `tests/unit/scripts/publish-about-zyron.test.ts`

**Interfaces:**
- Consumes: `aboutZyronDocument`, Prisma, and the administrator account `admin@zyroncnc.com`.
- Produces: versioned `company` page publication plus a published `/factory` SEO snapshot and audit history.

- [ ] Write a failing source-contract test proving the script snapshots existing content, increments real versions, writes audit logs, and never deletes page or SEO records.
- [ ] Run the test and verify it fails because the script does not exist.
- [ ] Implement an idempotent publication script with a dry-run default and explicit `--apply` mode.
- [ ] Run the focused test and verify it passes.

### Task 5: Visual QA, complete verification, and deployment

**Files:**
- Create: `.impeccable/review/desktop.png`
- Create: `.impeccable/review/mobile.png`
- Update only files required by findings.

**Interfaces:**
- Consumes: all prior tasks.
- Produces: verified Preview and Production deployments and a rollback-ready production publication.

- [ ] Run dependency install, typecheck, lint, unit tests, integration tests, About verifier, and production build.
- [ ] Capture and inspect desktop and mobile screenshots, run the design detector once, and batch-fix material findings.
- [ ] Deploy Preview and verify `/factory`, `/admin/login`, static media, and authenticated admin route behavior.
- [ ] Commit and push the branch, merge through the repository’s current process, deploy Production, then execute `npm run about:publish -- --apply` with production environment variables.
- [ ] Verify the production domain, CMS publication, metadata, page assets, mobile rendering, and rollback history.
