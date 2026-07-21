# Electric Folding Machine Product Page Design

## Objective

Replace the generic Electric Sheet Metal Folding Machine detail view with a dedicated, solution-led page for thin-sheet edge bending, HVAC duct fabrication, architectural sheet metal and light workshop forming. Preserve the existing global header, footer, product route, machine image, verified specifications and industrial visual system.

The dedicated page must present the machine as a practical part of a sheet-metal production workflow rather than a parameter-only catalog item. It must remain factual, avoid promotional exaggeration and work cleanly on desktop and mobile.

## Approved direction

The canonical route remains `/products/electric-sheet-metal-folding-machine`, while the page uses `Electric Folding Machine` as its single H1. The existing product image remains the only machine photograph. The implementation must not invent machine details, alter the product's appearance or generate simulated close-up images.

The Applications section uses eight distinct real photographs selected specifically for this page. It must not reuse the Manual Folding Machine application assets. Each photograph represents an industry or downstream use case and must not be described as a ZYRON customer installation.

Only facts already supported by the project data may be presented as verified machine characteristics:

- Motor-driven clamping and folding action
- Folding-beam forming after the sheet is clamped
- Thin-sheet folding, flanging, edge wrapping and angle forming
- Galvanized sheet, iron sheet, aluminum sheet and thin stainless steel sheet applications
- The four existing DWS model rows and their current values

Do not add prices, availability, ratings, performance percentages, fake testimonials, fabricated machine components or unsupported maximum material claims.

## Architecture

Use the established dedicated product-page pattern already used by the Manual Folding Machine page:

- `data/electric-folding-machine-page.ts` owns typed page copy, application-photo configuration and internal-link configuration.
- `components/ElectricFoldingMachineSolutionPage.tsx` composes the semantic page, responsive sections, accessible process diagram, comparison table, specification table, FAQ disclosures and JSON-LD.
- `app/products/[id]/page.tsx` supplies dedicated metadata and renders the component only for the electric folding machine route.
- `data/bending-details.ts` remains the source of truth for all technical parameter values; the new page consumes the existing data without changing it.
- A focused verification script defines the page contract and is included in the all-product solution-page verification count.
- Application photos live in `public/products/electric-folding-applications/` with a compact source manifest in the same directory.

The new page stays isolated from the shared `ProductSolutionPage`, so its content, table behavior and image requirements cannot affect unrelated products.

## Information architecture

The page contains these sections in order:

1. Hero with two CTAs, four proof labels and the existing electric folding machine image on a titanium-gray industrial stage
2. Five customer problems and practical solution directions
3. Three solution-fit groups: HVAC duct fabrication, sheet-metal workshop, and roofing/architectural metal
4. Eight application scenarios using distinct real photographs
5. Six material families and a material-strength qualification note
6. Six-step process from flat sheet to folded part
7. Verified machine advantages beside the real product image or an abstract code-native folding diagram
8. Objective manual-versus-electric-versus-hydraulic folding comparison
9. Supporting-equipment workflow with internal links to matching catalog products
10. Selection guide covering material, thickness, bending length, angle, application, output, voltage and companion machines
11. Responsive technical specification table using all four existing DWS rows
12. Eight FAQ items
13. Final quotation and engineering CTA

The page uses concise English copy based on the user-provided brief. Claims are qualified where material strength, configuration or production requirements affect suitability.

## Application photography

Use one unique, commercially usable real photograph for each application:

1. HVAC duct panel folding
2. Ventilation duct fabrication
3. Roofing sheet-metal work
4. Architectural sheet metal
5. Electrical cabinet and enclosure fabrication
6. Signage fabrication
7. Stainless-steel light fabrication
8. General sheet-metal workshop

Photos may show the relevant fabrication environment, material or downstream product when an exact electric-folding operation image is unavailable. They must not show prominent third-party branding or imply endorsement.

Assets are downloaded rather than hotlinked, converted to WebP, given stable topic-based filenames and recorded in `SOURCES.md` with source-page URLs, creator information when available and access date. The UI uses Next.js `Image`, descriptive alternative text, responsive `sizes`, a consistent 16:9 area and `object-cover`. Below-the-fold photos use the framework's default lazy loading.

## Technical specification contract

The existing four rows remain unchanged:

- `DWS-1.5 x 1300`
- `DWS-1.5 x 1500`
- `DWS-1.5 x 2000`
- `DWS-1.5 x 2500`

All seven current fields and values are rendered directly from `data/bending-details.ts`. No units or values are inserted into the row data.

Column headings are normalized only for presentation:

- The text label remains together on a single non-wrapping line.
- A trailing parenthesized unit moves to a separate centered line.
- `Main/Auxiliary Motor Power` remains one connected label above `(kW)`.
- Desktop keeps the full table readable inside its section; mobile permits horizontal scrolling inside the table wrapper only.
- The note below the table states that final specifications depend on sheet material, thickness, bending length, voltage and selected configuration.

## Visual and responsive system

- Base surfaces: `#0B0D10`, titanium gray and graphite gradients
- Primary text: white on dark sections and near-black on light sections
- Secondary text: zinc and neutral gray
- Accent: `#76B900`, using the site's existing hover treatment
- Panels: fine borders, square or small-radius corners, restrained shadows and subtle hover lift
- Typography: the existing site font stack with one H1 and a semantic H2/H3 hierarchy
- Motion: no decorative or exaggerated animation
- Desktop: two-column hero, three-column solution cards and four-column application grid where space permits
- Tablet: two-column application grid and appropriately wrapped flows
- Mobile: stacked hero, single-column cards, full-width CTAs, no document-level horizontal overflow and table-only horizontal scrolling

The page must not use an ecommerce promotion style, prices, QR codes or new one-off contact details.

## SEO and structured data

- Title: `Electric Folding Machine | Sheet Metal Edge Bending Solution`
- Description: `Electric folding machine for thin sheet metal bending, edge folding, HVAC duct panel forming, roofing sheet metal and light fabrication workshops. Get a suitable electric sheet metal folding solution.`
- Canonical: `/products/electric-sheet-metal-folding-machine`
- Hero image alt: `Electric folding machine for sheet metal edge bending`
- Keywords: all nine electric folding terms supplied in the brief
- Open Graph and Twitter metadata use the existing product image
- JSON-LD types: `ProductModel`, `BreadcrumbList` and `FAQPage`
- Product schema includes brand, manufacturer, category, URL, image, description and verified parameter properties; it omits offers, price, availability, rating and review data

## Internal links

Link only to routes already present in the product catalog. Relevant workflow links include manual and hydraulic folding machines, shearing machines, lock forming machines, beading machines, TDF flange forming, seam closing, press brakes and HVAC duct production lines. Link labels explain each machine's role without implying unsupported performance.

## Error handling and content safeguards

- The dedicated component fails clearly during development if verified technical parameters are absent.
- Application configuration requires eight unique local image paths and non-empty alternative text.
- JSON-LD is serialized with unsafe `<` characters escaped.
- Missing optional internal-link targets are excluded rather than rendered as broken links.
- No remote image dependency remains after the application assets are downloaded.

## Verification and deployment

- Add a contract script that proves the dedicated route, exact metadata, one H1, all required sections, exact DWS rows, split unit headings, eight unique local application photos, safe schema output and valid internal links.
- Update the all-product solution-page contract to include the new dedicated page.
- Run the complete product-page verification suite, ESLint, TypeScript and the Next.js production build with bounded log output.
- Render and inspect the page at desktop and narrow mobile viewports. Check identity, image loading and cropping, heading hierarchy, console health, FAQ interaction, CTA navigation, document overflow and specification-table scrolling.
- Deploy the verified `main` branch to the existing Vercel production project and verify `https://www.zyroncnc.com/products/electric-sheet-metal-folding-machine` after deployment.

## Scope boundary

The work changes only the Electric Folding Machine dedicated detail experience, supporting application assets, route metadata and focused verification files. It does not rewrite unrelated product pages, modify the existing parameter source values or change the site's global navigation and footer structure.
