# All Product Solution Pages Design

## Scope

Upgrade the 50 product detail pages that still use the generic template into a professional, solution-oriented buying experience. Preserve the five dedicated solution pages for Foot Shear, Compact Electric Shearing Machine, Energy-Saving Electric Shearing Machine, Hydraulic Swing Beam Shear, and Hydraulic Guillotine Shear.

The production target remains `https://www.zyroncnc.com`. Existing product names, canonical URLs, source product images, technical parameter values, header, footer, contact routes, redirects, sitemap behavior, and brand system remain unchanged.

The earlier technical SEO brief prohibited visible changes for its SEO-only scope. The current request explicitly authorizes product-detail layout and visible-copy changes for the remaining products, so this design treats that prohibition as superseded only for the 50 target product-detail pages. SEO truthfulness, URL, structured-data, and no-fabrication constraints remain active.

## Research Findings

Current industrial product pages from TRUMPF, LVD, Bystronic, and AMADA consistently lead with the buyer's production problem and desired outcome, then explain applications, differentiators, configuration choices, technical data, software or workflow fit, services, and a consultation CTA. The strongest pages do not rely on a photo gallery alone; their decision support comes from clear content hierarchy, comparison logic, tables, process explanations, and service context.

The ZYRON site has one real product image per target product. The page must therefore create professional depth with editorial structure, CSS-native workflow diagrams, icons, comparison tables, and factual copy. It must not simulate a gallery by cropping the same image into fake detail views, generate fictional component photos, or repeat the same machine image in every section.

## Approaches Considered

### 1. Fifty dedicated page components

This provides maximum product-specific control but duplicates layout and schema logic, makes cross-page QA expensive, and creates long-term drift. It is rejected because most products share the same buying-decision structure.

### 2. One universal template with only existing product fields

This is fast and consistent but would repeat generic wording across unrelated processes such as laser cutting, duct production, rolling, pressing, and shredding. It would improve visual consistency without enough domain-specific decision support.

### 3. Shared solution page with category profiles and product-derived content

This is the selected approach. One reusable server component owns visual structure, semantics, schema, responsiveness, and CTA behavior. Eight category profiles provide process-specific buyer questions, workflow stages, selection criteria, and service framing. Existing product fields supply the product name, image, tagline, verified features, applications, options, and technical parameters. Small product-level overrides are allowed only when the current data contains a verified distinction.

## Architecture

- Add one reusable `ProductSolutionPage` server component for every non-dedicated product route.
- Add a centralized solution-content module with one profile for each existing category: shearing, bending, fiber laser cutting, plate rolling, press machines, rectangular duct production, round duct production, and shredders.
- Add a pure content-builder function that combines a `Product`, its `ProductCategory`, and its category profile into the page view model.
- Keep the five existing dedicated solution components and their route branches unchanged.
- Replace only the generic JSX branch in `app/products/[id]/page.tsx` with the shared component.
- Continue using the existing `Product` object and technical parameter tables as the source of truth.

## Page Structure

1. **Solution hero** — one complete real product image; product H1; factual positioning paragraph; three concise outcome statements; category link; quote and comparison CTAs.
2. **Decision snapshot** — material/process fit, production mode, and configuration basis expressed as labels with real text, not artificial numerical metrics.
3. **Customer challenges** — four category-specific problems that explain when the machine should be considered.
4. **Recommended solution fit** — product-specific applications and a clear list of conditions that make the machine suitable.
5. **Production workflow** — four or five CSS-native steps tailored to the category, from requirement or feedstock through the next process.
6. **Operational value** — verified advantages or existing highlights, presented as outcome-oriented explanations.
7. **Application scenarios** — current product applications presented with category-specific context.
8. **Selection and configuration** — current specs and options framed as questions a buyer should confirm before quotation.
9. **Technical parameters** — preserve every existing row and column; keep responsive horizontal scrolling. If no detailed table exists, show only the current specification labels and values without inventing model data.
10. **Project support** — requirement review, model matching, delivery preparation, and technical support without unsupported service promises.
11. **Related products** — three valid products from the same category.
12. **Final inquiry CTA** — ask for the minimum information required by that category and link to the existing contact page.

## Visual System

- Reuse the established ZYRON graphite, white, neutral gray, and `#76B900` green system from the five dedicated solution pages.
- Keep typography, square industrial corners, restrained borders, generous section spacing, and editorial two-column rhythm consistent with those pages.
- Use the single product image once in the hero. A second use is permitted only when it communicates a real functional overview and remains visually distinct; the default is not to repeat it.
- Use Lucide icons and CSS-native process lines or numbered steps. Do not add stock photography, generated machinery details, fake screenshots, decorative dashboards, promotional price blocks, or invented badges.
- Desktop uses wide editorial grids. Tablet and mobile collapse to one column. Only technical tables may scroll horizontally; the page itself must never overflow.

## Content Rules

- English visible copy remains natural, concise, and buyer-oriented.
- Never invent capacity, accuracy, speed, energy savings, certification, included control systems, standard accessories, price, stock, warranty duration, customer names, case results, or delivery dates.
- Reuse existing performance descriptions and advantages where available. Convert them into shorter presentation units without changing their technical meaning.
- Category profiles may describe the normal selection process but must use conditional wording such as “selected according to” when capacity depends on model or configuration.
- Preserve the identified Manual Sheet Metal Folding Machine content concern: do not present CNC controller or servo back gauge as standard equipment on that manual product.
- Avoid identical SEO paragraphs across all pages; page copy must combine the product's name, tagline, applications, options, and category process.

## SEO And Structured Data

- Preserve every canonical product URL and existing redirect.
- Keep exactly one H1 per page with logical H2 and H3 hierarchy.
- Keep Product or ProductModel and BreadcrumbList JSON-LD aligned with visible content.
- Do not add Offer, price, availability, rating, review, SKU, GTIN, MPN, or unsupported FAQ schema.
- Keep image alt text factual and based on the product name and function.
- Metadata remains product-specific and must not be replaced by one repeated description.

## Testing

- Add a source-contract test before implementation and verify it fails because the shared component and profiles do not yet exist.
- Verify all 55 product routes remain generated and the five dedicated route branches remain isolated.
- Verify each of the 50 generic targets resolves a category profile and includes all required solution sections.
- Verify existing technical tables are passed through without modifying row or column values.
- Verify JSON-LD excludes fabricated commerce and review fields.
- Verify exactly one H1 and valid CTA or related-product links on representative pages from all eight categories.
- Run TypeScript, existing verification scripts, production build, and local production server checks.
- Browser-check representative desktop and 390 px mobile pages from all eight categories plus the five dedicated pages for regressions, image loading, table overflow, and page-width overflow.
- After deployment, verify the production domain, representative pages, sitemap entries, canonical URLs, and HTTP status.

## Deployment

Deploy the validated source to the existing Vercel production project `wangzhan` and retain `https://www.zyroncnc.com` as the public production domain. Do not create a separate hosting project. Verify production after deployment and report any Vercel authentication or domain propagation blocker plainly.
