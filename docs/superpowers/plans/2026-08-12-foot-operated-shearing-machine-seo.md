# Foot Operated Shearing Machine SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the existing Foot Shear product page into a server-rendered B2B purchasing resource for `foot operated shearing machine` and deploy it without changing its canonical URL or inventing product data.

**Architecture:** Keep the existing dynamic product route and product registry. Replace the thin Foot Shear wrapper with a dedicated server component, keep all page copy in one focused data module, and continue reading the verified Q11 parameter table from the shared product object. Verify the complete output with a source contract and rendered browser checks.

**Tech Stack:** Next.js 15 App Router, React 19 server components, TypeScript, Tailwind CSS, `next/image`, JSON-LD, Node assertion scripts.

## Global Constraints

- Canonical route remains `/products/foot-shear`; the legacy route remains a permanent redirect.
- One H1 only: `Foot Operated Shearing Machine`.
- No duplicate keyword pages, keyword stuffing, hidden copy, or `meta name="keywords"`.
- Preserve the exact Q11 parameter rows from `data/shearing-details.ts`.
- Do not claim Q01 models, price, stock, ratings, reviews, certificates, awards, sales volume, or unsupported capacity.
- Critical SEO content, tables, FAQs, and links must be present in server-rendered HTML.
- Preserve the site's black/white/green industrial visual system and mobile responsiveness.

---

### Task 1: Define the SEO page contract

**Files:**
- Modify: `scripts/verify-foot-shear-page.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: the route, dedicated component, page content, product registry, original parameter source, sitemap, robots, and redirect configuration.
- Produces: `npm run verify:foot-shear-seo`, which exits non-zero until all SEO requirements are implemented.

- [ ] **Step 1: Write assertions for exact title, description, H1, canonical URL, page modules, ten FAQs, Q11 rows, descriptive links, unique alt text, four schema types, and forbidden commercial schema fields.**
- [ ] **Step 2: Run `npm run verify:foot-shear-seo` and confirm it fails because the old title, H1, FAQ count, and selection modules do not meet the contract.**
- [ ] **Step 3: Commit the failing contract.**

### Task 2: Implement buyer-focused content and the dedicated server page

**Files:**
- Modify: `data/foot-shear-page.ts`
- Modify: `components/FootShearSolutionPage.tsx`
- Modify: `app/products/[id]/page.tsx`

**Interfaces:**
- Consumes: `Product` and `Product.technicalParameters` from `data/products.ts`.
- Produces: `FootShearSolutionPage({ product }: { product: Product })`, rendered only for `product.id === "foot-shear"`.

- [ ] **Step 1: Replace the page data with typed hero, overview, mechanism, problems, reasons, materials, features, applications, comparison, selection, quality, FAQ, link, and CTA records.**
- [ ] **Step 2: Implement the dedicated server component with semantic headings, readable HTML tables, native details/summary FAQs, descriptive internal links, and unique image alt text.**
- [ ] **Step 3: Add Product, BreadcrumbList, Organization, and visible FAQ JSON-LD while excluding offers, price, availability, reviews, and ratings.**
- [ ] **Step 4: Update route metadata to the exact title and description, keep the canonical route, and remove the Foot Shear metadata keywords array.**
- [ ] **Step 5: Run `npm run verify:foot-shear-seo` and confirm it passes.**
- [ ] **Step 6: Commit the implementation.**

### Task 3: Verify rendering, routes, and deployment readiness

**Files:**
- Modify: `scripts/verify-foot-shear-browser.cjs` only if the existing browser contract needs the new exact copy and section counts.

**Interfaces:**
- Consumes: the production Next.js build and `/products/foot-shear` HTML.
- Produces: repeatable desktop/mobile and live HTML evidence.

- [ ] **Step 1: Run `npm run verify:foot-shear-seo`, the existing shearing/major-page regression contracts, and `npm run lint`.**
- [ ] **Step 2: Run `npm run build` and confirm the canonical route is statically generated.**
- [ ] **Step 3: Start the production server and verify desktop plus 390 px mobile layouts, table-local scrolling, no document overflow, image loading, FAQ interaction, and clean console output.**
- [ ] **Step 4: Check `/robots.txt`, `/sitemap.xml`, the legacy redirect, the canonical page, and every new internal route.**
- [ ] **Step 5: Push the validated commit to `main`, wait for Vercel success, and repeat the public HTTP/HTML checks.**
