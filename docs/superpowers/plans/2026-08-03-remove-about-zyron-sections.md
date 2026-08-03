# Remove About ZYRON Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove four specified sections from the About ZYRON page and keep the remaining page, SEO, and inquiry flow coherent.

**Architecture:** Keep the existing server-rendered page composition, remove the unused section components and data at their current boundaries, and retarget the hero CTA to the product system. Preserve all remaining section components and structured data.

**Tech Stack:** Next.js 15 App Router, React, TypeScript, Tailwind CSS, Node contract verifier.

## Global Constraints

- Remove Manufacturing Capabilities, Testing Before Delivery, Certificates, and Factory Gallery completely.
- Do not change the remaining About ZYRON content or product routes beyond copy needed to avoid stale references.
- Keep one H1, the direct About ZYRON navigation link, inquiry functionality, and Organization/WebPage/Breadcrumb/FAQ JSON-LD.
- Do not add dependencies or replacement imagery.

---

### Task 1: Define the reduced page contract

**Files:**
- Modify: `scripts/verify-about-zyron-page.mjs`

**Interfaces:**
- Consumes: About page component source files.
- Produces: A verifier requiring 12 allowed sections and rejecting the four removed sections.

- [ ] **Step 1: Write the failing contract assertions**

Change the expected section list to the 12 retained section markers, assert that `manufacturing`, `testing`, `certificates`, and `factory-gallery` are absent, require `id="product-system"`, and require the “Explore Product System” CTA.

- [ ] **Step 2: Run the verifier to confirm RED**

Run: `npm run verify:about-zyron`

Expected: FAIL because the current page still renders one or more removed sections.

- [ ] **Step 3: Commit the contract change with the implementation**

The test remains failing until Task 2 provides the requested behavior.

### Task 2: Remove the sections and stale entry points

**Files:**
- Modify: `app/factory/page.tsx`
- Modify: `components/company/CompanyPage.tsx`
- Modify: `components/company/CompanyHero.tsx`
- Modify: `components/company/ProductSystem.tsx`
- Modify: `components/company/EngineeringQualitySections.tsx`
- Modify: `components/company/CompanySupportSections.tsx`
- Modify: `data/company.ts`
- Delete: `components/company/ManufacturingCapabilities.tsx`
- Delete: `components/company/TestingVideo.tsx`
- Delete: `components/company/CompanyMediaDialog.tsx`

**Interfaces:**
- Consumes: Existing About ZYRON section components and centralized company data.
- Produces: A 12-section `/factory` page with a valid product-system anchor.

- [ ] **Step 1: Implement the minimal page-composition change**

Remove the four section renders and imports, retarget the hero CTA to `#product-system`, and add that ID to the Product System section.

- [ ] **Step 2: Remove dead client components and data**

Delete the manufacturing component, testing video, and media dialog; remove the data arrays used only by the deleted sections and their now-unused imports.

- [ ] **Step 3: Update metadata copy**

Remove testing and certificates from the route and WebPage schema descriptions while preserving the approved page title and canonical URL.

- [ ] **Step 4: Run the focused verifier to confirm GREEN**

Run: `npm run verify:about-zyron`

Expected: `About ZYRON company page contract passed.`

### Task 3: Regression, visual QA, and release

**Files:**
- Verify only.

**Interfaces:**
- Consumes: The completed implementation.
- Produces: Evidence that the change is safe to merge and deploy.

- [ ] **Step 1: Run all page contracts, lint, and production build**

Run every `verify:*` script, then `npm run lint` and `npm run build`; expect exit code 0.

- [ ] **Step 2: Inspect `/factory` at desktop and mobile widths**

Confirm 12 sections, one H1, no horizontal overflow, a working Product System CTA, and no console errors.

- [ ] **Step 3: Commit, merge, push, and deploy**

Commit as `refactor: remove About ZYRON evidence sections`, fast-forward `main`, push `main`, deploy the existing Vercel project, and verify production HTML excludes all four removed section markers.
