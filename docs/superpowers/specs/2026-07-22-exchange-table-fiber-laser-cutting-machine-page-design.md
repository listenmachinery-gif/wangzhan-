# Exchange-Table Fiber Laser Cutting Machine Page Design

## Objective

Replace the generic product-detail rendering for `exchange-table-fiber-laser-cutting-machine` with a dedicated, high-efficiency sheet-metal cutting solution page. Preserve the existing site header, footer, navigation, route, product image, and product data while presenting the machine as a dual-platform production solution.

The page must not invent machine specifications, prices, performance gains, automatic loading capability, contact details, or product-detail photography.

## Selected Approach

Build one dedicated server-rendered React component backed by a typed page-content module, then route only the exchange-table product to it.

This approach is preferred over extending the generic `ProductSolutionPage`, because the requested selection, exchange-table, gas, safety, comparison, FAQ, and workflow content needs a product-specific information architecture. A shared laser-series refactor is intentionally out of scope because the other laser products have different positioning and have not been requested.

## Source-of-Truth Rules

- The current `Product` object remains authoritative for product name, image, tagline, category, original specs, highlights, applications, and options.
- The existing four laser-category specs are preserved and surfaced in the technical section.
- Numeric working area, power range, cutting thickness, exchange time, accuracy, cutting speed, machine dimensions, and machine weight are not present for this product. They must display `Customizable / Please confirm with our sales engineer` rather than fabricated values.
- Other manufacturer websites may inform conditional explanatory language only. They must not be used to assign numeric values to this machine without a model match and a source explicitly tied to this product.
- Existing verified real workshop photographs in `public/products/*-applications/` will be reused for the Applications grid. Applications must contain real photographs only.
- The existing transparent product image remains unchanged and must be rendered with `object-contain`. No generated product detail views are allowed.

## Information Architecture

The dedicated page contains these sections in order:

1. Hero
2. Cutting problems
3. Exchange-table cutting solutions
4. Applications with ten real photographs
5. Materials
6. Cutting process
7. Exchange-table design
8. Laser-power selection
9. Cutting gas and edge quality
10. Machine advantages and confirmed/conditional configuration
11. Single-table vs exchange-table vs automatic line comparison
12. Complete fabrication workflow
13. Machine selection guide
14. Technical specifications
15. Workshop preparation and safety
16. FAQ
17. Internal product links
18. Final CTA

## Hero

- H1: `Exchange-Table Fiber Laser Cutting Machine`
- Subtitle: `High-efficiency sheet metal laser cutting solution with dual exchange platforms.`
- Use the approved description and CTA labels from the brief.
- Show four value labels: dual exchange platforms, reduced loading wait, batch sheet cutting, and workshop practicality.
- Display the original 1448 × 1086 product image on a dark titanium presentation surface without altering machine structure, proportions, color, or enclosure.
- Above-fold copy must match the approved brief exactly. Existing site breadcrumb navigation may remain above the H1.

## Applications

Render a responsive photo grid with ten unique, existing real-image files:

- Sheet metal fabrication
- Electrical cabinet and enclosure
- Stainless steel products
- Kitchen equipment
- Advertising signage
- HVAC duct and ventilation parts
- Machinery manufacturing
- Metal door and window parts
- Steel structure components
- General metalworking workshop

Each card has a real photo, descriptive alt text, title, and one concise conditional explanation. No illustration, SVG, or line-art placeholder is permitted inside this section.

## Technical Specifications

The technical table uses one configuration row and the requested field set:

- Model
- Working Area
- Laser Power
- Cutting Material
- Maximum Cutting Thickness
- Exchange Table Type
- Exchange Time
- Positioning Accuracy
- Max Cutting Speed
- Transmission System
- Control System
- Cooling System
- Machine Size
- Machine Weight
- Application

The table may use verified qualitative values from the current product object. All absent numeric values use the approved confirmation placeholder.

Column headings are parsed into a non-wrapping label line and, where applicable, a separate centered unit line. The table lives inside a local `overflow-x-auto` container so the page itself does not overflow on mobile.

## Visual System

- Dark titanium and black-gray backgrounds with white and zinc-gray typography.
- Accent color `#76B900` only.
- Thin borders, squared industrial cards, restrained hover lift, and motion-reduced fallbacks.
- Alternating dark and light sections maintain reading rhythm.
- Real photographs are reserved for Applications; code-native diagrams may be used only for the exchange-table process and production workflow.
- No excessive icon grid, promotional badges, gradients that reduce readability, price, QR code, or unverified contact block.

## Responsive Behavior

- Desktop: split hero, multi-column cards, wide comparison and technical tables in local scroll containers.
- Tablet: two-column application and information grids where space permits.
- Mobile: stacked hero, single-column cards, full-width CTAs, readable FAQ summaries, and no root-level horizontal overflow.
- Product image uses priority loading in the hero. Application images use lazy loading.

## Data and Component Boundaries

- `data/exchange-table-fiber-laser-cutting-machine-page.ts`: typed copy, application images, comparison data, workflow, technical-field mapping, selection guide, and FAQs.
- `components/ExchangeTableFiberLaserCuttingMachineSolutionPage.tsx`: semantic section rendering, JSON-LD, heading parser, responsive tables, and shared local presentation helpers.
- `app/products/[id]/page.tsx`: route dispatch plus exact metadata for this product.
- `scripts/verify-exchange-table-fiber-laser-cutting-machine-page.mjs`: contract assertions for sections, data provenance, images, table format, SEO, schema, and prohibited claims.

The page is a server component and adds no client-side JavaScript beyond existing site behavior. FAQ uses native `details` and `summary` elements.

## SEO and Structured Data

- Exact title and description from the brief.
- Canonical route `/products/exchange-table-fiber-laser-cutting-machine`.
- Requested keyword set in metadata.
- Product image alt: `Exchange-table fiber laser cutting machine for sheet metal cutting`.
- One H1 only.
- Product, FAQPage, and BreadcrumbList JSON-LD.
- Product schema omits `offers`.

## Validation

- Contract test proves the dedicated route, 18 sections, ten unique real image paths, one H1, requested SEO, schema types, original product-spec references, placeholder policy, header label/unit split, local table scrolling, and absence of price/QR claims.
- Targeted ESLint runs before the full repository lint.
- Production build must complete successfully.
- Browser QA covers page identity, first meaningful render, framework-overlay absence, console health, desktop and mobile overflow, application image count, table headers, local scrolling, CTA links, and one FAQ interaction.
- Visual QA compares rendered screenshots with the accepted concept direction and records intentional deviations caused by source-data integrity.

## Scope Boundary

This change does not redesign other laser-cutting products, alter global navigation/footer, add dependencies, invent detailed photographs, introduce an inquiry form, or publish to production unless separately authorized.
