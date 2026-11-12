# Small Electric Shear Material Range Gallery Implementation Plan

**Goal:** Add and deploy a responsive nine-image material gallery after the backgauge carousel.

**Architecture:** Extend the existing typed page-content model with an optional material-range gallery. Render it in `ShearingSolutionPage` as server-side static markup and store optimized WebP files under the Small Electric Shear media directory.

**Tech stack:** Next.js, React, TypeScript, Tailwind CSS, `next/image`, Node verification scripts, Vercel.

## Task 1: Add a failing content and placement contract

**Files:**
- Modify: `scripts/verify-small-electric-shear-media.mjs`

1. Add exact expectations for the nine image paths and labels.
2. Assert the new section appears after the backgauge carousel and before the problems section.
3. Assert the grid includes the requested desktop three-column layout and centered captions.
4. Run `npm run verify:small-electric-shear-media` and confirm failure because the gallery does not exist.

## Task 2: Add optimized assets and typed data

**Files:**
- Create: `public/products/shearing/small-electric/material-range/*.webp`
- Modify: `data/shearing-solution-types.ts`
- Modify: `data/small-electric-shear-page.ts`

1. Convert the nine 836 × 628 source images to optimized WebP files.
2. Add the gallery item and section types.
3. Add English heading, qualified capacity note, alt text, and exact item order.

## Task 3: Render the responsive section

**Files:**
- Modify: `components/ShearingSolutionPage.tsx`

1. Render the new section after `BackgaugeCarousel`.
2. Use a 1/2/3-column responsive grid with 4:3 image cards.
3. Add centered lower captions, readable gradient overlay, hover zoom, and reduced-motion support.
4. Re-run the focused contract until it passes.

## Task 4: Verify and deploy

1. Run media, SEO, TypeScript, lint, and production-build checks.
2. Inspect desktop and mobile layouts in the browser, including image loading and console health.
3. Commit, fast-forward merge to `main`, push, and wait for the production deployment.
4. Verify the live URL and section placement.
