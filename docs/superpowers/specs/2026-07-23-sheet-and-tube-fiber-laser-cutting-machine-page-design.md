# Sheet and Tube Fiber Laser Cutting Machine Page Design

## Objective

Replace the generic product-detail rendering for `sheet-and-tube-fiber-laser-cutting-machine` with a dedicated, professional sheet-and-tube fiber-laser-cutting solution page. Preserve the global header, footer, navigation, route, original product image, current product identity, and compatible original product specifications.

The page must distinguish an integrated sheet-and-tube machine from both a sheet-only laser cutter and a dedicated tube laser. It must not invent product-specific numeric specifications, prices, performance gains, certifications, machine structures, contact methods, or machine-detail photography.

## Selected Approach

Build one dedicated server-rendered React component backed by a typed page-content module, then route only the sheet-and-tube product to it.

This approach is preferred over extending the generic `ProductSolutionPage`, because the dual material paths, dual process diagrams, machine comparison, tube-selection inputs, and source-aware parameter table need a product-specific information architecture. A shared refactor of every laser product page is intentionally out of scope because the single-table, exchange-table, sheet-and-tube, and dedicated-tube machines have different operating models and claims.

The alternatives considered were:

1. Extend the generic product template with many conditional blocks. This would minimize new files but make the generic component harder to understand and increase the chance that sheet-only or tube-only claims leak between products.
2. Refactor all fiber-laser pages into one shared schema in this change. This could improve long-term reuse but would expand risk and scope well beyond the requested product page.
3. Use a dedicated typed page module and component. This keeps the change isolated, follows the two existing laser-page patterns, and gives the dual-use page clear content boundaries. This is the selected approach.

## Source-of-Truth Rules

- The existing `Product` object remains authoritative for the product name, image, tagline, category, and compatible original category specifications.
- Preserve these applicable original specifications: fiber-laser power is selected by material and maximum cutting thickness; the cutting format is integrated sheet-and-tube processing; the motion system uses precision guide rails, rack drive, and servo control; and the software supports common CAD/CAM nesting and cutting workflows.
- The category options mention exchange tables, enclosed covers, tube chucks, and automatic loading. These are not guaranteed on this product and may appear only as configuration questions, not confirmed equipment.
- The repository has no product-specific numeric working area, laser-power range, sheet thickness, tube range, tube length, wall thickness, accuracy, speed, dimensions, or weight. These values must display `Customizable / Please confirm with our sales engineer`.
- Official Bodor and SENFENG sheet-and-tube product material may support cautious selection context. Competitor numeric values must not be assigned to a ZYRON model or presented as guaranteed ZYRON specifications.
- The existing transparent 1448 × 1086 product image remains unchanged and renders with `object-contain`. No generated machine detail, alternate angle, cutting head, chuck, bed, source, or control-cabinet photograph is allowed.
- Applications use eleven real photographs with source and license records. Generated imagery, SVGs, and line-art illustrations are prohibited inside the Applications grid.

## Information Architecture

The dedicated page contains these primary sections in order:

1. Hero
2. Cutting problems
3. Integrated cutting solutions
4. Applications with eleven real photographs
5. Sheet materials
6. Tube and pipe types
7. Sheet cutting process
8. Tube cutting process
9. Why dual-use design
10. Laser-power selection
11. Cutting gas and edge quality
12. Machine advantages and confirmed configuration context
13. Sheet laser vs sheet-and-tube laser vs dedicated tube laser
14. Complete fabrication workflow
15. Machine selection guide
16. Technical specifications
17. Workshop preparation and safety
18. FAQ
19. Internal product links
20. Final CTA

## Hero and Visual Direction

- H1: `Sheet and Tube Fiber Laser Cutting Machine`
- Subtitle: `One machine for metal sheet cutting and tube cutting in flexible fabrication workshops.`
- Use the description, CTA labels, and four value labels from the user brief.
- Display the original machine image on a restrained dark titanium presentation surface without changing its structure, proportions, colors, or logo.
- Use the existing site type system and container widths with dark titanium, black-gray gradients, off-white text, light-gray secondary copy, and `#76B900` as the only accent color.
- Use thin borders, subtle glass surfaces, restrained shadows, small hover lifts, and no exaggerated animation.

## Visual Concept References and Implementation Inventory

Two Image Gen concepts define the layout, section rhythm, typography hierarchy, color cadence, media framing, table anatomy, and component geometry:

- Upper-page concept: `/Users/zhangmingwei/.codex/generated_images/019f84c8-b51f-7a61-a95b-63358ebfe906/exec-1ed32147-7171-4a82-828b-2f07d1b8c485.png`
- Lower-page concept: `/Users/zhangmingwei/.codex/generated_images/019f84c8-b51f-7a61-a95b-63358ebfe906/exec-83f5ed50-914a-4d9a-a384-a87f0ec1ca9f.png`

The concepts are visual references only. Their generated application imagery, generated machine-detail imagery, sample model codes, numeric values, labels, comparison judgments, claims, and copy that differs from the user brief are excluded from implementation.

The extracted design system is:

- Color lock: true near-black `#0B0D10`, titanium surfaces `#12161A` and `#1B2024`, true white headings, cool zinc-gray body copy, thin low-contrast borders, and `#76B900` as the only bright accent.
- Typography: the existing site sans-serif stack; compact uppercase section labels; large tightly tracked headings; 14–16 px body text with generous line height; deliberate 13–14 px button and table typography.
- Geometry: sharp corners or 2 px radii, strong horizontal bands, open editorial layouts, stable 4:3 photo frames, locally scrollable tables, and restrained cards only where content grouping requires them.
- Hero media: the original transparent product image, unchanged and untinted, on a dark presentation field with an ambient shadow beneath it. No color overlay sits on the image.
- Icon treatment: the existing Lucide outline family at a consistent 1.5–2 px visual weight; no filled or decorative icon containers unless required by a process step.
- Motion: 200 ms border/color changes and a maximum 2 px hover lift, with reduced-motion support.
- Responsive continuation: two-column desktop hero, stacked mobile hero, one-column mobile cards, full-width mobile CTA buttons, and table overflow contained within each section.

The allowed above-the-fold copy is limited to the breadcrumb already supplied by the global page, the exact H1, exact subtitle, exact description, two exact CTA labels, and four exact value labels from the user brief. No eyebrow, badge, proof metric, certification, phone number, or new product claim may be added.

## Applications

Render a responsive photo grid with eleven unique real-image files:

- Sheet metal fabrication
- Metal furniture
- Fitness equipment
- Guardrail and fence
- Electrical cabinet and enclosure
- Machinery frame and structure
- Stainless steel products
- Advertising signage
- Metal door and window parts
- Agricultural and construction machinery
- General metalworking workshop

Each card has a real photograph, descriptive alt text, title, and a concise explanation of why mixed sheet-and-tube cutting fits that industry. Photos use stable 4:3 frames with consistent crop logic. They are representative application references, not customer cases and not photographs of this exact machine.

## Sheet and Tube Process Communication

- The sheet path renders the six steps from drawing import through loading, parameter setup, cutting, sorting, and the next fabrication process.
- The tube path renders the six steps from loading through chuck clamping, tube-profile setup, cutting, part removal, and welding or assembly.
- The layouts share a visual language but remain separate so buyers can understand both material flows.
- The dual-use value section explicitly states that the machine is practical for mixed production but does not completely replace a dedicated tube laser for large-volume, long, large-diameter, or complex profile work.

## Technical Specifications

The responsive table renders one product configuration row. Header labels remain unbroken on one line, while detected unit tokens render on a separate centered line. Comparison and specification tables scroll inside their own containers on narrow screens so the page itself does not overflow.

Confirmed values are resolved from the current `Product` object:

- Model: product name
- Laser Power: current laser-source selection guidance
- Cutting Format: current integrated sheet-and-tube format
- Transmission System: current motion-system specification
- Control / Software: current CAD/CAM workflow specification

The remaining requested numeric or product-specific fields display the approved confirmation placeholder. A note below the table explains that final values depend on material, thickness, working area, tube size, laser power, gas, chuck system, controller, and selected configuration.

## Components and Data Flow

- `data/sheet-and-tube-fiber-laser-cutting-machine-page.ts` owns page copy, application-photo metadata, process steps, comparison rows, selection prompts, specification-field mappings, internal links, and FAQ content.
- `components/SheetAndTubeFiberLaserCuttingMachineSolutionPage.tsx` renders the page through small focused view components and resolves approved specification fields from the live `Product` object.
- `app/products/[id]/page.tsx` adds exact metadata and routes only this product to the dedicated component.
- `scripts/verify-sheet-and-tube-fiber-laser-cutting-machine-page.mjs` enforces route, section, photo, table-header, schema, placeholder, and prohibited-claim requirements.
- `public/products/sheet-and-tube-fiber-laser-cutting-machine-applications/` stores optimized real photographs and a source ledger.

## SEO and Structured Data

- Meta title: `Sheet and Tube Fiber Laser Cutting Machine | Plate & Pipe Cutting Solution`
- Use the exact meta description and ten keyword phrases from the brief.
- Use one H1 and descriptive image alt text.
- Add canonical, Open Graph, and Twitter metadata using the existing product image.
- Add `ProductModel`, `FAQPage`, and `BreadcrumbList` JSON-LD. Omit `offers`, price, ratings, fabricated identifiers, and fabricated brand claims.
- Internal links resolve only to existing site routes, with unavailable equipment categories omitted instead of linked to fabricated URLs.

## Responsive and Accessibility Behavior

- The hero becomes a vertical layout on mobile.
- Card grids collapse to one column, CTA buttons become full width, and comparison/specification tables scroll locally.
- Images use responsive sizing and lazy loading outside the hero.
- Interactive elements retain visible focus states and reduced-motion behavior.
- FAQ uses semantic native disclosure controls.
- Decorative SVG process graphics are hidden from assistive technology; real application images carry meaningful alt text.

## Verification

- Add a focused page-contract script before implementation and make it fail against the current generic page.
- Run the focused contract, existing laser-page contracts, lint, and production build.
- Render the page locally and inspect desktop and mobile layouts, including horizontal overflow, image crops, parameter headers, FAQ interaction, and the absence of broken routes.
- After production deployment, verify the live route returns HTTP 200 and contains the exact metadata, 20 primary sections, real-photo asset paths, table marker, schemas, and sitemap entry.

## Deployment

After verification, merge the feature work into `main`, push the synchronized branch, deploy the existing Vercel production project, and verify the canonical custom-domain route. Do not create a separate hosting project or change existing domain configuration.
