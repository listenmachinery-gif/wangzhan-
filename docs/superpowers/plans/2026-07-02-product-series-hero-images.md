# Product Series Hero Images Implementation Plan

> **For Codex:** Follow the confirmed design exactly. Preserve existing copy, data, navigation, and product-card content.

**Goal:** Add the supplied hero images and readable masks to the products index and all eight series pages, then deploy the verified result.

**Architecture:** Extend `ProductCategory` with a dedicated `heroImage` path, store the eight optimized source assets under one public directory, and render the series hero as a full-bleed background with layered overlays. Keep the existing `image` field for category cards and product media.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Node source-contract test, Vercel deployment through the existing GitHub integration.

---

### Task 1: Add a failing hero contract test

**Files:**
- Create: `scripts/verify-product-series-heroes.mjs`

1. Assert that all eight public hero files exist.
2. Assert that each category contains the expected `heroImage` mapping.
3. Assert that the series page renders `category.heroImage` and exposes stable hero/mask hooks.
4. Assert that the products index exposes a stable mask hook.
5. Run the script and confirm it fails before implementation.

### Task 2: Add hero assets and category mappings

**Files:**
- Create: `public/products/series-heroes/*.png`
- Modify: `data/products.ts`

1. Copy the eight supplied images using ASCII, kebab-case filenames.
2. Add `heroImage` to `ProductCategory`.
3. Map every category to its matching new asset.
4. Use the new image for series-page Open Graph metadata.

### Task 3: Build the masked series hero

**Files:**
- Modify: `app/products/series/[id]/page.tsx`

1. Replace the split hero media column with a full-bleed background image.
2. Add a neutral dimming layer, localized left text mask, and bottom fade.
3. Keep existing copy, buttons, back link, and downstream page sections unchanged.
4. Ensure mobile text width and spacing remain readable.

### Task 4: Strengthen the products index mask

**Files:**
- Modify: `app/products/page.tsx`

1. Retain the current hero image and content.
2. Add a centered localized contrast mask plus top and bottom fades.
3. Preserve the current full-screen composition.

### Task 5: Verify and deploy

1. Run the hero contract test and confirm it passes.
2. Run `git diff --check`, `npx tsc --noEmit`, and `npm run build`.
3. Inspect the products index and all eight series pages in the in-app browser at desktop and mobile widths.
4. Commit and push the implementation to the existing deployment branch.
5. Verify the production domain serves the new hero assets and layouts.
