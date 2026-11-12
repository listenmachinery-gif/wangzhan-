# Small Electric Shearing Machine Detail Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the eight supplied machine-detail images after Product Overview in a responsive two-column/four-row gallery and deploy it to production.

**Architecture:** Extend the shared shearing content contract with one optional detail-gallery object and render it conditionally in the shared server component. Populate that object only for the Small Electric page and serve exact local PNG copies through `next/image`.

**Tech Stack:** Next.js 15 App Router, React 19 server components, TypeScript, Tailwind CSS, `next/image`, Node media-contract tests, Playwright browser QA.

**Spec:** `docs/superpowers/specs/2026-11-12-small-electric-detail-gallery-design.md`

## Global Constraints

- Use all eight supplied 1672×941 PNG files without recompression.
- Keep exact supplied order and image-embedded copy.
- Desktop/tablet at 768 px and wider uses two columns; mobile uses one column.
- Render immediately after Product Overview and before Problems.
- Scope the gallery to the Small Electric page; no client component or dependency changes.

## Review Focus

- A missing or duplicated asset must fail the media contract.
- Other shearing pages without gallery data must not render an empty section.
- Images must retain their complete 1672:941 framing instead of being cropped.
- The 390 px mobile viewport must remain one column without horizontal overflow.
- The 1440 px desktop viewport must render exactly two cards per row and four rows.

---

### Task 1: Add and render the scoped detail gallery

**Files:**
- Create: `public/products/shearing/small-electric/details/*.png` (eight files)
- Modify: `scripts/verify-small-electric-shear-media.mjs`
- Modify: `data/shearing-solution-types.ts`
- Modify: `data/small-electric-shear-page.ts`
- Modify: `components/ShearingSolutionPage.tsx`
- Create: `docs/superpowers/specs/2026-11-12-small-electric-detail-gallery-design.md`
- Create: `docs/superpowers/plans/2026-11-12-small-electric-detail-gallery.md`

**Interfaces:**
- Consumes: existing `ShearingSolutionContent`, `smallElectricShearPageContent`, and shared overview/problems section order.
- Produces: optional `detailGallery` with `eyebrow`, `title`, and eight `{ image, alt }` records; `data-section="details-gallery"` rendered between overview and problems.

- [ ] **Step 1: Write the failing media-contract assertions**

Extend `scripts/verify-small-electric-shear-media.mjs` with literal expected image paths and assertions for exact order, count eight, unique paths, descriptive alts, local PNG existence, and the approved headings.

- [ ] **Step 2: Run the media contract and verify RED**

Run: `npm run verify:small-electric-shear-media`

Expected: FAIL because `detailGallery` and its assets do not exist.

- [ ] **Step 3: Copy the eight supplied assets and implement the typed content contract**

Copy the files byte-for-byte into `public/products/shearing/small-electric/details/` using kebab-case names. Add `ShearingDetailImage`, `ShearingDetailGallery`, and optional `detailGallery?: ShearingDetailGallery`; populate the exact heading and ordered records in the Small Electric data module.

- [ ] **Step 4: Render the conditional gallery**

After Product Overview, render `data-section="details-gallery"` only when `content.detailGallery` exists. Use semantic `figure` elements, `next/image` with `fill`, `sizes="(min-width: 768px) 50vw, 100vw"`, `object-contain`, native aspect-ratio containers, and `sr-only` captions.

- [ ] **Step 5: Verify GREEN and regressions**

Run:

```bash
npm run verify:small-electric-shear-media
npm run verify:small-electric-shear-seo
npm run verify:energy-saving-shear-seo
npm run verify:hydraulic-swing-beam-seo
npm run verify:reel-shear-seo
npm run lint
npm run build
```

Expected: all commands exit 0; build generates the product route.

- [ ] **Step 6: Run responsive browser QA**

Verify the target route at 1440×1100 and 390×844. Assert overview → details-gallery → problems DOM order, eight loaded images, two desktop columns/four rows, one mobile column/eight rows, no horizontal overflow, no framework overlay, and no console or request failures. Capture full gallery screenshots and compare against the supplied images with `view_image`.

- [ ] **Step 7: Commit the scoped change**

Stage only the eight assets, type/content/component/test changes, spec, and plan. Commit as `Add small electric shear detail gallery`.

### Task 2: Integrate and deploy

**Files:**
- No source changes unless production verification exposes a defect.

**Interfaces:**
- Consumes: Task 1 commit and browser verification.
- Produces: remote `main`, successful Vercel deployment, and verified production page/assets.

- [ ] **Step 1: Review the complete branch and run fresh verification**

Review the branch diff against the spec, then rerun the media contract, lint, build, and browser QA.

- [ ] **Step 2: Merge into `main` and push**

Fast-forward local `main` to the verified feature commit, push `origin/main`, and confirm the remote SHA.

- [ ] **Step 3: Monitor and verify production**

Wait for Vercel success, then confirm the production route and all eight assets return HTTP 200 and repeat desktop/mobile browser QA against `https://www.zyroncnc.com`.
