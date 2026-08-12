# Reel Shear Beading Machine SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strengthen the existing Reel Shear Beading Machine product page for relevant English Google searches and buyer evaluation without changing its URL, visual system, or verified LQ-15 data.

**Architecture:** Keep the dedicated server-rendered Next.js product component and content data module. Extend the source contract first, then update metadata, content, page modules, JSON-LD, and internal links while reading technical values from the shared product record.

**Tech Stack:** Next.js 15 App Router, React 19 server components, TypeScript, Tailwind CSS, Node assertion contracts, Vercel.

## Global Constraints

- Canonical route remains `/products/reel-shear-beading-machine`.
- H1 remains exactly `Reel Shear Beading Machine`.
- Technical values remain LQ-15, 0.5–1.2 mm, beading/slitting profiles, 1.5 kW, 260 kg, and 1600 × 630 × 1120 mm.
- Do not add meta keywords, fake price, offers, availability, reviews, ratings, certifications, awards, or unsupported performance data.
- Preserve the existing page visual language and responsive behavior.
- Core SEO content must be available in initial server-rendered HTML.

---

### Task 1: Define the Reel Shear SEO contract

**Files:**
- Modify: `scripts/verify-slitting-and-beading-machine-parameters.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: the product seed, dedicated content module, product component, dynamic route, redirect source, sitemap, and robots source.
- Produces: `npm run verify:reel-shear-seo`, a deterministic contract for metadata, content, data integrity, links, schema, and technical SEO.

- [ ] Replace the old partial assertions with checks for the exact title, description, canonical route, one H1, primary/secondary/commercial/long-tail coverage, verified LQ-15 ownership, ten FAQs, six links, unique image text, Product/BreadcrumbList/Organization/FAQPage schema, redirect retention, sitemap/robots participation, and forbidden commercial fields.
- [ ] Run `npm run verify:reel-shear-seo` and confirm it fails on the old metadata and missing content.
- [ ] Keep the failing output as the RED evidence for implementation.

### Task 2: Implement metadata and buyer-focused content

**Files:**
- Modify: `app/products/[id]/page.tsx`
- Modify: `data/reel-shear-beading-page.ts`

**Interfaces:**
- Consumes: the approved design strings and verified product data boundaries.
- Produces: exact route metadata and structured page content consumed by `ReelShearBeadingSolutionPage`.

- [ ] Set the exact title and description and remove the route’s metadata keyword array.
- [ ] Refine hero and overview copy to explain the confirmed combined operations and HVAC context naturally.
- [ ] Add typed operation, material-detail, manufacturer, application, selection, FAQ, related-link, and quote content without unsupported claims.
- [ ] Preserve the ten FAQ questions verbatim so visible content and FAQ JSON-LD share one source.

### Task 3: Render the expanded SEO content and schema

**Files:**
- Modify: `components/ReelShearBeadingSolutionPage.tsx`

**Interfaces:**
- Consumes: `reelShearBeadingPageContent`, `Product.technicalParameters`, and existing company identity data.
- Produces: a statically renderable product page with one H1, descriptive sections, tables, FAQ accordions, internal links, and four JSON-LD blocks.

- [ ] Add the overview, operations, and manufacturer sections in the existing section design language.
- [ ] Render material-specific explanations and the seven application cards.
- [ ] Use exact descriptive related-product anchors and retain only verified routes.
- [ ] Change the hero ALT, load the hero image with priority, and retain the explanatory diagram’s accessible label.
- [ ] Change the schema type to Product, add a linked Organization entity, map verified product properties, and omit forbidden commercial fields.
- [ ] Keep units on a separate centered line and localize horizontal scrolling to both tables.
- [ ] Run `npm run verify:reel-shear-seo` until GREEN.

### Task 4: Regression and rendered verification

**Files:**
- No production file changes expected.

**Interfaces:**
- Consumes: the completed page implementation.
- Produces: reproducible build, HTML, HTTP, responsive-layout, console, and interaction evidence.

- [ ] Run `npm run lint`, `npm run verify:foot-shear-seo`, the pre-existing Reel Shear parameter checks via the new contract, and `npm run build`.
- [ ] Start the production server and verify canonical and legacy URLs, six related routes, robots, sitemap, H1, metadata, initial HTML, and JSON-LD.
- [ ] Inspect desktop and 390 × 844 mobile layouts, confirm no document overflow, confirm local table overflow, open one FAQ, verify both graphics, and check the console.
- [ ] Run `git diff --check` and confirm the feature worktree is clean after commit.

### Task 5: Publish and verify production

**Files:**
- No source changes expected unless live validation exposes a deployment defect.

**Interfaces:**
- Consumes: the verified commit.
- Produces: the live canonical page and deployment evidence.

- [ ] Commit the implementation with an intentional Reel Shear SEO message.
- [ ] Fast-forward the verified commit to `origin/main` to trigger the existing Vercel deployment.
- [ ] Wait for the deployment status to succeed.
- [ ] Repeat the HTTP, redirect, sitemap, robots, internal-link, and initial-HTML contract against `https://www.zyroncnc.com/products/reel-shear-beading-machine`.
- [ ] Fast-forward the primary checkout to `origin/main` and remove the temporary worktree and feature branch.
