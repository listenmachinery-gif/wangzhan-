# ZYRON Homepage CMS Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish the document-specified ZYRON homepage with six editable CMS modules, supplied media, real product links, and the existing inquiry CRM.

**Architecture:** Extend the existing SitePage PageBuilder with purpose-built homepage component types and focused responsive renderers. Keep SitePage/PageVersion publishing, MediaAsset selection, Navigation footer management, and `/api/inquiry`; use an explicit idempotent production content script so deploying code cannot silently overwrite the current homepage.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Prisma/PostgreSQL, Vitest, Testing Library, Playwright, Vercel.

**Spec:** `docs/superpowers/specs/2026-11-24-homepage-cms-redesign-design.md`

## Global Constraints

- Preserve all existing product records, technical parameters, SEO, navigation, inquiries, CRM data, media and URLs.
- Use only the ten user-supplied ZYRON images and convert them to optimized permanent site assets without visual alteration.
- Use exactly the supplied English homepage copy and confirmed company figures.
- Do not invent article bodies, dates, customer claims, certifications, addresses, phone numbers or external links.
- Do not add a second CMS, animation library or UI framework.
- Code deployment must not automatically mutate production content; the explicit content publish step is audited and reversible.

## Review Focus

- Rapid product-tab clicks must never pair one product's copy with another product's image.
- Draft or linkless news items must not render as clickable published articles.
- Reduced-motion users must receive stable content without count-up or transition dependence.
- Homepage inquiry errors, double submissions and malformed fields must follow the existing secure API contract.
- Existing published home documents with legacy module types must continue rendering without forced conversion.

---

### Task 1: Homepage content contract and supplied assets

**Files:**
- Create: `lib/homepage/homepage-content.ts`
- Modify: `lib/page-builder/schema.ts`
- Modify: `lib/page-builder/registry.ts`
- Modify: `lib/page-builder/default-homepage.ts`
- Create: `tests/unit/page-builder/homepage-redesign-schema.test.ts`
- Create: optimized assets under `public/images/about/` and `public/images/products/`

**Interfaces:**
- Produces: `homepageRedesignDocument: PageDocument` and six new `HOME_*` component definitions.
- Consumes: existing PageDocument schema, structured repeater editor and durable site-relative media paths.

- [ ] Write failing schema tests that validate the six ordered modules, exact product routes/copy, draft news safety fields, supplied media paths and legacy document compatibility.
- [ ] Run the focused test and confirm failure because the component types and document do not exist.
- [ ] Add the six component types, strict content schemas and editor fields; add `homepageRedesignDocument` without replacing `defaultHomepageDocument`.
- [ ] Convert the ten supplied PNGs to high-quality WebP at the exact permanent paths and verify dimensions and size.
- [ ] Run schema and existing PageBuilder schema tests; expect all pass.
- [ ] Commit `feat(homepage): define editable homepage redesign content`.

### Task 2: Responsive public homepage modules

**Files:**
- Create: `components/site/home/HomeHeroSection.tsx`
- Create: `components/site/home/HomeAboutSection.tsx`
- Create: `components/site/home/HomeProductShowcase.tsx`
- Create: `components/site/home/HomeWhyChooseSection.tsx`
- Create: `components/site/home/HomeNewsInsights.tsx`
- Create: `components/site/home/HomeContactSection.tsx`
- Modify: `components/InquiryForm.tsx`
- Modify: `components/page-builder/renderers.tsx`
- Create: `tests/unit/homepage/homepage-sections.test.tsx`
- Create: `tests/unit/homepage/product-showcase.test.tsx`
- Create: `tests/unit/homepage/contact-section.test.tsx`

**Interfaces:**
- Consumes: Task 1 content records and existing `/api/inquiry` payload contract.
- Produces: accessible renderer implementations for all six `HOME_*` types.

- [ ] Write failing tests for semantic headings, full un-cropped media, product click/keyboard state, rapid clicks, mobile order, reduced motion, news filtering and quote-form focus/submission states.
- [ ] Run focused tests and confirm expected missing-renderer failures.
- [ ] Implement focused components using Next Image, fixed aspect-ratio containers, accessible buttons, stable state and existing brand tokens.
- [ ] Extend InquiryForm through explicit props rather than duplicating the API, validation and analytics workflow.
- [ ] Register renderers and ensure all editable text exposes `data-page-text` hooks.
- [ ] Run focused tests and existing inquiry/page-renderer tests; expect all pass.
- [ ] Commit `feat(homepage): build responsive interactive homepage sections`.

### Task 3: Dedicated homepage administration

**Files:**
- Create: `app/admin/homepage/page.tsx`
- Create: `components/admin/pages/HomepageAdmin.tsx`
- Modify: `components/admin/AdminSidebar.tsx`
- Modify: `components/admin/AdminBreadcrumbs.tsx`
- Modify: `components/admin/pages/PageBuilder.tsx`
- Modify: `components/admin/pages/PageCreateForm.tsx`
- Modify: `lib/services/page-service.ts`
- Create: `tests/unit/admin/homepage-admin.test.tsx`
- Modify: `tests/unit/page-builder/editor.test.tsx`

**Interfaces:**
- Consumes: `homepageRedesignDocument`, PageService permissions and existing PageBuilder.
- Produces: `/admin/homepage`, a safe create/open flow and Footer shortcut.

- [ ] Write failing tests for permission-filtered navigation, existing-home open behavior, empty-state creation, six module labels, media replacement and Footer shortcut.
- [ ] Run focused tests and confirm failures.
- [ ] Add a page-service slug lookup and dedicated admin page without auto-writing on GET.
- [ ] Add the sidebar/breadcrumb entry and template creation path.
- [ ] Add home-only PageBuilder navigation to Footer management and structured status editing for news items.
- [ ] Run focused tests and admin navigation/PageBuilder tests; expect all pass.
- [ ] Commit `feat(admin): add unified homepage management`.

### Task 4: Safe public takeover and publish lifecycle

**Files:**
- Modify: `app/(site)/page.tsx`
- Modify: `lib/page-builder/default-homepage.ts`
- Create: `scripts/publish-homepage-redesign.ts`
- Create: `tests/unit/page-builder/homepage-rendering.test.tsx`
- Create: `tests/integration/pages/homepage-publication.test.ts`

**Interfaces:**
- Consumes: tasks 1-3 homepage document and PageService transactional version/media behavior.
- Produces: explicit homepage takeover only for a published `HOME_HERO`, plus an audited idempotent publish script.

- [ ] Write failing tests proving legacy pages remain unchanged, a published redesign takes over all six sections, drafts stay private, publication revalidates `/`, and the script creates a new recoverable version without deleting other content.
- [ ] Run focused tests and confirm failures.
- [ ] Update the home route to recognize the explicit redesign marker while preserving all previous fallback modes.
- [ ] Implement a production-guarded idempotent script that snapshots the previous content, synchronizes media references and publishes through the service layer.
- [ ] Run unit and integration tests; expect all pass.
- [ ] Commit `feat(homepage): add reversible redesign publication`.

### Task 5: Browser acceptance, deployment and production release

**Files:**
- Create: `tests/e2e/homepage-redesign.spec.ts`
- Modify only defects found by verification.
- Store screenshots under `.playwright/screenshots/homepage-redesign/`.

**Interfaces:**
- Consumes: complete homepage/admin implementation.
- Produces: verified branch, Draft PR, Preview deployment and approved production publication.

- [ ] Add Playwright coverage at 1920, 1440, 1024, 768 and 375 widths for module order, no overflow, product switching, image containment, admin media editing, draft/publish/rollback and real test-database inquiry storage.
- [ ] Run `npm run typecheck`, `npm run lint`, unit tests, integration tests and `npm run build`; all must pass.
- [ ] Run the E2E suite against the isolated test database and inspect representative screenshots.
- [ ] Review the complete diff for secrets, build artifacts, unverified claims and unintended production writes.
- [ ] Push the feature branch, create/update its Draft PR against the phase-2 branch, and wait for Vercel Preview checks.
- [ ] Verify Preview core routes, admin authentication boundary and inquiry API behavior.
- [ ] Merge the prerequisite branch chain through the repository's existing PR flow, apply the guarded homepage content publication, deploy production, and verify `www.zyroncnc.com`.
- [ ] Record production deployment ID, final commit, public route checks and rollback version.
