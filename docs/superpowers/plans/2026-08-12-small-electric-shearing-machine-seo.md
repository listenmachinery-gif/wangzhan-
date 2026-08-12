# Small Electric Shearing Machine SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Optimize the existing compact electric shear page for “Small Electric Shearing Machine” and related Q11G buyer intent without changing the canonical URL, visual system, or verified technical data.

**Architecture:** Extend the shared server component through optional typed content fields, then enable those fields only in the small-electric content module. Keep all specifications sourced from the shared Product record and protect the adjacent energy-saving page with regression and metadata-differentiation checks.

**Tech Stack:** Next.js 15 App Router, React 19 server components, TypeScript, Tailwind CSS, Node assertion contracts, Vercel.

## Global Constraints

- Canonical route remains `/products/compact-electric-shearing-machine`.
- H1 is exactly `Small Electric Shearing Machine`.
- Keep all eight Q11G technical rows unchanged in `data/shearing-details.ts`.
- Do not add meta keywords, fake capacity, price, offers, availability, ratings, reviews, certifications, awards, or unsupported customization.
- Preserve the existing solution-page visual language and responsive behavior.
- Core SEO content must be available in initial server-rendered HTML.
- Keep compact/small-batch intent separate from the adjacent energy-saving page’s energy-use and operating-cost intent.

---

### Task 1: Define the SEO contract

**Files:**
- Modify: `scripts/verify-small-electric-shear-page.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: route metadata, shared component, content module, product data, energy-saving content, redirects, sitemap, and robots.
- Produces: `npm run verify:small-electric-shear-seo` covering metadata, H1, keywords, all eight Q11G rows, modules, nine FAQs, links, image ALT, schema, cannibalization, and forbidden fields.

- [ ] Write source assertions for the exact approved metadata, canonical, one H1, natural keyword coverage, verified model ownership, optional module rendering, descriptive links, four schema types, no meta keywords, and no false commercial data.
- [ ] Run the contract and verify it fails because the old title/H1 and missing modules do not meet the specification.
- [ ] Preserve the expected failing output as RED evidence.

### Task 2: Extend the shared content interface and renderer

**Files:**
- Modify: `data/shearing-solution-types.ts`
- Modify: `components/ShearingSolutionPage.tsx`

**Interfaces:**
- Consumes: existing `ShearingSolutionContent`, `Product`, and company identity data.
- Produces: optional `heroSubtitle`, `overview`, `modelGuide`, `manufacturer`, `energyComparison`, `relatedLinks`, and `structureImageAlt` fields plus server-rendered sections and Organization/Product variants schema.

- [ ] Add optional types without changing requirements for existing pages.
- [ ] Render the hero subtitle and unique structure ALT.
- [ ] Render overview, model guide, manufacturer, energy comparison, and related links only when supplied.
- [ ] Add Organization JSON-LD, link Product manufacturer, and map each verified parameter row to a ProductModel variant without offers.
- [ ] Add stable data-section attributes needed for rendered QA and preserve local table scrolling.

### Task 3: Implement Small Electric Shear metadata and copy

**Files:**
- Modify: `app/products/[id]/page.tsx`
- Modify: `data/small-electric-shear-page.ts`

**Interfaces:**
- Consumes: the approved metadata/content design and the new optional shared fields.
- Produces: exact metadata and professional buyer content for the compact Q11G page.

- [ ] Set the exact title and description, remove the metadata keyword array, and update Open Graph ALT.
- [ ] Set exact H1 and a separate compact-electric subtitle.
- [ ] Add natural secondary, commercial, and long-tail coverage without a keyword list.
- [ ] Add six cautious material explanations, seven applications, Q11G model guidance, manufacturer content, nine exact FAQs, and six descriptive internal links.
- [ ] Add the compact-vs-energy-saving comparison while keeping energy terms subordinate.
- [ ] Remove unsupported cutting-length customization language and publish an honest quotation explanation.
- [ ] Run the SEO contract until it passes.

### Task 4: Regression and rendered verification

**Files:**
- No production changes expected.

**Interfaces:**
- Consumes: the completed implementation.
- Produces: build, regression, HTTP, HTML, desktop, mobile, image, interaction, and console evidence.

- [ ] Run `npm run lint`, the Small Electric SEO contract, the Energy-Saving contract, the Foot Shear contract, and `npm run build`.
- [ ] Start the production server and verify the canonical route, legacy redirect, six related routes, robots, sitemap, one H1, metadata, eight Q11G rows, nine FAQs, and four JSON-LD types in initial HTML.
- [ ] Inspect default desktop and 390 × 844 mobile layouts, expand one FAQ, confirm hero/structure images, confirm local table overflow, and verify no console errors or page-level horizontal overflow.
- [ ] Run `git diff --check` and confirm a clean committed worktree.

### Task 5: Publish and verify production

**Files:**
- No source changes expected unless production validation finds a defect.

**Interfaces:**
- Consumes: the verified commit.
- Produces: the live optimized canonical page.

- [ ] Commit the design and implementation intentionally.
- [ ] Fast-forward the verified commit to `origin/main` and wait for Vercel success.
- [ ] Repeat the HTTP, legacy redirect, related-link, sitemap, robots, and initial-HTML checks against `https://www.zyroncnc.com/products/compact-electric-shearing-machine`.
- [ ] Fast-forward the primary checkout and remove the owned worktree and feature branch.
