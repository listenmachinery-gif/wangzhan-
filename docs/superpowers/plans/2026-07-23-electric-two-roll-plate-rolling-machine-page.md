# Electric Two-Roll Plate Rolling Machine Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a dedicated Electric Two-Roll Plate Rolling Machine solution page with truthful parameters, real application photography, responsive tables, and production-ready SEO.

**Architecture:** Add one typed content module and one server-rendered product page component. Extend the existing dynamic product route with a narrow product-id branch for metadata and rendering, leaving the generic page and other dedicated pages unchanged.

**Tech Stack:** Next.js 15 App Router, React 19 server components, TypeScript, Tailwind CSS, `next/image`, native `details`, Node contract scripts, Vercel.

## Global Constraints

- Reuse `/products/catalog/electric-two-roll-plate-rolling-machine.png` without altering machine structure, proportions, or colors.
- Use only the four existing `product.specs` values as confirmed product parameter sources.
- Use `Customizable / Please confirm with our sales engineer` for unavailable product-specific numeric or structural values.
- Use ten locally stored real application photographs and a source ledger; do not use line drawings for applications.
- Render parameter units on a separate centered line and keep the label text unbroken.
- Use exactly one H1 and 17 top-level sections.
- Omit prices, QR codes, fake customer cases, fake detail photography, and Product-schema `offers`.
- Do not add dependencies.

---

### Task 1: Dedicated Page Contract

**Files:**
- Create: `scripts/verify-electric-two-roll-plate-rolling-machine-page.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: repository files and the target product slug.
- Produces: `npm run verify:electric-two-roll-rolling`.

- [ ] **Step 1: Write the failing contract**

```js
import assert from "node:assert/strict";
import fs from "node:fs";

const route = fs.readFileSync("app/products/[id]/page.tsx", "utf8");
const componentPath =
  "components/ElectricTwoRollPlateRollingMachineSolutionPage.tsx";
const dataPath =
  "data/electric-two-roll-plate-rolling-machine-page.ts";

assert.match(
  route,
  /ElectricTwoRollPlateRollingMachineSolutionPage/,
  "route must import the dedicated electric two-roll page",
);
assert.equal(fs.existsSync(componentPath), true, "dedicated component must exist");
assert.equal(fs.existsSync(dataPath), true, "typed page data must exist");

const component = fs.readFileSync(componentPath, "utf8");
assert.match(component, /data-section=/, "sections must expose contract markers");
assert.match(component, /overflow-x-auto/, "tables must scroll locally");
assert.match(component, /splitSpecificationHeading/, "units must split from labels");
assert.doesNotMatch(component, /offers\s*:/, "Product schema must omit offers");
```

- [ ] **Step 2: Register and run the contract**

Add:

```json
"verify:electric-two-roll-rolling": "node scripts/verify-electric-two-roll-plate-rolling-machine-page.mjs"
```

Run:

```bash
npm run verify:electric-two-roll-rolling
```

Expected: FAIL because the dedicated component and data module do not exist.

- [ ] **Step 3: Commit the red test**

```bash
git add package.json scripts/verify-electric-two-roll-plate-rolling-machine-page.mjs
git commit -m "test: define electric two-roll rolling page contract"
```

---

### Task 2: Real Application Assets and Typed Content

**Files:**
- Create: `data/electric-two-roll-plate-rolling-machine-page.ts`
- Create: `public/products/electric-two-roll-plate-rolling-machine-applications/SOURCES.md`
- Create: ten JPG files under `public/products/electric-two-roll-plate-rolling-machine-applications/`

**Interfaces:**
- Consumes: attachment copy, existing product specs, licensed photo sources, and primary manufacturer context.
- Produces: `electricTwoRollPlateRollingMachinePage`, `applicationPhotos`, and exported content types.

- [ ] **Step 1: Source real photography**

Collect ten real photographs representing HVAC ducting, ventilation sleeves, filters, exhaust shells, fire-extinguisher cylinders, small tanks, lighting shells, stainless cylinders, thin-sheet housings, and a metal workshop. Record original URLs, author/platform, license URL, and usage note in `SOURCES.md`.

- [ ] **Step 2: Create the typed content contract**

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
export type SpecificationField = {
  heading: string;
  source: "name" | "spec" | "confirmed";
  sourceIndex?: number;
  confirmedValue?: string;
};
export type FaqItem = { question: string; answer: string };
```

- [ ] **Step 3: Encode truthful specification fields**

```ts
export const specificationFields: readonly SpecificationField[] = [
  { heading: "Model", source: "name" },
  { heading: "Rolling Capacity", source: "spec", sourceIndex: 0 },
  { heading: "Roll Structure", source: "spec", sourceIndex: 1 },
  { heading: "Operation", source: "spec", sourceIndex: 2 },
  { heading: "Workpiece", source: "spec", sourceIndex: 3 },
  { heading: "Rolling Length (mm)", source: "confirmed" },
  { heading: "Sheet Thickness (mm)", source: "confirmed" },
  { heading: "Minimum Rolling Diameter (mm)", source: "confirmed" },
  { heading: "Roller Material", source: "confirmed" },
  { heading: "Upper Roller Diameter (mm)", source: "confirmed" },
  { heading: "Lower Roller Type", source: "confirmed" },
  { heading: "Motor Power (kW)", source: "confirmed" },
  { heading: "Rolling Speed (m/min)", source: "confirmed" },
  { heading: "Voltage (V)", source: "confirmed" },
  { heading: "Machine Size (mm)", source: "confirmed" },
  { heading: "Machine Weight (kg)", source: "confirmed" },
  { heading: "Application", source: "confirmed", confirmedValue: "Thin sheet cylinder forming" },
];
```

- [ ] **Step 4: Commit content and assets**

```bash
git add data/electric-two-roll-plate-rolling-machine-page.ts public/products/electric-two-roll-plate-rolling-machine-applications
git commit -m "feat: add electric two-roll rolling content and photos"
```

---

### Task 3: Dedicated Solution Page and Route

**Files:**
- Create: `components/ElectricTwoRollPlateRollingMachineSolutionPage.tsx`
- Modify: `app/products/[id]/page.tsx`

**Interfaces:**
- Consumes: `Product` and the typed page-data exports.
- Produces: the 17-section dedicated page for `electric-two-roll-plate-rolling-machine`.

- [ ] **Step 1: Add product-specific metadata**

Add an early metadata branch with the exact title, description, ten keywords, canonical path, Open Graph image, and Twitter image.

- [ ] **Step 2: Add the dedicated route**

```tsx
if (product.id === "electric-two-roll-plate-rolling-machine") {
  return <ElectricTwoRollPlateRollingMachineSolutionPage product={product} />;
}
```

- [ ] **Step 3: Implement shared page helpers**

```tsx
const confirmationValue =
  "Customizable / Please confirm with our sales engineer";
const specificationUnitPattern = /^(.*?)(\([^()]+\))$/;

const splitSpecificationHeading = (heading: string) => {
  const normalized = heading.replace(/\s+/g, " ").trim();
  const match = normalized.match(specificationUnitPattern);
  return match
    ? { label: match[1].trim(), unit: match[2] }
    : { label: normalized, unit: "" };
};
```

Render `label` with `whitespace-nowrap` and `unit` below it with centered block layout.

- [ ] **Step 4: Implement all sections and schema**

Build the 17 top-level sections from the typed data. Use the original product image only in the hero/advantage presentation, real 4:3 application photos, local horizontal table scrollers, native FAQ disclosures, and `ProductModel`, `FAQPage`, and `BreadcrumbList` JSON-LD without `offers`.

- [ ] **Step 5: Run the green contract**

```bash
npm run verify:electric-two-roll-rolling
```

Expected: `Electric Two-Roll Plate Rolling Machine page contract passed.`

- [ ] **Step 6: Commit the page**

```bash
git add app/products/[id]/page.tsx components/ElectricTwoRollPlateRollingMachineSolutionPage.tsx
git commit -m "feat: build electric two-roll rolling solution page"
```

---

### Task 4: Responsive and Visual Verification

**Files:**
- Modify only files that fail visual checks.

**Interfaces:**
- Consumes: local Next.js dev page.
- Produces: desktop/mobile screenshots and a checked FAQ interaction.

- [ ] **Step 1: Start the app**

```bash
npm run dev -- --hostname 127.0.0.1 --port 3100
```

- [ ] **Step 2: Check desktop at 1280×720**

Verify:

- exact title and one H1
- 17 sections
- both hero CTAs visible or immediately discoverable without layout collision
- original machine image loaded
- no document-level horizontal overflow
- no browser errors

- [ ] **Step 3: Check real application photos**

Scroll to Applications and verify all ten images have nonzero natural width and display stable 4:3 crops.

- [ ] **Step 4: Check interaction and mobile**

Expand the first FAQ and verify its answer is visible. Set the viewport to 390×844 and verify full-width CTAs, stacked hero, single-column cards, local table overflow, and no page overflow. Reset the viewport after checking.

- [ ] **Step 5: Commit only necessary visual fixes**

```bash
git add components/ElectricTwoRollPlateRollingMachineSolutionPage.tsx
git commit -m "fix: polish electric two-roll rolling page"
```

---

### Task 5: Final Verification, Integration, and Production Deployment

**Files:**
- No planned source changes.

**Interfaces:**
- Consumes: verified feature branch and current remote main.
- Produces: clean synchronized main branch and a Ready production deployment.

- [ ] **Step 1: Run final checks**

```bash
npm run verify:electric-two-roll-rolling
npm run verify:sheet-and-tube-laser
npm run verify:fiber-tube-laser
npm run lint
npm run build
```

Expected: all contracts pass, ESLint exits 0, and Next.js generates all static pages successfully.

- [ ] **Step 2: Merge current remote work safely**

Fetch and merge `origin/main` without discarding user work. Preserve both scripts when `package.json` gains concurrent entries. Re-run Task 5 Step 1 after any merge.

- [ ] **Step 3: Push main**

```bash
git push origin main
```

- [ ] **Step 4: Deploy the existing Vercel project**

```bash
npx --yes vercel@56.5.0 --prod --yes
```

Then inspect the exact production URL returned by the deployment command. Expected: deployment status `Ready` with aliases `https://www.zyroncnc.com` and `https://zyroncnc.com`.

- [ ] **Step 5: Verify production**

Verify the custom-domain product URL returns HTTP 200, exact title, one H1, 17 sections, ten application assets, split units, all three JSON-LD types, no offers, and a sitemap entry.
