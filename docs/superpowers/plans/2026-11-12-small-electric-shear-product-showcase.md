# Small Electric Shear Product Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a polished four-image product showcase immediately above the Small Electric Shearing Machine details section and deploy it to production.

**Architecture:** Four supplied photos become optimized local WebP assets configured through optional typed page content. A small client component owns active-image state, thumbnail selection, and wrapping previous/next controls; the existing server-rendered page only composes the section.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, `next/image`, Node assertion scripts, Playwright fallback.

**Spec:** `docs/superpowers/specs/2026-11-12-small-electric-shear-product-showcase-design.md`

## Global Constraints

- Use only the four supplied photographs; do not use generated midpoint images.
- Place the showcase after Product Overview and before Machine Details.
- Preserve all eight existing detail cards and their order.
- No new runtime dependency.

## Review Focus

- Previous/next controls wrap at both ends.
- Thumbnail buttons expose their selected state and accessible labels.
- The 1672:941 product images use `object-contain` and are not cropped.
- Mobile thumbnail navigation does not cause page-level horizontal overflow.
- The section appears only on pages with `productShowcase` content.

---

### Task 1: Four-image content and asset contract

**Files:**
- Delete: `components/product-spin-utils.ts`
- Create: `public/products/shearing/small-electric/showcase/front-left.webp`
- Create: `public/products/shearing/small-electric/showcase/front-right.webp`
- Create: `public/products/shearing/small-electric/showcase/rear-left.webp`
- Create: `public/products/shearing/small-electric/showcase/rear-right.webp`
- Modify: `data/shearing-solution-types.ts`
- Modify: `data/small-electric-shear-page.ts`
- Modify: `scripts/verify-small-electric-shear-media.mjs`

- [ ] Add failing assertions for exact copy, four ordered distinct local WebP paths, labels, alt text, and existing files.
- [ ] Confirm media verification fails because `productShowcase` is absent.
- [ ] Convert the four supplied images to optimized WebP files and add typed content.
- [ ] Confirm media and SEO contracts pass; commit.

### Task 2: Interactive showcase and placement

**Files:**
- Create: `components/ProductShowcase.tsx`
- Modify: `components/ShearingSolutionPage.tsx`
- Modify: `scripts/verify-small-electric-shear-media.mjs`

- [ ] Add failing assertions for component integration before details, thumbnail selection, wrapping controls, and accessible selected state.
- [ ] Confirm media verification fails because the component is absent.
- [ ] Implement the responsive image stage, thumbnails, and previous/next controls.
- [ ] Confirm media/SEO contracts pass; commit.

### Task 3: Verification, merge, and deployment

- [ ] Run lint, media/SEO contracts, and production build.
- [ ] Verify desktop and mobile rendering and interactions with Playwright because Browser/IAB is unavailable.
- [ ] Inspect screenshots with `view_image`, remove temporary QA artifacts, and self-review the branch.
- [ ] Merge to `main`, re-run verification, push, deploy production, and verify the live URL.
