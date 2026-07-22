# Single-Table Fiber Laser Cutting Machine Page Design

## Objective

Replace the generic product-detail rendering for `single-table-fiber-laser-cutting-machine` with a dedicated, professional “cost-effective sheet-metal fiber-laser-cutting solution” page. Preserve the global header, footer, navigation, route, original product image, and current product data while giving first-time laser buyers and small-to-medium workshops a clear selection path.

The page must not invent product-specific specifications, prices, cutting-thickness promises, exchange-table capabilities, automatic loading, performance gains, contact methods, certifications, or fake machine-detail photography.

## Selected Approach

Build one dedicated server-rendered React component backed by a typed page-content module, then route only the single-table product to it.

This is preferred over the generic `ProductSolutionPage`, because the requested single-table positioning, gas guidance, workshop preparation, comparison, workflow, selection, FAQ, and source-aware specification content needs a product-specific information architecture. A shared laser-series refactor is intentionally out of scope because exchange-table, sheet-and-tube, and tube machines have different operating models and claims.

## Visual Concept

The accepted design direction is documented by two Image Gen concept references:

- Complete-page rhythm and first viewport: `/Users/zhangmingwei/.codex/generated_images/019f84c8-b51f-7a61-a95b-63358ebfe906/exec-dfa885aa-7bb8-4956-89ab-91f0ac6d57e2.png`
- Lower-page tables, workflow, selection, safety, FAQ, and CTA: `/Users/zhangmingwei/.codex/generated_images/019f84c8-b51f-7a61-a95b-63358ebfe906/exec-d6a596bc-4da0-4cb2-85cd-3b5d018f380f.png`

The concepts define layout, hierarchy, typography, color rhythm, table anatomy, media framing, and component geometry only. Generated application imagery, invented numeric values, model codes, absolute edge-quality statements, and copy that differs from the user brief are explicitly excluded from implementation.

## Source-of-Truth Rules

- The current `Product` object remains authoritative for product name, image, tagline, category, original specs, highlights, applications, and options.
- Existing product specs remain visible: fiber laser power selected by material and maximum cutting thickness; sheet-oriented cutting format; precision guide rails, rack drive, and servo control; and common CAD/CAM nesting and cutting workflows.
- The repository has no product-specific numeric working area, power range, cutting thickness, accuracy, speed, overall dimensions, or weight for this machine. Those fields must display `Customizable / Please confirm with our sales engineer`.
- Official Bodor and SENFENG single-platform product material may support cautious industry context and selection guidance. Competitor numeric values must not be presented as guaranteed ZYRON specifications or assigned to an invented ZYRON model.
- The product image marking `ZY-4020` is visual evidence only; it is not sufficient to infer a complete model specification.
- Applications use nine newly sourced real production photographs with photographer/source records and license links. Generated images, SVGs, and line-art illustrations are prohibited inside the Applications grid.
- The existing transparent 1448 × 1086 product image remains unchanged and renders with `object-contain`. No generated machine detail, alternate angle, cutting head, source, bed, or control-cabinet photograph is allowed.

## Information Architecture

The dedicated page contains these sections in order:

1. Hero
2. Cutting problems
3. Single-table cutting solutions
4. Applications with nine real photographs
5. Materials
6. Sheet-to-part cutting process
7. Why single-table design
8. Laser-power selection
9. Cutting gas and edge quality
10. Machine advantages and confirmed configuration context
11. Single-table vs exchange-table vs plasma comparison
12. Complete fabrication workflow
13. Machine selection guide
14. Technical specifications
15. Workshop preparation and safety
16. FAQ
17. Internal product links
18. Final CTA

## Hero

- H1: `Single-Table Fiber Laser Cutting Machine`
- Subtitle: `Cost-effective sheet metal laser cutting solution for small and medium fabrication workshops.`
- Use the exact description and CTA labels from the attachment.
- Show four value labels: single-table open structure, suitable for metal sheet cutting, cost-effective entry solution, and practical for sheet-metal workshops.
- Display the original product image on a restrained dark metal presentation surface without changing its structure, proportions, colors, logo, or control cabinet.
- Existing breadcrumb navigation may appear above the H1. No invented hero eyebrow, badge, proof chip, or metric is allowed.

## Applications

Render a responsive photo grid with nine unique, newly sourced real-image files:

- Sheet metal fabrication
- Electrical cabinet and enclosure
- Advertising signage
- Stainless steel products
- Kitchen equipment
- HVAC duct and ventilation parts
- Machinery manufacturing
- Metal door and window parts
- General metalworking workshop

Each card has a real photograph, descriptive alt text, title, and one concise explanation of why a single-table flat-sheet machine fits that context. Photos use stable 4:3 frames with consistent crop logic. No illustration, line-art placeholder, fake machine detail, generated image, or image with an unrelated prominent brand is permitted.

## Technical Specifications

The technical table uses one product configuration row with the requested field set:

- Model
- Working Area
- Laser Power
- Cutting Material
- Maximum Cutting Thickness
- Positioning Accuracy
- Max Cutting Speed
- Transmission System
- Control System
- Cooling System
- Machine Size
- Machine Weight
- Application

Verified qualitative values come from the current product/category data. All absent product-specific numeric values use the approved confirmation placeholder. Official competitor values may be recorded in source documentation for context but must not be copied into the ZYRON configuration row.

Column headings are parsed into a non-wrapping label line and, where applicable, a separate centered unit line. The table lives inside a local `overflow-x-auto` container so the document itself does not overflow on mobile.

The visible footnote states that final specifications depend on sheet material, thickness, working area, laser power, cutting gas, control system, and selected machine configuration.

## Visual System

- Backgrounds alternate between true white, `#0B0D10`, and `#171C21`.
- Accent color is `#76B900`; all other emphasis uses white or neutral zinc/gray.
- Typography is clean and compact with strong editorial hierarchy, readable body copy, and deliberate table/control text sizes.
- Geometry is squared or uses a restrained 2 px radius. Borders are thin; shadows and glass effects are used sparingly.
- Sections use bands, rails, lists, tables, open compositions, and occasional framed media instead of repeated rounded card grids.
- Applications reserve imagery for real photographs. Cutting process and fabrication workflow may use restrained code-native SVG/Lucide symbols only.
- Hover movement is subtle and disabled under reduced-motion preferences.
- There is no price, QR code, countdown, phone/WeChat block, unverified certification, fake testimonial, excessive icon grid, promotional badge, or decorative glow.

## Responsive Behavior

- Desktop: split hero, three-column applications, multi-column information bands, and wide comparison/specification tables in local scroll containers.
- Tablet: two-column applications and content grids where space permits.
- Mobile: stacked hero with text before product image, single-column cards, full-width CTA buttons, readable FAQ summaries, and no root-level horizontal overflow.
- Product image uses priority loading in the hero. Application photos use lazy loading and responsive `sizes` values.

## Data and Component Boundaries

- `data/single-table-fiber-laser-cutting-machine-page.ts`: typed copy, application photos, materials, process, selection guidance, comparison data, workflow, technical fields, source notes, and FAQs.
- `components/SingleTableFiberLaserCuttingMachineSolutionPage.tsx`: semantic section rendering, JSON-LD, heading parser, responsive tables, application images, and focused local presentation helpers.
- `app/products/[id]/page.tsx`: dedicated route dispatch and exact metadata for this product.
- `scripts/verify-single-table-fiber-laser-cutting-machine-page.mjs`: contract assertions for section count, data provenance, real images, table format, SEO, schemas, placeholders, and prohibited claims.
- `public/products/single-table-fiber-laser-cutting-machine-applications/`: nine optimized real photographs plus `SOURCES.md`.

The page remains a server component and adds no client-side JavaScript beyond existing global site behavior. FAQ uses native `details` and `summary` elements.

## SEO and Structured Data

- Title: `Single-Table Fiber Laser Cutting Machine | Sheet Metal Cutting Solution`
- Description: exact attachment description.
- Canonical route: `/products/single-table-fiber-laser-cutting-machine`.
- Include the ten requested keyword phrases.
- Product image alt: `Single-table fiber laser cutting machine for sheet metal cutting`.
- Exactly one H1.
- ProductModel, FAQPage, and BreadcrumbList JSON-LD.
- Product schema omits `offers` and any price.
- Internal links include exchange-table fiber laser cutting, shearing, hydraulic press brake, CNC press brake, plate rolling, hydraulic press, sheet-metal bending, and metal-sheet laser cutting routes available in the project.

## Validation

- Contract test proves dedicated route dispatch, 18 sections, nine unique real-image paths, one H1, requested SEO, schema types, original product-spec references, placeholder policy, header label/unit split, local table scrolling, and absence of price/QR/exchange-table claims.
- Targeted contract verification runs red before implementation and green afterward.
- ESLint and the complete production build must pass.
- Browser/IAB QA covers page identity, first meaningful render, framework-overlay absence, console health, desktop and 390 px mobile overflow, real application image count, broken images, table headers, local scrolling, CTA links, and one FAQ interaction.
- Visual QA compares the latest implementation screenshots with both accepted concept references using `view_image`, records at least five comparison points, and fixes all material design drift.

## Scope Boundary

This change does not redesign other laser-cutting products, alter global navigation/footer, add dependencies, create fake product-detail imagery, introduce a form submission workflow, assign competitor specifications to a ZYRON model, publish to production, or deploy unless separately authorized.
