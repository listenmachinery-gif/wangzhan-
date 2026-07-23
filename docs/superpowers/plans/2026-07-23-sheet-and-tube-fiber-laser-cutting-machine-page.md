# Sheet and Tube Fiber Laser Cutting Machine Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build, verify, publish, and live-check a dedicated Sheet and Tube Fiber Laser Cutting Machine solution page with original product data, truthful unknown-value handling, real application photography, split-unit table headers, and product-specific SEO.

**Architecture:** Add a typed content module and one server-rendered React page component, then route only `sheet-and-tube-fiber-laser-cutting-machine` to it from the existing dynamic product route. A focused Node contract locks the content, asset, schema, and safety requirements; existing site chrome and product data remain authoritative.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, `next/image`, `lucide-react`, Node `assert`, Vercel CLI.

## Global Constraints

- Preserve the global header, footer, navigation, route, original transparent 1448 × 1086 product image, product identity, and compatible original specifications.
- Use `#76B900` as the only bright accent on dark titanium and black-gray industrial surfaces.
- Do not add dependencies, price, QR code, unsupported performance gains, certifications, ratings, or fabricated machine details.
- Do not present competitor numeric data as a guaranteed ZYRON specification.
- Unknown product-specific values must render exactly `Customizable / Please confirm with our sales engineer`.
- Applications must use eleven real photographs; do not use generated images, SVGs, or line-art illustrations in that grid.
- Header labels stay on one line; units render beneath labels and centered.
- Mobile uses a stacked hero, single-column cards, full-width CTAs, and local horizontal table scrolling.
- Do not create a new hosting project or change domain configuration.

---

### Task 1: Add the Failing Page Contract

**Files:**
- Create: `scripts/verify-sheet-and-tube-fiber-laser-cutting-machine-page.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: repository files and the route id `sheet-and-tube-fiber-laser-cutting-machine`.
- Produces: `npm run verify:sheet-and-tube-laser`, a deterministic source-and-asset contract.

- [ ] **Step 1: Write the failing contract**

Create a Node script that loads the route, future component, future data module, and future source ledger. Its central checks must use these exact requirements:

```js
const requiredSections = [
  "hero", "pain-points", "solutions", "applications", "sheet-materials",
  "tube-types", "sheet-cutting-process", "tube-cutting-process",
  "dual-use-design", "laser-power", "cutting-gas", "advantages",
  "comparison", "fabrication-workflow", "selection-guide",
  "technical-specifications", "workshop-safety", "faq",
  "internal-links", "final-cta",
];

assert.match(route, /SheetAndTubeFiberLaserCuttingMachineSolutionPage/);
assert.match(route, /Sheet and Tube Fiber Laser Cutting Machine \| Plate & Pipe Cutting Solution/);
assert.equal((component.match(/data-section="/g) ?? []).length, 20);
assert.match(component, /splitSpecificationHeading/);
assert.match(component, /whitespace-nowrap/);
assert.match(component, /text-center/);
assert.ok((component.match(/overflow-x-auto/g) ?? []).length >= 2);
assert.match(data, /Customizable \/ Please confirm with our sales engineer/);
assert.doesNotMatch(`${route}\n${component}\n${data}`, /offers\s*:|\bprice\b|qr code|二维码/i);
```

Also assert one H1 source occurrence, the approved hero alt text, ProductModel/FAQPage/BreadcrumbList schemas, eleven unique photo paths, existence of every photo, real-photo license records, original-spec mappings `sourceIndex: 0` through `sourceIndex: 3`, and a warning that competitor references are not ZYRON guarantees.

- [ ] **Step 2: Add the package command**

Add this script without removing any existing verification scripts:

```json
"verify:sheet-and-tube-laser": "node scripts/verify-sheet-and-tube-fiber-laser-cutting-machine-page.mjs"
```

- [ ] **Step 3: Run the contract and confirm the expected failure**

Run: `npm run verify:sheet-and-tube-laser`

Expected: non-zero exit because the dedicated component and data module do not exist.

- [ ] **Step 4: Commit the red test**

```bash
git add package.json scripts/verify-sheet-and-tube-fiber-laser-cutting-machine-page.mjs
git commit -m "test: define sheet and tube laser page contract"
```

---

### Task 2: Add Typed Content and Real Application Photography

**Files:**
- Create: `data/sheet-and-tube-fiber-laser-cutting-machine-page.ts`
- Create: `public/products/sheet-and-tube-fiber-laser-cutting-machine-applications/*.jpg`
- Create: `public/products/sheet-and-tube-fiber-laser-cutting-machine-applications/SOURCES.md`

**Interfaces:**
- Consumes: the approved copy and current product spec indexes `0..3`.
- Produces: `sheetAndTubeFiberLaserCuttingMachinePage`, `applicationPhotos`, and typed content interfaces consumed by the page component.

- [ ] **Step 1: Define focused data types**

Use these public shapes:

```ts
export type ContentCard = { title: string; text: string };
export type SolutionCard = ContentCard & {
  suitableFor: string;
  recommendedUse: string;
  productionValue: string;
};
export type ApplicationPhoto = ContentCard & {
  image: string;
  alt: string;
};
export type ComparisonRow = {
  label: string;
  sheetLaser: string;
  sheetAndTubeLaser: string;
  tubeLaser: string;
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

- [ ] **Step 2: Populate all approved content groups**

Export `sheetAndTubeFiberLaserCuttingMachinePage` with the exact hero title, subtitle, description, CTAs, and value labels from the brief. Include five pain points, three solution cards, seven sheet materials, seven tube types, six sheet-process steps, six tube-process steps, dual-use guidance, laser-power guidance, gas guidance, confirmed/original advantages, eight comparison rows, eight fabrication-workflow items, twenty-one selection prompts, eighteen specification fields, eight safety points, ten FAQ entries, internal links, and the final CTA.

Use these confirmed specification mappings:

```ts
specificationFields: [
  { heading: "Model", source: "name" },
  { heading: "Working Area (mm)", source: "confirmed" },
  { heading: "Laser Power (kW)", source: "spec", sourceIndex: 0 },
  { heading: "Cutting Format", source: "spec", sourceIndex: 1 },
  { heading: "Transmission System", source: "spec", sourceIndex: 2 },
  { heading: "Control / Software", source: "spec", sourceIndex: 3 },
  { heading: "Maximum Sheet Cutting Thickness (mm)", source: "confirmed" },
  { heading: "Tube Type", source: "confirmed" },
  { heading: "Tube Diameter / Section Range (mm)", source: "confirmed" },
  { heading: "Tube Length (mm)", source: "confirmed" },
  { heading: "Maximum Tube Wall Thickness (mm)", source: "confirmed" },
  { heading: "Chuck Type", source: "confirmed" },
  { heading: "Positioning Accuracy (mm)", source: "confirmed" },
  { heading: "Max Cutting Speed (m/min)", source: "confirmed" },
  { heading: "Cooling System", source: "confirmed" },
  { heading: "Machine Size (mm)", source: "confirmed" },
  { heading: "Machine Weight (kg)", source: "confirmed" },
  { heading: "Application", source: "confirmed", confirmedValue: "Integrated metal sheet and tube cutting" },
]
```

- [ ] **Step 3: Source and optimize eleven real photographs**

Download one licensed, relevant real photograph for each approved application. Save deterministic local filenames under the product application directory, strip metadata, and resize/crop to a practical web resolution while preserving natural content. Record the source page, photographer or provider, and license page for every file in `SOURCES.md`. The ledger must also record the official Bodor and SENFENG pages used for selection context and state that their numeric values do not define guaranteed ZYRON specifications.

- [ ] **Step 4: Run asset-focused contract checks**

Run: `npm run verify:sheet-and-tube-laser`

Expected: it still fails because the component and route integration are not implemented, but it must no longer report missing data, missing photos, duplicate paths, or missing source records.

- [ ] **Step 5: Commit content and images**

```bash
git add data/sheet-and-tube-fiber-laser-cutting-machine-page.ts public/products/sheet-and-tube-fiber-laser-cutting-machine-applications
git commit -m "feat: add sheet and tube laser content and photos"
```

---

### Task 3: Build the Dedicated Page and Route Metadata

**Files:**
- Create: `components/SheetAndTubeFiberLaserCuttingMachineSolutionPage.tsx`
- Modify: `app/products/[id]/page.tsx`

**Interfaces:**
- Consumes: `Product` and `sheetAndTubeFiberLaserCuttingMachinePage`.
- Produces: `SheetAndTubeFiberLaserCuttingMachineSolutionPage({ product }: { product: Product })` and product-specific metadata/routing.

- [ ] **Step 1: Add table-heading and specification resolvers**

```ts
const specificationUnitPattern = /^(.*?)(\([^()]+\))$/;

const splitSpecificationHeading = (heading: string) => {
  const normalized = heading.replace(/\s+/g, " ").trim();
  const match = normalized.match(specificationUnitPattern);
  return match
    ? { label: match[1].trim(), unit: match[2] }
    : { label: normalized, unit: "" };
};

const resolveSpecification = (product: Product, field: SpecificationField) => {
  if (field.source === "name") return product.name;
  if (field.source === "spec" && field.sourceIndex !== undefined) {
    return product.specs[field.sourceIndex]?.value ??
      "Customizable / Please confirm with our sales engineer";
  }
  return field.confirmedValue ??
    "Customizable / Please confirm with our sales engineer";
};
```

- [ ] **Step 2: Render the 20 primary sections**

Use server components, `next/image`, `next/link`, and existing Lucide icons. Every primary section must include the exact `data-section` marker listed by the contract. Use the original product image in the hero, eleven local photos in Applications, separate sheet and tube process layouts, locally scrollable comparison/specification tables, semantic `<details>` FAQ items, existing `/contact` CTAs, and only existing internal routes.

Render each specification heading as:

```tsx
<th className="px-5 py-4 text-center align-bottom">
  <span className="block whitespace-nowrap">{label}</span>
  {unit ? <span className="mt-1 block text-center">{unit}</span> : null}
</th>
```

- [ ] **Step 3: Add truthful structured data**

Render JSON-LD for `ProductModel`, `FAQPage`, and `BreadcrumbList`. ProductModel uses `product.name`, the canonical site URL, original image, description, category, and only confirmed additional properties; it must omit offers, price, reviews, ratings, and identifiers.

- [ ] **Step 4: Add exact route metadata and dedicated rendering**

Import the component and add the product-specific metadata branch:

```ts
if (product.id === "sheet-and-tube-fiber-laser-cutting-machine") {
  const title =
    "Sheet and Tube Fiber Laser Cutting Machine | Plate & Pipe Cutting Solution";
  const description =
    "Sheet and tube fiber laser cutting machine for metal sheet cutting, pipe cutting, furniture, fitness equipment, frame structures and fabrication workshops. Get a suitable plate and tube laser cutting solution based on your material, tube size and production needs.";
  // return title, description, ten approved keywords, canonical, Open Graph, and Twitter metadata
}
```

Route the resolved product before the generic fallback:

```tsx
if (product.id === "sheet-and-tube-fiber-laser-cutting-machine") {
  return <SheetAndTubeFiberLaserCuttingMachineSolutionPage product={product} />;
}
```

- [ ] **Step 5: Run the focused contract**

Run: `npm run verify:sheet-and-tube-laser`

Expected: `Sheet and Tube Fiber Laser Cutting Machine page contract passed.`

- [ ] **Step 6: Commit the page implementation**

```bash
git add app/products/[id]/page.tsx components/SheetAndTubeFiberLaserCuttingMachineSolutionPage.tsx
git commit -m "feat: build sheet and tube laser solution page"
```

---

### Task 4: Verify and Visually Inspect the Page

**Files:**
- Modify only files required by failures found in this task.

**Interfaces:**
- Consumes: the completed dedicated page.
- Produces: a lint-clean, build-clean, visually verified production candidate.

- [ ] **Step 1: Run all laser page contracts**

```bash
npm run verify:single-table-laser
npm run verify:exchange-table-laser
npm run verify:sheet-and-tube-laser
```

Expected: all three scripts exit `0` and print their pass messages.

- [ ] **Step 2: Run lint with bounded output**

```bash
npm run lint > /tmp/sheet-tube-lint.log 2>&1
status=$?
tail -n 120 /tmp/sheet-tube-lint.log
exit $status
```

Expected: exit `0`.

- [ ] **Step 3: Run the production build with bounded output**

```bash
npm run build > /tmp/sheet-tube-build.log 2>&1
status=$?
tail -n 120 /tmp/sheet-tube-build.log
exit $status
```

Expected: exit `0` and the product route is included in the generated application.

- [ ] **Step 4: Inspect desktop and mobile rendering**

Start the application locally, open `/products/sheet-and-tube-fiber-laser-cutting-machine`, and check desktop and mobile widths. Confirm the original hero machine is not cropped, all eleven real photos load, there is one H1, the two process paths are readable, tables scroll locally, header label/unit wrapping is correct, CTAs and FAQ controls work, and the document has no horizontal overflow or console errors.

- [ ] **Step 5: Fix only evidence-backed issues and rerun affected checks**

Apply minimal changes, rerun the focused contract plus lint and build, and record fresh zero exit codes.

- [ ] **Step 6: Commit verification fixes if any**

```bash
git add app components data public scripts package.json
git commit -m "fix: polish sheet and tube laser page"
```

Skip the commit if no files changed.

---

### Task 5: Integrate, Publish, and Verify Production

**Files:**
- No planned source changes.

**Interfaces:**
- Consumes: the verified feature branch and existing Vercel project link.
- Produces: synchronized `main`, a Ready production deployment, and verified custom-domain HTML.

- [ ] **Step 1: Confirm a clean feature branch and review commit scope**

Run: `git status --short --branch && git log --oneline --decorate -6`

Expected: no uncommitted source changes and only intentional feature commits.

- [ ] **Step 2: Integrate into main and rerun fresh verification**

Fast-forward or merge the feature branch into `main` without discarding unrelated user work. Run all three laser contracts, lint, and build again from the integrated tree; every command must exit `0`.

- [ ] **Step 3: Push synchronized main**

Run: `GIT_TERMINAL_PROMPT=0 git push origin main`

Expected: `main -> main`, with local `HEAD` equal to `origin/main`.

- [ ] **Step 4: Deploy the existing production project**

Run: `npx vercel --prod --yes`

Expected: exit `0`, target `production`, status `Ready`, and aliases for `https://www.zyroncnc.com` and `https://zyroncnc.com`.

- [ ] **Step 5: Verify the canonical live route**

Fetch `https://www.zyroncnc.com/products/sheet-and-tube-fiber-laser-cutting-machine` with a cache-busting query. Assert HTTP 200, exact title and H1, the dedicated-page marker, exactly 20 primary section markers, at least eleven application-photo asset references, ProductModel/FAQPage/BreadcrumbList, the split-unit table content, no `offers`, and the sitemap entry.

- [ ] **Step 6: Confirm final repository and deployment state**

Run `git status --short --branch`, compare `HEAD` with `origin/main`, and inspect the Vercel deployment. Expected: clean synchronized main and production status `Ready`.
