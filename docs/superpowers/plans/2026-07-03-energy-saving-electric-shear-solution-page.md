# Energy-Saving Electric Shear Solution Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated Energy-Saving Electric Shearing Machine solution page that preserves every original technical parameter row, explains its intermittent-drive energy logic without unsupported percentage claims, and keeps table labels intact with centered units on a second line.

**Architecture:** Reuse the approved `ShearingSolutionPage` server component and add only optional energy-specific fields to its content contract. Keep a thin Energy-Saving Electric Shear wrapper and branch to it only for `energy-saving-electric-shearing-machine` in the existing dynamic product route, leaving the Foot Shear, Small Electric Shear, and generic product templates unchanged.

**Tech Stack:** Next.js 15 App Router, React 19 server components, TypeScript, Tailwind CSS, `next/image`, Lucide React, Node source contracts, Playwright browser verification.

---

### Task 1: Add The Failing Source Contract

**Files:**
- Create: `scripts/verify-energy-saving-electric-shear-page.mjs`

- [ ] **Step 1: Assert the dedicated page contract**

The script must assert:

- `components/EnergySavingElectricShearSolutionPage.tsx` and `data/energy-saving-electric-shear-page.ts` exist;
- the route renders the wrapper only for `energy-saving-electric-shearing-machine`;
- the exact SEO title, meta description, H1, energy-use section, workflow, eight FAQs, and three JSON-LD types exist;
- the shared component reads `product.technicalParameters` and does not duplicate parameter values in editorial content;
- the table still uses `splitColumnHeading`, a centered unit line, non-wrapping data cells, and an internal horizontal scroller;
- the comparison column label is configurable rather than hardcoded to the Small Electric Shearing Machine;
- the advantages renderer safely supports all seven supplied advantage items.

- [ ] **Step 2: Run the source contract and confirm RED**

Run:

```bash
node scripts/verify-energy-saving-electric-shear-page.mjs
```

Expected: failure because the energy-saving wrapper and content module do not exist yet.

### Task 2: Extend The Shared Content Contract

**Files:**
- Modify: `data/shearing-solution-types.ts`

- [ ] **Step 1: Add an optional energy-use model**

Add an optional `energyUse` object with eyebrow, title, introduction, and operating-state items. Each state contains a short title and explanation so the shared component can render the cutting, idle, and motor-stop logic without inventing a diagram asset.

- [ ] **Step 2: Make the comparison electric-column label configurable**

Add an optional `comparisonElectricLabel` field. Existing pages continue to default to `Small Electric Shearing Machine`; the new page supplies `Energy-Saving Electric Shearing Machine`.

### Task 3: Add Energy-Saving Editorial Content

**Files:**
- Create: `data/energy-saving-electric-shear-page.ts`

- [ ] **Step 1: Map the supplied content into the shared schema**

Include the confirmed hero, four buyer pain points, best-fit criteria, five process steps, six applications, seven advantages, seven structure items, comparison rows, production workflow, four support items, eight FAQs, final CTA, and quotation requirements.

- [ ] **Step 2: Keep claims factual and model-dependent**

Describe the motor-stop/intermittent-drive logic without adding unsupported energy-saving percentages or fixed capacity claims. Preserve conditional wording for thickness, width, material, voltage, and configuration.

- [ ] **Step 3: Keep parameters out of editorial data**

Do not copy model rows or values into this file. The page must continue reading the original table from `data/shearing-details.ts`.

### Task 4: Extend The Shared Solution Component

**Files:**
- Modify: `components/ShearingSolutionPage.tsx`

- [ ] **Step 1: Render the optional energy-use section**

Place the section after solution positioning and before the process flow. Use the existing typography, spacing, borders, and brand green. Render three stable operating-state panels with Lucide icons; do not create a fake image or handcrafted SVG.

- [ ] **Step 2: Support seven advantages safely**

Expand or cycle the established Lucide icon list so every supplied advantage has a valid icon and no undefined component is rendered.

- [ ] **Step 3: Use the configurable comparison label**

Render `content.comparisonElectricLabel ?? "Small Electric Shearing Machine"` in the comparison table header. Preserve all existing comparison behavior for the Foot and Small Electric pages.

- [ ] **Step 4: Preserve the technical table contract**

Keep heading labels unbroken, units on a centered second line, model values on one line, and horizontal overflow contained within the table wrapper on mobile.

### Task 5: Add Wrapper, Route, And SEO Integration

**Files:**
- Create: `components/EnergySavingElectricShearSolutionPage.tsx`
- Modify: `app/products/[id]/page.tsx`

- [ ] **Step 1: Add a thin wrapper**

Pass the product and `energySavingElectricShearPageContent` to `ShearingSolutionPage` without duplicating markup.

- [ ] **Step 2: Add exact metadata**

For `energy-saving-electric-shearing-machine`, return:

- title: `Energy-Saving Electric Shearing Machine | Thin Sheet Cutting Solution | ZYRON`
- description: `Energy-saving electric shearing machine for thin sheet metal cutting, HVAC duct fabrication, galvanized sheet processing and daily workshop production. Get a lower-cost cutting solution from ZYRON Heavy Industry.`
- canonical URL: `/products/energy-saving-electric-shearing-machine`
- product-specific Open Graph image and alt text.

- [ ] **Step 3: Add isolated route rendering**

Render `<EnergySavingElectricShearSolutionPage product={product} />` only for the matching product ID. Keep existing Foot Shear, Small Electric Shear, and generic branches intact.

- [ ] **Step 4: Run the source contract and confirm GREEN**

Run:

```bash
node scripts/verify-energy-saving-electric-shear-page.mjs
```

Expected: `Energy-Saving Electric Shear page source contract passed.`

### Task 6: Static And Browser Verification

- [ ] **Step 1: Run all related source contracts**

```bash
node scripts/verify-foot-shear-page.mjs
node scripts/verify-small-electric-shear-page.mjs
node scripts/verify-energy-saving-electric-shear-page.mjs
npx tsc --noEmit
npm run build
```

Expected: all commands pass without changing the original parameter data.

- [ ] **Step 2: Verify desktop and mobile rendering**

Use the in-app Browser first. If its local-control integration remains unavailable, use the previously authorized local Playwright fallback. Check at 1440 x 1000 and 390 x 844:

- exact title, meta description, and single H1;
- complete product image with no cropping;
- all original technical parameter rows and values;
- centered two-line table headings and table-contained horizontal scrolling;
- eight FAQs and Product, BreadcrumbList, FAQPage schemas;
- no page-level horizontal overflow, console errors, or failed assets;
- Foot Shear, Small Electric Shear, and one unrelated generic product still use their intended templates.

### Task 7: Review, Commit, Deploy, And Verify Production

- [ ] **Step 1: Review the final diff**

Run `git diff --check`, confirm `data/shearing-details.ts` was not modified, and confirm no unsupported energy-saving percentage was introduced.

- [ ] **Step 2: Commit and push**

Commit the implementation with a focused message and push `main` to trigger the existing Vercel deployment.

- [ ] **Step 3: Verify production**

Confirm `https://www.zyroncnc.com/products/energy-saving-electric-shearing-machine` returns the new H1, original parameter table, eight FAQs, and all three structured-data types.
