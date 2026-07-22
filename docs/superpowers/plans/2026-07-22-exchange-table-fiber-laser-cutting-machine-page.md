# Exchange-Table Fiber Laser Cutting Machine Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated, responsive exchange-table fiber laser cutting solution page using the original product image and specs, real application photography, exact SEO copy, and no fabricated numeric data.

**Architecture:** Add a typed content module and a dedicated server component, then route only `exchange-table-fiber-laser-cutting-machine` through that component. The component reads original fields from the existing `Product` object, uses an explicit placeholder policy for absent numeric specifications, and renders native HTML FAQ interactions plus Product/FAQ/Breadcrumb JSON-LD.

**Tech Stack:** Next.js 15 App Router, React 19 server components, TypeScript, Tailwind CSS, Next Image, Lucide React, Node assertion contract tests, Codex Browser QA.

## Global Constraints

- Preserve global navigation, footer, route, and the original 1448 × 1086 product image.
- Applications must use ten real photographs and no illustrations or line art.
- Preserve the current product specs and never invent power, thickness, speed, accuracy, exchange time, dimensions, or weight.
- Missing numeric values must display `Customizable / Please confirm with our sales engineer`.
- Use one H1, exact approved metadata, `#76B900`, local table scrolling, full-width mobile CTAs, and lazy application images.
- Product schema must omit `offers`; the page must contain no price or QR code.
- Add no dependencies and do not redesign other product pages.
- Production deployment is out of scope until separately authorized.

## File Map

- Create `data/exchange-table-fiber-laser-cutting-machine-page.ts`: all typed page content, real photo paths, workflow, comparison, FAQ, and specification field mapping.
- Create `components/ExchangeTableFiberLaserCuttingMachineSolutionPage.tsx`: semantic section renderer, tables, native FAQ, and JSON-LD.
- Create `scripts/verify-exchange-table-fiber-laser-cutting-machine-page.mjs`: executable contract for content, data provenance, images, sections, SEO, and prohibited claims.
- Modify `app/products/[id]/page.tsx`: metadata and dedicated route dispatch.
- Modify `package.json`: add the focused verification script.
- Create `.codex/visual-references/exchange-table-fiber-laser-cutting-machine/*`: accepted generated visual references and design-system notes.

---

### Task 1: Establish the Visual Direction

**Files:**
- Create: `.codex/visual-references/exchange-table-fiber-laser-cutting-machine/concept-hero.png`
- Create: `.codex/visual-references/exchange-table-fiber-laser-cutting-machine/concept-applications.png`
- Create: `.codex/visual-references/exchange-table-fiber-laser-cutting-machine/concept-technical.png`
- Create: `.codex/visual-references/exchange-table-fiber-laser-cutting-machine/design-system.md`

**Interfaces:**
- Consumes: `public/products/catalog/exchange-table-fiber-laser-cutting-machine.png` and the ten existing real application image files selected in Task 3.
- Produces: accepted visual evidence for layout, color, density, photography treatment, responsive interpretation, and fidelity QA.

- [ ] **Step 1: Generate hero and production-positioning concept**

Use Image Gen with the protected product image. Require a dark titanium hero, exact H1/subtitle/CTAs/value labels, the full unchanged machine, restrained green accents, pain-point rows, and three solution cards. Explicitly prohibit new machine details, prices, QR codes, and generated close-ups.

- [ ] **Step 2: Generate applications and process concept**

Reference real repository photographs and require a ten-photo Applications grid, material band, seven-stage process, dual-table explanation, power guide, and gas section. Application cards must remain photographic.

- [ ] **Step 3: Generate technical and selection concept**

Require advantages, objective three-platform comparison, fabrication workflow, selection guide, 15-column locally scrolling table, safety, FAQ, internal links, and final CTA. Mark every numeric field as confirmation-only.

- [ ] **Step 4: Inspect and document the accepted direction**

Use `view_image` on all concepts and source images. Record typography hierarchy, color tokens, grid rules, image treatment, prohibited generated content, and intentional implementation deviations in `design-system.md`.

- [ ] **Step 5: Commit**

```bash
git add .codex/visual-references/exchange-table-fiber-laser-cutting-machine
git commit -m "design: define exchange table laser page direction"
```

---

### Task 2: Define the Page Contract First

**Files:**
- Create: `scripts/verify-exchange-table-fiber-laser-cutting-machine-page.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: repository source files as text.
- Produces: `npm run verify:exchange-table-laser` with exit code 0 only when all required contracts exist.

- [ ] **Step 1: Write the failing contract**

The script must use `node:assert/strict` and assert:

```js
assert.match(route, /ExchangeTableFiberLaserCuttingMachineSolutionPage/);
assert.match(route, /product\.id === "exchange-table-fiber-laser-cutting-machine"/);
assert.match(route, /Exchange-Table Fiber Laser Cutting Machine \| High-efficiency Sheet Metal Cutting Solution/);
assert.equal((component.match(/<h1\b/g) ?? []).length, 1);
assert.match(component, /product\.specs/);
assert.match(component, /splitSpecificationHeading/);
assert.match(component, /overflow-x-auto/);
assert.match(component, /"@type": "Product"/);
assert.match(component, /"@type": "FAQPage"/);
assert.match(component, /"@type": "BreadcrumbList"/);
assert.equal((data.match(/image:\s*"\/products\//g) ?? []).length, 10);
assert.doesNotMatch(component + data, /price|qr code|二维码/i);
```

Also assert all 18 `data-section` values, ten unique image paths, the exact placeholder policy, exact hero copy, exact metadata, the original product image path, and absence of `offers`.

- [ ] **Step 2: Add the package script**

```json
"verify:exchange-table-laser": "node scripts/verify-exchange-table-fiber-laser-cutting-machine-page.mjs"
```

- [ ] **Step 3: Run the contract and verify red state**

Run: `npm run verify:exchange-table-laser`

Expected: non-zero exit with the dedicated component or data module missing.

- [ ] **Step 4: Commit**

```bash
git add package.json scripts/verify-exchange-table-fiber-laser-cutting-machine-page.mjs
git commit -m "test: define exchange table laser page contract"
```

---

### Task 3: Create Typed Content and Preserve Original Data

**Files:**
- Create: `data/exchange-table-fiber-laser-cutting-machine-page.ts`

**Interfaces:**
- Produces: `exchangeTableFiberLaserCuttingMachinePage`, `applicationPhotos`, `technicalSpecificationFields`, and the exported `ContentCard`, `SolutionCard`, `ApplicationPhoto`, `ComparisonRow`, `WorkflowItem`, `SpecificationField`, and `FaqItem` types.
- Consumed by: `ExchangeTableFiberLaserCuttingMachineSolutionPage` in Task 4.

- [ ] **Step 1: Define the typed content interfaces**

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
  automaticLine: string;
};
export type WorkflowItem = ContentCard & { href?: string };
export type SpecificationField = {
  heading: string;
  source: "name" | "spec" | "application" | "confirmed";
  sourceIndex?: number;
  confirmedValue?: string;
};
export type FaqItem = { question: string; answer: string };
```

- [ ] **Step 2: Add the ten real application photographs**

Use these unique repository assets:

```ts
const applicationImagePaths = [
  "/products/electro-hydraulic-servo-cnc-press-brake-applications/precision-sheet-metal-fabrication.jpg",
  "/products/electro-hydraulic-servo-cnc-press-brake-applications/electrical-cabinet-manufacturing.jpg",
  "/products/electro-hydraulic-servo-cnc-press-brake-applications/stainless-steel-products.jpg",
  "/products/electric-folding-applications/stainless-steel-fabrication.webp",
  "/products/electric-folding-applications/signage-fabrication.webp",
  "/products/electro-hydraulic-servo-cnc-press-brake-applications/hvac-duct-and-ventilation.jpg",
  "/products/electro-hydraulic-servo-cnc-press-brake-applications/machinery-manufacturing.jpg",
  "/products/electric-folding-applications/architectural-sheet-metal.webp",
  "/products/electro-hydraulic-servo-cnc-press-brake-applications/steel-structure-components.jpg",
  "/products/electro-hydraulic-servo-cnc-press-brake-applications/general-metalworking-workshop.jpg",
] as const;
```

Add titles, accurate conditional descriptions, and real-scene alt text for all ten entries.

- [ ] **Step 3: Add the approved page content**

Transcribe the exact hero, five pain points, three solutions, seven materials, seven process steps, exchange-table explanation, power and gas guidance, advantages, comparison, workflow, 16 selection inputs, safety guidance, eleven FAQs, internal links, and final CTA from the approved brief. Keep all claims conditional where configuration-dependent.

- [ ] **Step 4: Add the specification field mapping**

```ts
export const technicalSpecificationFields: readonly SpecificationField[] = [
  { heading: "Model", source: "name" },
  { heading: "Working Area (mm)", source: "confirmed" },
  { heading: "Laser Power (kW)", source: "spec", sourceIndex: 0 },
  { heading: "Cutting Material", source: "confirmed", confirmedValue: "Mild steel, stainless steel, galvanized sheet, aluminum, copper and brass depending on configuration" },
  { heading: "Maximum Cutting Thickness (mm)", source: "confirmed" },
  { heading: "Exchange Table Type", source: "confirmed", confirmedValue: "Dual exchange platforms" },
  { heading: "Exchange Time (s)", source: "confirmed" },
  { heading: "Positioning Accuracy (mm)", source: "confirmed" },
  { heading: "Max Cutting Speed (m/min)", source: "confirmed" },
  { heading: "Transmission System", source: "spec", sourceIndex: 2 },
  { heading: "Control System", source: "spec", sourceIndex: 3 },
  { heading: "Cooling System", source: "confirmed" },
  { heading: "Machine Size L × W × H (mm)", source: "confirmed" },
  { heading: "Machine Weight (kg)", source: "confirmed" },
  { heading: "Application", source: "application" },
] as const;
```

- [ ] **Step 5: Run the contract**

Run: `npm run verify:exchange-table-laser`

Expected: still FAIL because the component and route do not exist, while data assertions pass.

- [ ] **Step 6: Commit**

```bash
git add data/exchange-table-fiber-laser-cutting-machine-page.ts
git commit -m "feat: add exchange table laser page content"
```

---

### Task 4: Implement the Dedicated Page and SEO

**Files:**
- Create: `components/ExchangeTableFiberLaserCuttingMachineSolutionPage.tsx`
- Modify: `app/products/[id]/page.tsx`

**Interfaces:**
- Consumes: `Product`, `exchangeTableFiberLaserCuttingMachinePage`, `applicationPhotos`, and `technicalSpecificationFields`.
- Produces: default server component `ExchangeTableFiberLaserCuttingMachineSolutionPage({ product }: { product: Product })`.

- [ ] **Step 1: Build presentation helpers**

Implement local `SectionIntro`, `PrimaryLink`, `SecondaryLink`, card renderers, native FAQ, and heading parser:

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

Render the label in `block whitespace-nowrap` and unit in a separate `block text-center` span.

- [ ] **Step 2: Resolve technical values only from original data or the approved placeholder**

```ts
const confirmationPlaceholder =
  "Customizable / Please confirm with our sales engineer";

const resolveSpecificationValue = (field: SpecificationField) => {
  if (field.source === "name") return product.name;
  if (field.source === "spec" && field.sourceIndex !== undefined)
    return product.specs[field.sourceIndex]?.value ?? confirmationPlaceholder;
  if (field.source === "application") return product.applications.join(", ");
  return field.confirmedValue ?? confirmationPlaceholder;
};
```

- [ ] **Step 3: Render all 18 sections**

Use a root `main[data-exchange-table-fiber-laser-cutting-machine-page]` and exact `data-section` values from the spec. Use the original product image in hero and advantages, ten lazy real images in Applications, code-native exchange-table/process diagrams outside Applications, local comparison/table overflow, and full-width mobile CTAs.

- [ ] **Step 4: Add safe structured data**

Render Product, FAQPage, and BreadcrumbList JSON-LD. Product contains name, description, image, brand, category, and URL but no `offers`.

- [ ] **Step 5: Add metadata and route dispatch**

Add the exact title, description, ten requested keywords, canonical, Open Graph, Twitter card, and image alt to `generateMetadata`. Import and return the dedicated component for the exchange-table product before the generic fallback.

- [ ] **Step 6: Verify green state**

Run: `npm run verify:exchange-table-laser`

Expected: `Exchange-Table Fiber Laser Cutting Machine page contract passed.`

- [ ] **Step 7: Run focused lint**

```bash
./node_modules/.bin/eslint \
  'app/products/[id]/page.tsx' \
  components/ExchangeTableFiberLaserCuttingMachineSolutionPage.tsx \
  data/exchange-table-fiber-laser-cutting-machine-page.ts \
  scripts/verify-exchange-table-fiber-laser-cutting-machine-page.mjs
```

Expected: exit 0 with no errors.

- [ ] **Step 8: Commit**

```bash
git add app/products/[id]/page.tsx components/ExchangeTableFiberLaserCuttingMachineSolutionPage.tsx
git commit -m "feat: build exchange table laser cutting solution page"
```

---

### Task 5: Rendered QA, Full Verification, and Local Integration

**Files:**
- Modify only files required by verified QA findings.
- Do not commit screenshots or temporary browser scripts.

**Interfaces:**
- Consumes: the completed dedicated page.
- Produces: evidence-backed desktop/mobile QA, clean repository checks, and a verified local merge to `main`.

- [ ] **Step 1: Run the local server and Browser QA**

Test flow: `/products/exchange-table-fiber-laser-cutting-machine` → page loads → Applications show ten real photos → technical table scrolls locally → first FAQ expands and displays its answer.

Check page URL/title, one H1, no framework overlay, console errors/warnings, 18 sections, image count, image loading attributes, root width, table column count, label/unit styles, original spec values, placeholder values, CTA links, Product/FAQ/Breadcrumb schemas, and absence of offers/price/QR.

- [ ] **Step 2: Test desktop and mobile viewports**

Use 1080 × 900 and 390 × 844. Confirm no root overflow, single-column mobile Applications, local table/comparison scroll, full-width mobile CTA, readable FAQ, and unchanged machine proportions.

- [ ] **Step 3: Compare screenshots with the accepted concepts**

Use Browser screenshots and `view_image`. Record at least five fidelity points, above-fold copy differences, intentional source-integrity deviations, and any fixes. Confirm no material mismatch remains.

- [ ] **Step 4: Run complete verification with bounded logs**

```bash
npm run verify:exchange-table-laser
npm run lint > /tmp/exchange-table-lint.log 2>&1; code=$?; echo "lint exit code: $code"; tail -n 120 /tmp/exchange-table-lint.log; exit $code
npm run build > /tmp/exchange-table-build.log 2>&1; code=$?; echo "build exit code: $code"; tail -n 120 /tmp/exchange-table-build.log; exit $code
```

Expected: all exit codes 0.

- [ ] **Step 5: Merge and verify on main**

Merge the feature branch locally with a merge commit, rerun the focused contract, full lint, and full build from the main repository, then remove the owned `.worktrees/` worktree and delete the merged feature branch.

- [ ] **Step 6: Report the result**

Report changed files, the 18 modules, SEO, desktop/mobile checks, contract/lint/build evidence, visual-reference paths, intentional deviations, merge commit, and the production-deployment boundary.
