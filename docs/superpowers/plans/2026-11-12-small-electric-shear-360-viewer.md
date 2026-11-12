# Small Electric Shear 360° Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an accessible eight-frame 360° product-spin viewer above the Small Electric Shearing Machine detail gallery.

**Architecture:** Four supplied photographs and four reviewed AI-generated midpoint views form an ordered local image sequence. A focused client component owns interaction while pure helpers own frame math; the existing server page receives the sequence through optional typed content.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, `next/image`, Node assertion scripts, Playwright fallback for browser QA.

**Spec:** `docs/superpowers/specs/2026-11-12-small-electric-shear-360-viewer-design.md`

## Global Constraints

- No Three.js, WebGL, or new runtime dependency.
- Preserve the existing detail-gallery order, copy, and visual treatment.
- Use eight distinct local 1672:941 product frames in clockwise order.
- Desktop follows cursor position; touch drags; Left/Right Arrow wraps.
- Generated frames must be visually reviewed and rejected if mechanically misleading.

## Review Focus

- Pointer at or beyond either horizontal edge clamps to the first or last frame.
- Zero-width or empty-frame inputs return a safe first-frame result.
- Keyboard stepping wraps from first to last and last to first.
- Touch dragging does not prevent ordinary vertical page scrolling.
- All eight images remain contained and visible without mobile overflow or product cropping.

---

### Task 1: Product-spin behavior contract

**Files:**
- Create: `components/product-spin-utils.ts`
- Modify: `scripts/verify-small-electric-shear-media.mjs`

**Interfaces:**
- Produces: `getFrameIndexFromPointer(offsetX: number, width: number, frameCount: number): number`
- Produces: `getSteppedFrameIndex(current: number, delta: number, frameCount: number): number`

- [ ] **Step 1: Write failing assertions for pointer mapping, edge clamping, zero-width/empty inputs, and wrapped keyboard stepping.**
- [ ] **Step 2: Run `npm run verify:small-electric-shear-media` and confirm it fails because the helper module is missing.**
- [ ] **Step 3: Implement the two pure helper functions with finite-number guards, clamping, and modulo wrapping.**
- [ ] **Step 4: Re-run `npm run verify:small-electric-shear-media` and confirm the helper assertions pass.**
- [ ] **Step 5: Commit the helper and behavior contract.**

### Task 2: Reviewed product-spin assets and typed content

**Files:**
- Create: `public/products/shearing/small-electric/spin/frame-01-front-right.webp`
- Create: `public/products/shearing/small-electric/spin/frame-02-right-side.webp`
- Create: `public/products/shearing/small-electric/spin/frame-03-rear-right.webp`
- Create: `public/products/shearing/small-electric/spin/frame-04-rear-center.webp`
- Create: `public/products/shearing/small-electric/spin/frame-05-rear-left.webp`
- Create: `public/products/shearing/small-electric/spin/frame-06-left-side.webp`
- Create: `public/products/shearing/small-electric/spin/frame-07-front-left.webp`
- Create: `public/products/shearing/small-electric/spin/frame-08-front-center.webp`
- Modify: `data/shearing-solution-types.ts`
- Modify: `data/small-electric-shear-page.ts`
- Modify: `scripts/verify-small-electric-shear-media.mjs`

**Interfaces:**
- Produces: optional `productSpin` with `eyebrow`, `instruction`, `accessibleLabel`, and ordered `frames`.

- [ ] **Step 1: Add failing contract assertions for exact copy, eight ordered distinct local WebP paths, descriptive alt text, and existing files.**
- [ ] **Step 2: Run the media verification and confirm it fails because `productSpin` is absent.**
- [ ] **Step 3: Copy and convert the four supplied source views, generate the four midpoint angles, inspect all eight, and save approved WebP files.**
- [ ] **Step 4: Add the typed content configuration using the approved clockwise sequence.**
- [ ] **Step 5: Re-run media verification and confirm the asset/content contract passes.**
- [ ] **Step 6: Commit reviewed assets and typed content.**

### Task 3: Interactive viewer and page integration

**Files:**
- Create: `components/ProductSpinViewer.tsx`
- Modify: `components/ShearingSolutionPage.tsx`
- Modify: `scripts/verify-small-electric-shear-media.mjs`

**Interfaces:**
- Consumes: `productSpin` typed content and Task 1 frame helpers.
- Produces: `ProductSpinViewer({ frames, eyebrow, instruction, accessibleLabel })` client component.

- [ ] **Step 1: Add failing source contract assertions for viewer placement before the detail grid, pointer handling, keyboard handling, focusability, and all-frame rendering.**
- [ ] **Step 2: Run media verification and confirm it fails because the component/integration is missing.**
- [ ] **Step 3: Implement stacked responsive images, cursor-follow behavior, touch drag capture, Arrow key wrapping, focus styling, and reduced-motion-safe transitions.**
- [ ] **Step 4: Render the component above the existing 2 × 4 detail grid only when `productSpin` exists.**
- [ ] **Step 5: Re-run media verification and the full relevant SEO contract.**
- [ ] **Step 6: Commit the interactive viewer integration.**

### Task 4: Production and visual verification

**Files:**
- Create temporarily, then remove: browser QA screenshots and logs.

**Interfaces:**
- Consumes: completed viewer and approved sequence.
- Produces: verified desktop/mobile behavior with no retained QA artifacts.

- [ ] **Step 1: Run `npm run lint`, both small-electric verification scripts, and `npm run build`; require zero errors.**
- [ ] **Step 2: Start the production server and use Playwright because the Browser/IAB tool is unavailable in this environment.**
- [ ] **Step 3: Verify desktop cursor movement, keyboard wrapping, stage placement, image loading, and detail-grid preservation.**
- [ ] **Step 4: Verify a mobile viewport for containment, drag behavior, vertical scrolling, focus/copy readability, and no overflow.**
- [ ] **Step 5: Capture the rendered viewer and inspect the latest screenshot and approved source views with `view_image`; record a five-point fidelity ledger.**
- [ ] **Step 6: Remove temporary QA artifacts, confirm a clean branch, and commit any final fixes.**

