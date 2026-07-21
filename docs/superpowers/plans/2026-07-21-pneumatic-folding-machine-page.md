# Pneumatic Folding Machine Solution Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated Pneumatic Folding Machine solution page with eight unique real application photographs, unchanged verified QS specifications, professional responsive layout and complete SEO.

**Architecture:** Keep verified machine facts and parameter rows in `data/bending-details.ts`, put page-specific typed copy and photo mappings in a focused data module, and render the route through a dedicated React server component. A source contract drives implementation, existing catalog tests prevent regressions, and locally stored WebP assets avoid runtime image-host dependencies.

**Tech Stack:** Next.js 15 App Router, React 19 server components, TypeScript, Tailwind CSS, `next/image`, `next/link`, Lucide React, Node ESM verification scripts and the existing Sharp runtime.

## Global Constraints

- Keep `/products/pneumatic-sheet-metal-folding-machine` and the current product identity.
- Use exactly one H1: `Pneumatic Folding Machine`.
- Reuse `/products/catalog/pneumatic-sheet-metal-folding-machine.png`; do not alter the machine or generate fake close-ups.
- Preserve all five existing QS parameter rows and every cell exactly.
- Keep each parameter label on one line and put its unit on a centered second line.
- Use eight unique real photos that do not reuse the Manual Folding Machine page files or Pexels source IDs.
- Use only project-verified four-cylinder, dual-folding-cylinder, dual-clamping-cylinder, foot-pedal and adjustable-die claims.
- Do not add dependencies, prices, offers, availability, ratings, reviews, QR codes, fake metrics or unsupported machine details.
- Preserve the global header, footer, navigation and responsive conventions.
- Finish with focused contracts, full product-page regression, lint, production build and desktop/mobile browser QA.

---

### Task 1: Define the dedicated-page contract

**Files:**
- Create: `scripts/verify-pneumatic-folding-machine-page.mjs`

**Interfaces:**
- Consumes: existing catalog and parameter sources plus the future content, component, asset manifest and route integration
- Produces: a zero-exit source contract for identity, content, parameters, photos, table behavior, schemas, metadata and routing

- [ ] **Step 1: Write the failing source contract**

Use Node `assert`, `existsSync`, `readFileSync`, `readdirSync`, `resolve` and `fileURLToPath`. Define these exact fixtures:

```js
const expectedRows = [
  ["QS-1.5 x 1000", "60 deg", "0.3-1.5 mm", "1000 mm", "380 kg", "1650 x 680 x 1350mm"],
  ["QS-1.5 x 1300", "60 deg", "0.3-1.5 mm", "1300 mm", "420 kg", "1980 x 800 x 1350mm"],
  ["QS-1.5 x 1500", "60 deg", "0.3-1.5 mm", "1500 mm", "550 kg", "2180 x 800 x 1350mm"],
  ["QS-1.5 x 2000", "60 deg", "0.3-1.5 mm", "2000 mm", "620 kg", "2680 x 800 x 1350mm"],
  ["QS-1.5 x 2500", "60 deg", "0.3-1.5 mm", "2500 mm", "700 kg", "3180 x 800 x 1350mm"],
];

const requiredSections = [
  "hero", "problems", "solutions", "applications", "materials", "air",
  "process", "advantages", "comparison", "equipment", "selection",
  "technical", "faq", "cta",
];

const applicationImages = [
  "/products/pneumatic-folding-applications/hvac-duct-panel-folding.webp",
  "/products/pneumatic-folding-applications/rectangular-air-duct-fabrication.webp",
  "/products/pneumatic-folding-applications/ventilation-duct-workshop.webp",
  "/products/pneumatic-folding-applications/galvanized-sheet-folding.webp",
  "/products/pneumatic-folding-applications/light-sheet-metal-fabrication.webp",
  "/products/pneumatic-folding-applications/electrical-cabinet-enclosure.webp",
  "/products/pneumatic-folding-applications/stainless-steel-light-forming.webp",
  "/products/pneumatic-folding-applications/construction-sheet-metal-work.webp",
];
```

Require the exact route metadata, one H1 using `content.hero.title`, hero alt, all fourteen section markers, every exact row in `data/bending-details.ts`, a `technicalHeadings` display map, `whitespace-nowrap`, centered block units, `max-w-full overflow-x-auto`, eight unique application paths, eight alt values, a source manifest containing IDs `30749458`, `10033425`, `5505867`, `36497859`, `11617523`, `33694032`, `5362681`, `29386093` and `https://www.pexels.com/license/`, plus `ProductModel`, `BreadcrumbList` and `FAQPage` without commercial/review schema fields.

- [ ] **Step 2: Run the contract and verify RED**

```bash
node scripts/verify-pneumatic-folding-machine-page.mjs
```

Expected: exit 1 because the dedicated content, component and photo directory do not exist.

- [ ] **Step 3: Commit the failing contract**

```bash
git add scripts/verify-pneumatic-folding-machine-page.mjs
git commit -m "test: define pneumatic folding page contract"
```

---

### Task 2: Add typed page content

**Files:**
- Create: `data/pneumatic-folding-machine-page.ts`

**Interfaces:**
- Produces: `pneumaticFoldingMachinePageContent`, `technicalHeadings` and serializable types consumed by the dedicated component

- [ ] **Step 1: Define focused content types**

Create types for hero, text cards, solution cards, application photos, compressed-air facts, process steps, comparison rows, equipment links and FAQ items. Use these exact interfaces for the special shapes:

```ts
export type PneumaticFoldingApplication = {
  title: string;
  text: string;
  image: string;
  alt: string;
};

export type PneumaticFoldingSolution = {
  title: string;
  suitableFor: string;
  recommendedUse: string;
  productionValue: string;
};

export type PneumaticFoldingComparisonRow = {
  item: string;
  manual: string;
  pneumatic: string;
  electric: string;
  hydraulic: string;
};
```

- [ ] **Step 2: Add the exact hero and table presentation map**

```ts
hero: {
  title: "Pneumatic Folding Machine",
  subtitle: "Efficient air-driven sheet metal folding solution for HVAC duct fabrication and thin metal forming.",
  description: "A practical pneumatic folding machine for thin sheet metal bending, duct panel folding and edge forming. Driven by compressed air, it helps workshops reduce manual labor, improve daily folding efficiency and support rectangular duct production.",
  primaryCta: "Get Pneumatic Folding Solution",
  secondaryCta: "Request Machine Configuration",
  proofPoints: [
    "Air-driven Folding",
    "Suitable for HVAC Duct Panels",
    "Easier Than Manual Folding",
    "Practical for Thin Sheet Metal",
  ],
},

export const technicalHeadings = [
  { source: "Model", label: "Model", unit: "" },
  { source: "Minimum Bending Angle", label: "Minimum Bending Angle", unit: "(deg)" },
  { source: "Bending Thickness", label: "Bending Thickness", unit: "(mm)" },
  { source: "Bending Width", label: "Bending Width", unit: "(mm)" },
  { source: "Weight", label: "Weight", unit: "(kg)" },
  { source: "Overall Dimensions", label: "Overall Dimensions", unit: "(mm)" },
] as const;
```

- [ ] **Step 3: Populate all approved content**

Add the brief's five problems, three solution groups, eight application cards and paths, six materials, four compressed-air facts and two non-numeric air fields, six process steps, verified advantages, seven neutral four-machine comparison rows, seven workflow machines, eleven selection prompts, nine FAQs and final CTA. Restrict structural claims to the verified facts in `data/bending-details.ts`.

- [ ] **Step 4: Configure only verified internal links**

Use catalog-backed links for manual, electric and hydraulic folding machines plus shearing, beading, lock forming, TDF flange forming, lock seam closing, press brake and rectangular duct line products. Confirm every href exists in `data/products.ts`.

- [ ] **Step 5: Run the focused contract and commit the content**

```bash
node scripts/verify-pneumatic-folding-machine-page.mjs
git add data/pneumatic-folding-machine-page.ts
git commit -m "feat: add pneumatic folding solution content"
```

Expected: the contract still exits 1 only for absent photos, component and route integration.

---

### Task 3: Add eight licensed real application photos

**Files:**
- Create: `public/products/pneumatic-folding-applications/*.webp`
- Create: `public/products/pneumatic-folding-applications/SOURCES.md`

**Interfaces:**
- Consumes: Pexels source pages and image CDN originals
- Produces: eight 1200×675 local WebP assets and a durable source/license manifest

- [ ] **Step 1: Download and encode the source set**

Use a bounded Node ESM command with the installed `sharp` package. Fetch `https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg?auto=compress&cs=tinysrgb&w=1600`, fail on non-2xx, then apply `.rotate().resize(1200, 675, { fit: "cover", position: "attention" }).webp({ quality: 78 })` for:

```js
const photos = [
  [30749458, "hvac-duct-panel-folding.webp"],
  [10033425, "rectangular-air-duct-fabrication.webp"],
  [5505867, "ventilation-duct-workshop.webp"],
  [36497859, "galvanized-sheet-folding.webp"],
  [11617523, "light-sheet-metal-fabrication.webp"],
  [33694032, "electrical-cabinet-enclosure.webp"],
  [5362681, "stainless-steel-light-forming.webp"],
  [29386093, "construction-sheet-metal-work.webp"],
];
```

- [ ] **Step 2: Inspect the actual image set**

Generate a temporary contact sheet using Sharp and inspect it with `view_image`. Replace a source immediately if it contains prominent third-party branding, unsafe work, irrelevant subject matter, a misleading machine identity or a poor crop; update the contract, content and manifest in the same change.

- [ ] **Step 3: Add the exact source manifest**

Record access date `2026-07-21`, the Pexels License, the general-application disclaimer, photographers and these exact source pages:

```md
| File | Photographer | Source |
| --- | --- | --- |
| `hvac-duct-panel-folding.webp` | Jakub Zerdzicki | https://www.pexels.com/photo/industrial-interior-with-exposed-hvac-ductwork-30749458/ |
| `rectangular-air-duct-fabrication.webp` | Fikri Bijey | https://www.pexels.com/photo/low-angle-shot-of-a-building-under-the-sky-10033425/ |
| `ventilation-duct-workshop.webp` | Mike van Schoonderwalt | https://www.pexels.com/photo/interior-of-an-unfinished-building-5505867/ |
| `galvanized-sheet-folding.webp` | Rutvik Shimpi | https://www.pexels.com/photo/skilled-artisan-working-with-metal-sheets-36497859/ |
| `light-sheet-metal-fabrication.webp` | Abdullah Asad | https://www.pexels.com/photo/a-man-using-a-grinder-on-metal-sheets-11617523/ |
| `electrical-cabinet-enclosure.webp` | Bulat843 | https://www.pexels.com/photo/focused-technician-working-in-industrial-workshop-33694032/ |
| `stainless-steel-light-forming.webp` | Hassan yahia | https://www.pexels.com/photo/welder-working-in-protective-clothing-5362681/ |
| `construction-sheet-metal-work.webp` | Critical Smith | https://www.pexels.com/photo/skilled-welder-working-with-sparks-flying-29386093/ |
```

- [ ] **Step 4: Verify binary properties and commit**

Use Sharp metadata to assert that every file is non-empty WebP at 1200×675. Run the focused contract and commit:

```bash
git add public/products/pneumatic-folding-applications scripts/verify-pneumatic-folding-machine-page.mjs data/pneumatic-folding-machine-page.ts
git commit -m "feat: add pneumatic folding application photos"
```

---

### Task 4: Build the dedicated server component

**Files:**
- Create: `components/PneumaticFoldingMachineSolutionPage.tsx`

**Interfaces:**
- Consumes: `{ product: Product }`, `product.technicalParameters`, `pneumaticFoldingMachinePageContent` and `technicalHeadings`
- Produces: all fourteen semantic sections, photo cards, decision tables, FAQ disclosures and safe JSON-LD

- [ ] **Step 1: Add component guards and helpers**

```tsx
type PneumaticFoldingMachineSolutionPageProps = { product: Product };

const jsonLd = (value: object) =>
  JSON.stringify(value).replace(/</g, "\\u003c");

if (!product.technicalParameters) {
  throw new Error("Pneumatic Folding Machine technical parameters are required");
}
```

Add a small `SectionIntro` helper. Validate that `technicalHeadings.map(({ source }) => source)` exactly matches the source columns before rendering.

- [ ] **Step 2: Build the safe schemas**

Create `ProductModel`, `BreadcrumbList` and `FAQPage` objects for `https://www.zyroncnc.com/products/pneumatic-sheet-metal-folding-machine`. Map each source table cell into `additionalProperty`; omit offers, price, availability, rating and review data. Serialize all scripts through `jsonLd`.

- [ ] **Step 3: Implement hero through compressed-air requirement**

Render `hero`, `problems`, `solutions`, `applications`, `materials` and `air`. Use the existing product image with exact alt and responsive sizes. Application cards use local photos through `next/image`, `fill`, responsive `sizes`, `object-cover` and below-the-fold lazy loading. Do not add line drawings to Applications.

- [ ] **Step 4: Implement process through selection**

Render `process`, `advantages`, `comparison`, `equipment` and `selection`. Use numbered process steps and code-native connectors only. Keep the comparison neutral, link only verified catalog routes and send configuration CTAs to `/contact`.

- [ ] **Step 5: Implement the exact parameter table**

```tsx
<th className="whitespace-nowrap border-r border-white/10 px-5 py-5 text-center font-semibold last:border-r-0">
  {heading.label}
  {heading.unit ? (
    <span className="mt-1 block text-center text-[0.72rem] font-medium text-[#8DDA17]">
      {heading.unit}
    </span>
  ) : null}
</th>
```

Render rows directly from `product.technicalParameters.rows`, wrap only the table in `max-w-full overflow-x-auto`, and add `Final specifications depend on sheet material, thickness, bending length, air pressure and selected machine configuration.`

- [ ] **Step 6: Implement FAQ and final CTA**

Use native `<details>` and `<summary>` for all nine FAQs. Complete `faq` and `cta` sections with `/contact` links. Confirm exactly one H1 and semantic H2/H3 ordering.

- [ ] **Step 7: Run the focused contract and commit**

```bash
node scripts/verify-pneumatic-folding-machine-page.mjs
git add components/PneumaticFoldingMachineSolutionPage.tsx
git commit -m "feat: build pneumatic folding solution page"
```

Expected: the contract remains red only for route and metadata integration.

---

### Task 5: Route the dedicated page and add SEO metadata

**Files:**
- Modify: `app/products/[id]/page.tsx`
- Modify: `scripts/verify-all-product-solution-pages.mjs`

**Interfaces:**
- Consumes: `PneumaticFoldingMachineSolutionPage`
- Produces: dedicated rendering/metadata and catalog expectations of 53 total, 8 dedicated and 45 shared pages

- [ ] **Step 1: Add exact metadata**

Before the shared metadata fallback, add a branch for `pneumatic-sheet-metal-folding-machine` with:

```ts
const title = "Pneumatic Folding Machine | HVAC Duct Sheet Metal Folding Solution";
const description = "Pneumatic folding machine for thin sheet metal bending, HVAC duct panel folding, galvanized sheet forming and rectangular air duct fabrication. Get a suitable air-driven folding solution.";
```

Add the ten supplied keywords, canonical, Open Graph and Twitter fields. Use alt `Pneumatic folding machine for HVAC duct sheet metal folding`.

- [ ] **Step 2: Import and select the dedicated component**

```tsx
if (product.id === "pneumatic-sheet-metal-folding-machine") {
  return <PneumaticFoldingMachineSolutionPage product={product} />;
}
```

Place this guard before the generic category lookup and `ProductSolutionPage` fallback.

- [ ] **Step 3: Update the catalog-wide counts**

Add the pneumatic ID to `dedicatedIds`, then assert `dedicatedIds.length === 8` and `sharedPageCount === 45` while keeping `productCount === 53`.

- [ ] **Step 4: Verify GREEN and commit**

```bash
node scripts/verify-pneumatic-folding-machine-page.mjs
node scripts/verify-all-product-solution-pages.mjs
git add app/products/[id]/page.tsx scripts/verify-all-product-solution-pages.mjs
git commit -m "feat: route pneumatic folding solution page"
```

Expected: both contracts exit 0.

---

### Task 6: Full verification and visual QA

**Files:**
- Modify only if a verification result reveals a pneumatic-page defect
- Remove temporary contact sheets and browser screenshots before completion

**Interfaces:**
- Consumes: the complete dedicated implementation
- Produces: reproducible lint/build logs, browser evidence and a clean worktree

- [ ] **Step 1: Run all product contracts**

```bash
for script in scripts/verify-*.mjs scripts/verify-*.cjs; do node "$script" || exit 1; done
```

Expected: every script exits 0.

- [ ] **Step 2: Run lint with bounded output**

```bash
npm run lint > /tmp/pneumatic-folding-lint.log 2>&1
tail -n 120 /tmp/pneumatic-folding-lint.log
```

Expected: exit 0 and no ESLint errors.

- [ ] **Step 3: Run the production build with bounded output**

```bash
npm run build > /tmp/pneumatic-folding-build.log 2>&1
tail -n 120 /tmp/pneumatic-folding-build.log
```

Expected: exit 0, TypeScript succeeds and the pneumatic route is statically generated.

- [ ] **Step 4: Verify desktop in the in-app browser**

Start the app, open the dedicated route at a desktop viewport, capture a full-page screenshot and inspect hero balance, section order, all real images, copy, headings, links, FAQ behavior, table headings and console health.

- [ ] **Step 5: Verify narrow mobile behavior**

At approximately 390×844, confirm stacked hero, single-column cards, full-width CTAs, no document-level horizontal overflow and horizontal scrolling limited to the technical and comparison table wrappers.

- [ ] **Step 6: Perform final image and fidelity inspection**

Use `view_image` on the existing product source image, the application contact sheet and the latest desktop/mobile screenshots. Record at least five inspected comparison points: copy, layout, typography, palette, image treatment, table behavior and responsive composition. Fix all material mismatches.

- [ ] **Step 7: Commit verification fixes and confirm clean state**

```bash
git add components/PneumaticFoldingMachineSolutionPage.tsx data/pneumatic-folding-machine-page.ts 'app/products/[id]/page.tsx' scripts/verify-pneumatic-folding-machine-page.mjs scripts/verify-all-product-solution-pages.mjs public/products/pneumatic-folding-applications
git commit -m "fix: refine pneumatic folding page verification"
git status --short
```

If no files changed during verification, omit the commit. Expected final status: clean.
