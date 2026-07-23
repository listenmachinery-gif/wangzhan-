# Electric Two-Roll Plate Rolling Machine Page Design

## Objective

Replace the generic product-detail rendering for `electric-two-roll-plate-rolling-machine` with a dedicated English solution page focused on fast thin-sheet cylinder forming, small-diameter round parts, repeat production, and practical workshop integration.

## Approval and Constraints

The user has given standing approval to proceed without questions or interruptions and to deploy the recommended result. The page must preserve the current machine image and original parameter basis, use real application photography, avoid fake detail imagery, omit prices, and never invent model-specific capacities.

## Recommended Architecture

Use a dedicated server-rendered page component and a separate typed content module. Route selection and metadata remain in `app/products/[id]/page.tsx`, while all page-specific copy, tables, FAQ content, application-photo metadata, and source mappings live in one data file. This keeps the existing generic product system unchanged for all other products.

Rejected alternatives:

1. Expanding `ProductSolutionPage` would increase regression risk for every generic product.
2. Copying a previous laser page without a typed data boundary would create a large, hard-to-review component with machine-specific copy embedded throughout.

## Visual System

- Palette: `#0B0D10` base, `#12161A` panels, `#1B2024` raised surfaces, white headings, zinc supporting text, and `#76B900` accents.
- Hero: split layout with copy on the left and the original transparent PNG on a restrained industrial stage on the right.
- Typography: compact industrial display scale, generous body leading, no promotional eyebrow above the H1.
- Cards: square or two-pixel corners, fine borders, subtle hover lift, no decorative icon overload.
- Application photography: real production or finished-product photographs in consistent 4:3 crops with descriptive alt text.
- Diagrams: limited to simple HTML/CSS process and comparison structures; no fake photographic detail views and no line-art application substitutes.

## Information Architecture

The page contains exactly 17 top-level sections:

1. Hero
2. Rolling problems
3. Thin-sheet cylinder solutions
4. Real applications
5. Materials
6. Cylindrical part types
7. Flat-sheet-to-cylinder process
8. Two-roll design explanation
9. Electric drive explanation
10. Advantages
11. Two-roll / three-roll / four-roll comparison
12. Complete cylinder fabrication workflow
13. Selection guide
14. Technical specifications
15. Workshop preparation and operation notes
16. FAQ
17. Final CTA

## Product Truthfulness

- Reuse the existing four source specifications from `product.specs`: rolling capacity, roll structure, operation, and workpiece.
- In the expanded parameter table, map only those four confirmed source values and the product name.
- Use `Customizable / Please confirm with our sales engineer` for rolling length, sheet thickness, minimum diameter, roller material, roller diameters, lower roller type, motor power, rolling speed, voltage, machine size, and machine weight unless a reliable product-specific value already exists.
- General two-roll operating principles may be supported by primary manufacturer references, but external model capacities must not be presented as ZYRON specifications.
- Qualify polyurethane/rubber lower rollers, unloading devices, foot controls, and related features as configuration-dependent unless confirmed in current product data.

## Parameter Table

Use a responsive table inside a local horizontal scroller. Each column heading is normalized so its descriptive label remains on one unbroken line and a trailing unit such as `(mm)`, `(kW)`, `(m/min)`, or `(kg)` is rendered on a separate centered line. The page itself must never gain horizontal overflow.

## Real Application Photography

Use ten real photographs for:

- HVAC round duct parts
- Ventilation sleeves
- Filter shells
- Exhaust pipes and covers
- Fire extinguisher shells
- Small tank shells
- Lighting covers
- Stainless-steel cylindrical products
- Thin-sheet metal shells
- General sheet-metal workshops

Store the assets locally under `public/products/electric-two-roll-plate-rolling-machine-applications/` with a `SOURCES.md` ledger. Photographs are representative application references, not customer cases and not claimed to show this exact machine.

## SEO and Structured Data

- One H1: `Electric Two-Roll Plate Rolling Machine`
- Title: `Electric Two-Roll Plate Rolling Machine | Thin Sheet Cylinder Rolling Solution`
- Description: the exact user-supplied description.
- Canonical: `/products/electric-two-roll-plate-rolling-machine`
- Keywords: all ten supplied English search terms.
- JSON-LD: `ProductModel`, `FAQPage`, and `BreadcrumbList`; omit `offers`.
- Image alt: `Electric two-roll plate rolling machine for thin sheet cylinder forming`.
- Add internal links only to routes that exist in the current catalog.

## Responsive and Interaction Behavior

- Desktop hero is a two-column composition; mobile stacks text, CTAs, and machine image.
- Mobile CTA buttons are full width.
- Application and content grids collapse to one column.
- Tables scroll within their own containers.
- FAQ uses native `details`/`summary` for keyboard-accessible disclosure without client JavaScript.
- Images use Next.js optimization and lazy loading outside the hero.
- Motion respects `prefers-reduced-motion`.

## Verification

- Add a dedicated contract script that checks the route, metadata, 17-section marker contract, one H1, original product image, real-photo assets, parameter mappings, split unit rendering, no offers/price, FAQ/Product/Breadcrumb schema, and local table scrolling.
- Verify red/green behavior before and after implementation.
- Run related rolling-page or generic page checks if available, full ESLint, and a production Next.js build.
- Inspect the page at 1280×720 and 390×844, confirm no document overflow, verify all application images load, and expand at least one FAQ.
- Deploy to the existing Vercel production project and verify the custom-domain page and sitemap return the new page.
