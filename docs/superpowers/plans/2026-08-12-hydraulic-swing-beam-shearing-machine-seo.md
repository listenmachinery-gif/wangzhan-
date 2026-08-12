# Hydraulic Swing Beam Shearing Machine SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing Hydraulic Swing Beam Shearing Machine route a technically credible, purchase-oriented canonical page with complete source-model coverage and clear separation from the Hydraulic Guillotine page.

**Architecture:** Keep the dynamic Next.js product route and server-rendered shared `ShearingSolutionPage`. Store page-specific content in `data/hydraulic-swing-beam-shear-page.ts`, derive ProductModel schema from the untouched source table, and enforce the public SEO contract with executable checks and browser QA.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Node.js assertion scripts, in-app Browser QA, Vercel.

## Global Constraints

- Preserve the existing visual style, responsive behavior, route, and shared component architecture.
- Use `Hydraulic Swing Beam Shearing Machine` as the only primary keyword and do not add meta keywords.
- Preserve all 40 original technical rows without guessed model prefixes or parameter edits.
- Mark exact QC12Y/QC12K row naming and controller mapping `NEEDS PRODUCT DATA VERIFICATION`.
- Do not invent material-specific thickness, machine weight, tolerance, price, stock, ratings, reviews, certifications, or awards.
- Keep Swing Beam intent focused on arc motion and economical routine hydraulic cutting; keep Guillotine intent focused on guided blade movement and demanding plate work.

---

### Task 1: SEO Contract and Metadata

**Files:**
- Modify: `scripts/verify-hydraulic-swing-beam-shear-page.mjs`
- Modify: `package.json`
- Modify: `app/products/[id]/page.tsx`

**Interfaces:**
- Consumes: the existing product route, wrapper, shared component, and source table.
- Produces: exact metadata, canonical behavior, Open Graph ALT, and `verify:hydraulic-swing-beam-seo`.

- [ ] Replace the legacy checks with assertions for approved metadata, exact H1 contract, 40 source rows, 12 FAQs, model warning, seven links, schema and prohibited data.
- [ ] Run `npm run verify:hydraulic-swing-beam-seo` and confirm it fails on the legacy title.
- [ ] Implement the route metadata and npm script.
- [ ] Rerun the contract until metadata expectations pass and the next missing content requirement fails.

### Task 2: Technical Buyer Content and Cannibalization

**Files:**
- Modify: `data/hydraulic-swing-beam-shear-page.ts`
- Modify: `data/hydraulic-guillotine-shear-page.ts`

**Interfaces:**
- Consumes: existing optional overview, materials, model guide, comparison, manufacturer and related-link fields.
- Produces: professional, server-rendered swing-beam content and a reciprocal Guillotine related link.

- [ ] Add the overview, arc-motion mechanism, hold-down/back-gauge workflow, eight applications, seven material groups, and explicit material-capacity caveat.
- [ ] Add a model guide covering every source thickness and length group while flagging unmapped QC12Y/QC12K controller designation.
- [ ] Add balanced Guillotine comparison, manufacturer review, twelve exact FAQs, quote inputs, and seven internal links.
- [ ] Correct only the adjacent Guillotine arc-motion/QC12Y wording required to protect intent separation, then add the reciprocal related link.
- [ ] Rerun Swing Beam and Guillotine contracts plus related shearing regressions.

### Task 3: Production Validation and Deployment

**Files:**
- Verify: the committed route, content, source contract and generated page.

**Interfaces:**
- Consumes: final feature branch tree.
- Produces: deployed production content with HTTP and rendered evidence.

- [ ] Run every `verify:*` script, ESLint, production build, and `git diff --check`.
- [ ] Run local HTTP checks for page, legacy redirect, robots, sitemap, seven linked routes, four schema types, 40 ProductModel variants and 12 FAQs.
- [ ] Inspect desktop and 390 px mobile layout, FAQ expansion, table scrolling, image loading and console health with the in-app Browser.
- [ ] Commit, update `main`, deploy through Vercel, and repeat production HTML and route checks before reporting completion.

