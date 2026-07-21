# NC Hydraulic Press Brake Solution Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a dedicated NC Hydraulic Press Brake product page that keeps the original parameters, uses real application photos, renders table labels and units correctly, and presents the machine as a cost-effective sheet-metal bending solution.

**Architecture:** Route only `nc-hydraulic-press-brake` to a dedicated server component. Keep long-form copy and repeatable page data in a typed configuration file, while continuing to read the original `Product.technicalParameters` object so parameter values have one source of truth. Reuse the existing site shell, Next.js Image, Tailwind tokens, lucide icons, and `/contact` inquiry flow.

**Tech Stack:** Next.js 15 App Router, React 19 server components, TypeScript, Tailwind CSS 3.4, lucide-react, Node.js contract tests, Browser/IAB visual QA, Vercel production deployment.

## Global Constraints

- Do not change the machine structure, proportions, or color in the existing product image.
- Application cards must use real local photos; do not use line drawings or fake machine-detail photos.
- Parameter rows and values must remain sourced from `bending-details.ts` without rewriting or rounding.
- Each specification header label stays on one line; its parenthesized unit appears centered on the line below.
- Accent color is exactly `#76B900`; retain the existing global navigation and footer.
- Do not add prices, QR codes, unverifiable performance claims, unnecessary dependencies, or unrelated refactors.
- Mobile cards collapse to one column, CTA buttons become full width, and comparison/specification tables scroll inside their own containers.
- Verification commands must redirect verbose output and print no more than the final 120 lines.

---

### Task 1: Generate and lock the page visual reference

**Files:**
- Create: `.codex/visual-references/nc-hydraulic-press-brake/concept-hero.png`
- Create: `.codex/visual-references/nc-hydraulic-press-brake/concept-content.png`
- Create: `.codex/visual-references/nc-hydraulic-press-brake/concept-technical.png`
- Create: `.codex/visual-references/nc-hydraulic-press-brake/design-system.md`

**Interfaces:**
- Consumes: `public/products/bending/simple-nc-press-brake.png` as a protected product reference and the approved design spec.
- Produces: three accepted visual references plus exact tokens and section rules used by the React implementation.

- [ ] **Step 1: Inspect the existing product image and representative real application photos**

Use `view_image` on the product image and a montage of the selected local `.webp` application photos. Confirm they are photographs and not line art.

- [ ] **Step 2: Generate three coordinated industrial webpage concepts**

Use the built-in Image Gen workflow with the existing machine image as a reference for the hero concept. Generate: hero + problem/solution sections; applications + materials + process; and controls + tables + selection + FAQ + CTA. Require dark titanium, black/gray gradients, white/light-gray copy, `#76B900`, square/low-radius frames, no price UI, no QR code, no fake detail photography, and code-native UI text.

- [ ] **Step 3: Inspect and save the concepts in the workspace**

Use `view_image` on all three concepts, select internally consistent outputs, and copy them to the exact paths above without overwriting unrelated assets.

- [ ] **Step 4: Record the implementation inventory**

Write `design-system.md` with the accepted colors, typography, spacing scale, border/radius/shadow rules, section background rhythm, exact hero copy, CTA labels, media crops, icon family, table behavior, mobile collapse rules, and intentional differences caused by using real local application photos.

- [ ] **Step 5: Commit the visual references**

Run:

```bash
git add .codex/visual-references/nc-hydraulic-press-brake
git commit -m "design: define nc press brake page direction"
```

Expected: one commit containing only the three concepts and design-system inventory.

### Task 2: Define the page contract and typed content model

**Files:**
- Create: `scripts/verify-nc-hydraulic-press-brake-page.mjs`
- Create: `data/nc-hydraulic-press-brake-page.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: the approved design spec and real photo paths already stored under `public/products/*-applications/`.
- Produces: `ncHydraulicPressBrakePage` and its exported TypeScript types for the component; `npm run verify:nc-press-brake` for regression verification.

- [ ] **Step 1: Write the failing contract test**

Create a Node script that reads the route, data, and component sources and asserts all of the following:

```js
assert.match(route, /NcHydraulicPressBrakeSolutionPage/);
assert.match(route, /NC Hydraulic Press Brake \| Sheet Metal Bending Solution/);
assert.match(component, /data-nc-press-brake-page/);
assert.match(component, /FAQPage/);
assert.match(component, /Product/);
assert.match(component, /overflow-x-auto/);
assert.match(component, /heading\.label/);
assert.match(component, /heading\.unit/);
assert.doesNotMatch(component, /price|qr code/i);
assert.match(data, /applicationPhotos/);
assert.equal((data.match(/\.webp/g) ?? []).length, 8);
assert.match(data, /What Bending Problems Can It Solve\?/);
assert.match(data, /Simple NC Control for Practical Bending/);
assert.match(data, /Tooling Matters for Better Bending/);
assert.match(data, /Need a Cost-effective Sheet Metal Bending Solution\?/);
```

Also import the built site data indirectly through source checks that verify the page receives `product.technicalParameters` rather than declaring a second parameter row array.

- [ ] **Step 2: Add the npm verification command and run the failing test**

Add:

```json
"verify:nc-press-brake": "node scripts/verify-nc-hydraulic-press-brake-page.mjs"
```

Run:

```bash
npm run verify:nc-press-brake > /tmp/nc-contract.log 2>&1; code=$?; echo "contract exit code: $code"; tail -n 120 /tmp/nc-contract.log; exit $code
```

Expected: FAIL because the dedicated data and component do not exist yet.

- [ ] **Step 3: Implement the typed data module**

Export typed records for `painPoints`, `solutions`, `applicationPhotos`, `materials`, `processSteps`, `controlPoints`, `advantages`, `comparisonRows`, `workflowEquipment`, `selectionQuestions`, `toolingPoints`, `faqs`, and `internalLinks`. Use the exact approved English copy and map the eight applications to these real local photos:

```ts
export const applicationPhotos = [
  "/products/electric-folding-applications/general-sheet-metal-workshop.webp",
  "/products/electric-folding-applications/electrical-cabinet-enclosure.webp",
  "/products/electric-folding-applications/stainless-steel-fabrication.webp",
  "/products/electric-folding-applications/ventilation-duct-fabrication.webp",
  "/products/electric-folding-applications/architectural-sheet-metal.webp",
  "/products/pneumatic-folding-applications/construction-sheet-metal-work.webp",
  "/products/manual-folding-applications/repair-maintenance-workshop.webp",
  "/products/electric-folding-applications/hvac-duct-panel-folding.webp",
] as const;
```

Do not create a parameter data copy in this file.

- [ ] **Step 4: Run the test to confirm only routing/component assertions remain**

Run the contract command again. Expected: FAIL on the missing dedicated route/component while all data-content assertions pass.

- [ ] **Step 5: Commit the contract and data model**

Run:

```bash
git add scripts/verify-nc-hydraulic-press-brake-page.mjs data/nc-hydraulic-press-brake-page.ts package.json
git commit -m "test: define nc press brake page contract"
```

Expected: the commit contains only the contract, package script, and typed content.

### Task 3: Implement the dedicated page, header formatting, and SEO

**Files:**
- Create: `components/NcHydraulicPressBrakeSolutionPage.tsx`
- Modify: `app/products/[id]/page.tsx`

**Interfaces:**
- Consumes: `Product`, `ncHydraulicPressBrakePage`, existing `product.technicalParameters`, `/contact`, and internal product URLs.
- Produces: `NcHydraulicPressBrakeSolutionPage({ product }: { product: Product })` and route-specific metadata.

- [ ] **Step 1: Add the dedicated route import and selection**

Import the component and return it only when:

```tsx
if (product.id === "nc-hydraulic-press-brake") {
  return <NcHydraulicPressBrakeSolutionPage product={product} />;
}
```

- [ ] **Step 2: Add exact route-specific metadata**

Return the approved title, description, ten SEO keywords, canonical URL, Open Graph image/alt, and Twitter summary-large-image values before the generic metadata fallback.

- [ ] **Step 3: Implement the header parser**

Inside the dedicated component, implement:

```ts
const splitSpecificationHeading = (column: string) => {
  const normalized = column
    .replace("DimensionsL", "Dimensions L")
    .replace(/\bx\b/g, "×")
    .replace(/\s+/g, " ")
    .trim();
  const match = normalized.match(/^(.*?)(\([^()]+\))$/);
  return match
    ? { label: match[1].trim(), unit: match[2] }
    : { label: normalized, unit: "" };
};
```

Render `heading.label` in a `whitespace-nowrap` block and `heading.unit` in a centered block below it.

- [ ] **Step 4: Build semantic section components**

Compose small local components for section headings, real-photo application cards, horizontal process steps, comparison/specification tables, selection lists, and CTA buttons. Render all fifteen approved sections in order. Use one H1, semantic H2/H3 nesting, `details/summary` FAQ items, `aria-hidden` decorative icons, descriptive image alt text, and `loading="lazy"` behavior through non-priority Next.js images.

- [ ] **Step 5: Add structured data**

Render escaped JSON-LD scripts for `Product`, `FAQPage`, and `BreadcrumbList`. Product schema contains brand/manufacturer/category/image/additionalProperty but no `offers`, price, or rating.

- [ ] **Step 6: Apply the accepted responsive design system**

Implement `#0B0D10` and titanium-gray section bands, `#76B900` accent, thin borders, low-radius cards, restrained shadows/hover movement, desktop hero split, mobile stacked hero, full-width mobile CTA buttons, one-column mobile card grids, and local horizontal scrolling for both tables.

- [ ] **Step 7: Run the page contract and TypeScript-aware lint**

Run:

```bash
npm run verify:nc-press-brake > /tmp/nc-contract.log 2>&1; contract=$?; npm run lint > /tmp/nc-lint.log 2>&1; lint=$?; echo "contract exit code: $contract"; echo "lint exit code: $lint"; tail -n 120 /tmp/nc-contract.log; tail -n 120 /tmp/nc-lint.log; test $contract -eq 0 -a $lint -eq 0
```

Expected: both exit codes are 0.

- [ ] **Step 8: Commit the implementation**

Run:

```bash
git add components/NcHydraulicPressBrakeSolutionPage.tsx app/products/'[id]'/page.tsx
git commit -m "feat: build nc press brake solution page"
```

Expected: the dedicated page and route/SEO changes are committed without staging unrelated files.

### Task 4: Browser verification and visual fidelity repair

**Files:**
- Modify when needed: `components/NcHydraulicPressBrakeSolutionPage.tsx`
- Modify when needed: `data/nc-hydraulic-press-brake-page.ts`
- Create temporarily, then remove: browser screenshots under `.codex/qa/`

**Interfaces:**
- Consumes: local Next.js page plus the three visual references.
- Produces: verified desktop/mobile render with no material mismatch or interaction defect.

- [ ] **Step 1: Start the local server and open the product route**

Run `npm run dev` in a persistent session and open `http://localhost:3000/products/nc-hydraulic-press-brake` with Browser/IAB.

- [ ] **Step 2: Verify the desktop surface**

At a 1440px-wide viewport, inspect the hero, all section transitions, all eight real photos, both scrolling tables, FAQ toggles, internal links, and CTA destinations. Capture hero, applications, technical table, and final CTA screenshots.

- [ ] **Step 3: Verify the mobile surface**

At a 390px-wide viewport, verify stacked hero, full-width CTAs, single-column cards, readable photography crops, local table scrolling, FAQ keyboard/click behavior, and absence of document-level horizontal overflow. Capture hero, applications, table, and FAQ screenshots.

- [ ] **Step 4: Compare accepted concepts and implementation**

Use `view_image` on every accepted concept and the corresponding latest browser screenshots. Record at least these comparison points in a scratch fidelity ledger: copy, first-viewport balance, typography, palette, product-image treatment, real-photo crops, section rhythm, table headers, mobile collapse, and CTA styling.

- [ ] **Step 5: Repair all material mismatches and repeat QA**

Fix clipping, wrapping, spacing, contrast, image framing, table readability, broken links, or non-working details interactions. Repeat screenshots and `view_image` comparison until no agency-signoff issue remains.

- [ ] **Step 6: Remove temporary QA artifacts and commit visual fixes**

Remove `.codex/qa/` screenshots after comparison, then run:

```bash
git add components/NcHydraulicPressBrakeSolutionPage.tsx data/nc-hydraulic-press-brake-page.ts
git diff --cached --quiet || git commit -m "fix: polish nc press brake responsive layout"
```

Expected: a fix commit only if source files changed; no temporary QA screenshots remain.

### Task 5: Final verification and production deployment

**Files:**
- No source files expected unless a verification failure exposes a task-scoped defect.

**Interfaces:**
- Consumes: the completed page and current production hosting configuration.
- Produces: passing checks and a live production URL.

- [ ] **Step 1: Run final contract, lint, and production build**

Run:

```bash
npm run verify:nc-press-brake > /tmp/nc-final-contract.log 2>&1; contract=$?; npm run lint > /tmp/nc-final-lint.log 2>&1; lint=$?; npm run build > /tmp/nc-final-build.log 2>&1; build=$?; echo "contract exit code: $contract"; echo "lint exit code: $lint"; echo "build exit code: $build"; tail -n 120 /tmp/nc-final-contract.log; tail -n 120 /tmp/nc-final-lint.log; tail -n 120 /tmp/nc-final-build.log; test $contract -eq 0 -a $lint -eq 0 -a $build -eq 0
```

Expected: all three exit codes are 0.

- [ ] **Step 2: Confirm deployment target and current identity without mutation**

Inspect `vercel.json`, `.vercel/project.json` when present, and `vercel whoami`. Confirm the target belongs to the current workspace before deploying.

- [ ] **Step 3: Deploy to production**

Run:

```bash
npx vercel --prod --yes > /tmp/nc-vercel-deploy.log 2>&1; code=$?; echo "deploy exit code: $code"; tail -n 120 /tmp/nc-vercel-deploy.log; exit $code
```

Expected: exit code 0 and a production deployment URL.

- [ ] **Step 4: Smoke-test the live page**

Open the production `/products/nc-hydraulic-press-brake` route with Browser/IAB. Confirm 200 status, correct H1/meta copy, eight application photos, original parameter rows, table header formatting, FAQ interaction, and CTA links.

- [ ] **Step 5: Report the deployment**

Provide modified files, added modules, SEO work, desktop/mobile verification, contract/lint/build status, visual concept paths, production URL, and any intentional visual differences. Do not claim success without the command outputs and live smoke test.
