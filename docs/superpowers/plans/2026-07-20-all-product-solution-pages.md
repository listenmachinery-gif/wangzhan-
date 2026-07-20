# All Product Solution Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic template used by 50 product detail routes with one professional solution-oriented page system while preserving the five dedicated shearing solution pages and deploying the verified result to the existing Vercel production site.

**Architecture:** A pure content builder combines each existing `Product` and `ProductCategory` with one of eight category profiles. A shared server component renders the resulting view model. The dynamic route continues to isolate the five dedicated pages and delegates only its former generic branch to the shared component.

**Tech Stack:** Next.js 15 App Router, React 19 Server Components, TypeScript 5.7, Tailwind CSS 3.4, lucide-react, Node verification scripts, Vercel.

## Global Constraints

- Preserve all 55 current product names, product IDs, URLs, image paths, redirects, and original technical parameter values.
- Keep the five dedicated shearing solution page branches unchanged.
- Use only the one existing real image for each target product; do not add or fabricate detail images.
- Do not invent price, stock, ratings, reviews, certifications, performance figures, customer cases, warranties, standard accessories, or delivery promises.
- Preserve one H1, canonical metadata, Product or ProductModel JSON-LD, BreadcrumbList JSON-LD, and mobile table scrolling.
- Deploy to the existing Vercel project and production domain `https://www.zyroncnc.com`; do not create another site.

---

### Task 1: Lock the shared-page contract with a failing verification script

**Files:**
- Create: `scripts/verify-all-product-solution-pages.mjs`
- Test: `scripts/verify-all-product-solution-pages.mjs`

**Interfaces:**
- Consumes: source files under `app/products/[id]`, `components`, and `data`.
- Produces: a zero-exit source contract that confirms route isolation, eight profile keys, required page section markers, safe schema, and the 55/5/50 product split.

- [ ] **Step 1: Write the source contract**

Use Node `assert/strict`, `fs`, and `path`. Read `data/products.ts`, `data/product-solution-profiles.ts`, `components/ProductSolutionPage.tsx`, and `app/products/[id]/page.tsx`. Assert that:

```js
const expectedProfileIds = [
  "shearing-machines",
  "bending-machines",
  "laser-cutting-machines",
  "plate-rolling-machines",
  "press-machines",
  "rectangular-duct-production",
  "round-duct-production",
  "shredders",
];

const dedicatedIds = [
  "foot-shear",
  "compact-electric-shearing-machine",
  "energy-saving-electric-shearing-machine",
  "hydraulic-swing-beam-shear",
  "hydraulic-guillotine-shear",
];
```

The source must contain all eight category keys, all five dedicated route guards, one generic `<ProductSolutionPage`, required `data-section` values (`hero`, `challenges`, `fit`, `workflow`, `advantages`, `applications`, `selection`, `technical`, `support`, `related`, `cta`), and Product/BreadcrumbList schema. Reject `Offer`, `aggregateRating`, `review`, `priceCurrency`, and `availability`.

- [ ] **Step 2: Run the test and verify RED**

Run: `node scripts/verify-all-product-solution-pages.mjs`

Expected: FAIL because `data/product-solution-profiles.ts` and `components/ProductSolutionPage.tsx` do not exist.

- [ ] **Step 3: Commit the failing test only**

```bash
git add scripts/verify-all-product-solution-pages.mjs
git commit -m "test: define all-product solution page contract"
```

### Task 2: Build typed category profiles and product-derived view models

**Files:**
- Create: `data/product-solution-profiles.ts`
- Test: `scripts/verify-all-product-solution-pages.mjs`

**Interfaces:**
- Consumes: `Product` and `ProductCategory` from `data/products.ts`.
- Produces: `ProductSolutionProfile`, `ProductSolutionViewModel`, `productSolutionProfiles`, and `buildProductSolutionViewModel(product, category)`.

- [ ] **Step 1: Define the types and pure builder**

```ts
export type ProductSolutionProfile = {
  categoryId: Product["categoryId"];
  eyebrow: string;
  buyerOutcome: string;
  challenges: Array<{ title: string; text: string }>;
  workflow: Array<{ title: string; text: string }>;
  selectionQuestions: string[];
  supportSteps: Array<{ title: string; text: string }>;
  inquiryFields: string[];
};

export type ProductSolutionViewModel = {
  profile: ProductSolutionProfile;
  intro: string;
  outcomes: string[];
  applications: Array<{ title: string; text: string }>;
  advantages: Array<{ title: string; text: string }>;
  configurations: Array<{ title: string; text: string }>;
};

export function buildProductSolutionViewModel(
  product: Product,
  category: ProductCategory,
): ProductSolutionViewModel;
```

Parse colon-separated advantages into title/body pairs, use current highlights as fallback, convert existing applications and options into contextual cards, and derive the intro from `performanceFeatures ?? tagline`. Do not manufacture numerical claims.

- [ ] **Step 2: Add all eight profiles**

Each category profile must provide exactly four challenges, four or five workflow steps, four selection questions, four support steps, and five inquiry fields. Category language must center on these verified inputs:

| Category | Selection basis | Workflow focus |
| --- | --- | --- |
| Shearing | material, thickness, width, drive | position, hold, cut, next process |
| Bending | material, thickness, length, angle/tooling | drawing, tooling, gauge, bend, inspect |
| Fiber laser | material, thickness, format, output | file, nest, load, cut, unload |
| Plate rolling | material, thickness, width, diameter | setup, pre-bend, roll, inspect |
| Press | process, force, stroke, tooling/safety | load, position, press, unload |
| Rectangular duct | duct size, material, production stage, output | prepare, form, connect, assemble |
| Round duct | diameter, material, profile, output | feed, form, join, finish |
| Shredders | feedstock, input size, output size, throughput | feed, size reduction, discharge, downstream separation |

- [ ] **Step 3: Run the contract**

Run: `node scripts/verify-all-product-solution-pages.mjs`

Expected: still FAIL because the shared component and route integration do not yet exist.

- [ ] **Step 4: Commit profiles**

```bash
git add data/product-solution-profiles.ts
git commit -m "feat: add category solution profiles"
```

### Task 3: Implement the shared solution page and route integration

**Files:**
- Create: `components/ProductSolutionPage.tsx`
- Modify: `app/products/[id]/page.tsx`
- Test: `scripts/verify-all-product-solution-pages.mjs`

**Interfaces:**
- Consumes: `product: Product`, `category: ProductCategory`, `relatedProducts: Product[]`, and `buildProductSolutionViewModel`.
- Produces: a server-rendered product page with the eleven `data-section` markers required by Task 1.

- [ ] **Step 1: Render the component from the accepted design**

```tsx
type ProductSolutionPageProps = {
  product: Product;
  category: ProductCategory;
  relatedProducts: Product[];
};

export type ProductSolutionPageComponent = (
  props: ProductSolutionPageProps,
) => React.ReactElement;
```

Render the eleven fully specified sections from the design specification. Use the accepted graphite/white/green design system. The hero contains the product image once. Do not render synthetic numeric metrics. Keep `overflow-x-auto` on the parameter wrapper and never on the entire page.

- [ ] **Step 2: Replace only the generic route branch**

After the five dedicated returns, retain category and related-product lookup and return:

```tsx
if (!category) {
  notFound();
}

return (
  <ProductSolutionPage
    product={product}
    category={category}
    relatedProducts={relatedProducts}
  />
);
```

Remove imports used only by the deleted generic JSX. Do not alter dedicated imports or guards.

- [ ] **Step 3: Verify GREEN**

Run: `node scripts/verify-all-product-solution-pages.mjs`

Expected: PASS with `55 products, 5 dedicated, 50 shared solution pages`.

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`

Expected: exit 0 with no TypeScript errors.

- [ ] **Step 5: Commit implementation**

```bash
git add components/ProductSolutionPage.tsx data/product-solution-profiles.ts app/products/[id]/page.tsx scripts/verify-all-product-solution-pages.mjs
git commit -m "feat: upgrade all product pages to solution layouts"
```

### Task 4: Verify the complete product catalog locally

**Files:**
- Modify only if verification exposes a defect: files from Tasks 1–3.
- Test: all `scripts/verify-*.mjs`, TypeScript, Next.js production build, and representative live routes.

**Interfaces:**
- Consumes: the complete built application.
- Produces: fresh build, source-contract, HTTP, schema, and responsive-layout evidence.

- [ ] **Step 1: Run all source verification scripts**

```bash
for file in scripts/verify-*.mjs; do node "$file"; done
```

Expected: every script exits 0.

- [ ] **Step 2: Run typecheck and production build**

```bash
npx tsc --noEmit
npm run build
```

Expected: both commands exit 0 and Next.js generates all product routes.

- [ ] **Step 3: Start the production server and verify representative routes**

Check one route from every category plus all five dedicated routes. For each representative shared page assert status 200, one H1, all required section markers, one product image in main content, valid JSON-LD, valid internal links, and no page-width overflow.

- [ ] **Step 4: Browser-check desktop and mobile**

Use the in-app Browser at 1440 px and 390 px. Inspect hero balance, section hierarchy, table scrolling, related cards, CTA links, product image loading, and the five dedicated-page regression targets. Repair all visible clipping, accidental wrapping, empty cards, or horizontal overflow.

- [ ] **Step 5: Commit verification repairs**

```bash
git add app components data scripts
git commit -m "fix: polish shared product solution pages"
```

Skip this commit when no repair files exist.

### Task 5: Publish to the existing Vercel production site

**Files:**
- No source changes expected.

**Interfaces:**
- Consumes: the verified `main` branch and existing `.vercel/project.json` project binding.
- Produces: an updated `https://www.zyroncnc.com` production deployment.

- [ ] **Step 1: Confirm clean intended scope**

Run `git status --short`, `git diff --check`, and inspect the final commit list. Preserve unrelated user files and include the pre-existing Hydraulic Guillotine solution work because it is part of the requested five-page baseline.

- [ ] **Step 2: Push the current main branch**

Run: `git push origin main`

Expected: origin accepts the commits and the configured Vercel Git deployment begins.

- [ ] **Step 3: Deploy directly only if Git integration does not produce the release**

Run: `npx vercel --prod --yes`

Expected: Vercel returns a successful production deployment for the existing `wangzhan` project.

- [ ] **Step 4: Verify production**

Confirm `https://www.zyroncnc.com` and representative product URLs return 200, contain the new shared sections, have correct canonical URLs, retain the dedicated five-page layouts, and appear in the production sitemap.

- [ ] **Step 5: Report the exact production result**

Return the production URL, the 55/5/50 page coverage, source and build results, browser checks, deployment result, and any non-blocking content caveats. Do not claim Core Web Vitals field-data success without Search Console or CrUX evidence.
