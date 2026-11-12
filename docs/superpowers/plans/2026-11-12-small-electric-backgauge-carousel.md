# Small Electric Shear Backgauge Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add and deploy a responsive three-option backgauge carousel below the Small Electric Shearing Machine detail gallery.

**Architecture:** Extend the typed page content with a backgauge-carousel data model, create a focused client component for selection and swipe behavior, and compose it in the generic solution page only when content is present. Optimize the supplied images into local WebP assets and protect the feature with the existing Small Electric Shear media contract.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, `next/image`, Lucide icons, Node assertion scripts, Sharp.

**Spec:** `docs/superpowers/specs/2026-11-12-small-electric-backgauge-carousel-design.md`

## Global Constraints

- Render after `data-section="details-gallery"` and before `data-section="problems"`.
- Keep the exact three English titles and benefits defined in the spec.
- Use local distinct WebP assets derived from the three supplied images.
- Do not add a carousel dependency or autoplay.
- Preserve existing Product Showcase and Machine Details content.

## Review Focus

- Zero or one carousel item must not cause modulo-by-zero or broken controls; page content provides exactly three and the component returns `null` for zero.
- Pointer movement must only trigger a slide after a deliberate horizontal swipe, while vertical scrolling remains available.
- Long English copy must remain readable over all three differently composed photographs.
- Arrow and selector controls must expose accessible labels, active state, and visible focus treatment.
- Mobile layout must avoid horizontal overflow and preserve the main machine subject.

---

### Task 1: Lock the media and placement contract

**Files:**
- Modify: `scripts/verify-small-electric-shear-media.mjs`

**Interfaces:**
- Consumes: existing `smallElectricShearPageContent` and solution-page source contract.
- Produces: failing assertions for `backgaugeCarousel`, three WebP assets, component accessibility/interaction markers, and section placement.

- [ ] **Step 1: Write assertions for exact copy, asset paths, local files, distinct images, component controls, swipe handling, reduced-motion styling, and placement.**
- [ ] **Step 2: Run `npm run verify:small-electric-shear-media`.**
  - Expected: FAIL because `backgaugeCarousel` and `BackgaugeCarousel.tsx` do not exist.
- [ ] **Step 3: Commit the failing contract.**

### Task 2: Add optimized assets and typed content

**Files:**
- Create: `public/products/shearing/small-electric/backgauge-options/manually-adjustable-backgauge.webp`
- Create: `public/products/shearing/small-electric/backgauge-options/handwheel-adjustable-backgauge.webp`
- Create: `public/products/shearing/small-electric/backgauge-options/motorized-backgauge.webp`
- Modify: `data/shearing-solution-types.ts`
- Modify: `data/small-electric-shear-page.ts`

**Interfaces:**
- Consumes: exact spec copy and optimized asset paths asserted by Task 1.
- Produces: `ShearingBackgaugeCarousel` and `ShearingSolutionContent.backgaugeCarousel` for rendering.

- [ ] **Step 1: Convert the three supplied images to quality-88 WebP assets.**
- [ ] **Step 2: Add the carousel types and exact content.**
- [ ] **Step 3: Run `npm run verify:small-electric-shear-media`.**
  - Expected: FAIL only because the component and placement are still absent.
- [ ] **Step 4: Commit the typed content and assets.**

### Task 3: Build and compose the responsive carousel

**Files:**
- Create: `components/BackgaugeCarousel.tsx`
- Modify: `components/ShearingSolutionPage.tsx`

**Interfaces:**
- Consumes: `ShearingBackgaugeCarousel` from Task 2.
- Produces: a client component with previous/next wrapping, direct selection, horizontal swipe, responsive overlay, and accessible state.

- [ ] **Step 1: Implement the minimum client component required by the contract.**
- [ ] **Step 2: Render it immediately after the detail gallery.**
- [ ] **Step 3: Run `npm run verify:small-electric-shear-media`.**
  - Expected: PASS.
- [ ] **Step 4: Run `npm run verify:small-electric-shear-seo`, `npx tsc --noEmit`, and `npm run lint`.**
  - Expected: all PASS with no new warnings.
- [ ] **Step 5: Commit the component and placement.**

### Task 4: Production and visual verification

**Files:**
- Modify only if browser verification reveals a covered defect.

**Interfaces:**
- Consumes: complete feature branch.
- Produces: production build evidence, desktop/mobile screenshots, working interaction evidence, and deployment-ready branch.

- [ ] **Step 1: Run `npm run build`.**
  - Expected: exit 0.
- [ ] **Step 2: Run the production server and verify desktop placement, all three transitions, active state, copy, and console logs in Browser/IAB.**
- [ ] **Step 3: Verify a 390 x 844 viewport for readable copy, controls, swipe, and no horizontal overflow.**
- [ ] **Step 4: Inspect the supplied references and latest desktop/mobile screenshots with `view_image`; record five comparison points and fix material drift.**
- [ ] **Step 5: Re-run media, SEO, TypeScript, lint, and build; commit any verified fixes.**

### Task 5: Merge, deploy, and verify production

**Files:**
- No planned source changes.

**Interfaces:**
- Consumes: verified feature branch.
- Produces: merged `main`, pushed deployment commit, successful Vercel status, and live-page verification.

- [ ] **Step 1: Merge the feature branch into `main` locally.**
- [ ] **Step 2: Re-run the complete verification suite on merged `main`.**
- [ ] **Step 3: Push `main` to `origin` and wait for the GitHub `Vercel` status to report success.**
- [ ] **Step 4: Verify the production carousel and three options on the live URL.**
