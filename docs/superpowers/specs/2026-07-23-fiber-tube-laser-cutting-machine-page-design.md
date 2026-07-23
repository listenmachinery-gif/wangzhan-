# Fiber Tube Laser Cutting Machine Page Design

## Objective

Replace the generic product-detail rendering for `fiber-tube-laser-cutting-machine` with a dedicated, professional metal-tube fiber-laser-cutting solution page. Preserve the global header, footer, navigation, route, original product image, product identity, and compatible original product specifications.

The page must be clearly about dedicated tube processing rather than sheet cutting or a combined sheet-and-tube machine. It must not invent product-specific numeric specifications, prices, performance gains, certifications, machine structures, contact methods, or machine-detail photography.

## Selected Approach

Build one dedicated server-rendered React component backed by a typed page-content module, then route only the Fiber Tube product to it.

This approach is preferred over extending the generic `ProductSolutionPage`, because tube profiles, clamping, loading, unloading, gas selection, three-way comparison, and tube-selection inputs require a product-specific information architecture. A shared refactor of every laser page is intentionally out of scope because single-table, exchange-table, sheet-and-tube, and dedicated-tube machines have different workflows and verified claims.

Alternatives considered:

1. Extend the generic template with many tube-only conditionals. This minimizes new files but makes the generic page fragile and creates a higher risk of sheet-cutting claims leaking into the tube page.
2. Refactor all fiber-laser pages into one shared schema. This may help future reuse but expands risk and scope beyond the requested page.
3. Add a dedicated typed page module and component. This keeps the change isolated, follows the two deployed laser-page patterns, and gives the tube workflow clear content boundaries. This is the selected approach.

## Source-of-Truth Rules

- The existing `Product` object is authoritative for product name, image, tagline, category, applications, and compatible original category specifications.
- Preserve applicable original specifications: fiber-laser power is selected by material and maximum cutting thickness; the format supports tube processing; the motion system uses precision guide rails, rack drive, and servo control; software supports common CAD/CAM nesting and cutting workflows.
- The category options mention a tube chuck system and automatic loading. These are configuration possibilities, not guaranteed equipment. They may appear only as selection questions or optional configurations.
- The repository has no product-specific numeric laser-power range, tube diameter, tube length, wall thickness, positioning accuracy, cutting speed, dimensions, machine weight, chuck count, or tailing length. These values display exactly `Customizable / Please confirm with our sales engineer`.
- External manufacturer material may support cautious selection context only. Competitor numeric values must never be assigned to a ZYRON model or presented as guaranteed ZYRON specifications.
- Preserve the existing 1448 × 1086 product image unchanged and render it with `object-contain`. Do not generate or ship machine-detail photography, alternate angles, cutting-head photos, or chuck photos.
- Applications use twelve real photographs with source and license records. Generated imagery, SVGs, and line art are prohibited inside the Applications grid.

## Information Architecture

The dedicated page contains these primary sections in order:

1. Hero
2. Tube-cutting problems
3. Tube-cutting solutions
4. Applicable Industries with twelve real photographs
5. Tube and profile types
6. Tube materials
7. Raw-tube-to-finished-part process
8. Chuck system
9. Loading and unloading options
10. Laser-power selection
11. Cutting gas and edge quality
12. Machine advantages
13. Dedicated tube laser vs sheet-and-tube laser vs traditional processing
14. Complete fabrication workflow
15. Machine selection guide
16. Technical specifications
17. Workshop preparation and safety
18. FAQ
19. Internal product links
20. Final CTA

## Hero and Visual Direction

- H1: `Fiber Tube Laser Cutting Machine`
- Subtitle: `Professional CNC laser tube cutting solution for round, square, rectangular and profile tubes.`
- Use the approved description, CTA labels, and four value labels from the attachment.
- Display the original machine image on a restrained dark-titanium presentation surface without changing its structure, proportions, colors, or logo.
- Use the existing site type system and container widths with true-white content bands, dark titanium and black-gray bands, light-gray secondary copy, and `#76B900` as the only accent color.
- Use thin rules, sharp geometry, restrained shadows, clipped-corner buttons, subtle hover lifts, and no exaggerated animation.
- Do not add a hero eyebrow, pretitle, badge, pill, price, QR code, testimonial, certification, or unsupported metric.

## Applicable Industries

Render a responsive grid with twelve unique real-image files:

- Metal furniture
- Fitness equipment
- Guardrail and fence
- Door and window frame
- Machinery frame
- Shelf and rack manufacturing
- Automotive and motorcycle parts
- Agricultural machinery
- Construction machinery
- Steel structure tube parts
- Stainless steel products
- General tube fabrication workshop

Each card includes a real photograph, descriptive alt text, a title, and a concise explanation of why dedicated tube processing fits that application. The photographs are representative application references, not ZYRON customer cases and not photographs of this exact machine. They use stable 4:3 frames, `object-cover`, and lazy loading. No SVG, line drawing, icon-only tile, or generated industry scene may substitute for a photo.

## Tube Processing Communication

- Tube-profile tiles cover round, square, rectangular, oval, waist-round, angle steel, channel steel, and selected profiles. They are code-native cross-section diagrams, not fake product-detail photography.
- Material cards cover carbon steel, stainless steel, galvanized tube, aluminum, copper, brass, and thin-wall metal tube with cautious selection copy and no thickness claims.
- The seven-step process renders Tube Drawing Import, Tube Loading, Chuck Clamping, Program Setting, Laser Tube Cutting, Finished Part Unloading, and Welding / Assembly.
- The chuck module explains holding, rotation, automatic centering as a possible configuration, and long-tube support without confirming a chuck quantity.
- Loading modules distinguish manual, semi-automatic, and optional automatic workflows without capacities or speeds.
- Power and gas modules use conditional language and no absolute promises about burrs, oxidation, or cut quality.

## Technical Specifications

The responsive parameter table renders one product configuration row. All requested fields share one first header row. Each parameter name is a single no-wrap phrase; if a unit token exists, it renders as a separate centered line below the phrase. The table scrolls inside its own container on narrow screens, while the page root never overflows.

Confirmed values resolve from the current `Product` object:

- Model: product name
- Laser Power: current laser-source selection guidance
- Tube Type: a cautious list of supported tube/profile categories, subject to configuration
- Transmission System: current motion-system specification
- Control System: current CAD/CAM workflow specification
- Application: current product applications plus the dedicated tube-processing context

All other numeric or product-specific fields use the approved confirmation placeholder. A note below the table explains that final values depend on material, tube type, diameter, section, wall thickness, length, power, chuck, loading, gas, and selected machine configuration.

## Components and Data Flow

- `data/fiber-tube-laser-cutting-machine-page.ts` owns page copy, photo metadata, profile and material content, process steps, comparison rows, selection prompts, specification mappings, internal links, and FAQ content.
- `components/FiberTubeLaserCuttingMachineSolutionPage.tsx` renders focused view components and resolves approved specification fields from the live `Product` object.
- `app/products/[id]/page.tsx` adds exact metadata and routes only this product to the dedicated component.
- `scripts/verify-fiber-tube-laser-cutting-machine-page.mjs` enforces the route, section set, photo-only applications, table-header behavior, schema, placeholder, and prohibited-claim requirements.
- `public/products/fiber-tube-laser-cutting-machine-applications/` stores the twelve real photos and a source ledger.
- `.codex/visual-references/fiber-tube-laser-cutting-machine/` stores the three approved concept references and the extracted design system.

## SEO and Structured Data

- Meta title: `Fiber Tube Laser Cutting Machine | Metal Pipe Cutting Solution`
- Use the exact meta description from the attachment and include the twelve approved keyword phrases.
- Use exactly one H1 and the alt text `Fiber tube laser cutting machine for metal pipe and profile cutting`.
- Add canonical, Open Graph, and Twitter metadata using the original product image.
- Add `Product`, `FAQPage`, and `BreadcrumbList` JSON-LD. Omit `offers`, prices, ratings, fabricated identifiers, and fabricated performance claims.
- Internal links resolve only to existing routes. Unavailable equipment is described without a fabricated link.

## Responsive and Accessibility Behavior

- The hero becomes one column on mobile, with the machine below the copy.
- Card grids collapse to one column, CTA buttons become full width, and comparison/specification tables scroll locally.
- Application images use responsive sizes and lazy loading.
- Interactive controls retain visible focus styles and respect reduced motion.
- FAQ uses native `details` and `summary` elements.
- Decorative diagrams are hidden from assistive technology; application photos have meaningful alt text.

## Visual Reference Set

- `01-hero-problems-solutions.png`: first viewport, value rail, tube problems, and three solution columns.
- `02-applications-process-systems.png`: real-photo industry grid, profiles, materials, process, chuck, loading, power, and gas layouts.
- `03-comparison-technical-cta.png`: advantages, comparison, workflow, selection, specification table, safety, FAQ, product links, and final CTA.

Generated tube, chuck, loading, or cutting imagery that appears inside a concept is non-shippable layout reference only. The production page uses the original product image, real licensed industry photographs, and code-native diagrams.

## Verification and Deployment

- Add the focused page-contract script before implementation and confirm it fails against the current generic page.
- Run the focused contract, the existing laser-page contracts, lint, and production build.
- Render locally and inspect desktop and mobile layouts, table header line behavior, local horizontal scrolling, FAQ interaction, photograph crops, and the absence of document-level overflow.
- Compare browser screenshots against all three visual references and record at least five fidelity checks.
- Push only the isolated Fiber Tube feature to `origin/main`, allow the existing Vercel production project to deploy, and verify the canonical custom-domain route returns HTTP 200 with the metadata, real-photo assets, technical table, and schemas.
