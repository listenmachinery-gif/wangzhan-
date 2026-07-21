# Electric Folding Machine Solution Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a dedicated Electric Folding Machine solution page with eight unique real application photographs, unchanged verified DWS specifications, professional responsive layout and complete SEO.

**Architecture:** Keep verified parameters in `data/bending-details.ts`, put page-specific typed copy and photo mappings in a focused data module, and render the route through a dedicated React server component. A source contract drives the work, existing catalog verifiers prevent regressions, and local WebP assets remove runtime reliance on an external image host.

**Tech Stack:** Next.js 15 App Router, React 19 server components, TypeScript, Tailwind CSS, `next/image`, `next/link`, Lucide React, Node ESM verification scripts, the existing Sharp runtime, Vercel CLI.

## Global Constraints

- Keep `/products/electric-sheet-metal-folding-machine` and the current catalog identity.
- Use exactly one H1: `Electric Folding Machine`.
- Reuse `/products/catalog/electric-sheet-metal-folding-machine.png`; never alter the machine or generate fake close-ups.
- Preserve every value in the four existing DWS rows exactly.
- Keep each parameter label on one line and put its parenthesized unit on a centered second line.
- Use eight unique real photos that are not reused from the Manual Folding Machine page.
- Store photos locally as WebP and record their source, creator and access date.
- Use only project-supported motor-drive, clamping-beam, folding-beam, material and application claims.
- Do not add dependencies, price, offers, availability, ratings, reviews, QR codes, new phone/WeChat details, fake metrics or fake customer claims.
- Preserve the global header, footer, navigation and responsive conventions.
- Push the verified `main` branch, deploy it through the configured Vercel project and verify the official URL.

---

### Task 1: Define the dedicated-page contract

**Files:**
- Create: `scripts/verify-electric-folding-machine-page.mjs`

**Interfaces:**
- Consumes: `data/products.ts`, `data/bending-details.ts`, the future content/component files, application asset directory and `app/products/[id]/page.tsx`
- Produces: a zero-exit source contract for identity, content, parameters, photos, table behavior, schemas, metadata and routing

- [ ] **Step 1: Write the failing contract**

Use Node `assert`, `existsSync`, `readFileSync`, `readdirSync` and `resolve`. Define these exact fixtures:

```js
const rows = [
  ["DWS-1.5 x 1300", "1.5", "1300", "55", "2.2/0.75", "450", "1950 x 650 x 1550"],
  ["DWS-1.5 x 1500", "1.5", "1500", "55", "2.2/0.75", "500", "2150 x 650 x 1550"],
  ["DWS-1.5 x 2000", "1.5", "2000", "55", "2.2/0.75", "600", "2650 x 650 x 1550"],
  ["DWS-1.5 x 2500", "1.5", "2500", "55", "3/0.75", "700", "3100 x 650 x 1550"],
];

const sections = [
  "hero", "problems", "solutions", "applications", "materials", "process",
  "advantages", "comparison", "equipment", "selection", "technical", "faq", "cta",
];

const applicationImages = [
  "/products/electric-folding-applications/hvac-duct-panel-folding.webp",
  "/products/electric-folding-applications/ventilation-duct-fabrication.webp",
  "/products/electric-folding-applications/roofing-sheet-metal-work.webp",
  "/products/electric-folding-applications/architectural-sheet-metal.webp",
  "/products/electric-folding-applications/electrical-cabinet-enclosure.webp",
  "/products/electric-folding-applications/signage-fabrication.webp",
  "/products/electric-folding-applications/stainless-steel-fabrication.webp",
  "/products/electric-folding-applications/general-sheet-metal-workshop.webp",
];
```

Assert all paths are unique, mapped in content, present below `public`, and the directory contains exactly eight WebP files. Require eight alt values and manifest IDs `28914401`, `30749458`, `48895`, `34766497`, `33694019`, `3677229`, `34329584`, `28852853` plus `https://www.pexels.com/license/`.

Require all thirteen section markers; exactly one H1 using `content.hero.title`; hero alt `Electric folding machine for sheet metal edge bending`; `splitColumnHeading`; `whitespace-nowrap` and `text-center`; a block-centered unit; `max-w-full overflow-x-auto`; all four exact rows; the exact meta title/description; `ProductModel`, `BreadcrumbList`, `FAQPage`; no commercial/review schema fields; and a route guard for `electric-sheet-metal-folding-machine`.

- [ ] **Step 2: Verify RED**

```bash
node scripts/verify-electric-folding-machine-page.mjs
```

Expected: exit 1 because the dedicated files do not exist.

- [ ] **Step 3: Commit the contract**

```bash
git add scripts/verify-electric-folding-machine-page.mjs
git commit -m "test: define electric folding page contract"
```

---

### Task 2: Add typed solution content

**Files:**
- Create: `data/electric-folding-machine-page.ts`

**Interfaces:**
- Produces: `electricFoldingMachinePageContent`, a typed serializable object for the dedicated component

- [ ] **Step 1: Define content types**

Create focused types for hero, text cards, solution cards, application cards, process steps, comparison rows, equipment links and FAQ items. Use this application interface:

```ts
export type ElectricFoldingApplication = {
  title: string;
  text: string;
  image: string;
  alt: string;
};
```

- [ ] **Step 2: Populate the approved content**

Use the brief's exact hero:

```ts
hero: {
  title: "Electric Folding Machine",
  subtitle: "Efficient sheet metal edge bending solution for workshops, HVAC duct fabrication and light metal forming.",
  description: "A practical electric folding machine for thin sheet metal bending, edge folding and duct panel forming. It helps workshops improve folding efficiency, reduce manual labor and keep more consistent bending results for daily sheet metal production.",
  primaryCta: "Get Folding Solution",
  secondaryCta: "Request Machine Configuration",
  proofPoints: [
    "Electric Driven Folding",
    "Suitable for Thin Sheet Metal",
    "Stable Angle Control",
    "Practical for Duct Fabrication",
  ],
},
```

Add five problems, three solution groups, eight applications, six materials, six process steps, verified advantages, seven neutral manual/electric/hydraulic comparison rows, seven workflow machines, ten selection prompts, eight FAQs and the final CTA from the approved brief. Use the eight paths from Task 1 and descriptive application-specific alt text.

- [ ] **Step 3: Configure only valid internal links**

Use existing routes for manual/hydraulic folding, shearing, lock forming, beading, TDF flange forming, seam closing, press brake and duct-line products. Confirm each href appears in `data/products.ts` before adding it.

- [ ] **Step 4: Verify expected partial RED and commit**

```bash
node scripts/verify-electric-folding-machine-page.mjs
git add data/electric-folding-machine-page.ts
git commit -m "feat: add electric folding solution content"
```

Expected: contract still fails only on absent photos, component and route integration.

---

### Task 3: Add eight licensed real application photos

**Files:**
- Create: `public/products/electric-folding-applications/*.webp` (exact eight filenames from Task 1)
- Create: `public/products/electric-folding-applications/SOURCES.md`

**Interfaces:**
- Consumes: Pexels CDN JPEGs and the existing Sharp runtime
- Produces: eight 1200×675 WebP files and a durable license/source manifest

- [ ] **Step 1: Download and encode the approved source set**

Use a bounded Node ESM script. For each pair below, fetch `https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg?auto=compress&cs=tinysrgb&w=1600`, fail on a non-2xx response, then apply `.rotate().resize(1200, 675, { fit: "cover", position: "attention" }).webp({ quality: 76 })`:

```js
const photos = [
  [28914401, "hvac-duct-panel-folding.webp"],
  [30749458, "ventilation-duct-fabrication.webp"],
  [48895, "roofing-sheet-metal-work.webp"],
  [34766497, "architectural-sheet-metal.webp"],
  [33694019, "electrical-cabinet-enclosure.webp"],
  [3677229, "signage-fabrication.webp"],
  [34329584, "stainless-steel-fabrication.webp"],
  [28852853, "general-sheet-metal-workshop.webp"],
];
```

- [ ] **Step 2: Inspect all crops**

Use `view_image` on a contact sheet or each file. Reject any photo with prominent branding, irrelevant subject matter, misleading machine identity, unsafe context or poor 16:9 crop. When replacing an image, update the contract ID and source manifest in the same task.

- [ ] **Step 3: Write the exact source manifest**

Record access date `2026-07-21`, link the official Pexels License, state that the photos show general applications rather than ZYRON customers/models, and list:

```md
| File | Photographer | Source |
| --- | --- | --- |
| `hvac-duct-panel-folding.webp` | Roma captainbarduck | https://www.pexels.com/photo/industrial-ventilation-ducts-on-urban-wall-28914401/ |
| `ventilation-duct-fabrication.webp` | Jakub Zerdzicki | https://www.pexels.com/photo/industrial-interior-with-exposed-hvac-ductwork-30749458/ |
| `roofing-sheet-metal-work.webp` | Pexels | https://www.pexels.com/photo/gray-steel-sheet-48895/ |
| `architectural-sheet-metal.webp` | Noland Live | https://www.pexels.com/photo/architectural-abstract-of-modern-metal-facade-34766497/ |
| `electrical-cabinet-enclosure.webp` | Bulat843 | https://www.pexels.com/photo/technician-working-on-electrical-control-panel-33694019/ |
| `signage-fabrication.webp` | Jan Kopřiva | https://www.pexels.com/photo/person-s-hands-holding-signage-3677229/ |
| `stainless-steel-fabrication.webp` | Bulat369 | https://www.pexels.com/photo/industrial-worker-grinding-metal-in-workshop-34329584/ |
| `general-sheet-metal-workshop.webp` | Shakur Leni | https://www.pexels.com/photo/metalwork-and-welding-in-a-workshop-setting-28852853/ |
```

- [ ] **Step 4: Verify binary properties and commit**

Use Sharp metadata to assert all eight files are WebP, 1200×675 and non-empty. Run the contract; expect remaining failure only for component/route work. Then commit:

```bash
git add public/products/electric-folding-applications scripts/verify-electric-folding-machine-page.mjs data/electric-folding-machine-page.ts
git commit -m "feat: add electric folding application photos"
```

---

### Task 4: Build the dedicated server component

**Files:**
- Create: `components/ElectricFoldingMachineSolutionPage.tsx`

**Interfaces:**
- Consumes: `product: Product`, `product.technicalParameters`, and `electricFoldingMachinePageContent`
- Produces: all thirteen semantic sections, real-photo cards, decision tables, FAQ disclosures and safe structured data

- [ ] **Step 1: Add component helpers**

Keep the file server-only and implement these exact helpers:

```tsx
type ElectricFoldingMachineSolutionPageProps = { product: Product };

const splitColumnHeading = (column: string) => {
  const normalized = column.replace(/\s+/g, " ").trim();
  const match = normalized.match(/^(.*?)(\([^()]+\))$/);
  return match
    ? { label: match[1].trim(), unit: match[2] }
    : { label: normalized, unit: "" };
};

const jsonLd = (value: object) =>
  JSON.stringify(value).replace(/</g, "\\u003c");
```

Add a focused `SectionIntro` helper and a code-native folding-process diagram. Do not create simulated machine close-ups.

- [ ] **Step 2: Build safe schemas**

Create `ProductModel`, `BreadcrumbList` and `FAQPage` objects for `https://www.zyroncnc.com/products/electric-sheet-metal-folding-machine`. Map every technical cell into `additionalProperty`; omit offers, price, availability, ratings and reviews. Render schemas in escaped `application/ld+json` scripts.

- [ ] **Step 3: Implement hero through advantages**

Render `hero`, `problems`, `solutions`, `applications`, `materials`, `process` and `advantages` with graphite/titanium surfaces and `#76B900`. Use the unchanged catalog image:

```tsx
<Image
  src={product.image}
  alt="Electric folding machine for sheet metal edge bending"
  fill
  loading="lazy"
  sizes="(min-width: 1024px) 50vw, 100vw"
  className="object-contain"
/>
```

Each below-the-fold application card uses:

```tsx
<Image
  src={application.image}
  alt={application.alt}
  fill
  sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
  className="object-cover transition duration-500 group-hover:scale-[1.03]"
/>
```

Keep the four-column desktop, two-column tablet and one-column mobile application grid.

- [ ] **Step 4: Implement comparison, workflow and selection**

Render `comparison`, `equipment` and `selection`. Keep the three-machine comparison neutral, use `next/link` only for verified product hrefs, and link configuration/selection CTAs to `/contact`.

- [ ] **Step 5: Implement the exact parameter table**

Throw `new Error("Electric Folding Machine technical parameters are required")` if data is absent. Render columns and rows directly from `product.technicalParameters`, using:

```tsx
const heading = splitColumnHeading(column);

<th className="whitespace-nowrap px-5 py-5 text-center font-semibold">
  {heading.label}
  {heading.unit ? (
    <span className="mt-1 block text-center text-xs font-medium text-neutral-500">
      {heading.unit}
    </span>
  ) : null}
</th>
```

Wrap only the table in `max-w-full overflow-x-auto`. Add the exact note: `Final specifications depend on sheet material, thickness, bending length, voltage and selected machine configuration.`

- [ ] **Step 6: Implement FAQ and final CTA**

Use native `<details>` and `<summary>` for the eight FAQs. Complete the `faq` and `cta` sections with links to `/contact`. Confirm one H1 and semantic H2/H3 ordering.

- [ ] **Step 7: Verify partial RED and commit**

Run `node scripts/verify-electric-folding-machine-page.mjs`; expect only route/metadata assertions to fail. Then:

```bash
git add components/ElectricFoldingMachineSolutionPage.tsx
git commit -m "feat: build electric folding solution page"
```

---

### Task 5: Route the dedicated page and add SEO metadata

**Files:**
- Modify: `app/products/[id]/page.tsx`
- Modify: `scripts/verify-all-product-solution-pages.mjs`

**Interfaces:**
- Consumes: `ElectricFoldingMachineSolutionPage`
- Produces: dedicated rendering/metadata plus catalog expectations of 53 total, 8 dedicated and 45 shared pages

- [ ] **Step 1: Import and select the component**

Add the direct import. Before the shared fallback, return `<ElectricFoldingMachineSolutionPage product={product} />` when `product.id === "electric-sheet-metal-folding-machine"`.

- [ ] **Step 2: Add exact metadata**

Create the product-specific branch:

```ts
const title = "Electric Folding Machine | Sheet Metal Edge Bending Solution";
const description =
  "Electric folding machine for thin sheet metal bending, edge folding, HVAC duct panel forming, roofing sheet metal and light fabrication workshops. Get a suitable electric sheet metal folding solution.";
```

Add all nine approved keywords, canonical route, Open Graph URL/image/alt and Twitter large-image card. Use alt `Electric folding machine for sheet metal edge bending`.

- [ ] **Step 3: Update solution-page counts**

Add `electric-sheet-metal-folding-machine` to `dedicatedIds`, keep total count `53`, and change the explicit shared count from `46` to `45`.

- [ ] **Step 4: Verify GREEN and commit**

```bash
node scripts/verify-electric-folding-machine-page.mjs
node scripts/verify-all-product-solution-pages.mjs
git add app/products/'[id]'/page.tsx scripts/verify-all-product-solution-pages.mjs
git commit -m "feat: route electric folding product page"
```

Expected: both scripts pass; the second reports 53 total, 8 dedicated and 45 shared pages.

---

### Task 6: Regression, responsive QA and production deployment

**Files:**
- Modify only requirement-scoped files if a check exposes a defect

**Interfaces:**
- Produces: fresh test/build/render evidence, clean pushed `main`, a production deployment and a verified official product URL

- [ ] **Step 1: Run all source contracts**

```bash
for script in scripts/verify-*.mjs; do node "$script" || exit 1; done
```

Expected: every verifier exits 0.

- [ ] **Step 2: Run lint and TypeScript with bounded logs**

```bash
npm run lint > /tmp/electric-folding-lint.log 2>&1
npx tsc --noEmit > /tmp/electric-folding-tsc.log 2>&1
```

Expected: both exit 0. On failure, show only the last 120 lines and fix the smallest requirement-scoped issue.

- [ ] **Step 3: Run the production build**

```bash
npm run build > /tmp/electric-folding-build.log 2>&1
```

Expected: exit 0 and the generated routes include `/products/electric-sheet-metal-folding-machine`. On failure, show only the last 120 lines.

- [ ] **Step 4: Inspect desktop rendering**

Start the production server and use the Browser skill first. At desktop width, verify URL/title, one H1, all thirteen sections, four DWS rows, eight raster application images, unchanged hero machine, FAQ expansion, CTA navigation, no framework overlay, no console errors and no page overflow.

- [ ] **Step 5: Inspect mobile rendering**

At 390px, verify stacked hero, one-column cards, full-width CTAs, readable image crops, no document overflow and table-only horizontal scrolling. Open one FAQ and navigate one CTA to `/contact`.

- [ ] **Step 6: Perform screenshot fidelity review**

Use `view_image` on the product asset and fresh desktop/mobile screenshots. Compare the graphite/titanium palette, unchanged machine, eight real images, restrained cards, parameter label/unit split, section rhythm and absence of fake/commercial content. Fix material mismatches and repeat affected checks.

- [ ] **Step 7: Run the final verification gate**

Re-run all verifiers, lint, TypeScript and build after any QA fix. Then:

```bash
git diff --check
git status --short --branch
```

Expected: no whitespace error and only intentional files. Commit QA changes only when present:

```bash
git add components/ElectricFoldingMachineSolutionPage.tsx data/electric-folding-machine-page.ts app/products/'[id]'/page.tsx scripts/verify-electric-folding-machine-page.mjs scripts/verify-all-product-solution-pages.mjs public/products/electric-folding-applications
git commit -m "fix: refine electric folding page QA"
```

- [ ] **Step 8: Push and deploy**

```bash
git push origin main
npx vercel --prod --yes > /tmp/electric-folding-deploy.log 2>&1
```

Expected: `origin/main` advances to local HEAD and Vercel returns a production deployment URL for project `wangzhan`.

- [ ] **Step 9: Verify production**

Open `https://www.zyroncnc.com/products/electric-sheet-metal-folding-machine` with a cache-busting query. Confirm HTTP success, exact title/H1, eight application photos, DWS table, FAQ interaction, CTA destination and no runtime/console error. Finally run:

```bash
git status --short --branch
git rev-parse HEAD
git rev-parse origin/main
```

Expected: clean `main`, local HEAD equals `origin/main`, and the official URL renders the new page.
