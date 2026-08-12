# Hydraulic Four-Roll Plate Rolling Machine Page Design

## Goal

Replace the generic Hydraulic Four-Roll Plate Rolling Machine detail route with a dedicated hydraulic plate-clamping and shell-forming solution page for cylinders, compatible cones, tank shells, pressure-vessel shells, pipe sections, wind-tower sections, and heavy fabrication workflows.

## Approved Direction

Use the previously approved A direction and the established plate-rolling page family, while keeping this product's copy, structure, application photography, metadata, and route independent. Preserve the global header, footer, inquiry routes, typography, responsive behavior, original product record, and both legacy aliases.

## Visual System

- Use dark titanium gray and black gradients, restrained glass panels, white text, gray supporting copy, and `#76B900` as the only accent.
- Reuse the existing transparent four-roll machine image as the only machine photograph. Do not fabricate detail images or alter its structure, proportions, color, or branding.
- Use twelve different real application photographs. Do not reuse source photographs from any existing product application source record.
- Use real photography rather than line drawings for the Applications section. CSS technical diagrams are allowed for four-roll, hydraulic, and pre-bending explanations.
- Avoid prices, promotional badges, QR codes, exaggerated animation, and unsupported guarantees.

## Page Structure

Render exactly 21 visible sections in this order:

1. Hero
2. Rolling problems
3. Hydraulic four-roll solutions
4. Applications with real photographs
5. Materials
6. Shapes the machine can form
7. Flat-plate-to-rolled-shell process
8. Four-roll design
9. Hydraulic system
10. Pre-bending and clamping
11. NC/CNC control options
12. Feeding and unloading options
13. Machine advantages
14. Four-roll vs three-roll vs fully automatic three-roll comparison
15. Complete shell-fabrication workflow
16. Configuration and selection guide
17. Technical specifications
18. Workshop preparation and operation notes
19. Related machine links
20. FAQ
21. Final CTA

## Claims and Configuration Safety

The page may explain the four-roll principle: top and bottom rolls clamp the plate while two side rolls support pre-bending and rolling. It may describe the product as hydraulic because the product name and catalog identity support that. Hydraulic side-roll movement, hydraulic clamping details, NC/CNC control, cone attachment, drop-end discharge, feeding table, ejector, tilting support, digital position display, hydraulic cooling, and overload functions remain explicitly configuration-dependent unless confirmed by existing product data.

Do not claim hydraulic pressure, controller brand, program count, numeric accuracy, capacity, speed, power, weight, guaranteed roundness, zero straight edge, one-pass forming, or unattended production.

## Parameters

Preserve the four existing project values verbatim:

- Rolling capacity: `Selected by plate thickness, width, material, and minimum diameter`
- Roll structure: `Two-roll, three-roll, or four-roll construction`
- Operation: `Electric, semi-automatic, fully automatic, or hydraulic`
- Workpiece: `Cylinders, arcs, cones, and curved sheet components`

Do not import external numeric parameters because a verified model designation is unavailable. All additional fields use exactly `Customizable / Please confirm with our sales engineer`.

Each parameter heading stays as one connected phrase in the first row. Units render as centered second lines. The table scrolls locally on small screens without causing page-level overflow.

## Architecture

- Add `data/hydraulic-four-roll-plate-rolling-machine-page.ts` for typed page content, unique image mappings, specification presentation metadata, comparison data, FAQ, and internal links.
- Add `components/HydraulicFourRollPlateRollingMachineSolutionPage.tsx` as a server component rendering the 21 sections and safe structured data.
- Add a focused source contract proving routing, metadata, section order, original parameter preservation, table behavior, unique real application assets, provenance, and safe claims.
- Route only `hydraulic-four-roll-plate-rolling-machine` to the dedicated component; preserve every other product route and legacy redirect.

## SEO and Structured Data

- Title: `Hydraulic Four-Roll Plate Rolling Machine | Cylinder & Tank Shell Rolling Solution`
- Description: `Hydraulic four-roll plate rolling machine for plate pre-bending, cylinder forming, cone rolling, tank shells, pressure vessels, pipe sections and heavy fabrication workshops. Get a suitable hydraulic plate rolling solution based on your material, thickness and target diameter.`
- Product image alt: `Hydraulic four-roll plate rolling machine for cylinder and tank shell forming`
- Add the supplied keyword set, canonical, Open Graph, and Twitter metadata.
- Add `ProductModel`, `FAQPage`, and `BreadcrumbList`; omit offers, price, availability, ratings, and reviews.

## Responsive and Interaction Behavior

- Desktop hero uses copy left and product image right; mobile stacks content and uses full-width CTAs.
- Applications and content grids collapse to one column on narrow screens.
- Comparison and specification tables remain locally horizontally scrollable.
- FAQ uses native accessible disclosure controls.
- Product hero loads eagerly from the original static image; application photos load lazily.

## Verification

- Write and observe a failing focused contract before implementation.
- Run the focused verifier, all existing verifiers, ESLint, and the Next.js production build.
- Inspect desktop and `390 x 844` mobile rendering with the Browser plugin.
- Confirm one H1, exactly 21 primary sections, twelve loaded application photographs, no framework overlay, no relevant console errors, no document overflow, locally scrollable tables, and an operable FAQ.
- Push `main`, wait for Vercel production deployment, and verify the public route returns HTTP 200 with the dedicated marker and metadata.
