# Small Electric Shearing Machine Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Small Electric Shearing Machine first viewport with the supplied full-width product artwork, left-side English sales copy, and two working CTA buttons.

**Architecture:** Add an optional full-bleed hero variant to the existing shared shearing solution component and enable it only from the Small Electric content module. Preserve the current default hero branch for every other product and keep the rest of the Small Electric page unchanged.

**Tech Stack:** Next.js 15 App Router, React 19 server components, TypeScript, Tailwind CSS, `next/image`, Node source-contract tests.

**Spec:** `docs/superpowers/specs/2026-11-12-small-electric-shear-hero-design.md`

## Global Constraints

- Use the supplied 1672×941 artwork without regenerating or visually altering the product.
- Exact approved hero copy and CTA labels come from the design spec.
- Both CTA buttons link to `/contact`.
- No client component, dependency, metadata, schema, technical-data, or downstream-section changes.
- The new hero variant must affect only `compact-electric-shearing-machine`.

## Review Focus

- A missing hero asset must fail the source contract and build review rather than silently falling back.
- Existing shearing pages without hero-background fields must retain the old two-column branch.
- At 390 px width, copy and buttons must stay within the viewport and the artwork must remain meaningful.
- At desktop width, the left copy must not cover the machine and the operator must remain visible.
- Both CTA controls must remain keyboard-accessible links to `/contact`.

---

### Task 1: Add the scoped hero contract and artwork

**Files:**
- Create: `public/products/shearing/small-electric-shearing-machine-hero.png`
- Modify: `scripts/verify-small-electric-shear-page.mjs`
- Modify: `data/shearing-solution-types.ts`
- Modify: `data/small-electric-shear-page.ts`
- Modify: `components/ShearingSolutionPage.tsx`

**Interfaces:**
- Consumes: existing `ShearingSolutionContent` and `smallElectricShearPageContent`.
- Produces: optional `heroBackgroundImage`, `heroBackgroundAlt`, `heroIntro`, and `heroValuePoints` fields; a full-bleed hero branch selected by `heroBackgroundImage`.

- [ ] **Step 1: Write the failing source-contract assertions**

Add assertions for the exact asset path, approved copy, optional hero fields, conditional full-bleed branch, optimized `Image` with `priority`, two `/contact` links, and preservation of the existing default hero branch.

- [ ] **Step 2: Run the contract and verify RED**

Run: `node scripts/verify-small-electric-shear-page.mjs`

Expected: FAIL because `small-electric-shearing-machine-hero.png` and the optional hero-background contract are missing.

- [ ] **Step 3: Copy the supplied hero artwork**

Copy `/Users/zhangmingwei/Desktop/电动剪板机/7aa94a5a-7545-4089-923f-c41a1f052881.png` to `public/products/shearing/small-electric-shearing-machine-hero.png` without recompression.

- [ ] **Step 4: Implement the optional hero content fields**

Add optional string fields `heroBackgroundImage`, `heroBackgroundAlt`, and `heroIntro`, plus optional `readonly string[]` field `heroValuePoints`. Populate them in `smallElectricShearPageContent` using the exact design-spec values.

- [ ] **Step 5: Implement the scoped full-bleed hero branch**

When `content.heroBackgroundImage` is present, render the full-width responsive background artwork, localized readability gradient, H1, support copy, two proof points, and both CTA links. Otherwise render the existing hero markup unchanged.

- [ ] **Step 6: Run source and regression contracts**

Run:

```bash
node scripts/verify-small-electric-shear-page.mjs
npm run verify:small-electric-shear-media
npm run verify:energy-saving-shear-seo
npm run verify:hydraulic-swing-beam-seo
```

Expected: all contracts PASS.

### Task 2: Verify responsive rendering and production readiness

**Files:**
- Modify only Task 1 files if visual QA exposes a mismatch.

**Interfaces:**
- Consumes: the completed hero branch and asset.
- Produces: verified desktop/mobile UI ready for deployment.

- [ ] **Step 1: Run static verification**

Run:

```bash
npm run lint
npm run build
git diff --check
```

Expected: zero lint errors, successful static generation, and no whitespace errors.

- [ ] **Step 2: Run browser QA at desktop and mobile widths**

Verify `/products/compact-electric-shearing-machine` at the supplied artwork's native desktop width where practical and at 390×844. Check page identity, meaningful content, image load, copy fidelity, CTA visibility, `/contact` navigation, console health, framework overlay, and horizontal overflow.

- [ ] **Step 3: Compare visual evidence**

Use `view_image` on the supplied artwork and the latest desktop/mobile screenshots. Record at least five checks: crop, copy placement, machine visibility, operator visibility, typography/buttons, and responsive behavior. Fix every material mismatch.

- [ ] **Step 4: Commit and deploy**

Stage only the hero asset, spec, plan, source-contract, type, content, and shared component changes. Commit, push `main`, and verify the production URL returns the new hero asset and approved copy.
