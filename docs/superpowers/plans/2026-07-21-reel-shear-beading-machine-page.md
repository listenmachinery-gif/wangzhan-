# Reel Shear Beading Machine Product Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the reel shear product, give it a dedicated thin-sheet cutting and beading solution page, preserve its verified parameters, migrate its URL safely, and publish the result to the existing production site.

**Architecture:** Keep product identity and verified parameters in `data/products.ts`, place the dedicated editorial content in a focused configuration module, and render it through a server component selected by the existing dynamic product route. The global layout remains unchanged. URL compatibility is handled by the existing generated redirect mechanism.

**Tech Stack:** Next.js 15 App Router, React 19 server components, TypeScript, Tailwind CSS 3, Lucide React, Node assertion scripts, Vercel.

## Global Constraints

- Canonical display name and H1 are exactly `Reel Shear Beading Machine`.
- Preserve `LQ-15`, `0.5–1.2`, `Beading / slitting profiles`, `1.5`, `260`, and `1600 × 630 × 1120` as the only model-row values.
- Reuse `/products/catalog/slitting-and-beading-machine.png`; do not create or modify product imagery.
- Do not add prices, offers, stock, ratings, reviews, CNC claims, automatic-operation claims, or unverified capacity.
- Use one H1, `#76B900` accents, responsive single-column mobile cards, and no page-level horizontal overflow.
- Keep table labels unbroken, place parenthesized units on a centered second line, and limit horizontal scrolling to table wrappers.
- Add ProductModel, BreadcrumbList, and FAQPage JSON-LD without commerce or review fields.
- Preserve the global header, footer, navigation, contact route, and all unrelated product pages.

---

### Task 1: Define the Reel Shear Contract

**Files:**
- Modify: `scripts/verify-slitting-and-beading-machine-parameters.mjs`

**Interfaces:**
- Consumes: repository source files as UTF-8 text.
- Produces: a failing-then-passing source contract covering product identity, redirects, page modules, metadata, schemas, parameter values, and table-header layout.

- [ ] **Step 1: Replace the old product-name assertion and add dedicated-page assertions**

Use `dataPath`, `componentPath`, `routePath`, `productsPath`, and `nextConfigPath` constants. Assert all of the following exact behavior:

```js
assert.match(productsSource, /name:\s*"Reel Shear Beading Machine"/);
assert.match(productsSource, /legacyIds:\s*\["slitting-and-beading-machine",\s*"roller-shear-beading-machine"\]/);
assert.match(productsSource, /image:\s*"\/products\/catalog\/slitting-and-beading-machine\.png"/);

for (const value of [
  "LQ-15",
  "0.5–1.2",
  "Beading / slitting profiles",
  "1.5",
  "260",
  "1600 × 630 × 1120",
]) {
  assert.ok(productSeed[0].includes(value), `Missing Reel Shear parameter: ${value}`);
}

for (const section of [
  "hero", "problems", "solutions", "applications", "materials", "workflow",
  "advantages", "comparison", "selection", "technical", "faq", "related", "cta",
]) {
  assert.ok(componentSource.includes(`data-section="${section}"`), `Missing section: ${section}`);
}

assert.match(componentSource, /splitColumnHeading/);
assert.match(componentSource, /whitespace-nowrap/);
assert.match(componentSource, /heading\.unit/);
assert.match(componentSource, /"@type":\s*"FAQPage"/);
assert.doesNotMatch(componentSource, /priceCurrency|aggregateRating|availability|offers:/);
assert.match(routeSource, /ReelShearBeadingSolutionPage/);
assert.match(routeSource, /Reel Shear Beading Machine \| Sheet Metal Cutting and Beading Solution/);
```

- [ ] **Step 2: Run the contract and verify RED**

Run: `node scripts/verify-slitting-and-beading-machine-parameters.mjs`

Expected: FAIL because `Reel Shear Beading Machine`, its dedicated configuration, component, and route guard do not yet exist.

- [ ] **Step 3: Commit the failing contract**

```bash
git add scripts/verify-slitting-and-beading-machine-parameters.mjs
git commit -m "test: define reel shear solution page contract"
```

---

### Task 2: Rename the Product Without Losing Its Image or Old URLs

**Files:**
- Modify: `data/products.ts`

**Interfaces:**
- Consumes: `ProductSeed`, `slugify`, and `legacyProductRedirects`.
- Produces: canonical product ID `reel-shear-beading-machine`, an explicit image override, and permanent redirects from both previous IDs.

- [ ] **Step 1: Add the image override to `ProductSeed` and product mapping**

```ts
type ProductSeed = {
  name: string;
  image?: string;
  tagline: string;
  parentName?: string;
  detailKey?: string;
  legacyIds?: string[];
  seoTerms?: string[];
  specs?: Spec[];
  highlights?: string[];
  applications?: string[];
  options?: string[];
  technicalParameters?: TechnicalParameterTable;
};
```

Map the image with:

```ts
image: seed.image ?? `/products/catalog/${id}.png`,
```

- [ ] **Step 2: Rename and migrate the reel shear seed**

```ts
{
  name: "Reel Shear Beading Machine",
  image: "/products/catalog/slitting-and-beading-machine.png",
  tagline: "Compact cutting and beading solution for thin sheet metal and HVAC duct fabrication.",
  legacyIds: ["slitting-and-beading-machine", "roller-shear-beading-machine"],
  seoTerms: [
    "Rolling Shear Beading Machine",
    "Sheet Metal Beading and Cutting Machine",
    "Duct Beading Machine",
    "HVAC Duct Beading Machine",
    "Sheet Metal Reinforcement Machine",
    "Thin Sheet Cutting and Beading Machine",
    "Duct Fabrication Machine",
  ],
  technicalParameters: {
    columns: [
      "Model",
      "Sheet Thickness (mm)",
      "Shape",
      "Power (kW)",
      "Weight (kg)",
      "Dimensions L × W × H (mm)",
    ],
    rows: [["LQ-15", "0.5–1.2", "Beading / slitting profiles", "1.5", "260", "1600 × 630 × 1120"]],
  },
}
```

- [ ] **Step 3: Run the focused contract**

Run: `node scripts/verify-slitting-and-beading-machine-parameters.mjs`

Expected: still FAIL at the missing dedicated content/component/route assertions, while the product identity assertions pass.

- [ ] **Step 4: Commit the product identity migration**

```bash
git add data/products.ts
git commit -m "feat: rename reel shear beading machine"
```

---

### Task 3: Add Product-Specific Solution Content

**Files:**
- Create: `data/reel-shear-beading-page.ts`

**Interfaces:**
- Consumes: no runtime service or client state.
- Produces: `reelShearBeadingPageContent`, `ReelShearCard`, and `ReelShearFaq` for the dedicated server component.

- [ ] **Step 1: Define typed content structures**

```ts
export type ReelShearCard = {
  title: string;
  text: string;
};

export type ReelShearFaq = {
  question: string;
  answer: string;
};
```

- [ ] **Step 2: Export the complete configuration**

Export `reelShearBeadingPageContent` with these exact top-level fields:

```ts
export const reelShearBeadingPageContent = {
  hero: {
    eyebrow: "Thin Sheet Cutting & Beading Solution",
    title: "Reel Shear Beading Machine",
    subtitle: "Compact cutting and beading solution for thin sheet metal and HVAC duct fabrication.",
    description: "A practical machine for sheet metal cutting, plate opening and reinforcement beading. Suitable for ventilation duct workshops, HVAC sheet metal processing, construction duct fabrication and light sheet metal forming.",
    valuePoints: [
      "Cutting and Beading in One Machine",
      "Suitable for Thin Sheet Metal",
      "Compact Workshop Equipment",
      "Practical for Duct Fabrication",
    ],
  },
  problems: [
    { title: "Manual sheet cutting is slow", text: "Support basic thin-sheet blanking and sectional cutting with less fully manual handling." },
    { title: "Flat duct sheets need more rigidity", text: "Form reinforcement beads that help reduce deformation across flat duct panels." },
    { title: "Small workshops need compact machines", text: "Fit duct-processing points, job sites, and small sheet-metal workshops where floor space is limited." },
    { title: "Separate tools increase handling time", text: "Bring cutting and beading into one compact workstation to reduce process changes." },
    { title: "Duct fabrication needs flexible processing", text: "Support varied thin-sheet and duct-panel preparation requirements in daily work." },
  ],
  solutions: [
    { title: "On-site Duct Fabrication", suitableFor: "Ventilation installation teams and job-site fabrication points", recommendedUse: "Basic thin-sheet cutting and reinforcement beading near the installation area", productionValue: "A compact supporting machine for flexible site work" },
    { title: "Small HVAC Workshop", suitableFor: "Small duct factories and repair or fabrication shops", recommendedUse: "Daily sheet opening, trimming, and duct-panel reinforcement", productionValue: "Combines two practical preparation steps in one workstation" },
    { title: "Supporting Machine in Duct Production Line", suitableFor: "Workshops already using lock formers, folding machines, shears, or TDF/TDC flange machines", recommendedUse: "Auxiliary cutting and beading within the wider duct workflow", productionValue: "Fills a focused preparation role without replacing the full line" },
  ],
  applications: [
    { title: "HVAC duct fabrication", text: "Prepare thin duct sheets before folding, locking, flanging, and assembly." },
    { title: "Ventilation duct installation", text: "Support practical cutting and beading tasks near the installation workflow." },
    { title: "Galvanized sheet processing", text: "Handle suitable galvanized thin sheet after material and thickness confirmation." },
    { title: "Construction site duct work", text: "Provide a compact preparation station where large production equipment is impractical." },
    { title: "Light sheet metal workshop", text: "Combine two common preparation operations for mixed small-batch work." },
    { title: "Air duct reinforcement", text: "Add reinforcement beads to help improve the rigidity of suitable duct panels." },
  ],
  materials: ["Galvanized Sheet", "Mild Steel Sheet", "Stainless Steel Sheet", "Aluminum Sheet", "Color Steel Sheet", "Thin Metal Plate"],
  workflow: [
    { title: "Sheet Preparation", text: "Prepare galvanized sheet or thin metal plate according to duct size." },
    { title: "Cutting / Plate Opening", text: "Use the machine for basic sheet cutting or plate opening." },
    { title: "Beading Reinforcement", text: "Form reinforcement ribs to improve sheet rigidity." },
    { title: "Folding or Lock Forming", text: "Continue with a folding machine, lock former, or flange forming machine." },
    { title: "Duct Assembly", text: "Assemble duct panels for ventilation or HVAC projects." },
    { title: "Installation", text: "Move finished ducts to the planned site installation." },
  ],
  advantages: [
    "Combines cutting and beading functions",
    "Compact structure for small workshops",
    "Suitable for confirmed thin sheet metal processing",
    "Helps reinforce duct panels",
    "Practical operation for daily fabrication",
    "Supporting equipment for duct production",
    "Works in a wider flow with folding, lock forming, and flange forming machines",
  ],
  comparison: [
    { label: "Main function", reelShear: "Basic thin-sheet cutting and reinforcement beading", multiLine: "Continuous multi-line reinforcement beading" },
    { label: "Cutting ability", reelShear: "Included for suitable thin-sheet preparation", multiLine: "Not the primary function" },
    { label: "Beading ability", reelShear: "Focused beading for flexible preparation", multiLine: "Multiple reinforcement lines for duct panels" },
    { label: "Suitable workshop", reelShear: "Job sites and small or mixed-production workshops", multiLine: "Duct workshops with regular panel reinforcement work" },
    { label: "Production flexibility", reelShear: "Combines two basic operations in one compact machine", multiLine: "Specialized for repeat multi-line beading" },
    { label: "Recommended use", reelShear: "Flexible cutting and beading support", multiLine: "Batch duct-panel reinforcement" },
  ],
  selectionQuestions: [
    "Sheet material", "Maximum sheet thickness", "Sheet width or working length", "Cutting requirement",
    "Beading shape requirement", "Daily production quantity", "Factory or job-site use", "Voltage requirement",
    "Machines that must connect with this process",
  ],
  faqs: [
    { question: "What is a reel shear beading machine?", answer: "It is a practical machine for suitable thin-sheet cutting and reinforcement beading, commonly used in duct fabrication and job-site sheet-metal preparation." },
    { question: "What is the difference between a reel shear beading machine and a duct beading machine?", answer: "A conventional multi-line duct beading machine focuses on forming several reinforcement beads, while a reel shear beading machine combines basic cutting and beading functions." },
    { question: "What materials can this machine process?", answer: "Typical applications include galvanized sheet, thin mild steel, stainless steel, aluminum, and color steel. Actual suitability depends on material strength, thickness, configuration, and tooling." },
    { question: "Is it suitable for HVAC duct fabrication?", answer: "It can support basic preparation work in HVAC duct workshops, ventilation projects, job sites, and small fabrication shops." },
    { question: "Can it replace a full automatic duct production line?", answer: "No. It is better positioned as compact workshop equipment, a job-site machine, or a supporting station in a wider duct-production process." },
    { question: "Can it work with other duct machines?", answer: "It can be placed in a workflow with lock formers, folding machines, flange machines, and shears when the overall process is matched correctly." },
    { question: "What information should I provide before quotation?", answer: "Provide material, thickness, sheet width, required cutting and beading work, daily quantity, voltage, and destination country or port." },
    { question: "Can the roller or tooling be customized?", answer: "Tooling options may be reviewed for the required bead shape and process. Final availability must be confirmed by a sales engineer." },
  ],
  relatedLinks: [
    { label: "Duct Beading Machine", href: "/products/five-line-beading-machine" },
    { label: "Lock Forming Machine", href: "/products/multi-function-lock-forming-machine" },
    { label: "Folding Machine", href: "/products/manual-sheet-metal-folding-machine" },
    { label: "TDF Flange Forming Machine", href: "/products/tdf-flange-forming-machine" },
    { label: "Electric Shearing Machine", href: "/products/compact-electric-shearing-machine" },
    { label: "HVAC Duct Production Line", href: "/products/u-shaped-auto-duct-production-line-5" },
  ],
} as const;
```

- [ ] **Step 3: Run TypeScript checking**

Run: `npx tsc --noEmit`

Expected: PASS with no type errors.

- [ ] **Step 4: Commit the content configuration**

```bash
git add data/reel-shear-beading-page.ts
git commit -m "feat: add reel shear solution content"
```

---

### Task 4: Build the Dedicated Server Component

**Files:**
- Create: `components/ReelShearBeadingSolutionPage.tsx`

**Interfaces:**
- Consumes: `{ product: Product }` and `reelShearBeadingPageContent`.
- Produces: a server-rendered product detail page with the required sections and three JSON-LD blocks.

- [ ] **Step 1: Add safe helpers and schemas**

```ts
const splitColumnHeading = (column: string) => {
  const normalized = column.replace(/\s+/g, " ").trim();
  const match = normalized.match(/^(.*?)(\([^()]+\))$/);
  return match ? { label: match[1].trim(), unit: match[2] } : { label: normalized, unit: "" };
};

const jsonLd = (value: object) => JSON.stringify(value).replace(/</g, "\\u003c");
```

Build `ProductModel`, `BreadcrumbList`, and `FAQPage` objects. ProductModel may include `additionalProperty` from the verified table but must not contain `offers`, price, availability, rating, or reviews.

- [ ] **Step 2: Render all page sections**

Render these exact section markers in order:

```tsx
<section data-section="hero" />
<section data-section="problems" />
<section data-section="solutions" />
<section data-section="applications" />
<section data-section="materials" />
<section data-section="workflow" />
<section data-section="advantages" />
<section data-section="comparison" />
<section data-section="selection" />
<section data-section="technical" />
<section data-section="faq" />
<section data-section="related" />
<section data-section="cta" />
```

Use semantic headings, lists, tables, and `<details>` FAQ disclosure elements. The hero must contain the only H1. Contact CTAs link to `/contact`. Internal product links use verified canonical product paths.

- [ ] **Step 3: Implement the parameter-header rule**

```tsx
<th className="whitespace-nowrap bg-[#111315] px-4 py-4 text-center font-semibold text-white">
  <span className="block">{heading.label}</span>
  {heading.unit ? (
    <span className="mt-1 block text-[0.72rem] font-medium text-zinc-400">
      {heading.unit}
    </span>
  ) : null}
</th>
```

Wrap the table in `max-w-full overflow-x-auto` and give the table a sufficient minimum width so labels never wrap.

- [ ] **Step 4: Run the focused contract**

Run: `node scripts/verify-slitting-and-beading-machine-parameters.mjs`

Expected: still FAIL only at missing route and metadata assertions.

- [ ] **Step 5: Commit the component**

```bash
git add components/ReelShearBeadingSolutionPage.tsx
git commit -m "feat: build reel shear solution page"
```

---

### Task 5: Connect Metadata and Routing

**Files:**
- Modify: `app/products/[id]/page.tsx`

**Interfaces:**
- Consumes: product ID `reel-shear-beading-machine` and `ReelShearBeadingSolutionPage`.
- Produces: dedicated metadata and page rendering at the canonical route.

- [ ] **Step 1: Import the component and add product-specific metadata**

```ts
import ReelShearBeadingSolutionPage from "@/components/ReelShearBeadingSolutionPage";
```

For the reel shear product return the exact title and description from the design, requested keywords, canonical path, Open Graph image/alt, and Twitter summary image.

- [ ] **Step 2: Add the dedicated render guard before the shared-page fallback**

```tsx
if (product.id === "reel-shear-beading-machine") {
  return <ReelShearBeadingSolutionPage product={product} />;
}
```

- [ ] **Step 3: Verify GREEN**

Run: `node scripts/verify-slitting-and-beading-machine-parameters.mjs`

Expected: `Reel Shear Beading Machine page contract passed.`

- [ ] **Step 4: Run all source contracts and TypeScript**

Run:

```bash
for script in scripts/verify-*.mjs; do node "$script"; done
npx tsc --noEmit
```

Expected: every script exits 0 and TypeScript exits 0.

- [ ] **Step 5: Commit the route integration**

```bash
git add app/products/[id]/page.tsx scripts/verify-slitting-and-beading-machine-parameters.mjs
git commit -m "feat: route reel shear product page"
```

---

### Task 6: Production Build and Visual Verification

**Files:**
- Modify only files required by failures found in this task.

**Interfaces:**
- Consumes: the completed local page and Next.js production build.
- Produces: evidence for responsive layout, navigation, image, schemas, and production readiness.

- [ ] **Step 1: Run requested lint and production build**

Run:

```bash
npm run lint
npm run build
```

Expected: both commands exit 0. If the repository's existing lint script is incompatible with Next.js 15, record the exact error and use the installed TypeScript/source-contract checks without introducing an unrelated lint dependency.

- [ ] **Step 2: Start the production server and crawl the canonical page**

Run: `npm run start`

Check `/products/reel-shear-beading-machine` for HTTP 200, one H1, all 13 section markers, valid JSON-LD, and no prohibited schema fields. Check both old URLs for permanent redirects to the canonical path.

- [ ] **Step 3: Verify responsive rendering and interaction**

At desktop/tablet/mobile widths, inspect the hero order, product image, cards, workflow, FAQ, technical header units, table-only horizontal scrolling, full-width mobile CTAs, and page overflow. Click a CTA and confirm navigation to `/contact`.

- [ ] **Step 4: Commit any verified QA corrections**

```bash
git add components/ReelShearBeadingSolutionPage.tsx data/reel-shear-beading-page.ts app/products/[id]/page.tsx scripts/verify-slitting-and-beading-machine-parameters.mjs data/products.ts
git commit -m "fix: refine reel shear responsive layout"
```

Skip this commit when visual verification requires no source correction.

---

### Task 7: Publish and Verify Production

**Files:**
- No source files unless production-only verification exposes a reproducible defect.

**Interfaces:**
- Consumes: verified Git HEAD and the existing Vercel project binding.
- Produces: synchronized GitHub `main`, a ready Vercel production deployment, and a verified public canonical page.

- [ ] **Step 1: Run the final verification gate**

Run:

```bash
git diff --check
git status --short --branch
for script in scripts/verify-*.mjs; do node "$script"; done
npx tsc --noEmit
npm run build
```

Expected: clean diff check, no uncommitted changes, all scripts pass, TypeScript passes, and build exits 0.

- [ ] **Step 2: Push the current main branch without force**

Run: `git push origin main`

Expected: remote `main` advances to the exact local HEAD.

- [ ] **Step 3: Deploy to the linked Vercel production project**

Run: `npx vercel --prod --yes`

Expected: deployment status Ready and alias `https://www.zyroncnc.com`.

- [ ] **Step 4: Verify the public result**

Confirm:

```text
https://www.zyroncnc.com/products/reel-shear-beading-machine -> 200
https://www.zyroncnc.com/products/slitting-and-beading-machine -> permanent redirect
https://www.zyroncnc.com/products/roller-shear-beading-machine -> permanent redirect
```

Verify the canonical URL appears in `sitemap.xml`, the old canonical is absent, the public page contains all required sections, one H1, the exact verified parameter row, valid JSON-LD, and no price/rating/stock fields.
