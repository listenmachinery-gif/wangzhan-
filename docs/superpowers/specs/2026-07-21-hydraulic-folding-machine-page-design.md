# Hydraulic Folding Machine Product Page Design

## Objective

Replace the generic Hydraulic Sheet Metal Folding Machine detail view with a dedicated, solution-led page for medium-to-heavy thin-sheet folding, HVAC duct fabrication, long-edge forming, roofing and architectural sheet metal, enclosures and workshop production. Preserve the global header, footer, route, machine image, verified specifications and existing industrial design system.

The page must remain factual and configuration-led. It must not add prices, unsupported output claims, fake machine close-ups, customer-project claims or invented hydraulic component specifications.

## Approved direction

The canonical route remains `/products/hydraulic-sheet-metal-folding-machine`, while the page uses `Hydraulic Folding Machine` as its single H1. The existing transparent product image remains the only machine photograph and must not be structurally altered, recolored or replaced.

The Applications section uses eight newly sourced, commercially usable real photographs that are not reused from the manual, electric or pneumatic folding-machine pages. These images illustrate industries, environments and downstream products; they must not be described as ZYRON customer installations or exact machine-operation photographs.

All seven existing HWS technical rows and their values remain unchanged. The source of truth remains `data/bending-details.ts`.

## Architecture

- `data/hydraulic-folding-machine-page.ts` owns typed page copy, application image configuration, equipment links, comparison content, selection fields and FAQs.
- `components/HydraulicFoldingMachineSolutionPage.tsx` renders the semantic page, process visualization, responsive tables, FAQ disclosures and JSON-LD.
- `app/products/[id]/page.tsx` provides dedicated metadata and selects the dedicated component for the hydraulic folding-machine route.
- `data/bending-details.ts` remains unchanged and supplies every specification value.
- `public/products/hydraulic-folding-applications/` stores eight local WebP photographs and `SOURCES.md` records the Pexels source page, photographer and access date.
- `scripts/verify-hydraulic-folding-machine-page.mjs` defines the route and content contract, and `scripts/verify-all-product-solution-pages.mjs` includes the new dedicated page.

The page is isolated from `ProductSolutionPage`, so the new structure and photo requirements cannot affect unrelated products.

## Information architecture

The page contains these sections in order:

1. Hero with the two supplied CTAs, four proof labels and the existing machine image on a dark titanium stage
2. Five customer problems and practical solution directions
3. Three solution-fit groups for HVAC duct fabrication, medium/heavy-duty sheet-metal workshops and roofing/architectural metal
4. Eight application scenarios using newly sourced real photographs
5. Six material families and the supplied material-capacity qualification note
6. Hydraulic-system positioning using only supported general facts and existing product data
7. Six-step flow from sheet cutting through the next operation
8. Verified machine advantages beside the existing product image
9. Objective comparison of manual, electric, pneumatic and hydraulic folders with a press brake
10. Supporting-equipment workflow with internal catalog links
11. Selection guide and quotation CTA card
12. Responsive technical table containing all seven existing HWS rows
13. Nine FAQ disclosures
14. Final quotation and engineer CTA

Visible copy follows the supplied English brief. Machine claims are qualified whenever material strength, folding length, angle, configuration or production frequency changes suitability.

## Application photography

Use a fresh photo for each application:

1. HVAC duct panel folding
2. Rectangular air duct fabrication
3. Roofing sheet-metal work
4. Architectural sheet metal
5. Electrical cabinet and enclosure
6. Stainless-steel light fabrication
7. Long-edge sheet-metal bending
8. General sheet-metal workshop

Download rather than hotlink every asset. Convert it to a stable 1200 × 675 WebP file, use descriptive file names and record the original Pexels photo page and photographer in `SOURCES.md`. Avoid prominent third-party brands. Use Next.js `Image`, a consistent 16:9 crop, responsive `sizes`, descriptive alternative text and framework-default lazy loading for these below-the-fold images.

## Technical specification contract

The following existing rows remain byte-for-byte unchanged in `data/bending-details.ts`:

- `HWS-2 x 1300`
- `HWS-2 x 1600`
- `HWS-2 x 2000`
- `HWS-2 x 2500`
- `HWS-3 x 1600`
- `HWS-3 x 2000`
- `HWS-4 x 1600`

All six current fields render directly from the existing table. Presentation normalizes headings only:

- The label text remains connected on a single non-wrapping line.
- A unit is removed from row values only for display when that column has the same unit in every non-model row.
- The inferred unit is shown on a separate centered line below the connected heading label.
- Units are `mm`, `kW` and `kg` for thickness, folding width, motor power and machine weight; the dimensions column retains full values because it contains three-dimensional measurements.
- Desktop keeps the table readable in its container; mobile permits horizontal scrolling inside the table wrapper only.
- The note states that final specifications depend on material, thickness, bending length, hydraulic configuration and selected structure.

The implementation must not edit, round, reorder or replace source parameter values.

## Visual and responsive system

- Base dark surfaces: `#0B0D10`, titanium-gray and graphite gradients
- Light surfaces: white and `#F4F6F8`
- Accent: `#76B900` with the existing hover treatment
- Panels: fine borders, square or small-radius corners, restrained shadows and slight hover lift
- Typography: existing Montserrat/DIN/Eurostile/Arial stack with one H1 and semantic H2/H3 hierarchy
- Motion: subtle transition only; no decorative or exaggerated animation
- Desktop: two-column hero, three-column solution cards, four-column application grid and wide comparison/specification tables
- Tablet: two-column application layout and wrapped process/equipment flows
- Mobile: stacked hero, full-width CTAs, single-column cards, no document-level overflow and table-only horizontal scrolling

No page section may introduce ecommerce promotion styling, prices, QR codes, new phone numbers or unsupported contact information.

## SEO and structured data

- Title: `Hydraulic Folding Machine | Sheet Metal & HVAC Duct Folding Solution`
- Description: `Hydraulic folding machine for sheet metal edge bending, HVAC duct panel folding, long edge forming and workshop production. Get a suitable hydraulic sheet metal folding solution.`
- Canonical: `/products/hydraulic-sheet-metal-folding-machine`
- Hero alt: `Hydraulic folding machine for sheet metal and HVAC duct panel folding`
- Keywords: all ten supplied hydraulic-folding search terms
- Open Graph and Twitter metadata use the existing product image
- JSON-LD types: `ProductModel`, `BreadcrumbList` and `FAQPage`
- Product schema includes brand, manufacturer, category, URL, image, description and existing parameter properties; it omits offers, price, availability, rating and review data

Internal links cover manual, electric and pneumatic folding machines, shearing machines, lock forming, beading, TDF flange forming, seam closing, press brakes and HVAC duct production lines using existing routes only.

## Error handling and content safeguards

- The dedicated component throws a clear development error when technical parameters are absent.
- The application configuration requires eight unique local image paths and non-empty alt text.
- JSON-LD serialization escapes unsafe `<` characters.
- No remote image dependency remains after photographs are downloaded.
- Component and data names remain hydraulic-specific so copy cannot leak into another folding-machine page.

## Verification and deployment

- Write the contract test first and verify it fails before adding the dedicated implementation.
- Verify the exact route, metadata, single H1, required sections, seven unchanged HWS rows, split/inferred units, eight unique application images, schema output and valid internal links.
- Run the focused contract, complete product-page contract suite, ESLint, TypeScript through the production build and the Next.js production build with bounded logs.
- Render and inspect desktop and narrow mobile viewports. Check header/footer continuity, product identity, real-photo loading and crop, copy hierarchy, FAQ interaction, CTA destinations, document overflow and specification-table scrolling.
- Deploy the verified `main` branch using the repository's existing Vercel workflow and then verify the live canonical URL.

## Scope boundary

Only the Hydraulic Folding Machine detail experience, its new local application assets, dedicated metadata and focused verification files change. The work does not modify other product page layouts, rewrite global navigation/footer, change existing parameter source values, add dependencies or create fake machine imagery.
