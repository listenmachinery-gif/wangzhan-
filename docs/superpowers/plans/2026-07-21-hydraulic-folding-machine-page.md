# Hydraulic Folding Machine Solution Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a dedicated Hydraulic Folding Machine solution page with eight newly sourced real application photographs, unchanged verified HWS specifications, readable split-unit headers, professional responsive layout and complete SEO.

**Architecture:** Keep verified parameters in `data/bending-details.ts`, put page-specific typed content and photo mappings in one focused data module, and render the canonical route through a dedicated React server component. A failing source contract drives implementation, local WebP assets remove runtime image-host dependencies, and the existing full-suite verifier protects every other product page.

**Tech Stack:** Next.js 15 App Router, React 19 server components, TypeScript, Tailwind CSS, `next/image`, `next/link`, Lucide React, Node ESM contract scripts, bundled Sharp runtime and Vercel CLI.

## Global Constraints

- Keep `/products/hydraulic-sheet-metal-folding-machine` and its catalog identity.
- Use exactly one H1: `Hydraulic Folding Machine`.
- Reuse the existing hydraulic folding-machine product image without structural or color changes.
- Preserve every value in all seven existing HWS parameter rows exactly in `data/bending-details.ts`.
- Keep each parameter label connected; show consistent `mm`, `kW` and `kg` units on a centered second line.
- Use eight newly sourced real Pexels photographs that are not reused from any existing folding-machine page.
- Store photographs locally as 1200 × 675 WebP and record their source, creator and access date.
- Do not add dependencies, prices, offers, ratings, reviews, fake metrics, fake close-ups or unsupported component specifications.
- Preserve the global header, footer, navigation and responsive conventions.
- Deploy the verified `main` branch through the configured Vercel project and verify the canonical production URL.

---

### Task 1: Define the dedicated-page contract

**Files:**
- Create: `scripts/verify-hydraulic-folding-machine-page.mjs`

**Interfaces:**
- Consumes: route, content, component, parameter source and new asset directory
- Produces: a zero-exit contract for identity, section coverage, schemas, metadata, photos, responsive tables and original HWS values

- [ ] **Step 1: Write the failing contract**

Use Node `assert`, `existsSync`, `readFileSync`, `readdirSync` and `resolve`. Define the exact expected rows:

```js
const expectedRows = [
  ["HWS-2 x 1300", "2 mm", "1300 mm", "3 kW", "1400 kg", "2150 x 1100 x 1450mm"],
  ["HWS-2 x 1600", "2 mm", "1600 mm", "3 kW", "1600 kg", "2450 x 1100 x 1500mm"],
  ["HWS-2 x 2000", "2 mm", "2000 mm", "4 kW", "2000 kg", "2850 x 1100 x 1500mm"],
  ["HWS-2 x 2500", "2 mm", "2500 mm", "5.5 kW", "2200 kg", "3350 x 1150 x 1500mm"],
  ["HWS-3 x 1600", "3 mm", "1600 mm", "5.5 kW", "1900 kg", "2450 x 1100 x 1500mm"],
  ["HWS-3 x 2000", "3 mm", "2000 mm", "7.5 kW", "2200 kg", "2850 x 1150 x 1500mm"],
  ["HWS-4 x 1600", "4 mm", "1600 mm", "7.5 kW", "2000 kg", "2450 x 1150 x 1500mm"],
];

const sections = [
  "hero", "problems", "solutions", "applications", "materials", "hydraulic-system",
  "process", "advantages", "comparison", "equipment", "selection", "technical", "faq", "cta",
];
```

Require eight distinct `/products/hydraulic-folding-applications/*.webp` paths, eight non-empty alt strings, the source manifest and the Pexels license link. Require all section markers, one H1 from `content.hero.title`, the approved hero alt, `inferColumnUnit`, `stripDisplayUnit`, non-wrapping centered headers, table-only overflow, three safe JSON-LD types, the exact title/description and the hydraulic route guard.

- [ ] **Step 2: Verify RED**

Run `node scripts/verify-hydraulic-folding-machine-page.mjs` and confirm exit 1 because the dedicated content/component/assets do not exist.

- [ ] **Step 3: Commit the failing contract**

Run `git add scripts/verify-hydraulic-folding-machine-page.mjs && git commit -m "test: define hydraulic folding page contract"`.

---

### Task 2: Add typed solution content and fresh photos

**Files:**
- Create: `data/hydraulic-folding-machine-page.ts`
- Create: `public/products/hydraulic-folding-applications/*.webp`
- Create: `public/products/hydraulic-folding-applications/SOURCES.md`

**Interfaces:**
- Produces: `hydraulicFoldingMachinePageContent` and eight local source-tracked photographs

- [ ] **Step 1: Define the content model**

Create types for hero, text cards, three-field solution cards, photo applications, comparison rows, equipment links and FAQs. Applications use:

```ts
export type HydraulicFoldingApplication = {
  title: string;
  text: string;
  image: string;
  alt: string;
};
```

- [ ] **Step 2: Populate the approved brief**

Use the supplied hero title, subtitle, description, CTAs and proof points. Add five problems, three solution groups, eight applications, six materials, five hydraulic-system points, six process steps, supported advantages, seven comparison rows across five machine types, seven workflow machines, eleven selection prompts, nine FAQs and the final CTA. Use existing catalog hrefs only.

- [ ] **Step 3: Download the independent photo set**

Use each selected Pexels page's direct `images.pexels.com` download link. Fetch with bounded timeouts, then use the already installed Sharp runtime to rotate, crop and encode each file as 1200 × 675 WebP at quality 76. Required filenames are:

```js
[
  "hvac-duct-panel-folding.webp",
  "rectangular-air-duct-fabrication.webp",
  "roofing-sheet-metal-work.webp",
  "architectural-sheet-metal.webp",
  "electrical-cabinet-enclosure.webp",
  "stainless-steel-light-fabrication.webp",
  "long-edge-sheet-metal-bending.webp",
  "general-sheet-metal-workshop.webp",
]
```

- [ ] **Step 4: Inspect and document the images**

Use `view_image` on all final crops. Reject irrelevant subjects, prominent third-party branding, unsafe scenes or misleading machine identity. Record Pexels photographer, source page, license page, access date `2026-07-21` and the statement that images illustrate general applications rather than ZYRON customers or exact machine models.

- [ ] **Step 5: Verify partial RED and commit**

Run the focused contract; it must now fail only because the component and route are absent. Commit data, assets, manifest and any final contract source IDs with `git commit -m "feat: add hydraulic folding content and photos"`.

---

### Task 3: Build the dedicated server component

**Files:**
- Create: `components/HydraulicFoldingMachineSolutionPage.tsx`

**Interfaces:**
- Consumes: `{ product: Product }`, `product.technicalParameters` and `hydraulicFoldingMachinePageContent`
- Produces: fourteen semantic page sections, native FAQ disclosures and safe structured data

- [ ] **Step 1: Add presentation helpers**

Implement exact display-only unit helpers without touching source data:

```ts
const unitByColumn: Record<string, string> = {
  "Processing Plate Thickness": "mm",
  "Maximum Folding Width": "mm",
  "Motor Power": "kW",
  "Machine Weight": "kg",
};

const inferColumnUnit = (column: string) => unitByColumn[column] ?? "";
const stripDisplayUnit = (value: string, unit: string) =>
  unit ? value.replace(new RegExp(`\\s*${unit}$`, "i"), "") : value;
const jsonLd = (value: object) => JSON.stringify(value).replace(/</g, "\\u003c");
```

Add a small `SectionIntro` component at module scope. Keep the page as a server component and avoid state/effects.

- [ ] **Step 2: Build the schemas**

Render escaped `ProductModel`, `BreadcrumbList` and `FAQPage` JSON-LD for the canonical URL. Map original parameter cells into `additionalProperty` and omit all price/offer/review fields.

- [ ] **Step 3: Implement hero through hydraulic system**

Render the existing machine image with the approved alt and `object-contain`; render the eight real applications through `next/image` using 16:9 media frames, responsive `sizes` and default lazy loading. Use the existing graphite/white section rhythm and `#76B900` accent.

- [ ] **Step 4: Implement process through selection**

Build the six-step process, verified advantages, five-machine objective comparison, linked equipment workflow and selection guide. Use native links to `/contact` for all CTAs and existing product routes for internal links.

- [ ] **Step 5: Implement the specification table**

Throw `new Error("Hydraulic Folding Machine technical parameters are required")` if parameters are absent. Render every row directly from `product.technicalParameters`. Each heading uses one connected `whitespace-nowrap` label and an inferred unit in a centered block below. Each numeric value removes only the matching display suffix. Keep `Overall Dimensions` values unchanged. Wrap only the table container in `max-w-full overflow-x-auto`.

- [ ] **Step 6: Implement FAQs and final CTA**

Use native `<details>`/`<summary>`, one H1 total and correct H2/H3 hierarchy. Add no client-side accordion dependency.

- [ ] **Step 7: Verify partial RED and commit**

Run the focused contract; only route/metadata assertions may remain. Commit with `git commit -m "feat: build hydraulic folding solution page"`.

---

### Task 4: Route the page, add metadata and finish contracts

**Files:**
- Modify: `app/products/[id]/page.tsx`
- Modify: `scripts/verify-all-product-solution-pages.mjs`

**Interfaces:**
- Consumes: `HydraulicFoldingMachineSolutionPage`
- Produces: dedicated rendering/metadata and updated all-page counts

- [ ] **Step 1: Add the dedicated route branch**

Import the component directly. Return it when `product.id === "hydraulic-sheet-metal-folding-machine"` before the shared `ProductSolutionPage` fallback.

- [ ] **Step 2: Add exact metadata**

Use title `Hydraulic Folding Machine | Sheet Metal & HVAC Duct Folding Solution`, the supplied description, all ten keywords, canonical path, approved image alt, Open Graph and Twitter values.

- [ ] **Step 3: Update aggregate counts**

Increase the dedicated solution-page count by one and decrease the shared-page count by one while keeping the total product count unchanged. Add the hydraulic page to any dedicated-route expectation array.

- [ ] **Step 4: Verify GREEN and commit**

Run `node scripts/verify-hydraulic-folding-machine-page.mjs` and `node scripts/verify-all-product-solution-pages.mjs`; both must exit 0. Commit with `git commit -m "feat: route hydraulic folding solution page"`.

---

### Task 5: Visual QA, full verification and deployment

**Files:**
- Modify only files required by observed defects

**Interfaces:**
- Produces: a verified desktop/mobile page and verified production deployment

- [ ] **Step 1: Run bounded static verification**

Run the focused contract, every existing `verify-*page*.mjs`/browser-independent product verifier, `npm run lint`, `npx tsc --noEmit` and `npm run build`, redirecting long logs and reading exit codes plus the last 120 lines.

- [ ] **Step 2: Render desktop and mobile views**

Start the production build and inspect `/products/hydraulic-sheet-metal-folding-machine` at approximately 1440 × 1000 and 390 × 844. Capture full-page screenshots and verify hero composition, all photo crops, section rhythm, table header units, table-only scrolling, FAQ interaction, CTA links and absence of document overflow.

- [ ] **Step 3: Complete fidelity review**

Use `view_image` on the accepted design reference (the approved spec plus established folding-page visual system) and both implementation screenshots. Record at least five comparison points: copy, layout, typography, palette, real-image treatment, container model, responsive behavior and parameter-table behavior. Fix every material mismatch and repeat checks.

- [ ] **Step 4: Final verification commit**

After a fresh full verification run, commit any QA repairs with `git commit -m "fix: refine hydraulic folding page verification"`. Confirm `git status --short` is empty.

- [ ] **Step 5: Deploy and verify production**

Push `main` to `origin`, deploy through the repository's configured Vercel production workflow, and verify `https://www.zyroncnc.com/products/hydraulic-sheet-metal-folding-machine` returns the new H1, application photos, all seven HWS rows and correct metadata. Report the final deployment URL and verification evidence.
