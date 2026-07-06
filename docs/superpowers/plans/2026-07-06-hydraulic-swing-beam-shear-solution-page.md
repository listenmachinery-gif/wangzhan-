# Hydraulic Swing Beam Shear Solution Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated Hydraulic Swing Beam Shearing Machine solution page that preserves every original technical parameter row, adds buyer-oriented hydraulic cutting content, and keeps table labels intact with centered units on a second line.

**Architecture:** Reuse the approved `ShearingSolutionPage` server component and add only optional hydraulic-specific fields to its content contract. Keep a thin wrapper and branch to it only for `hydraulic-swing-beam-shear`, leaving the Foot Shear, Compact Electric Shear, Energy-Saving Electric Shear, and generic templates unchanged.

**Tech Stack:** Next.js 15 App Router, React 19 server components, TypeScript, Tailwind CSS, `next/image`, Lucide React, Node source contracts, browser-based responsive verification.

---

### Task 1: Add The Failing Source Contract

**Files:**
- Create: `scripts/verify-hydraulic-swing-beam-shear-page.mjs`

- [ ] **Step 1: Assert the dedicated page contract**

The script must assert that the wrapper and content files exist, the dynamic route is isolated to `hydraulic-swing-beam-shear`, metadata matches the supplied SEO text, the shared page consumes original `product.technicalParameters`, and the content supplies six materials, seven callouts, an objective binary shear comparison, six FAQs, and model-dependent claims.

- [ ] **Step 2: Assert the responsive table contract**

Verify that the shared component uses `splitColumnHeading`, a centered unit line marked with `data-table-heading-unit`, non-wrapping data cells, and an internal `overflow-x-auto` table container.

- [ ] **Step 3: Run the contract and confirm RED**

Run `node scripts/verify-hydraulic-swing-beam-shear-page.mjs` and confirm it fails because the dedicated wrapper and content module do not yet exist.

### Task 2: Extend The Shared Content Contract

**Files:**
- Modify: `data/shearing-solution-types.ts`

- [ ] **Step 1: Add optional material capability data**

Add a typed object containing eyebrow, title, note, and material items. Existing pages omit it.

- [ ] **Step 2: Add optional binary comparison data**

Add typed left and right machine labels plus rows containing a selection factor and one value per machine. Existing comparison data remains the fallback.

- [ ] **Step 3: Add optional image callout positions**

Add typed callout labels with percentage-based `left` and `top` positions so the real product image can carry numbered desktop annotations while mobile uses the existing text list.

### Task 3: Add Hydraulic Swing Beam Editorial Content

**Files:**
- Create: `data/hydraulic-swing-beam-shear-page.ts`

- [ ] **Step 1: Map the supplied brief into the shared schema**

Include the confirmed hero, four buyer problems, four-step process, six applications, six materials, six core features, seven structure callouts, objective swing-beam versus guillotine comparison, six optional configurations, four-step service workflow, six FAQs, final CTA, and quotation requirements.

- [ ] **Step 2: Ground claims in existing source content**

Use the existing QC12Y/QC12K performance description and advantages as factual grounding. Keep material capacity, thickness, cutting length, back gauge, CNC control, and optional equipment conditional on model configuration.

- [ ] **Step 3: Keep parameter values out of editorial data**

Do not copy any model rows or capacities into the new file. The page must continue reading the original table from `data/shearing-details.ts`.

### Task 4: Extend The Shared Solution Component

**Files:**
- Modify: `components/ShearingSolutionPage.tsx`

- [ ] **Step 1: Render optional material capability cards**

Place the cards after applications. Use the existing border, spacing, typography, and green accent system.

- [ ] **Step 2: Render numbered desktop image callouts**

Overlay small numbered markers only when callout data is supplied and only on desktop. Keep the complete image visible with `object-contain`; retain the numbered explanatory list as the mobile-safe fallback.

- [ ] **Step 3: Render the optional binary comparison**

When binary data exists, render a three-column table: selection factor, Hydraulic Swing Beam Shear, Hydraulic Guillotine Shear. Otherwise render the existing four-column comparison unchanged.

- [ ] **Step 4: Make variable-length grids safe**

Use a four-column process grid when there are four steps and cycle support icons for more than four optional configuration cards. Preserve existing five-step layouts.

- [ ] **Step 5: Preserve the technical table contract**

Keep heading labels unbroken, units on a centered second line, values on one line, and mobile overflow inside the table wrapper.

### Task 5: Add Wrapper, Route, And SEO Integration

**Files:**
- Create: `components/HydraulicSwingBeamShearSolutionPage.tsx`
- Modify: `app/products/[id]/page.tsx`

- [ ] **Step 1: Add a thin wrapper**

Pass the product and `hydraulicSwingBeamShearPageContent` to `ShearingSolutionPage` without duplicating markup.

- [ ] **Step 2: Add exact metadata**

Return the supplied title and meta description, canonical `/products/hydraulic-swing-beam-shear`, product Open Graph image, image alt, and natural keyword list.

- [ ] **Step 3: Add isolated route rendering**

Render the dedicated wrapper only for `product.id === "hydraulic-swing-beam-shear"` and keep every existing branch intact.

- [ ] **Step 4: Run the source contract and confirm GREEN**

Run `node scripts/verify-hydraulic-swing-beam-shear-page.mjs` and expect `Hydraulic Swing Beam Shear page source contract passed.`

### Task 6: Static And Rendered Verification

- [ ] **Step 1: Run all related source contracts**

Run the Foot Shear, Compact Electric Shear, Energy-Saving Electric Shear, and Hydraulic Swing Beam Shear source contracts, then `npx tsc --noEmit` and `npm run build`.

- [ ] **Step 2: Verify desktop and mobile rendering**

Use the in-app Browser first. Check 1440 x 1000 and 390 x 844 for the correct title, one H1, complete image, seven callout labels, original parameter rows, two-line centered headers, contained table scrolling, six FAQs, working inquiry links, no overlay, no failed assets, and no page-level horizontal overflow.

- [ ] **Step 3: Regression-check existing solution pages**

Open the Foot Shear, Compact Electric Shear, and Energy-Saving Electric Shear pages and confirm their existing content and comparison layouts remain unchanged.

### Task 7: Review, Commit, Deploy, And Verify Production

- [ ] **Step 1: Review the final diff**

Run `git diff --check`; confirm `data/shearing-details.ts` is unmodified and no fixed capacity or unsupported standard configuration was introduced.

- [ ] **Step 2: Commit and push**

Commit the implementation with a focused message and push `main` to trigger the existing Vercel deployment.

- [ ] **Step 3: Verify production and sitemap**

Confirm `https://www.zyroncnc.com/products/hydraulic-swing-beam-shear` renders the new page and that `https://www.zyroncnc.com/sitemap.xml` contains the canonical product URL.
