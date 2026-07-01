# Foot Shear Solution Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic Foot Shear detail page with a dedicated, solution-oriented English product page while preserving the original Q11 technical parameters and leaving every other product detail page unchanged.

**Architecture:** Keep the existing dynamic `/products/[id]` route and render a dedicated server component only when `product.id === "foot-shear"`. Store page-specific editorial content in one typed data module, reuse the existing `Product` object for the product image and technical table, and generate Product, BreadcrumbList, and FAQPage structured data in the dedicated page component.

**Tech Stack:** Next.js 15 App Router, React 19 server components, TypeScript, Tailwind CSS, `next/image`, Lucide React.

---

## Task 1: Add a source-level acceptance test

**Files:**
- Create: `scripts/verify-foot-shear-page.mjs`

- [ ] Add assertions that the dedicated data module and component exist.
- [ ] Assert that the dynamic route imports and renders `FootShearSolutionPage` only for `foot-shear`.
- [ ] Assert the exact SEO title, hero H1, required section headings, six FAQs, and three schema types are present.
- [ ] Assert the dedicated component reads `product.technicalParameters` instead of duplicating Q11 values.
- [ ] Run `node scripts/verify-foot-shear-page.mjs` and confirm it fails before production code is added.

## Task 2: Centralize Foot Shear editorial content

**Files:**
- Create: `data/foot-shear-page.ts`

- [ ] Define typed arrays for hero benefits, pain points, solution fit, process steps, applications, advantages, structure labels, comparison rows, support items, and FAQs.
- [ ] Keep all customer-facing copy in English and preserve the supplied wording where specified.
- [ ] Do not duplicate technical parameter values; retain `data/shearing-details.ts` as the single source of truth.

## Task 3: Build the dedicated solution page

**Files:**
- Create: `components/FootShearSolutionPage.tsx`

- [ ] Build a dark industrial hero with one complete product image, three compact value points, parameter summary, and two inquiry CTAs.
- [ ] Add sections for pain points, solution positioning, five-step process, applications, advantages, structure overview, original technical specifications, product comparison, support, FAQs, and final CTA.
- [ ] Use semantic headings with exactly one H1 and responsive layouts that do not create page-level horizontal overflow.
- [ ] Render the existing technical parameter table through `product.technicalParameters` and keep wide tables inside a mobile scroll container.
- [ ] Add Product, BreadcrumbList, and FAQPage JSON-LD without unsupported pricing or availability claims.
- [ ] Use the existing product image with alt text `Foot operated shearing machine for sheet metal cutting` and avoid fabricated detail imagery.

## Task 4: Route and metadata integration

**Files:**
- Modify: `app/products/[id]/page.tsx`

- [ ] Add the dedicated SEO title and description for `foot-shear` while retaining generic metadata for all other products.
- [ ] Render `FootShearSolutionPage` after product lookup and before the generic template.
- [ ] Preserve the existing canonical URL and legacy redirect behavior.
- [ ] Run `node scripts/verify-foot-shear-page.mjs` and confirm it passes.

## Task 5: Static verification

- [ ] Run `npx tsc --noEmit`.
- [ ] Run `npm run build`.
- [ ] Confirm the build includes `/products/foot-shear` and does not report route or hydration errors.

## Task 6: Browser and responsive verification

- [ ] Start the production server on an available local port.
- [ ] Verify desktop and mobile screenshots for image completeness, readable text, stable layout, and non-overlapping controls.
- [ ] Verify exactly one H1, six FAQs, the original five Q11 table rows, and all three structured-data types.
- [ ] Verify the document has no horizontal overflow on desktop or mobile; only the specifications table may scroll internally.
- [ ] Verify `/products/foot-operated-shearing-machine` redirects to `/products/foot-shear`.
- [ ] Verify a non-Foot-Shear product still renders the generic product template.
- [ ] Check browser console and failed network requests.

## Task 7: Review and release

- [ ] Review the diff for accidental changes outside the dedicated page, route integration, data, test, and documentation.
- [ ] Commit the verified change with a focused message.
- [ ] Push the current branch and confirm the deployed page shows the new H1 and sections.
