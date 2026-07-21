# Manual Folding Machine Solution Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated, solution-led Manual Folding Machine product page that preserves the existing image and all four verified technical rows while adding professional selection, workflow, FAQ, and SEO content.

**Architecture:** Keep the verified machine data in the existing product model, place page-specific copy in a typed content module, and render it through a focused React server component selected by the existing dynamic product route. A static contract script drives the implementation and the existing full-product verifier guards shared catalog behavior.

**Tech Stack:** Next.js 15 App Router, React 19 server components, TypeScript, Tailwind CSS, `next/image`, `next/link`, Lucide React, Node verification scripts.

## Global Constraints

- Keep the canonical product route `/products/manual-sheet-metal-folding-machine` and current catalog product name.
- Use exactly one H1 with visible text `Manual Folding Machine`.
- Reuse `/products/catalog/manual-sheet-metal-folding-machine.png`; do not generate, invent, recolor, or structurally alter machine imagery.
- Preserve all values in the four existing WS specification rows exactly.
- Keep each parameter label on one unbroken line and display a parenthesized unit on a centered second line.
- Use only verified handwheel, lever, clamping-beam, and folding-beam structure claims.
- Do not add price, offers, stock, rating, review, QR-code, phone, WeChat, fake performance data, or fake detail imagery.
- Do not add dependencies.
- This plan commits locally on `main` following the established project workflow; it does not push or deploy.

---

### Task 1: Define the dedicated-page contract

**Files:**
- Create: `scripts/verify-manual-folding-machine-page.mjs`

**Interfaces:**
- Consumes: source files under `data/`, `components/`, and `app/products/[id]/page.tsx`
- Produces: a zero-exit verification command that proves the required page contract

- [ ] **Step 1: Write the failing verification script**

Create a Node ESM script that reads the product data, dedicated content file, dedicated component, and route source. Define `assertContains(source, value, label)` and assert:

```js
const rows = [
  ["WS-1.5X1300B", "55", "400", "0.3-1.5 mm", "1300", "1980 x 800 x 1320"],
  ["WS-1.5X1500B", "55", "450", "0.3-1.5 mm", "1500", "2180 x 800 x 1320"],
  ["WS-1.5X2000B", "55", "550", "0.3-1.5 mm", "2000", "2680 x 800 x 1320"],
  ["WS-1.5X2500B", "55", "600", "0.3-1.5 mm", "2500", "3180 x 800 x 1320"],
];

const sections = [
  "hero", "problems", "solutions", "applications", "materials", "process",
  "advantages", "comparison", "equipment", "selection", "technical", "faq", "cta",
];
```

The script must also require the exact meta title and description, `FAQPage`, `ProductModel`, `BreadcrumbList`, no `offers`/price/rating/availability properties, `whitespace-nowrap`, centered unit markup, `overflow-x-auto`, the exact table note, and a route branch for `manual-sheet-metal-folding-machine`.

- [ ] **Step 2: Run the contract and verify RED**

Run:

```bash
node scripts/verify-manual-folding-machine-page.mjs
```

Expected: exit code 1 because `data/manual-folding-machine-page.ts` and the dedicated component do not exist.

- [ ] **Step 3: Commit the failing contract**

```bash
git add scripts/verify-manual-folding-machine-page.mjs
git commit -m "test: define manual folding page contract"
```

---

### Task 2: Add typed solution content

**Files:**
- Create: `data/manual-folding-machine-page.ts`

**Interfaces:**
- Produces: `manualFoldingMachinePageContent`, a serializable typed object consumed by the page component

- [ ] **Step 1: Define the content types**

Create focused types for `HeroContent`, `ProblemCard`, `SolutionCard`, `Application`, `ProcessStep`, `ComparisonRow`, `EquipmentLink`, `FaqItem`, and the aggregate `ManualFoldingMachinePageContent`. Keep all values strings or arrays so the file remains server-safe and easy to audit.

- [ ] **Step 2: Add the approved content**

Populate the object with the brief's exact hero title, subtitle, description, CTA labels, four proof labels, five problems, three solution groups, eight applications, six materials, six process steps, verified advantages, seven comparison rows, nine equipment workflow links, nine selection questions, eight FAQs, and final CTA. Use these verified structure statements only:

```ts
[
  "Manual handwheel and lever operation",
  "Clamping beam secures the sheet before folding",
  "Folding beam forms the sheet along the bending axis",
  "No electrical, hydraulic or compressed-air power required",
]
```

Use existing product hrefs such as `/products/electric-sheet-metal-folding-machine`, `/products/hydraulic-sheet-metal-folding-machine`, `/products/multi-function-lock-forming-machine`, `/products/five-line-beading-machine`, `/products/tdf-flange-forming-machine`, `/products/electric-duct-seam-closing-machine`, `/products/nc-hydraulic-press-brake`, and `/products/u-shaped-auto-duct-production-line-5`.

- [ ] **Step 3: Run the contract**

Run `node scripts/verify-manual-folding-machine-page.mjs`.

Expected: still RED, now because the dedicated component and route branch are missing.

- [ ] **Step 4: Commit the content module**

```bash
git add data/manual-folding-machine-page.ts
git commit -m "feat: add manual folding solution content"
```

---

### Task 3: Build the dedicated server component

**Files:**
- Create: `components/ManualFoldingMachineSolutionPage.tsx`

**Interfaces:**
- Consumes: `product: Product` and `manualFoldingMachinePageContent`
- Produces: the complete semantic page with all thirteen `data-section` markers and safe JSON-LD

- [ ] **Step 1: Add shared local helpers**

Implement:

```ts
const splitColumnHeading = (column: string) => {
  const normalized = column.replace(/\s+/g, " ").trim();
  const match = normalized.match(/^(.*?)(\([^()]+\))$/);
  return match ? { label: match[1].trim(), unit: match[2] } : { label: normalized, unit: "" };
};

const jsonLd = (value: object) => JSON.stringify(value).replace(/</g, "\\u003c");
```

Add small reusable helpers for section introductions, application line drawings, and the code-native folding-process diagram. Keep the component a server component with no `use client` directive.

- [ ] **Step 2: Add safe schemas**

Create `ProductModel`, `BreadcrumbList`, and `FAQPage` objects. Map all technical columns and all four rows into `additionalProperty`; omit commercial properties entirely. Render each object through an `application/ld+json` script using `jsonLd`.

- [ ] **Step 3: Implement the hero and narrative sections**

Render sections `hero`, `problems`, `solutions`, `applications`, `materials`, `process`, and `advantages`. Use the existing image with:

```tsx
<Image
  src={product.image}
  alt="Manual folding machine for sheet metal edge bending"
  fill
  loading="lazy"
  sizes="(min-width: 1024px) 50vw, 100vw"
  className="object-contain"
/>
```

Use a desktop left-copy/right-image grid, stacked mobile layout, `#0B0D10` and graphite backgrounds, `#76B900` accents, fine borders, restrained hover transforms, and full-width mobile CTA buttons.

- [ ] **Step 4: Implement decision and workflow sections**

Render `comparison`, `equipment`, and `selection`. The comparison must remain objective. Equipment cards must use `next/link` and real routes. The selection CTA links to `/contact`.

- [ ] **Step 5: Implement the exact technical table**

Throw a clear error if `product.technicalParameters` is missing. Render all columns and all four rows. Each `<th>` must use `whitespace-nowrap text-center`; display `{label}` and, when present, `<span className="mt-1 block text-center">{unit}</span>`. Wrap only the table in `overflow-x-auto` and set a stable minimum width so the mobile document itself does not overflow.

- [ ] **Step 6: Implement FAQ and final CTA**

Use semantic `<details>`/`<summary>` elements for the eight FAQ items and two contact links for the final CTA. Complete all thirteen section markers and maintain one visible H1.

- [ ] **Step 7: Run the contract**

Run `node scripts/verify-manual-folding-machine-page.mjs`.

Expected: still RED only for the missing route import/branch/metadata.

- [ ] **Step 8: Commit the component**

```bash
git add components/ManualFoldingMachineSolutionPage.tsx
git commit -m "feat: build manual folding solution page"
```

---

### Task 4: Route the page and add exact SEO metadata

**Files:**
- Modify: `app/products/[id]/page.tsx`
- Modify: `scripts/verify-all-product-solution-pages.mjs`

**Interfaces:**
- Consumes: `ManualFoldingMachineSolutionPage`
- Produces: dedicated rendering and metadata for `/products/manual-sheet-metal-folding-machine`

- [ ] **Step 1: Import and select the component**

Add the direct import and return `<ManualFoldingMachineSolutionPage product={product} />` before the shared page fallback when the product id equals `manual-sheet-metal-folding-machine`.

- [ ] **Step 2: Add exact metadata**

Add a product-specific metadata branch with:

```ts
const title = "Manual Folding Machine | Sheet Metal Edge Bending Solution";
const description = "Manual folding machine for thin sheet metal bending, edge folding, HVAC duct panel forming, roofing sheet metal and light fabrication workshops. Get a suitable manual sheet metal folding solution.";
```

Include all nine approved SEO keywords, canonical URL, Open Graph, Twitter card, the existing image, and exact image alt `Manual folding machine for sheet metal edge bending`.

- [ ] **Step 3: Update page-count expectations**

Change the all-product verifier's dedicated count from 6 to 7 and shared count from 47 to 46 while keeping the total product count at 53.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
node scripts/verify-manual-folding-machine-page.mjs
node scripts/verify-all-product-solution-pages.mjs
```

Expected: both commands exit 0 and report 53 total products, 7 dedicated pages, and 46 shared pages.

- [ ] **Step 5: Commit route integration**

```bash
git add app/products/[id]/page.tsx scripts/verify-all-product-solution-pages.mjs
git commit -m "feat: route manual folding product page"
```

---

### Task 5: Full regression and rendered QA

**Files:**
- Modify only if a test reveals a requirement-scoped defect

**Interfaces:**
- Produces: fresh evidence that static contracts, lint, types, production build, responsive rendering, schema, and interaction work

- [ ] **Step 1: Run every static verifier**

```bash
for script in scripts/verify-*.mjs; do node "$script" || exit 1; done
```

Expected: all scripts exit 0.

- [ ] **Step 2: Run lint and type checking with bounded logs**

```bash
npm run lint > /tmp/manual-folding-lint.log 2>&1
npx tsc --noEmit > /tmp/manual-folding-tsc.log 2>&1
```

Expected: both exit 0 with no warnings or errors.

- [ ] **Step 3: Run the production build with bounded output**

```bash
npm run build > /tmp/manual-folding-build.log 2>&1
```

Expected: exit 0 and the generated routes include `/products/manual-sheet-metal-folding-machine`.

- [ ] **Step 4: Validate the rendered page**

Start the production server locally. The flow under test is: `/products/manual-sheet-metal-folding-machine` loads → FAQ disclosure opens and primary CTA is clicked → answer becomes visible and `/contact` renders without runtime errors.

Use Browser/IAB first. If invocation fails, record the exact error and use an existing Playwright-compatible browser without adding repository dependencies. Check desktop 1440px and mobile 390px: page title and URL, meaningful DOM, no framework overlay, console health, image dimensions, one H1, all thirteen sections, all four parameter rows, FAQ interaction, CTA navigation, no document overflow, and table-only horizontal scrolling.

- [ ] **Step 5: Perform fidelity inspection**

Use `view_image` on the existing product image and the latest desktop/mobile implementation screenshots. Record at least these comparison points: exact hero copy, desktop grid and mobile stack, brand palette, unchanged machine asset, technical-header/unit layout, section rhythm, CTA behavior, and absence of fake visual or commercial content. Fix material mismatches and repeat the browser checks.

- [ ] **Step 6: Verify the final diff and repository state**

```bash
git diff --check
git status --short
```

Expected: no whitespace errors and only intentional task files are modified.

- [ ] **Step 7: Commit any QA fixes**

```bash
git add components/ManualFoldingMachineSolutionPage.tsx data/manual-folding-machine-page.ts app/products/'[id]'/page.tsx scripts/verify-manual-folding-machine-page.mjs scripts/verify-all-product-solution-pages.mjs
git commit -m "fix: refine manual folding page QA"
```

Skip this commit when there are no post-route QA changes.
