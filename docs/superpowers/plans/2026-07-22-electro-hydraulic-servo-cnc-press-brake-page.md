# Electro-Hydraulic Servo CNC Press Brake Solution Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated Electro-Hydraulic Servo CNC Press Brake product page that preserves all original parameters, uses nine real application photographs, separates table labels from centered unit lines, and presents the machine as a high-precision CNC sheet-metal bending solution.

**Architecture:** Add one typed content module and one dedicated React page component, then route only the matching catalog product through that component. Keep `data/bending-details.ts` as the single parameter source, use display-only table-header formatting, and reuse existing global navigation, footer, product lookup and Tailwind conventions.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, `next/image`, Lucide React, static contract scripts, Codex Image Gen for a UI concept, and the in-app Browser for visual QA.

## Global Constraints

- Preserve the existing 16-column, 26-row `technicalParameters` data exactly; do not duplicate or edit parameter values.
- Keep every table-label phrase together and render the parenthetical unit on a separate centered line.
- Use nine real industry photographs in Applications; do not use line drawings, SVG scenes, AI-generated factory scenes or fake product-detail photographs.
- Use only the existing full product image for machine imagery; do not alter machine structure, proportions or color.
- Use `#76B900` as the accent and the existing black/titanium/white industrial design system.
- Do not add prices, offers, QR codes, unverifiable precision claims, output percentages or unnecessary dependencies.
- Treat controller models, axis counts, crowning, quick clamps and other configuration-dependent features as optional or commonly available unless the existing product data states otherwise.
- Keep global navigation, footer and unrelated product pages unchanged.
- The page must have one H1; non-hero images are lazy-loaded; FAQ uses semantic `details/summary`.
- Root layout must not overflow horizontally at desktop, 1280px or 390px; only comparison and parameter tables may scroll inside their own containers.
- Final verification must include every `scripts/verify-*.mjs` script, `npm run lint`, `npx tsc --noEmit`, `npm run build`, Browser desktop/mobile QA and `view_image` concept/render comparison.

---

### Task 1: Create a page concept and lock the design inventory

**Files:**
- Reference: `public/products/bending/electro-hydraulic-servo-cnc-press-brake.png`
- Reference: `docs/superpowers/specs/2026-07-22-electro-hydraulic-servo-cnc-press-brake-page-design.md`
- Create: Codex-generated concept image outside the repository

**Interfaces:**
- Consumes: the approved section order, exact hero copy, product image and existing ZYRON design system.
- Produces: one accepted page concept path and a written inventory of palette, typography, hero composition, CTA labels, section rhythm, table treatment and responsive behavior.

- [ ] **Step 1: Generate the visual concept**

Use the Image Gen skill with the existing product image as the machine reference. Ask for a complete long-form desktop product page concept with a dark industrial hero, white/off-white information bands, restrained `#76B900` accents, real-photo application frames, one technical table, one comparison table and one FAQ region. Explicitly prohibit fake machine-detail photographs, changed machine geometry, prices, QR codes and invented parameter values.

- [ ] **Step 2: Inspect the concept at original detail**

Run `view_image` on the generated file with `detail: "original"`. Reject the concept if the machine is altered, the header is invented, application images look like drawings, primary copy is unreadable, or the table treatment cannot be implemented with HTML/CSS.

- [ ] **Step 3: Record the design inventory**

Record these fixed implementation values in the working notes used for the page component:

```text
Hero copy: exact user-provided H1, subtitle, description and two CTA labels
Palette: #0B0D10, #12161A, #171C21, #F4F6F8, #FFFFFF, #76B900
Container: max-w-[1440px] with responsive side padding
Radii: 2–4px for primary surfaces
Applications: 16:9 real-photo frames
Tables: dark header, thin neutral borders, local horizontal scrolling
Motion: restrained hover lift and reduced-motion-safe transitions
```

### Task 2: Add a failing page contract

**Files:**
- Create: `scripts/verify-electro-hydraulic-servo-cnc-press-brake-page.mjs`
- Modify: `scripts/verify-all-product-solution-pages.mjs`

**Interfaces:**
- Consumes: the existing filesystem-backed contract pattern.
- Produces: an executable contract that fails until the dedicated data, component, route and images exist.

- [ ] **Step 1: Write the failing contract**

Create a Node ESM script that reads the route, dedicated component, page data, bending details and photo source manifest. Assert:

```js
assert.match(route, /ElectroHydraulicServoCncPressBrakeSolutionPage/);
assert.match(route, /Electro-Hydraulic Servo CNC Press Brake \| Precision Sheet Metal Bending Solution/);
assert.match(component, /data-section="servo-synchronization"/);
assert.match(component, /data-section="cnc-control"/);
assert.match(component, /data-section="back-gauge"/);
assert.match(component, /data-section="crowning-tooling"/);
assert.match(component, /technicalParameters\.columns/);
assert.match(component, /technicalParameters\.rows/);
assert.match(component, /ProductModel/);
assert.match(component, /FAQPage/);
assert.match(component, /BreadcrumbList/);
assert.equal((component.match(/<h1\b/g) ?? []).length, 1);
assert.equal((pageData.match(/image:\s*"\/products\/electro-hydraulic-servo-cnc-press-brake-applications\//g) ?? []).length, 9);
assert.doesNotMatch(component + pageData, /price|QR code|二维码/i);
assert.match(details, /"50T1600"/);
assert.match(details, /"320T6000"/);
assert.match(sourceManifest, /Pexels|Unsplash/i);
```

Update the aggregate page contract to count this ID as dedicated without changing the total product count.

- [ ] **Step 2: Run the contract and confirm RED**

Run:

```bash
node scripts/verify-electro-hydraulic-servo-cnc-press-brake-page.mjs
```

Expected: exit 1 because the dedicated page data/component/photo manifest do not exist.

- [ ] **Step 3: Commit the failing contract**

```bash
git add scripts/verify-electro-hydraulic-servo-cnc-press-brake-page.mjs scripts/verify-all-product-solution-pages.mjs
git commit -m "test: define servo cnc press brake page contract"
```

### Task 3: Source real application photographs and add typed page content

**Files:**
- Create: `data/electro-hydraulic-servo-cnc-press-brake-page.ts`
- Create: `public/products/electro-hydraulic-servo-cnc-press-brake-applications/*.webp`
- Create: `public/products/electro-hydraulic-servo-cnc-press-brake-applications/SOURCES.md`

**Interfaces:**
- Consumes: existing product facts in `data/bending-details.ts`, valid catalog routes in `data/products.ts`, and nine real source images.
- Produces: `electroHydraulicServoCncPressBrakePage`, `ApplicationPhoto`, `ContentCard`, `SolutionCard`, `ComparisonRow`, `WorkflowItem` and `FaqItem` exports.

- [ ] **Step 1: Find nine real industry photographs**

Use image search for precision sheet-metal fabrication, electrical enclosures, stainless fabrication, HVAC duct work, machinery manufacturing, steel components, automotive metal parts, metal furniture/panels and a general metalworking workshop. Prefer Pexels or Unsplash pages with a traceable author and source URL. Reject drawings, renders, visible competing machine brands and misleading close-ups.

- [ ] **Step 2: Download and normalize the selected images**

Store descriptive `.webp` filenames under the dedicated application directory. Normalize every image to `1200×675` using the existing workspace image tools, without altering the factual scene.

- [ ] **Step 3: Record sources**

Write `SOURCES.md` with filename, source page URL, photographer/author, retrieval date and a note that each photo is used as general industry context rather than a customer case.

- [ ] **Step 4: Create the typed content module**

Define the exact hero copy and data for all 18 page sections. Use the user-supplied copy recorded in the design spec and expose these typed fields and exact item counts:

```ts
export type ContentCard = { title: string; text: string };
export type SolutionCard = ContentCard & {
  suitableFor: string;
  productionValue: string;
};
export type ApplicationPhoto = ContentCard & {
  image: string;
  alt: string;
};
export type ComparisonRow = {
  label: string;
  nc: string;
  torsion: string;
  servo: string;
};
export type WorkflowItem = ContentCard & { href?: string };
export type FaqItem = { question: string; answer: string };
```

The object contains: one exact Hero with four value labels; five pain points; three solutions; nine application photos; seven materials; seven process steps; one servo-synchronization group; one CNC-control group; one back-gauge group; one crowning/tooling group with seven facts and CTA; eight advantages; verified structure items backed by `bending-details.ts`; eight comparison rows; eight workflow steps; seventeen selection inputs; twelve FAQs; catalog-backed internal links; and the exact final CTA.

Do not include performance numbers beyond the original technical table. Qualify Delem/ESA/Cybelec, DA53T/58T/66T/69T, axis counts and crowning as common or optional configurations.

- [ ] **Step 5: Inspect all nine images**

Use `view_image` on every saved file. Replace any image that is a drawing, a visible branded competitor, visually repetitive, irrelevant or too low quality.

- [ ] **Step 6: Commit content and images**

```bash
git add data/electro-hydraulic-servo-cnc-press-brake-page.ts public/products/electro-hydraulic-servo-cnc-press-brake-applications
git commit -m "feat: add servo cnc press brake content and photos"
```

### Task 4: Build the dedicated responsive product page

**Files:**
- Create: `components/ElectroHydraulicServoCncPressBrakeSolutionPage.tsx`

**Interfaces:**
- Consumes: `Product`, `BendingDetail`, the content exports from Task 3 and the original `technicalParameters` object.
- Produces: `ElectroHydraulicServoCncPressBrakeSolutionPage({ product, detail })`.

- [ ] **Step 1: Implement display-only table helpers**

Add helpers that split a final parenthetical unit from the label without touching the source data:

```ts
function splitColumnHeading(column: string) {
  const match = column.match(/^(.*?)\s*(\([^()]+\))$/);
  return match
    ? { label: match[1].trim(), unit: match[2] }
    : { label: column.trim(), unit: null };
}
```

Render the label with `whitespace-nowrap` and the unit in a centered block beneath it. Do not append units to body cells because all units are already declared by the column header.

- [ ] **Step 2: Implement shared local primitives**

Create focused helpers within the component for section intros, CTA links, application cards, numbered process steps, comparison rows and FAQ items. Follow existing press-brake page patterns and keep every primitive semantic and keyboard accessible.

- [ ] **Step 3: Implement all page sections**

Render the 18 sections in the exact approved order with these stable markers:

```text
hero, pain-points, solutions, applications, materials, process,
servo-synchronization, cnc-control, back-gauge, crowning-tooling,
advantages, comparison, workflow, selection, technical, faq,
internal-links, cta
```

The Hero uses `product.image`; Applications use all nine real images; Advantages may reuse the complete product image but no fake detail image.

- [ ] **Step 4: Add structured data**

Render JSON-LD for:

```ts
const productSchema = {
  "@type": "ProductModel",
  name: product.name,
  image: absoluteImageUrl,
  description: page.hero.description,
};
const faqSchema = {
  "@type": "FAQPage",
  mainEntity: page.faqs.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};
const breadcrumbSchema = {
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Bending Machines", item: `${siteUrl}/products/series/bending-machines` },
    { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
  ],
};
```

Do not include `offers`, price, rating or fabricated review data.

- [ ] **Step 5: Run the focused contract toward GREEN**

Run:

```bash
node scripts/verify-electro-hydraulic-servo-cnc-press-brake-page.mjs
```

Expected: route-related assertions may still fail; component/data/image assertions pass.

- [ ] **Step 6: Commit the component**

```bash
git add components/ElectroHydraulicServoCncPressBrakeSolutionPage.tsx
git commit -m "feat: build servo cnc press brake solution page"
```

### Task 5: Route the product and add SEO metadata

**Files:**
- Modify: `app/products/[id]/page.tsx`

**Interfaces:**
- Consumes: the dedicated component from Task 4 and the existing `products`/`getBendingDetail` lookup.
- Produces: dedicated metadata and page rendering for `electro-hydraulic-servo-cnc-press-brake` only.

- [ ] **Step 1: Add the metadata branch**

Use the exact title and description from the spec, the ten supplied keywords, canonical `/products/electro-hydraulic-servo-cnc-press-brake`, the existing product image and the exact requested alt text for Open Graph.

- [ ] **Step 2: Add the dedicated render branch**

Import the new component and return it only when:

```ts
product.id === "electro-hydraulic-servo-cnc-press-brake"
```

Pass the catalog product and existing bending detail directly. Leave every other route unchanged.

- [ ] **Step 3: Run focused and aggregate contracts**

Run:

```bash
node scripts/verify-electro-hydraulic-servo-cnc-press-brake-page.mjs
node scripts/verify-all-product-solution-pages.mjs
```

Expected: both exit 0; the product total remains unchanged and the dedicated/shared counts shift by one.

- [ ] **Step 4: Commit routing and SEO**

```bash
git add app/products/[id]/page.tsx scripts/verify-all-product-solution-pages.mjs
git commit -m "feat: route servo cnc press brake solution page"
```

### Task 6: Run Browser fidelity and responsive QA

**Files:**
- Inspect and repair from the fidelity ledger: `components/ElectroHydraulicServoCncPressBrakeSolutionPage.tsx`
- Inspect and repair from the copy ledger: `data/electro-hydraulic-servo-cnc-press-brake-page.ts`
- Create temporarily: screenshots outside the repository

**Interfaces:**
- Consumes: the production build and accepted concept.
- Produces: desktop/mobile screenshots, a five-point fidelity ledger and verified interaction/layout behavior.

- [ ] **Step 1: Start the production build locally**

Run `npm run build`, then `npm run start -- -p 3000`. Open `/products/electro-hydraulic-servo-cnc-press-brake` with the in-app Browser.

- [ ] **Step 2: Verify desktop at 1440×1000**

Check one H1, 18 section markers, nine image elements, 12 FAQ items, CTA hrefs, original 16×26 table data, intact column labels, centered unit lines and no root-level horizontal scrolling.

- [ ] **Step 3: Verify mobile at 390×844**

Check stacked Hero layout, full-width CTA buttons, one-column photo cards, readable headings, local table scrolling, document-root width equal to viewport width and no clipped primary content.

- [ ] **Step 4: Verify interactions**

Open the first FAQ and verify its `details.open` state. Horizontally scroll the technical and comparison table containers and confirm their `scrollLeft` changes while the page root remains fixed.

- [ ] **Step 5: Capture and compare screenshots**

Save Browser viewport screenshots outside the repository. In one QA pass, call `view_image` on the accepted concept, desktop render, Applications render and mobile technical-table render. Write a fidelity ledger covering copy, Hero layout, typography, palette, real-photo treatment, tables, spacing and responsive behavior. Fix every material mismatch.

- [ ] **Step 6: Check browser logs**

Read error/warning logs from the product tab. Resolve product-page errors and record unrelated third-party warnings rather than changing unrelated code.

### Task 7: Run final verification and hand off

**Files:**
- Modify only if verification finds an in-scope defect.

**Interfaces:**
- Consumes: the final working tree.
- Produces: a clean commit with evidence-backed verification results.

- [ ] **Step 1: Run every source contract**

```bash
set -e
for script in scripts/verify-*.mjs; do
  node "$script"
done
```

Expected: every script exits 0.

- [ ] **Step 2: Run lint and type checking with bounded logs**

```bash
npm run lint > /tmp/servo-cnc-lint.log 2>&1
npx tsc --noEmit > /tmp/servo-cnc-tsc.log 2>&1
tail -n 120 /tmp/servo-cnc-lint.log
tail -n 120 /tmp/servo-cnc-tsc.log
```

Expected: both commands exit 0 with no warnings.

- [ ] **Step 3: Run the final production build with bounded logs**

```bash
npm run build > /tmp/servo-cnc-build.log 2>&1
tail -n 120 /tmp/servo-cnc-build.log
```

Expected: exit 0, successful optimized build and generated product route.

- [ ] **Step 4: Confirm clean scope and commit any QA repair**

```bash
git diff --check
git status --short
git diff --stat
```

If Browser QA required an in-scope repair:

```bash
git add components/ElectroHydraulicServoCncPressBrakeSolutionPage.tsx data/electro-hydraulic-servo-cnc-press-brake-page.ts
git commit -m "fix: polish servo cnc press brake responsive layout"
```

- [ ] **Step 5: Prepare the final handoff**

Report modified files, added sections, parameter preservation, photo sources, SEO changes, desktop/mobile Browser verification, concept/render comparison, lint/type/build results and any intentional deviations. Do not deploy unless the user explicitly requests deployment for this page.
