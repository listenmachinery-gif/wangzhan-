# Energy-Saving Electric Shearing Machine SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing Energy-Saving Electric Shearing Machine page the authoritative, technically careful canonical landing page for energy-efficient electric sheet-metal-shear search intent.

**Architecture:** Retain the dynamic Next.js product route and shared server-rendered `ShearingSolutionPage`. Put page-specific editorial content in its data module, rely on the existing product table for ProductModel schema, and protect the result with an executable SEO source contract plus rendered-page QA.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Node.js assertion scripts, in-app Browser QA, Vercel deployment.

## Global Constraints

- Preserve the established visual system, responsive layout, and shared component architecture.
- Use `Energy-Saving Electric Shearing Machine` as the only primary keyword and do not add a meta keywords tag.
- Keep all fourteen existing Q11G parameter rows unchanged.
- Mark the two model/width conflicts `NEEDS PRODUCT DATA VERIFICATION`; do not guess corrected widths.
- Do not invent energy-saving percentages, price, inventory, reviews, ratings, certifications, noise levels, or material-specific capacity.
- Keep Small Electric intent focused on compact workshops and Energy-Saving intent focused on reduced unnecessary power use and daily production.

---

### Task 1: SEO Contract and Metadata

**Files:**
- Modify: `scripts/verify-energy-saving-electric-shear-page.mjs`
- Modify: `package.json`
- Modify: `app/products/[id]/page.tsx`

**Interfaces:**
- Consumes: the Energy-Saving route ID and existing shared page wrapper.
- Produces: the exact title, description, canonical, Open Graph ALT, and an npm verification command.

- [ ] Replace the legacy source checks with assertions for the approved metadata, exact H1, no meta keywords, fourteen original table rows, and prohibited fake commercial/schema data.
- [ ] Run `node scripts/verify-energy-saving-electric-shear-page.mjs` and confirm it fails on the legacy title.
- [ ] Implement the route metadata and npm script.
- [ ] Rerun the contract and continue only when it passes.

### Task 2: Buyer-Focused Content and Model Integrity

**Files:**
- Modify: `data/energy-saving-electric-shear-page.ts`

**Interfaces:**
- Consumes: `ShearingSolutionContent` and the shared component’s optional overview, materials, model guide, comparisons, manufacturer, related-links, and FAQ fields.
- Produces: the server-rendered Energy-Saving page content without duplicating the Small Electric search intent.

- [ ] Add exact H1 plus distinct subtitle, overview, cost problems, five-stage mechanism, eight applications, six material categories, and explicit capacity caveat.
- [ ] Add model-selection guidance covering the fourteen real model names and a visible verification notice for the two conflicting widths.
- [ ] Add separate Small Electric and hydraulic comparisons, manufacturer/supplier guidance, thirteen exact FAQs, seven internal links, and quotation inputs.
- [ ] Rerun the SEO contract, Small Electric regression contract, and related shearing-page regressions.

### Task 3: Production Verification and Deployment

**Files:**
- Verify: all modified files and the generated static route.

**Interfaces:**
- Consumes: the completed branch tree.
- Produces: a deployed, crawlable production page and evidence-backed delivery report.

- [ ] Run `npm run lint`, `npm run build`, and `git diff --check`.
- [ ] Start the production server and validate HTTP 200, canonical, schemas, fourteen variants, thirteen FAQs, sitemap, robots, and all seven internal links.
- [ ] Inspect desktop and 390 px mobile layouts, FAQ expansion, table scrolling, image loading, and console errors in the in-app browser.
- [ ] Commit the validated source, update `main`, publish through the existing Vercel workflow, and rerun the production HTML and route checks.

