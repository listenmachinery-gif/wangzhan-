# Semi-Automatic Three-Roll Plate Rolling Machine Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a dedicated Semi-Automatic Three-Roll Plate Rolling Machine solution page with original parameters, new real application photography, responsive specifications, and safe SEO.

**Architecture:** Keep the existing dynamic product route and product record, dispatch this product ID to one dedicated server component, and store all page content and presentation metadata in one typed data module. Use a source contract as the regression boundary and keep all new application assets in a product-specific public directory with source notes.

**Tech Stack:** Next.js 15 App Router, React 19 server components, TypeScript, Tailwind CSS, Node contract verifiers, Next Image.

## Global Constraints

- Keep the original product image and all four existing product parameter values unchanged.
- Additional specification fields use `Customizable / Please confirm with our sales engineer`.
- Use ten new real application photographs with no overlap with the electric two-roll page.
- Do not use line-art application images, fake detail images, price, QR codes, unsupported numeric capabilities, or new dependencies.
- Use `#76B900` as the accent and preserve global header/footer behavior.
- Parameter labels stay on one line; units render centered below; tables scroll locally on mobile.

---

### Task 1: Define the dedicated page contract

**Files:**
- Create: `scripts/verify-semi-automatic-three-roll-plate-rolling-machine-page.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: the route, dedicated component, typed page data, original product specs, application assets, and source notes.
- Produces: `npm run verify:semi-automatic-three-roll-rolling`.

- [ ] **Step 1: Write the failing verifier**

Require the dedicated route guard, exact SEO title and description, one H1, all 18 `data-section` markers in order, `ProductModel`/`FAQPage`/`BreadcrumbList`, original spec indexes `0..3`, confirmation placeholders, ten unique non-SVG application files, `SOURCES.md`, nowrap headings, centered unit rows, and local overflow containers. Reject price/offers and unsupported absolute claims.

- [ ] **Step 2: Expose and run the verifier**

Run `npm run verify:semi-automatic-three-roll-rolling` and confirm it fails because the dedicated page files and route do not exist.

- [ ] **Step 3: Commit the red contract**

Commit as `test: define semi-automatic three-roll page contract`.

### Task 2: Add typed solution content and original-spec mapping

**Files:**
- Create: `data/semi-automatic-three-roll-plate-rolling-machine-page.ts`

**Interfaces:**
- Consumes: four source indexes from `product.specs` and the exact confirmation placeholder.
- Produces: typed hero, cards, materials, shapes, process, pre-bending, structure, operation, advantages, comparison, workflow, selection, specification fields, workshop notes, FAQs, CTA, and internal links.

- [ ] **Step 1: Add typed data structures and all approved copy**

Use the attachment's content direction, neutralize configuration-dependent claims, and encode 18-section content without numeric performance claims.

- [ ] **Step 2: Define specification presentation**

Map Rolling Capacity, Roll Structure, Operation, and Workpiece to source indexes `0..3`; map Model, Rolling Length, Plate Thickness, Pre-bending Thickness, Minimum Rolling Diameter, roll diameters, Motor Power, Rolling Speed, Voltage, Machine Size, Machine Weight, and Application to the confirmation placeholder. Store label and optional unit separately.

- [ ] **Step 3: Run verifier and confirm the next expected failure**

The data assertions pass while component/route assertions still fail.

- [ ] **Step 4: Commit**

Commit as `feat: add semi-automatic three-roll solution content`.

### Task 3: Add ten unique real application photographs

**Files:**
- Create: `public/products/semi-automatic-three-roll-plate-rolling-machine-applications/*.webp`
- Create: `public/products/semi-automatic-three-roll-plate-rolling-machine-applications/SOURCES.md`

**Interfaces:**
- Consumes: public-license photo sources representing real cylinders, tanks, ducts, pipes, housings, arc panels, cone parts, stainless products, machinery shells, and fabrication workshops.
- Produces: ten optimized `1200 × 675` WebP assets and provenance notes.

- [ ] **Step 1: Search and inspect candidate photos**

Reject drawings, renders, unrelated machinery, unsafe scenes, watermarks, duplicates, and every photo/source ID already used by the electric two-roll page.

- [ ] **Step 2: Download, crop, and optimize selected images**

Use deterministic image conversion only; do not alter photographed product geometry.

- [ ] **Step 3: Record sources and disclaimers**

List creator, source page, license URL, file mapping, and state that images illustrate representative applications rather than guaranteed ZYRON output.

- [ ] **Step 4: Run the focused asset contract and commit**

Commit as `feat: add semi-automatic three-roll application photos`.

### Task 4: Build the dedicated server-rendered page

**Files:**
- Create: `components/SemiAutomaticThreeRollPlateRollingMachineSolutionPage.tsx`

**Interfaces:**
- Consumes: `Product` plus the typed page data.
- Produces: `SemiAutomaticThreeRollPlateRollingMachineSolutionPage({ product }: { product: Product })`.

- [ ] **Step 1: Add schema and hero**

Render safe `ProductModel`, `FAQPage`, and `BreadcrumbList` JSON-LD, reuse `product.image`, use the exact alt text, and render the approved CTA paths.

- [ ] **Step 2: Render all 18 sections**

Use semantic server-rendered sections, real application images through `next/image`, CSS/process cards for explanations, accessible native FAQ details, and neutral comparison language.

- [ ] **Step 3: Implement responsive parameter presentation**

Validate original labels at runtime, use original values directly, keep heading labels `whitespace-nowrap`, render optional units as centered blocks, and wrap comparison/specification tables in `overflow-x-auto` containers.

- [ ] **Step 4: Run focused verifier and commit**

The verifier should now fail only on missing route dispatch. Commit as `feat: build semi-automatic three-roll solution page`.

### Task 5: Route the product and add SEO metadata

**Files:**
- Modify: `app/products/[id]/page.tsx`
- Modify: `scripts/verify-all-product-solution-pages.mjs`

**Interfaces:**
- Consumes: product ID `semi-automatic-three-roll-plate-rolling-machine`.
- Produces: dedicated metadata and component dispatch while preserving legacy aliases and other routes.

- [ ] **Step 1: Add exact metadata branch**

Add title, description, supplied keywords, canonical, Open Graph, Twitter metadata, and exact image alt.

- [ ] **Step 2: Add component route guard**

Dispatch the exact product ID to the dedicated component before the generic page branch.

- [ ] **Step 3: Update all-product page counts**

Add the ID to the dedicated list and update the derived dedicated/shared expectations without changing total products.

- [ ] **Step 4: Run all focused contracts and commit**

Commit as `feat: route semi-automatic three-roll solution page`.

### Task 6: Rendered QA and release

**Files:**
- Verify only.

**Interfaces:**
- Consumes: completed source and production route.
- Produces: browser evidence, passing checks, merged/pushed `main`, and successful Vercel deployment.

- [ ] **Step 1: Run all contracts, lint, and production build**

Capture bounded logs. All verifier scripts, `npm run lint`, and `npm run build` must exit `0`.

- [ ] **Step 2: Inspect desktop and mobile**

At desktop and `390 × 844`, confirm page identity, nonblank content, one H1, 18 sections, no overlay, no relevant console errors, no document overflow, ten loaded application images, and local specification-table overflow.

- [ ] **Step 3: Exercise an FAQ**

Open one FAQ disclosure and verify its answer becomes visible.

- [ ] **Step 4: Integrate and deploy**

Merge into `main`, push, wait for Vercel success, and verify the production route returns `200` with the dedicated page marker and without offers/price.
