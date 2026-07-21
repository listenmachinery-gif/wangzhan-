# Torsion Bar CNC Press Brake Solution Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a dedicated Torsion Bar CNC Press Brake product page that keeps all original parameters, uses eight real application photos, separates table labels from centered units, and presents the machine as a cost-effective CNC bending solution.

**Architecture:** Route only `torsion-bar-cnc-press-brake` to a dedicated server component. Store long-form page copy and repeatable records in a typed configuration file, while reading `product.technicalParameters` directly so parameter values keep one source of truth. Reuse the site shell, Next.js Image, Tailwind tokens, lucide-react, `/contact`, and existing real-photo assets.

**Tech Stack:** Next.js 15 App Router, React 19 server components, TypeScript, Tailwind CSS 3.4, lucide-react, Node.js contract tests, Browser/IAB visual QA, Vercel production deployment.

## Global Constraints

- Preserve the existing product image structure, proportions, and colors; do not create fake detail photos.
- All eight application cards use real local photographs, never line drawings or AI-generated workshop scenes.
- Read all 9 columns and 37 rows from the existing torsion-bar product data without copying or changing parameter values.
- Keep each header label on one line; render its parenthesized unit centered on the line below.
- Use `#76B900`, existing typography, navigation, footer, responsive rules, and inquiry flow.
- Do not add prices, offers, QR codes, fake claims, fake customer cases, new dependencies, or unrelated refactors.
- Mobile cards collapse to one column, CTA buttons become full width, and comparison/specification tables scroll locally.
- Redirect verbose verification output and print no more than the final 120 lines.

---

### Task 1: Generate and lock the visual reference

**Files:**
- Create: `.codex/visual-references/torsion-bar-cnc-press-brake/concept-hero.png`
- Create: `.codex/visual-references/torsion-bar-cnc-press-brake/concept-applications.png`
- Create: `.codex/visual-references/torsion-bar-cnc-press-brake/concept-technical.png`
- Create: `.codex/visual-references/torsion-bar-cnc-press-brake/design-system.md`

**Interfaces:**
- Consumes: `public/products/bending/torsion-bar-nc-press-brake.png`, the approved design spec, and real `.webp` application photos.
- Produces: three coordinated references and an exact implementation inventory.

- [ ] **Step 1: Inspect the protected product image and selected real photos**

Use `view_image` on the product image and selected application photos. Confirm the machine reference is intact and every application asset is photographic.

- [ ] **Step 2: Generate three coordinated page concepts**

Use the built-in Image Gen workflow. Prompt for: `(1)` hero + pain points + solution positions, `(2)` eight real-photo application cards + materials + process + torsion/CNC content, `(3)` advantages + comparison + workflow + selection + 9-column specification table + tooling + FAQ + CTA. Lock dark titanium, true white/light gray, `#76B900`, low-radius frames, no prices, no QR codes, no fake detail crops, and readable code-native UI text.

- [ ] **Step 3: Inspect, save, and inventory the concepts**

Use `view_image` on each output, copy accepted images to the exact paths above, and write `design-system.md` with colors, type scale, spacing, borders, media crops, exact hero copy, tables, mobile behavior, icon rules, and intentional use of existing real photos.

- [ ] **Step 4: Commit the visual reference**

```bash
git add .codex/visual-references/torsion-bar-cnc-press-brake
git commit -m "design: define torsion bar press brake direction"
```

Expected: one commit containing only concepts and the design inventory.

### Task 2: Define the failing page contract and typed content

**Files:**
- Create: `scripts/verify-torsion-bar-cnc-press-brake-page.mjs`
- Create: `data/torsion-bar-cnc-press-brake-page.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: the design spec and existing real `.webp` assets.
- Produces: `torsionBarCncPressBrakePage`, exported content types, and `npm run verify:torsion-bar-press-brake`.

- [ ] **Step 1: Write the failing contract test**

Create a Node assertion script covering the route, exact SEO title, 17 section names, eight `.webp` photo paths, one H1, Product/FAQ/Breadcrumb schemas, `product.technicalParameters`, local table overflow, separate `heading.label`/`heading.unit`, and prohibited content:

```js
assert.match(route, /TorsionBarCncPressBrakeSolutionPage/);
assert.match(route, /Torsion Bar CNC Press Brake \| Cost-effective Sheet Metal Bending Solution/);
assert.match(component, /product\.technicalParameters/);
assert.match(component, /heading\.label/);
assert.match(component, /heading\.unit/);
assert.match(component, /overflow-x-auto/);
assert.equal((data.match(/\.webp/g) ?? []).length, 8);
assert.doesNotMatch(component, /price|qr code/i);
```

- [ ] **Step 2: Register and run the test red**

Add to `package.json`:

```json
"verify:torsion-bar-press-brake": "node scripts/verify-torsion-bar-cnc-press-brake-page.mjs"
```

Run:

```bash
npm run verify:torsion-bar-press-brake > /tmp/torsion-contract.log 2>&1; code=$?; echo "contract exit code: $code"; tail -n 120 /tmp/torsion-contract.log; exit $code
```

Expected: non-zero because the dedicated component and data file do not exist.

- [ ] **Step 3: Implement the typed content module**

Export content records for hero, pain points, solutions, applications, materials, process, torsion synchronization, CNC control, advantages, comparison, workflow, selection, tooling, FAQ, internal links, and final CTA. Use exactly eight existing photos:

```ts
export const applicationPhotos = [
  "/products/electric-folding-applications/general-sheet-metal-workshop.webp",
  "/products/electric-folding-applications/electrical-cabinet-enclosure.webp",
  "/products/electric-folding-applications/ventilation-duct-fabrication.webp",
  "/products/electric-folding-applications/stainless-steel-fabrication.webp",
  "/products/pneumatic-folding-applications/construction-sheet-metal-work.webp",
  "/products/electric-folding-applications/architectural-sheet-metal.webp",
  "/products/manual-folding-applications/repair-maintenance-workshop.webp",
  "/products/electric-folding-applications/hvac-duct-panel-folding.webp",
] as const;
```

Do not declare parameter rows in this file.

- [ ] **Step 4: Re-run the contract and commit the red test/data boundary**

Expected: data assertions pass and route/component assertions remain red. Then run:

```bash
git add scripts/verify-torsion-bar-cnc-press-brake-page.mjs data/torsion-bar-cnc-press-brake-page.ts package.json
git commit -m "test: define torsion bar press brake page contract"
```

### Task 3: Implement the dedicated page, table formatting, and SEO

**Files:**
- Create: `components/TorsionBarCncPressBrakeSolutionPage.tsx`
- Modify: `app/products/[id]/page.tsx`

**Interfaces:**
- Consumes: `Product`, `torsionBarCncPressBrakePage`, original `product.technicalParameters`, `/contact`, and valid internal URLs.
- Produces: `TorsionBarCncPressBrakeSolutionPage({ product }: { product: Product })` plus route-specific metadata.

- [ ] **Step 1: Add the dedicated route and exact metadata**

```tsx
if (product.id === "torsion-bar-cnc-press-brake") {
  return <TorsionBarCncPressBrakeSolutionPage product={product} />;
}
```

Add the specified title, description, ten keywords, canonical, Open Graph/Twitter values, and image alt before generic metadata fallback.

- [ ] **Step 2: Implement the display-only header parser**

```ts
const splitSpecificationHeading = (column: string) => {
  const normalized = column
    .replace("DimensionsL", "Dimensions L")
    .replace(/\bx\b/g, "×")
    .replace(/\s+/g, " ")
    .trim();
  const match = normalized.match(/^(.*?)(\([^()]+\))$/);
  return match ? { label: match[1].trim(), unit: match[2] } : { label: normalized, unit: "" };
};
```

Render `heading.label` with `whitespace-nowrap` and `heading.unit` as a centered block beneath it.

- [ ] **Step 3: Build the 17 semantic page sections**

Use small local presentational helpers for headings, CTA links, real-photo applications, process/workflow steps, comparison/specification tables, selection items, and FAQ. Render exactly one H1 and semantic H2/H3 structure; non-hero images use Next.js lazy loading.

- [ ] **Step 4: Add escaped structured data**

Render Product, FAQPage, and BreadcrumbList JSON-LD. Product schema contains image, category, brand, manufacturer, and existing product specs but no `offers`, price, or rating.

- [ ] **Step 5: Apply responsive styling**

Use the accepted titanium/white section rhythm, thin borders, restrained hover motion, complete hero product image, four/two/one-column real-photo application grid, full-width mobile CTAs, and local table scrolling without document overflow.

- [ ] **Step 6: Run the contract and targeted lint green**

```bash
npm run verify:torsion-bar-press-brake > /tmp/torsion-contract.log 2>&1; contract=$?; npx eslint --no-ignore app components data scripts/verify-torsion-bar-cnc-press-brake-page.mjs > /tmp/torsion-lint.log 2>&1; lint=$?; echo "contract exit code: $contract"; echo "lint exit code: $lint"; tail -n 120 /tmp/torsion-contract.log; tail -n 120 /tmp/torsion-lint.log; test $contract -eq 0 -a $lint -eq 0
```

Expected: both exit codes are 0.

- [ ] **Step 7: Commit the implementation**

```bash
git add components/TorsionBarCncPressBrakeSolutionPage.tsx app/products/'[id]'/page.tsx
git commit -m "feat: build torsion bar press brake solution page"
```

### Task 4: Browser verification and fidelity repair

**Files:**
- Modify only when needed: `components/TorsionBarCncPressBrakeSolutionPage.tsx`
- Modify only when needed: `data/torsion-bar-cnc-press-brake-page.ts`

**Interfaces:**
- Consumes: local route and three accepted concepts.
- Produces: agency-signoff desktop/mobile render with proven interaction and no material mismatch.

- [ ] **Step 1: Open the local page with Browser/IAB**

Run the development server and open `http://127.0.0.1:3000/products/torsion-bar-cnc-press-brake`.

- [ ] **Step 2: Audit desktop and mobile**

At 1080px/1440px desktop and 390px mobile, verify one H1, all sections, complete product image, eight real photos, 9×37 parameters, label/unit formatting, local table scroll, full-width mobile CTAs, no document overflow, FAQ opening, CTA destinations, and clean console logs.

- [ ] **Step 3: Capture and compare visual evidence**

Capture hero, applications, technical table, and mobile FAQ. Use `view_image` on accepted concepts and corresponding browser screenshots. Record at least copy, hierarchy, palette, product image, real-photo crops, spacing, table headers, mobile collapse, icons, and CTA styling.

- [ ] **Step 4: Repair and re-run until no material mismatch remains**

Fix only task-scoped clipping, wrapping, spacing, contrast, image framing, accessibility, or interaction defects. Re-run the contract and targeted lint after source changes, then commit only if required.

### Task 5: Merge, verify, deploy, and live-smoke-test

**Files:**
- No planned source edits unless verification exposes a task-scoped defect.

**Interfaces:**
- Consumes: the completed feature branch and current Vercel project link.
- Produces: merged `main`, passing checks, and a verified live route.

- [ ] **Step 1: Run final checks on the feature branch**

```bash
npm run verify:torsion-bar-press-brake > /tmp/torsion-final-contract.log 2>&1; contract=$?; npm run lint > /tmp/torsion-final-lint.log 2>&1; lint=$?; npm run build > /tmp/torsion-final-build.log 2>&1; build=$?; echo "contract exit code: $contract"; echo "lint exit code: $lint"; echo "build exit code: $build"; tail -n 120 /tmp/torsion-final-contract.log; tail -n 120 /tmp/torsion-final-lint.log; tail -n 120 /tmp/torsion-final-build.log; test $contract -eq 0 -a $lint -eq 0 -a $build -eq 0
```

- [ ] **Step 2: Merge locally and repeat checks on `main`**

Preserve unrelated commits, resolve only overlapping route imports/branches, then run contract, full lint, and build again.

- [ ] **Step 3: Verify the deployment target and deploy**

Inspect `vercel.json`, `.vercel/project.json`, and `npx vercel whoami`, then run `npx vercel --prod --yes`. Expected: target `production`, state `READY`, and alias `https://www.zyroncnc.com`.

- [ ] **Step 4: Smoke-test the formal URL**

Check `https://www.zyroncnc.com/products/torsion-bar-cnc-press-brake` for HTTP 200, exact title/H1, eight application photos, first and last parameter models, Product/FAQ schemas, and no price/offers.

- [ ] **Step 5: Report the handoff**

Report modified files, page modules, SEO, desktop/mobile evidence, contract/lint/build results, visual concept paths, production URL, and intentional visual deviations. Do not claim completion without fresh command and live-page evidence.
