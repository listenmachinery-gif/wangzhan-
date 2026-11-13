# Small Electric Shear Applicable Industries Gallery Implementation Plan

**Goal:** Add and deploy a responsive nine-card applicable-industries module directly below the technical parameters.

**Architecture:** Extend the typed page-content model with an optional industry gallery. Render it as static server-side markup inside `ShearingSolutionPage` and store optimized WebP files under the Small Electric Shear media directory.

**Tech stack:** Next.js, React, TypeScript, Tailwind CSS, `next/image`, Node verification scripts, Vercel.

## Task 1: Add a failing gallery contract

**Files:**
- Modify: `scripts/verify-small-electric-shear-media.mjs`

1. Add exact expectations for all nine image paths, titles, and descriptions.
2. Assert the section appears after the technical parameters and before the model guide/comparison content.
3. Assert desktop three-column layout, text-below-image structure, and reduced-motion hover styling.
4. Run the focused media verification and confirm it fails because the gallery is absent.

## Task 2: Add optimized assets and typed content

**Files:**
- Create: `public/products/shearing/small-electric/industries/*.webp`
- Modify: `data/shearing-solution-types.ts`
- Modify: `data/small-electric-shear-page.ts`

1. Convert the nine 836 × 628 supplied PNG files to optimized WebP assets.
2. Add the industry-gallery item and section types.
3. Add exact English titles, descriptions, descriptive alt text, and requested item order.

## Task 3: Render the responsive module

**Files:**
- Modify: `components/ShearingSolutionPage.tsx`

1. Render the gallery immediately below the technical section.
2. Use a 1/2/3-column grid with separate image and content regions.
3. Add image-only hover zoom, overflow clipping, and reduced-motion support.
4. Re-run the focused contract until it passes.

## Task 4: Verify and deploy

1. Run media, SEO, TypeScript, lint, and production-build checks.
2. Inspect desktop and mobile layouts, image loading, text placement, hover behavior, and console health in Browser.
3. Commit, fast-forward merge to `main`, push, and wait for the production deployment.
4. Verify the live URL and module placement below the parameter table.
