# Fully Automatic Three-Roll Plate Rolling Machine Page Design

## Goal

Replace the generic product detail route for the Fully Automatic Three-Roll Plate Rolling Machine with a dedicated CNC plate-rolling solution page for repeat cylinders, cones, tank shells, pressure-vessel shells, pipe sections, wind-tower sections, and heavy fabrication workflows.

## Approved Direction

Use the previously approved A direction: extend the visual and architectural system established by the Semi-Automatic Three-Roll page while keeping this product's content, application photography, metadata, and route independent. Preserve the global header, footer, inquiry routes, typography, responsive rules, original product record, and legacy alias.

## Visual System

- Use titanium gray and black gradients, restrained glass panels, white text, gray supporting copy, and `#76B900` as the only accent.
- Use the existing transparent product image as the only machine photograph. Do not fabricate detail images or change its geometry, color, or branding.
- Use twelve different real application photographs for the Applications section. Do not reuse application files or source photographs from the semi-automatic or electric two-roll page.
- Application cards must use real photography rather than SVG or line-art. CSS diagrams remain acceptable for technical explanations and process steps.
- Avoid price, promotional badges, QR codes, exaggerated motion, and unsupported guarantees.

## Page Structure

Render exactly 20 visible sections in this order:

1. Hero
2. Rolling problems
3. Fully automatic rolling solutions
4. Applications with real photographs
5. Materials
6. Shapes the machine can form
7. Flat-plate-to-rolled-shell process
8. CNC control
9. Automatic pre-bending
10. Three-roll working structure
11. Feeding, centering, and unloading options
12. Machine advantages
13. Fully automatic three-roll vs semi-automatic three-roll vs four-roll comparison
14. Complete shell-fabrication workflow
15. Configuration and selection guide
16. Technical specifications
17. Workshop preparation and operation notes
18. Related machine links
19. FAQ
20. Final CTA

## Claims and Configuration Safety

The page may describe a CNC-oriented, fully automatic rolling workflow because the product identity and existing product data support that positioning. Automatic pre-bending, stored programs, feeding, centering, unloading, ejector, drop-end, hydraulic movement, cone attachment, remote diagnosis, data management, controller details, and other structural options must remain explicitly configuration-dependent unless confirmed by existing product data.

Do not claim a controller brand, program count, numeric accuracy, capacity, speed, power, weight, guaranteed roundness, zero straight edge, one-pass forming, fully unattended operation, or fixed structural option.

## Parameters

Preserve the four existing project values verbatim:

- Rolling capacity: `Selected by plate thickness, width, material, and minimum diameter`
- Roll structure: `Two-roll, three-roll, or four-roll construction`
- Operation: `Electric, semi-automatic, fully automatic, or hydraulic`
- Workpiece: `Cylinders, arcs, cones, and curved sheet components`

Do not import external numeric parameters. All additional fields use exactly `Customizable / Please confirm with our sales engineer`.

In the first table row, each heading label remains a connected one-line phrase. Units render as a centered second line below the heading. The table scrolls locally on small screens without causing page-level horizontal overflow.

## Architecture

- Add `data/fully-automatic-three-roll-plate-rolling-machine-page.ts` for typed copy, unique image mappings, process data, comparison content, specification presentation metadata, FAQ, and links.
- Add `components/FullyAutomaticThreeRollPlateRollingMachineSolutionPage.tsx` as a server component rendering the 20 sections and safe structured data.
- Add a focused source contract proving route dispatch, metadata, section order, original parameters, table behavior, unique real application assets, source notes, and schema safety.
- Route only `fully-automatic-three-roll-plate-rolling-machine` to this component. Preserve its legacy alias and every other product route.

## SEO and Structured Data

- Title: `Fully Automatic Three-Roll Plate Rolling Machine | CNC Cylinder & Cone Rolling Solution`
- Description: `Fully automatic three-roll plate rolling machine for CNC plate rolling, automatic pre-bending, cylinder forming, cone rolling, tank shells, pressure vessels and heavy fabrication workshops. Get a suitable automatic plate rolling solution based on your material, thickness and target diameter.`
- Product image alt: `Fully automatic three-roll plate rolling machine for CNC cylinder and cone rolling`
- Add the supplied keyword set, canonical, Open Graph, and Twitter metadata.
- Add `ProductModel`, `FAQPage`, and `BreadcrumbList`; omit offers, price, availability, rating, and review fields.

## Responsive and Interaction Behavior

- Desktop hero uses copy left and product image right; mobile stacks content with full-width CTAs.
- Application and content grids collapse to one column on narrow screens.
- Comparison and technical tables remain locally horizontally scrollable.
- FAQ uses native accessible disclosure controls.
- Inquiry CTAs use the existing contact page; internal links use existing product/category routes.
- Product hero loads eagerly at high priority; downstream application images load lazily.

## Verification

- Write and observe a failing focused contract before implementation.
- Run the focused verifier, every existing verifier, ESLint, and production build.
- Inspect desktop and `390 x 844` mobile rendering in the Browser plugin.
- Confirm one H1, 20 sections, twelve loaded application photographs, no framework overlay, no relevant console errors, no document overflow, locally scrollable tables, and an operable FAQ.
- Push `main`, wait for production deployment, and verify the public route returns the dedicated page marker and current metadata.
