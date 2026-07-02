# Small Electric Shear Solution Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated Small Electric Shearing Machine solution page that reuses the approved Foot Shear layout, preserves all eight original Q11G parameter rows, and formats table units on a centered second line.

**Architecture:** Extract the current Foot Shear page markup into a shared `ShearingSolutionPage` server component driven by product-specific content. Keep thin wrapper components for Foot Shear and Small Electric Shear, and branch to the new wrapper only for `compact-electric-shearing-machine` in the existing dynamic route.

**Tech Stack:** Next.js 15 App Router, React 19 server components, TypeScript, Tailwind CSS, `next/image`, Lucide React, Node source contracts, Playwright browser verification.

---

### Task 1: Add The Failing Source Contract

**Files:**
- Create: `scripts/verify-small-electric-shear-page.mjs`

- [ ] **Step 1: Assert the new architecture and page contract**

The script must assert:

- `components/ShearingSolutionPage.tsx`, `components/SmallElectricShearSolutionPage.tsx`, and `data/small-electric-shear-page.ts` exist;
- the route renders the wrapper only for `compact-electric-shearing-machine`;
- exact SEO title, meta description, H1, section headings, seven FAQs, and three JSON-LD types exist;
- the shared component reads `product.technicalParameters`;
- Q11G row values are absent from the new editorial data and component files;
- the shared table uses a `splitColumnHeading` helper and renders a separate unit line.

- [ ] **Step 2: Run the source contract and confirm RED**

Run:

```bash
node scripts/verify-small-electric-shear-page.mjs
```

Expected: failure because the shared component and Small Electric Shear wrapper do not exist.

### Task 2: Define Shared Content Types And Small Electric Content

**Files:**
- Create: `data/shearing-solution-types.ts`
- Create: `data/small-electric-shear-page.ts`
- Modify: `data/foot-shear-page.ts`

- [ ] **Step 1: Define the reusable content contract**

Create a `ShearingSolutionContent` type containing schema metadata, hero content, section headings, pain points, fit list, process steps, applications, advantages, structure parts, comparison content, optional production workflow, support items, FAQs, CTA content, and a `splitTableHeaderUnits` flag.

- [ ] **Step 2: Add the supplied Small Electric Shear content**

Use the attachment wording for the hero, pain points, applications, advantages, workflow, comparison, support, seven FAQs, and CTA. Keep statements conditional where capacity depends on model or material.

- [ ] **Step 3: Adapt Foot Shear content to the shared type**

Move fixed section headings currently embedded in the component into the Foot Shear content object. Preserve every visible Foot Shear string and set `splitTableHeaderUnits` to `false` so its table display remains unchanged.

### Task 3: Extract The Shared Solution Component

**Files:**
- Create: `components/ShearingSolutionPage.tsx`
- Modify: `components/FootShearSolutionPage.tsx`
- Create: `components/SmallElectricShearSolutionPage.tsx`

- [ ] **Step 1: Move the approved layout into the shared component**

The shared component accepts:

```ts
type ShearingSolutionPageProps = {
  product: Product;
  content: ShearingSolutionContent;
};
```

It renders the current hero, pain points, solution positioning, process, applications, advantages, structure, technical table, comparison, support, FAQ, and CTA sections from the content object.

- [ ] **Step 2: Implement centered two-line table headings**

Add:

```ts
function splitColumnHeading(column: string) {
  const match = column.match(/^(.*?)(\([^()]+\))$/);
  return match ? { label: match[1].trim(), unit: match[2] } : { label: column, unit: "" };
}
```

When `splitTableHeaderUnits` is true, render the label and unit in separate centered block elements. Keep parameter cells `whitespace-nowrap` and the table inside `overflow-x-auto`.

- [ ] **Step 3: Keep thin product wrappers**

`FootShearSolutionPage` and `SmallElectricShearSolutionPage` each pass their product-specific data to the shared component. No duplicate page markup remains.

### Task 4: Add Route And SEO Integration

**Files:**
- Modify: `app/products/[id]/page.tsx`

- [ ] **Step 1: Add Small Electric Shear metadata**

For `compact-electric-shearing-machine`, return the supplied title, meta description, keywords, canonical URL, Open Graph data, and image alt text.

- [ ] **Step 2: Add isolated page routing**

After product lookup, render `<SmallElectricShearSolutionPage product={product} />` only when the product ID matches. Leave the Foot Shear branch and generic page path intact.

- [ ] **Step 3: Run the source contract and confirm GREEN**

Run:

```bash
node scripts/verify-small-electric-shear-page.mjs
```

Expected: `Small Electric Shear page source contract passed.`

### Task 5: Add Browser Verification

**Files:**
- Create: `scripts/verify-small-electric-shear-browser.cjs`

- [ ] **Step 1: Verify desktop and mobile behavior**

The browser contract must check:

- exact title, description and single H1;
- both instances of the real product image load without cropping;
- all eight original rows from `Q11G-2 x 600` through `Q11G-1.2 x 2500` appear;
- table headings place `(mm)`, `(deg)`, `(times/min)`, and `(kW)` on separate unit lines;
- seven FAQs and Product, BreadcrumbList, FAQPage schemas exist;
- no page-level horizontal overflow at 1440 px and 390 px;
- legacy `/products/small-electric-shearing-machine` redirects to the canonical route;
- Foot Shear and an unrelated generic product still render their intended templates;
- no console errors or failed network requests occur.

### Task 6: Static And Visual Verification

- [ ] **Step 1: Run the full static checks**

```bash
node scripts/verify-foot-shear-page.mjs
node scripts/verify-small-electric-shear-page.mjs
npx tsc --noEmit
npm run build
```

Expected: all commands pass and the build lists both solution pages under `/products/[id]`.

- [ ] **Step 2: Run the browser contract against the production build**

Start Next.js on an available local port and run the Playwright script at 1440 x 1000 and 390 x 844. Inspect screenshots for spacing, image completeness, readable headings, unit alignment, and table containment.

### Task 7: Review And Release

- [ ] **Step 1: Review the final diff**

Run `git diff --check`, confirm no product parameter values were changed, and confirm generic product rendering remains in the route.

- [ ] **Step 2: Commit and push**

Commit the implementation with a focused message and push `main` to trigger the existing deployment.

- [ ] **Step 3: Verify production**

Confirm `https://www.zyroncnc.com/products/compact-electric-shearing-machine` returns the new H1, original Q11G rows, seven FAQs, and all three structured-data types.
