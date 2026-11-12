# Small Electric Shearing Machine Detail Overlays Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the eight detail-gallery images with clean supplied files and add code-native English names, benefits, and restrained image-only hover zoom.

**Architecture:** Extend the existing typed detail item with `title` and `text`, keep all content in the Small Electric page data module, and render a stationary lower-left caption over a neutral bottom gradient in the shared server component. Use CSS-only group hover and reduced-motion variants, with no client state or new dependency.

**Tech Stack:** Next.js 15, React 19 server components, TypeScript, Tailwind CSS, `next/image`, Node media-contract tests, Playwright browser QA.

**Spec:** `docs/superpowers/specs/2026-11-12-small-electric-detail-overlays-design.md`

## Global Constraints

- Use all eight supplied 1672×941 clean PNG files without recompression.
- Keep exact English titles and benefits from the spec and the user-requested order.
- Place caption content at the lower left over a neutral bottom gradient.
- Hover zoom affects only the image at scale `1.035`; caption remains stationary and reduced motion disables movement.
- Preserve the existing 2×4 desktop and 1×8 mobile gallery, page section order, server rendering, and other page content.

## Review Focus

- Wrong item order, missing title/benefit, or duplicate file must fail the media contract.
- Long title or benefit lines must remain readable without clipping at desktop and mobile widths.
- Hover must scale only the image, not the caption, and must not expose outside the figure.
- Mobile must not require hover to reveal content or create horizontal overflow.
- Other shearing pages must remain unchanged when their optional gallery data is absent.

---

### Task 1: Detail content contract and interactive presentation

**Files:**
- Modify: `scripts/verify-small-electric-shear-media.mjs`
- Modify: `data/shearing-solution-types.ts`
- Modify: `data/small-electric-shear-page.ts`
- Modify: `components/ShearingSolutionPage.tsx`
- Replace: `public/products/shearing/small-electric/details/*.png`
- Create: `docs/superpowers/specs/2026-11-12-small-electric-detail-overlays-design.md`
- Create: `docs/superpowers/plans/2026-11-12-small-electric-detail-overlays.md`

**Interfaces:**
- Consumes: existing optional `detailGallery` and the eight supplied desktop PNGs.
- Produces: eight ordered `{ image, alt, title, text }` items and visible lower-left captions with image-only hover zoom.

- [ ] **Step 1: Write the failing contract**

Replace the path-only expectations with eight literal records containing each exact `image`, `title`, and `text`; assert exact order and non-empty descriptive alts.

- [ ] **Step 2: Verify RED**

Run: `npm run verify:small-electric-shear-media`

Expected: FAIL because existing records lack `title` and `text` and have Ball Transfer / Polyurethane in the previous order.

- [ ] **Step 3: Replace assets and implement the typed data**

Copy the eight supplied files byte-for-byte to cache-busting public filenames ending in `-clean.png`. Add `title: string` and `text: string` to `ShearingDetailImage`; update and reorder the eight Small Electric records exactly as specified.

- [ ] **Step 4: Render captions and motion**

Make each figure a positioned overflow-hidden group. Use `object-cover`, a 500 ms ease-out `group-hover:scale-[1.035]` transform, and reduced-motion reset. Add a stationary neutral bottom gradient and visible lower-left `figcaption` containing the item title and benefit.

- [ ] **Step 5: Verify GREEN and regressions**

Run the Small Electric media/SEO contracts, related shear contracts, ESLint, production build, and `git diff --check`; all must exit 0.

- [ ] **Step 6: Run responsive rendered QA**

At 1672×941 and 390×844, verify page identity, section order, eight loaded images, eight visible title/benefit pairs, expected column count, no overflow/framework overlay/console errors, and CTA navigation. On desktop, hover the first figure and verify its image transform changes while its caption position remains unchanged. Capture gallery screenshots and compare them with the supplied source images using `view_image`.

- [ ] **Step 7: Commit the verified branch**

Stage only this task's source, assets, test, spec, and plan. Commit as `Add detail captions and hover zoom`.
