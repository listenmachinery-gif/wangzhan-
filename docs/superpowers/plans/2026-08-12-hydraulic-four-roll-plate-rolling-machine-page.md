# Hydraulic Four-Roll Plate Rolling Machine Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Execute inline with test-driven development because the user requested uninterrupted direct implementation. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a dedicated Hydraulic Four-Roll Plate Rolling Machine solution page using original parameters, unique real application photography, responsive specification tables, and safe SEO.

**Architecture:** Keep the dynamic product route and product record, dispatch this product ID to one dedicated server component, and store page content plus presentation metadata in one typed data module. Protect the route with a focused source contract and store application photos with provenance in a product-specific public directory.

**Tech Stack:** Next.js 15 App Router, React 19 server components, TypeScript, Tailwind CSS, Next Image, Node contract verifiers.

## Global Constraints

- Keep the original product image and all four existing product parameter values unchanged.
- Use `Customizable / Please confirm with our sales engineer` for every unconfirmed specification field.
- Use twelve real application photographs not found in any existing application source record.
- Do not add fake machine-detail images, line-art application images, numeric capabilities, prices, QR codes, or dependencies.
- Keep parameter labels on one line, center units below, and scroll tables locally on mobile.
- Keep configuration-dependent hydraulic, control, cone, feeding, and unloading features explicitly optional.

---

### Task 1: Define the dedicated page contract

**Files:**
- Create: `scripts/verify-hydraulic-four-roll-plate-rolling-machine-page.mjs`
- Modify: `package.json`

- [ ] Assert the focused script, route guard, exact SEO, one H1, ordered 21 sections, structured data, original specification indexes, unique real assets, table formatting, and prohibited claims.
- [ ] Run `npm run verify:hydraulic-four-roll-rolling` and observe failure because the dedicated implementation does not yet exist.

### Task 2: Add typed page content and real application photography

**Files:**
- Create: `data/hydraulic-four-roll-plate-rolling-machine-page.ts`
- Create: `public/products/hydraulic-four-roll-plate-rolling-machine-applications/*.webp`
- Create: `public/products/hydraulic-four-roll-plate-rolling-machine-applications/SOURCES.md`

- [ ] Add all 21 sections, preserve original specifications through indexes `0..3`, and use confirmation placeholders for additional fields.
- [ ] Source twelve unique public-license photographs, convert them to optimized WebP without geometric alteration, and record creator, source, license, mapping, and disclaimer.
- [ ] Run the focused verifier and confirm data/assets advance while component and route assertions remain red.

### Task 3: Implement the dedicated server page

**Files:**
- Create: `components/HydraulicFourRollPlateRollingMachineSolutionPage.tsx`

- [ ] Render safe ProductModel, FAQPage, and BreadcrumbList JSON-LD with the original product image.
- [ ] Render all 21 sections with configuration-safe wording, real application photography, restrained CSS diagrams, and native FAQ disclosures.
- [ ] Resolve the four original values from `product.specs`, keep labels together, center units below labels, and make both tables locally scrollable.

### Task 4: Route the product and add SEO

**Files:**
- Modify: `app/products/[id]/page.tsx`
- Modify: `scripts/verify-all-product-solution-pages.mjs`

- [ ] Add exact metadata, keywords, canonical, Open Graph, Twitter, and approved image alt.
- [ ] Dispatch the exact product ID before the generic branch and preserve its two legacy aliases.
- [ ] Add the product to dedicated page counts without changing the 53-product total.
- [ ] Run the focused contract and all page contracts.

### Task 5: Verify and deploy

**Files:**
- Verify only.

- [ ] Run every verifier, `npm run lint`, and `npm run build` with bounded output.
- [ ] Inspect desktop and `390 x 844` mobile rendering; verify 21 sections, one H1, all twelve photos, no overlays/errors/overflow, local table scrolling, and one opened FAQ.
- [ ] Commit the scoped change, push `main`, wait for Vercel production, and verify the live route marker, title, content, images, and HTTP 200 response.
