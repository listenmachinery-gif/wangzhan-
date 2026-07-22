# Single-Table Fiber Laser Cutting Machine Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated, responsive single-table fiber laser cutting solution page using the original product image and qualitative product data, nine sourced real application photographs, exact SEO copy, and no fabricated product specifications.

**Architecture:** Add one typed page-content module and one dedicated React server component, then route only `single-table-fiber-laser-cutting-machine` through that component. The component resolves technical values from the existing `Product` object or an explicit confirmation placeholder, uses native `details` FAQ interactions, and renders ProductModel, FAQPage, and BreadcrumbList JSON-LD.

**Tech Stack:** Next.js 15 App Router, React 19 server components, TypeScript, Tailwind CSS, Next Image, Lucide React, Node assertion contract tests, Codex Browser/IAB QA.

## Global Constraints

- Preserve the global header, footer, navigation, route, and original 1448 × 1086 product image.
- Applications must use nine real photographs with source/license records and no generated, SVG, or line-art application imagery.
- Preserve the current qualitative product specs and never infer product-specific power, thickness, speed, accuracy, dimensions, or weight from the image.
- Missing numeric values must display `Customizable / Please confirm with our sales engineer`.
- Competitor official information may support conditional selection context but must not be assigned to a ZYRON model as guaranteed product data.
- Do not claim exchange-table, automatic table exchange, dual-platform, or continuous production behavior for this product.
- Use one H1, exact approved metadata, `#76B900`, local table scrolling, full-width mobile CTAs, and lazy application images.
- Product schema must omit `offers`; the page must contain no price, QR code, or fake contact block.
- Add no dependencies and do not redesign other product pages.
- Production deployment is out of scope until separately authorized.

## File Map

- Create `scripts/verify-single-table-fiber-laser-cutting-machine-page.mjs`: source contract for route, sections, real photos, data provenance, tables, SEO, schemas, and prohibited claims.
- Modify `package.json`: add `verify:single-table-laser`.
- Create `data/single-table-fiber-laser-cutting-machine-page.ts`: typed page content, real-photo metadata, process, selection, comparison, FAQ, and specification mapping.
- Create `components/SingleTableFiberLaserCuttingMachineSolutionPage.tsx`: semantic 18-section renderer, JSON-LD, native FAQ, and responsive tables.
- Modify `app/products/[id]/page.tsx`: dedicated metadata and route dispatch.
- Create `public/products/single-table-fiber-laser-cutting-machine-applications/SOURCES.md`: application photo and technical-context provenance.
- Create nine real photo files under `public/products/single-table-fiber-laser-cutting-machine-applications/`.

---

### Task 1: Define the Dedicated Page Contract First

**Files:**
- Create: `scripts/verify-single-table-fiber-laser-cutting-machine-page.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `app/products/[id]/page.tsx`, the future component/data files, and the future application-photo directory.
- Produces: `npm run verify:single-table-laser`, exiting 0 only when the full dedicated-page contract exists.

- [ ] **Step 1: Write the failing contract**

Create a Node ESM script using `node:assert/strict`, `node:fs`, and `node:path`. It must read the route, component, data, and package files and assert this core contract:

```js
assert.match(route, /SingleTableFiberLaserCuttingMachineSolutionPage/);
assert.match(route, /product\.id === "single-table-fiber-laser-cutting-machine"/);
assert.match(
  route,
  /Single-Table Fiber Laser Cutting Machine \| Sheet Metal Cutting Solution/,
);
assert.equal((component.match(/<h1\b/g) ?? []).length, 1);
assert.match(component, /product\.specs/);
assert.match(component, /splitSpecificationHeading/);
assert.match(component, /overflow-x-auto/);
assert.match(component, /"@type": "ProductModel"/);
assert.match(component, /"@type": "FAQPage"/);
assert.match(component, /"@type": "BreadcrumbList"/);
assert.equal(
  (data.match(/image:\s*"\/products\/single-table-fiber-laser-cutting-machine-applications\//g) ?? [])
    .length,
  9,
);
assert.doesNotMatch(component + data, /offers\s*:|price|qr code|二维码/i);
```

Also assert:

- all 18 exact `data-section` names;
- nine unique photo paths and nine real image files;
- exact hero H1, subtitle, CTA labels, meta title, and meta description;
- the approved confirmation placeholder;
- an exact reference to `product.image` and `product.specs` rather than duplicate machine data;
- header label/unit splitting with `whitespace-nowrap` and centered unit text;
- local horizontal scroll wrappers for both comparison and specification tables;
- lazy Applications imagery and the exact required product-image alt;
- ProductModel, FAQPage, and BreadcrumbList schemas with no `offers`;
- absence of automatic-exchange or continuous-production claims attached to the single-table product, while allowing the objective comparison section to describe the exchange-table alternative;
- absence of price and QR claims.

- [ ] **Step 2: Add the package script**

Add this exact script without changing existing scripts:

```json
"verify:single-table-laser": "node scripts/verify-single-table-fiber-laser-cutting-machine-page.mjs"
```

- [ ] **Step 3: Run the contract and verify the red state**

Run:

```bash
npm run verify:single-table-laser
```

Expected: non-zero exit because the dedicated component and data module do not exist. Confirm the failure identifies missing single-table page implementation, not a syntax error in the verifier.

- [ ] **Step 4: Commit the red contract**

```bash
git add package.json scripts/verify-single-table-fiber-laser-cutting-machine-page.mjs
git commit -m "test: define single table laser page contract"
```

---

### Task 2: Source Real Application Photos and Build Typed Content

**Files:**
- Create: `data/single-table-fiber-laser-cutting-machine-page.ts`
- Create: `public/products/single-table-fiber-laser-cutting-machine-applications/SOURCES.md`
- Create: `public/products/single-table-fiber-laser-cutting-machine-applications/sheet-metal-fabrication.jpg`
- Create: `public/products/single-table-fiber-laser-cutting-machine-applications/electrical-cabinet-enclosure.jpg`
- Create: `public/products/single-table-fiber-laser-cutting-machine-applications/advertising-signage.jpg`
- Create: `public/products/single-table-fiber-laser-cutting-machine-applications/stainless-steel-products.jpg`
- Create: `public/products/single-table-fiber-laser-cutting-machine-applications/kitchen-equipment.jpg`
- Create: `public/products/single-table-fiber-laser-cutting-machine-applications/hvac-ventilation-parts.jpg`
- Create: `public/products/single-table-fiber-laser-cutting-machine-applications/machinery-manufacturing.jpg`
- Create: `public/products/single-table-fiber-laser-cutting-machine-applications/metal-door-window-parts.jpg`
- Create: `public/products/single-table-fiber-laser-cutting-machine-applications/general-metalworking-workshop.jpg`

**Interfaces:**
- Produces: `singleTableFiberLaserCuttingMachinePage`, `applicationPhotos`, `technicalSpecificationFields`, and the exported `ContentCard`, `SolutionCard`, `ApplicationPhoto`, `ComparisonRow`, `WorkflowItem`, `SpecificationField`, and `FaqItem` types.
- Consumed by: `SingleTableFiberLaserCuttingMachineSolutionPage` in Task 3.

- [ ] **Step 1: Find and inspect nine licensed real photographs**

Use focused image searches for the nine exact application contexts. Prefer Pexels photographs with a clearly visible industrial subject and a reusable license. Reject line art, renders, AI-looking images, prominent unrelated brands, unsafe scenes, duplicate crops, domestic interiors, and generic office imagery. Visually inspect every candidate before use.

- [ ] **Step 2: Save optimized application files and provenance**

Download the selected source originals, resize/crop each to a consistent 4:3 landscape frame with the long edge between 1200 and 1800 px, preserve photographic detail, and save the exact filenames listed above. `SOURCES.md` must record application title, local filename, source page URL, photographer/creator when supplied, and the license URL.

Also record these official technical-context sources as non-product guarantees:

- Bodor A Series single-platform page: `https://www.bodor.com/en/fiber-laser-cutting-machine/fiber-laser-metal-sheet-cutting-machines/a.html`
- Bodor economical open single-platform announcement: `https://www.bodor.com/en/news/Bodor-New-EA-series.html`
- SENFENG N Series open single-platform context: `https://www.senfenglaser.com/service-stories/fiber-laser-cutter-senfeng-installs-plate-cutter-in-morocco/`
- SENFENG official product brochure source used only for industry context: `https://es.senfenglaser.com/wp-content/uploads/2024/11/Full-range-of-product-brochures.pdf`

State explicitly that these sources inform selection language and do not define guaranteed ZYRON specifications.

- [ ] **Step 3: Define the typed content interfaces**

```ts
export type ContentCard = { title: string; text: string };
export type SolutionCard = ContentCard & {
  suitableFor: string;
  recommendedUse: string;
  productionValue: string;
};
export type ApplicationPhoto = ContentCard & { image: string; alt: string };
export type ComparisonRow = {
  label: string;
  singleTable: string;
  exchangeTable: string;
  plasma: string;
};
export type WorkflowItem = ContentCard & { href?: string };
export type SpecificationField = {
  heading: string;
  source: "name" | "spec" | "confirmed";
  sourceIndex?: number;
  confirmedValue?: string;
};
export type FaqItem = { question: string; answer: string };
```

- [ ] **Step 4: Add the nine application entries**

Each entry uses one exact local path, a descriptive alt, the requested title, and one cautious application explanation. The common path prefix is:

```ts
const applicationRoot =
  "/products/single-table-fiber-laser-cutting-machine-applications";
```

Descriptions must connect flat-sheet cutting to the application without claiming specific speed, thickness, precision, or edge finish.

- [ ] **Step 5: Add the approved page copy**

Transcribe the exact hero, five pain points, three solutions, seven materials, six process steps, single-table explanation, qualitative power guide, gas guidance, advantages, comparison, seven-machine workflow, 15 selection inputs, safety guidance, ten FAQs, internal links, and final CTA from the attachment. Keep configuration-dependent statements conditional.

- [ ] **Step 6: Add specification field mapping**

```ts
export const technicalSpecificationFields: readonly SpecificationField[] = [
  { heading: "Model", source: "name" },
  { heading: "Working Area (mm)", source: "confirmed" },
  { heading: "Laser Power (kW)", source: "spec", sourceIndex: 0 },
  {
    heading: "Cutting Material",
    source: "confirmed",
    confirmedValue:
      "Mild steel, stainless steel, galvanized sheet, aluminum, copper and brass depending on configuration",
  },
  { heading: "Maximum Cutting Thickness (mm)", source: "confirmed" },
  { heading: "Positioning Accuracy (mm)", source: "confirmed" },
  { heading: "Max Cutting Speed (m/min)", source: "confirmed" },
  { heading: "Transmission System", source: "spec", sourceIndex: 2 },
  {
    heading: "Control System",
    source: "confirmed",
    confirmedValue:
      "CNC cutting control system; final brand and functions depend on configuration",
  },
  { heading: "Cooling System", source: "confirmed" },
  { heading: "Machine Size L × W × H (mm)", source: "confirmed" },
  { heading: "Machine Weight (kg)", source: "confirmed" },
  {
    heading: "Application",
    source: "confirmed",
    confirmedValue:
      "Flat metal sheet cutting for fabrication, cabinets, signage, stainless products, HVAC parts and general metalworking",
  },
] as const;
```

- [ ] **Step 7: Run the contract after data creation**

Run: `npm run verify:single-table-laser`

Expected: still FAIL because the component and route are missing, while the data/photo assertions now pass.

- [ ] **Step 8: Commit content and photos**

```bash
git add data/single-table-fiber-laser-cutting-machine-page.ts public/products/single-table-fiber-laser-cutting-machine-applications
git commit -m "feat: add single table laser content and photos"
```

---

### Task 3: Implement the Dedicated Page, SEO, and Schemas

**Files:**
- Create: `components/SingleTableFiberLaserCuttingMachineSolutionPage.tsx`
- Modify: `app/products/[id]/page.tsx`

**Interfaces:**
- Consumes: `Product`, `singleTableFiberLaserCuttingMachinePage`, `applicationPhotos`, and `technicalSpecificationFields`.
- Produces: default server component `SingleTableFiberLaserCuttingMachineSolutionPage({ product }: { product: Product })`.

- [ ] **Step 1: Build focused presentation helpers**

Implement local `SectionIntro`, `PrimaryLink`, `SecondaryLink`, application/process/comparison/workflow renderers, native FAQ, and the header parser:

```ts
const specificationUnitPattern = /^(.*?)(\([^()]+\))$/;
const splitSpecificationHeading = (heading: string) => {
  const normalized = heading.replace(/\s+/g, " ").trim();
  const match = normalized.match(specificationUnitPattern);

  return match
    ? { label: match[1].trim(), unit: match[2] }
    : { label: normalized, unit: "" };
};
```

Render label and unit separately:

```tsx
<span className="block whitespace-nowrap">{heading.label}</span>
<span className="mt-1 block text-center text-[0.68rem] text-zinc-500">
  {heading.unit}
</span>
```

- [ ] **Step 2: Resolve specifications only from current data or the approved placeholder**

```ts
const confirmationPlaceholder =
  "Customizable / Please confirm with our sales engineer";

const resolveSpecificationValue = (field: SpecificationField) => {
  if (field.source === "name") return product.name;
  if (field.source === "spec" && field.sourceIndex !== undefined) {
    return product.specs[field.sourceIndex]?.value ?? confirmationPlaceholder;
  }
  return field.confirmedValue ?? confirmationPlaceholder;
};
```

- [ ] **Step 3: Render all 18 semantic sections**

Use root attributes `data-single-table-fiber-laser-cutting-machine-page` and `data-product-solution-page={product.id}`. Render exact `data-section` values:

```text
hero, pain-points, solutions, applications, materials, cutting-process,
single-table-design, laser-power, cutting-gas, advantages, comparison,
fabrication-workflow, selection-guide, technical-specifications,
workshop-safety, faq, internal-links, final-cta
```

Use the original product image in hero and advantages; use all nine lazy real photos only in Applications; use code-native icons/diagrams outside Applications; isolate comparison and specifications inside `overflow-x-auto` wrappers; keep mobile CTAs full width.

- [ ] **Step 4: Add safe structured data**

Render ProductModel, FAQPage, and BreadcrumbList JSON-LD. ProductModel includes name, description, image, URL, category, brand, manufacturer, and applicable qualitative `additionalProperty` values resolved through the technical field mapping, but no `offers` or price. Do not serialize incompatible category-level tube, exchange-table, or automatic-loading defaults.

- [ ] **Step 5: Add exact metadata and route dispatch**

In `generateMetadata`, add the exact title/description, ten keywords, canonical URL, Open Graph, Twitter card, and product-image alt. Import and return the dedicated component before the generic fallback:

```tsx
if (product.id === "single-table-fiber-laser-cutting-machine") {
  return <SingleTableFiberLaserCuttingMachineSolutionPage product={product} />;
}
```

- [ ] **Step 6: Verify the contract reaches green**

Run: `npm run verify:single-table-laser`

Expected: `Single-Table Fiber Laser Cutting Machine page contract passed.`

- [ ] **Step 7: Run focused lint**

```bash
./node_modules/.bin/eslint \
  'app/products/[id]/page.tsx' \
  components/SingleTableFiberLaserCuttingMachineSolutionPage.tsx \
  data/single-table-fiber-laser-cutting-machine-page.ts \
  scripts/verify-single-table-fiber-laser-cutting-machine-page.mjs
```

Expected: exit 0 with no errors.

- [ ] **Step 8: Commit the implementation**

```bash
git add app/products/[id]/page.tsx components/SingleTableFiberLaserCuttingMachineSolutionPage.tsx
git commit -m "feat: build single table laser cutting solution page"
```

---

### Task 4: Browser QA, Visual Fidelity, and Complete Verification

**Files:**
- Modify only files required by observed QA findings.
- Do not commit browser screenshots, temporary scripts, generated concept drafts, or build logs.

**Interfaces:**
- Consumes: the completed dedicated page and the two accepted concept paths from the design spec.
- Produces: evidence-backed desktop/mobile QA, visual-fidelity ledger, and clean full-repository verification.

- [ ] **Step 1: Start the local app and run Browser/IAB QA**

Target flow:

```text
/products/single-table-fiber-laser-cutting-machine
→ dedicated page renders
→ Applications show nine real photographs
→ technical/comparison tables scroll locally
→ first FAQ expands and displays its answer
```

Check URL/title, one H1, meaningful render, no framework overlay, console warnings/errors, 18 sections, photo count, zero broken images, lazy loading, root width, table column count, label/unit styles, applicable original spec values, placeholder values, CTA links, three schema types, absence of offers/price/QR, and absence of single-table feature misclaims.

- [ ] **Step 2: Test desktop and mobile viewports**

Use 1080 × 900 and 390 × 844. Confirm no root-level horizontal overflow, single-column mobile Applications, isolated table/comparison scrolling, full-width mobile CTAs, readable FAQ summaries, and unchanged machine proportions.

- [ ] **Step 3: Run visual-fidelity comparison**

Capture current desktop and mobile implementation screenshots outside the repository. In one QA pass, use `view_image` on:

- `/Users/zhangmingwei/.codex/generated_images/019f84c8-b51f-7a61-a95b-63358ebfe906/exec-dfa885aa-7bb8-4956-89ab-91f0ac6d57e2.png`
- `/Users/zhangmingwei/.codex/generated_images/019f84c8-b51f-7a61-a95b-63358ebfe906/exec-d6a596bc-4da0-4cb2-85cd-3b5d018f380f.png`
- the latest implementation screenshots.

Record at least five fidelity points: first-viewport composition, typography hierarchy, dark/white band rhythm, application photo framing, squared component geometry, table header anatomy, section spacing, and mobile stacking. Generated concept copy/data that violates the source-of-truth policy is an intentional deviation and must not be copied.

- [ ] **Step 4: Fix only observed material mismatches**

For every fix, reload the same Browser tab and repeat the relevant screenshot/DOM/console/interaction check. Do not add unrelated page features.

- [ ] **Step 5: Run complete bounded verification**

```bash
npm run verify:single-table-laser
npm run lint > /tmp/single-table-lint.log 2>&1; lint_status=$?; printf 'lint exit code: %s\n' "$lint_status"; tail -n 120 /tmp/single-table-lint.log; test "$lint_status" -eq 0
npm run build > /tmp/single-table-build.log 2>&1; build_status=$?; printf 'build exit code: %s\n' "$build_status"; tail -n 120 /tmp/single-table-build.log; test "$build_status" -eq 0
node scripts/verify-all-product-solution-pages.mjs
```

Expected: every command exits 0.

- [ ] **Step 6: Commit any QA corrections**

```bash
git add app components data public scripts package.json
git commit -m "fix: polish single table laser page"
```

Skip the commit when QA required no source changes.

---

### Task 5: Finish the Feature Branch Safely

**Files:**
- No planned source changes.

**Interfaces:**
- Consumes: verified feature branch.
- Produces: a clean handoff that preserves concurrent repository work.

- [ ] **Step 1: Re-check branch and worktree state**

Run `git status --short --branch`, `git worktree list --porcelain`, and `git log --oneline --decorate -12`. Confirm all task files are committed and identify any newer `main` commits created by concurrent work.

- [ ] **Step 2: Reconcile current main without discarding other work**

If `main` advanced, merge `main` into the feature branch, resolve only overlapping route/package/script changes, and rerun the focused contract, lint, and build. Never reset or overwrite concurrent changes.

- [ ] **Step 3: Integrate locally only after fresh verification**

Use a non-fast-forward merge into `main` only when the current repository state allows it safely. Re-run `npm run verify:single-table-laser`, full lint, full build, and all-product verification from the main checkout.

- [ ] **Step 4: Clean up the owned worktree**

After the merge and main-branch verification succeed, remove only `/Users/zhangmingwei/Documents/电动剪板机/.worktrees/single-table-fiber-laser-page` and delete only `codex/single-table-fiber-laser-page`.

- [ ] **Step 5: Report the result**

Report changed files, 18 modules, photo provenance, parameter policy, SEO, desktop/mobile checks, contract/lint/build evidence, visual-reference paths, intentional deviations, merge commit, and the explicit no-deployment boundary.
