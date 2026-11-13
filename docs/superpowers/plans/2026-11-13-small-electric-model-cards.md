# Small Electric Shear Model Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add seven supplied Q11G image-and-specification cards directly below the existing technical table.

**Architecture:** Extend `ShearingSolutionContent` with optional typed model-card data and render it server-side inside the shared technical section. Only the small-electric-shear page supplies the data, so other product pages remain unchanged.

**Tech Stack:** Next.js 15, React, TypeScript, Tailwind CSS, `next/image`, Sharp.

**Spec:** `docs/superpowers/specs/2026-11-13-small-electric-model-cards-design.md`

## Global Constraints

- Use the seven supplied source images and exact published values.
- Do not add a new standalone module or heading.
- Desktop is image-left/specifications-right; mobile stacks without overflow.
- Images must be local WebP assets with descriptive alt text.

## Review Focus

- Model/image mismatch: every card must retain the requested order and unique matching asset.
- Numeric transcription: thickness, width, angle, frequency, travel, power, and dimensions must match the supplied values.
- Placement: cards must remain inside `data-section="technical"` after the table and before the industry gallery.
- Responsiveness: seven cards must stack cleanly at 390 px without page-level horizontal overflow.
- Shared-page safety: products without `modelCards` must not render empty card markup.

---

### Task 1: Model-card data contract and assets

**Files:**
- Modify: `data/shearing-solution-types.ts`
- Modify: `data/small-electric-shear-page.ts`
- Modify: `scripts/verify-small-electric-shear-media.mjs`
- Create: `public/products/shearing/small-electric/models/*.webp`

**Interfaces:**
- Produces: `ShearingModelCard`, `ShearingModelSpecification`, and `ShearingSolutionContent.modelCards`.

- [ ] Write a failing contract test for seven ordered cards, exact values, unique local WebP images, and existing assets.
- [ ] Run `npm run verify:small-electric-shear-media` and confirm it fails because `modelCards` is absent.
- [ ] Convert the seven source images to WebP and add the typed data.
- [ ] Run the contract test and confirm it passes.

### Task 2: Technical-section card layout

**Files:**
- Modify: `components/ShearingSolutionPage.tsx`
- Test: `scripts/verify-small-electric-shear-media.mjs`

**Interfaces:**
- Consumes: `content.modelCards` from Task 1.

- [ ] Extend the failing test to require card markup inside the technical section, a responsive split grid, definition-list semantics, and `next/image` sizing.
- [ ] Render the cards after the existing table with no new section heading.
- [ ] Run media and SEO contract tests, then `npm run build`.
- [ ] Verify desktop and 390 px layouts in the browser, including DOM placement and console logs.
- [ ] Commit, merge to `main`, push, and verify the production deployment.
