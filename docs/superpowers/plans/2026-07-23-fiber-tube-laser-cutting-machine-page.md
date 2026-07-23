# Fiber Tube Laser Cutting Machine Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a dedicated Fiber Tube Laser Cutting Machine solution page that preserves original product data, uses real application photographs, and renders the requested wide parameter table with unbroken labels and centered units.

**Architecture:** Add a typed page-content module and a dedicated server component, then dispatch only the Fiber Tube slug from the existing dynamic route. A focused source-contract test enforces the requested modules and claims, while the existing Next.js route, header, footer, contact page, and product data remain shared.

**Tech Stack:** Next.js 15 App Router, React 19 server components, TypeScript, Tailwind CSS 3, `next/image`, Lucide React, Node.js contract tests, ESLint, Vercel production hosting.

## Global Constraints

- Keep the original 1448 × 1086 product image unchanged; do not add fake machine detail images.
- Applicable Industries must use twelve unique real raster photographs and no SVG or line-art tile.
- Preserve applicable original product values; use exactly `Customizable / Please confirm with our sales engineer` for missing product-specific data.
- The technical table first row contains all requested parameter headings; heading phrases are no-wrap and parenthesized units render on a separate centered line.
- Do not add numeric claims, prices, offers, QR codes, phone numbers, fake metrics, testimonials, ratings, or unsupported configurations.
- Use exactly one H1, the supplied metadata, local table scrolling, lazy application images, full-width mobile CTAs, and no document-level horizontal overflow.
- Do not add dependencies or modify unrelated product pages.

---

### Task 1: Focused Page Contract

**Files:**
- Create: `scripts/verify-fiber-tube-laser-cutting-machine-page.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: source files at `app/products/[id]/page.tsx`, `data/fiber-tube-laser-cutting-machine-page.ts`, `components/FiberTubeLaserCuttingMachineSolutionPage.tsx`, and `data/products.ts`.
- Produces: npm script `verify:fiber-tube-laser` and a zero-exit source contract.

- [ ] **Step 1: Write the failing contract**

Create a Node assertion script that requires the dedicated route component and slug branch, exact metadata, the 20 `data-section` markers from the design spec, exactly one `<h1`, `Product`, `FAQPage`, and `BreadcrumbList` schemas, no `offers`, the exact confirmation placeholder, 12 unique raster application image paths, no SVG application path, `loading="lazy"`, original product-image path, heading-splitting logic, `block whitespace-nowrap`, `block text-center`, and local `overflow-x-auto`.

- [ ] **Step 2: Register and run the contract to verify RED**

Add `"verify:fiber-tube-laser": "node scripts/verify-fiber-tube-laser-cutting-machine-page.mjs"` to `package.json`.

Run: `npm run verify:fiber-tube-laser`

Expected: FAIL because `FiberTubeLaserCuttingMachineSolutionPage.tsx` and its page-data module do not exist and the route has no dedicated Fiber Tube branch.

- [ ] **Step 3: Commit the red test**

Run:

```bash
git add package.json scripts/verify-fiber-tube-laser-cutting-machine-page.mjs
git commit -m "test: define fiber tube laser page contract"
```

### Task 2: Real Application Photograph Set

**Files:**
- Create: `public/products/fiber-tube-laser-cutting-machine-applications/metal-furniture.jpg`
- Create: `public/products/fiber-tube-laser-cutting-machine-applications/fitness-equipment.jpg`
- Create: `public/products/fiber-tube-laser-cutting-machine-applications/guardrail-fence.jpg`
- Create: `public/products/fiber-tube-laser-cutting-machine-applications/door-window-frame.jpg`
- Create: `public/products/fiber-tube-laser-cutting-machine-applications/machinery-frame.jpg`
- Create: `public/products/fiber-tube-laser-cutting-machine-applications/shelf-rack-manufacturing.jpg`
- Create: `public/products/fiber-tube-laser-cutting-machine-applications/automotive-motorcycle-parts.jpg`
- Create: `public/products/fiber-tube-laser-cutting-machine-applications/agricultural-machinery.jpg`
- Create: `public/products/fiber-tube-laser-cutting-machine-applications/construction-machinery.jpg`
- Create: `public/products/fiber-tube-laser-cutting-machine-applications/steel-structure-tube-parts.jpg`
- Create: `public/products/fiber-tube-laser-cutting-machine-applications/stainless-steel-products.jpg`
- Create: `public/products/fiber-tube-laser-cutting-machine-applications/general-tube-fabrication-workshop.jpg`
- Create: `public/products/fiber-tube-laser-cutting-machine-applications/SOURCES.md`

**Interfaces:**
- Consumes: Pexels-licensed source pages plus existing project-local licensed photographs.
- Produces: twelve unique locally hosted raster paths and a ledger with photographer, source URL, license, access date, and representative-use disclaimer.

- [ ] **Step 1: Collect and normalize the photographs**

Use exact Pexels source pages for metal furniture, gym equipment, metal guardrail, warehouse rack, agricultural machinery, and steel-tube imagery. Copy appropriate existing project-local Pexels files for the remaining applications. Use the bundled image runtime or ImageMagick only for mechanical orientation/crop/quality normalization; never synthesize or alter the represented scene.

- [ ] **Step 2: Validate every asset**

Run:

```bash
file public/products/fiber-tube-laser-cutting-machine-applications/*
sips -g pixelWidth -g pixelHeight public/products/fiber-tube-laser-cutting-machine-applications/*.jpg
```

Expected: twelve decodable JPEG files, each large enough for a responsive 4:3 crop, plus one Markdown ledger.

- [ ] **Step 3: Commit the photo set**

Run:

```bash
git add public/products/fiber-tube-laser-cutting-machine-applications
git commit -m "assets: add real fiber tube application photos"
```

### Task 3: Typed Content and Dedicated Page

**Files:**
- Create: `data/fiber-tube-laser-cutting-machine-page.ts`
- Create: `components/FiberTubeLaserCuttingMachineSolutionPage.tsx`
- Modify: `app/products/[id]/page.tsx`

**Interfaces:**
- Consumes: `Product` from `data/products.ts`, the original product image, twelve application image paths, and the exact content/SEO requirements from the design spec.
- Produces: `fiberTubeLaserCuttingMachinePage`, `technicalSpecificationFields`, `confirmationPlaceholder`, and default server component `FiberTubeLaserCuttingMachineSolutionPage({ product })`.

- [ ] **Step 1: Define typed page content**

Create focused types for content cards, solution cards, application photos, comparison rows, workflow links, specification-field mappings, and FAQs. Populate all 20 sections with the supplied cautious English copy. Use source mappings `name`, `spec`, `application`, and `confirmed`; only confirmed qualitative values may bypass the placeholder.

- [ ] **Step 2: Implement the server component**

Render the three-concept design system through small module-level helpers for section introductions, CTA links, solution columns, comparison table, profile cross-sections, application cards, specification table, and FAQ rows. Resolve original fields from `product.specs`, render the original hero image with priority and `object-contain`, render applications with `loading="lazy"`, and add safe JSON-LD without `offers`.

- [ ] **Step 3: Implement exact table heading behavior**

Normalize a heading, split a final parenthesized unit with `/^(.*?)(\([^()]+\))$/`, render the label as `<span className="block whitespace-nowrap">`, and render the unit as `<span className="block text-center">`. Put the one-row table inside a `max-w-full overflow-x-auto` wrapper and give it a stable minimum width.

- [ ] **Step 4: Add metadata and exact route dispatch**

Import the dedicated component, add the exact Fiber Tube metadata title, description, twelve keywords, canonical URL, Open Graph image, and Twitter image, then dispatch `product.id === "fiber-tube-laser-cutting-machine"` to the dedicated page before the generic fallback.

- [ ] **Step 5: Verify GREEN and regressions**

Run:

```bash
npm run verify:fiber-tube-laser
npm run verify:exchange-table-laser
npm run verify:single-table-laser
```

Expected: all three contracts PASS.

- [ ] **Step 6: Commit the implementation**

Run:

```bash
git add data/fiber-tube-laser-cutting-machine-page.ts components/FiberTubeLaserCuttingMachineSolutionPage.tsx 'app/products/[id]/page.tsx'
git commit -m "feat: build fiber tube laser solution page"
```

### Task 4: Static and Visual Verification

**Files:**
- Modify if required by verified defects: `data/fiber-tube-laser-cutting-machine-page.ts`
- Modify if required by verified defects: `components/FiberTubeLaserCuttingMachineSolutionPage.tsx`
- Modify if required by verified defects: `app/products/[id]/page.tsx`
- Create temporarily and remove before handoff: local QA screenshots outside tracked source.

**Interfaces:**
- Consumes: built page and the three concept images under `.codex/visual-references/fiber-tube-laser-cutting-machine/`.
- Produces: passing lint/build, browser-verified desktop/mobile layouts, and a fidelity ledger.

- [ ] **Step 1: Run static verification**

Run:

```bash
npm run lint > /tmp/fiber-tube-lint.log 2>&1
npm run build > /tmp/fiber-tube-build.log 2>&1
```

Expected: both exit code 0; inspect only the final 120 log lines if a failure occurs.

- [ ] **Step 2: Run the local production server and inspect desktop**

Open `/products/fiber-tube-laser-cutting-machine` at a 1536×1024 viewport. Verify the first viewport composition, exact copy, original machine, all 20 section markers, real photo crops, one H1, working CTA links, FAQ disclosure, and local table scrolling.

- [ ] **Step 3: Inspect mobile**

At approximately 390×844, verify a stacked hero, uncropped machine, full-width buttons, single-column cards, readable application photos, no document-level horizontal overflow, and locally scrollable comparison/specification tables.

- [ ] **Step 4: Compare concepts and implementation**

Use `view_image` on each concept and the corresponding implementation screenshot in the same pass. Record at least five points across copy, typography, hero balance, true-white/titanium color bands, real-photo treatment, section rhythm, clipped buttons, table anatomy, FAQ, and responsive behavior. Fix all material drift.

- [ ] **Step 5: Commit verified fixes**

Run:

```bash
git add data/fiber-tube-laser-cutting-machine-page.ts components/FiberTubeLaserCuttingMachineSolutionPage.tsx 'app/products/[id]/page.tsx'
git commit -m "fix: polish fiber tube laser responsive layout"
```

Skip the commit only when verification requires no source change.

### Task 5: Production Deployment

**Files:**
- No expected source changes.

**Interfaces:**
- Consumes: the verified isolated branch based on `origin/main`.
- Produces: synchronized GitHub `main`, successful Vercel status, and a live canonical page.

- [ ] **Step 1: Confirm deployment scope**

Run `git status --short --branch` and `git log --oneline origin/main..HEAD`. Confirm the branch contains only Fiber Tube design, tests, assets, page code, and verified fixes.

- [ ] **Step 2: Push the isolated branch to production main**

Run `git push origin HEAD:main` only if it is a fast-forward from the current `origin/main`. This intentionally excludes the separate unpushed Sheet and Tube design commit in the primary checkout.

- [ ] **Step 3: Monitor Vercel**

Read the pushed commit status through GitHub until the `Vercel` context reports success. Treat pending as deployment in progress and error/failure as a deployment defect to investigate.

- [ ] **Step 4: Verify production**

Request `https://www.zyroncnc.com/products/fiber-tube-laser-cutting-machine` and verify HTTP 200, exact title and description, real photo asset paths, technical table, FAQ/Product/Breadcrumb schemas, and the page marker.

- [ ] **Step 5: Preserve the unrelated local main commit**

Fetch `origin/main` and merge it into the local primary `main` without rewriting or pushing its separate Sheet and Tube design commit. Confirm that commit remains present and unmodified.
