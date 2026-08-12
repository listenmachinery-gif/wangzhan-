# Semi-Automatic Three-Roll Plate Rolling Machine Page Design

## Goal

Replace the generic product detail route for the Semi-Automatic Three-Roll Plate Rolling Machine with a dedicated, high-end industrial solution page for small and medium workshops producing cylinders, arcs, cones, pipe sections, shells, and curved sheet-metal parts.

## Approved Direction

Use a dedicated data-driven page modeled on the existing Electric Two-Roll Plate Rolling Machine solution page, without copying its two-roll claims or application photography. Keep the global header, footer, typography, brand colors, inquiry paths, product route, and responsive conventions unchanged.

## Visual System

- Use dark titanium gray and black-gray gradients, white primary text, restrained gray supporting text, and `#76B900` as the only accent color.
- Use the existing transparent-background product image as the only machine image. Do not generate or fabricate close-up machine details.
- Present the machine on a restrained glass/metal stage with soft shadow and light reflection while preserving its structure, proportions, colors, and branding.
- Use thin borders, compact typography, restrained hover lift, and no promotional badges, price, QR code, or exaggerated animation.
- Use ten newly sourced real application photographs. None may reuse an image file or source photograph from the Electric Two-Roll Plate Rolling Machine page. Each image must have source and license notes.

## Page Structure

Render exactly 18 visible sections in this order:

1. Hero
2. Rolling problems
3. Semi-automatic rolling solutions
4. Applications with real photographs
5. Materials
6. Shapes the machine can form
7. Flat-plate-to-rolled-part process
8. Why pre-bending matters
9. How three-roll plate rolling works
10. Semi-automatic workshop operation
11. Machine advantages
12. Manual three-roll vs semi-automatic three-roll vs four-roll comparison
13. Complete fabrication workflow
14. Configuration and selection guide
15. Technical specifications
16. Workshop preparation and operation notes
17. FAQ
18. Final CTA

The application section overrides the attachment's optional line-art direction: it must use real photographs and no SVG/line-art application cards. Technical explanatory modules may use CSS diagrams and numbered process cards, but no fake machine-detail imagery.

## Product Claims and Machine Structure

The page may safely state that the product is a semi-automatic three-roll plate rolling machine used for cylinders, arcs, compatible cones, and general curved forming. The existing main photograph visibly supports three working rolls, external gear drive, mechanical adjustment points, and a rigid fabricated frame. Configuration-dependent features such as pre-bending method, cone attachment, drop-end discharge, foot pedal, motor/reducer details, electrical controls, or powered roll positioning must remain explicitly optional or subject to configuration confirmation.

Do not claim numeric capacity, guaranteed roundness, zero straight edge, one-pass forming, fixed automation level, or unverified accuracy.

## Parameters

Preserve the four existing project values verbatim:

- Rolling capacity: `Selected by plate thickness, width, material, and minimum diameter`
- Roll structure: `Two-roll, three-roll, or four-roll construction`
- Operation: `Electric, semi-automatic, fully automatic, or hydraulic`
- Workpiece: `Cylinders, arcs, cones, and curved sheet components`

Do not import external numeric parameters. The product has no confirmed model number, so every additional proposed specification uses exactly `Customizable / Please confirm with our sales engineer`.

The first table row must keep each heading label on one line. Units, where applicable, render as a centered second line below the label. The table remains locally horizontally scrollable on mobile and must not create document-level overflow.

## Architecture

- Add `data/semi-automatic-three-roll-plate-rolling-machine-page.ts` for all page copy, image mappings, table presentation metadata, comparison data, FAQ, and internal links.
- Add `components/SemiAutomaticThreeRollPlateRollingMachineSolutionPage.tsx` as a server component that renders the 18 sections and JSON-LD.
- Add a focused contract verifier that proves routing, metadata, section order, original parameter preservation, table behavior, real unique application assets, source notes, and safe schema fields.
- Route only `semi-automatic-three-roll-plate-rolling-machine` to the dedicated component. Keep legacy IDs and all other product routes unchanged.

## SEO and Structured Data

- Title: `Semi-Automatic Three-Roll Plate Rolling Machine | Cylinder & Cone Rolling Solution`
- Description: `Semi-automatic three-roll plate rolling machine for cylinder forming, arc bending, cone rolling, tank shells, duct parts and metal fabrication workshops. Get a suitable plate rolling solution based on your material, thickness and target diameter.`
- Product image alt: `Semi-automatic three-roll plate rolling machine for cylinder and cone forming`
- Add the supplied keyword set to route metadata.
- Add `ProductModel`, `FAQPage`, and `BreadcrumbList` JSON-LD. Omit `offers`, price, availability, reviews, and ratings.

## Responsive and Interaction Behavior

- Desktop hero uses text left and product image right; mobile stacks content with full-width CTAs.
- Applications and content cards collapse to one column on narrow screens.
- Process and comparison content remains readable through responsive grids or local horizontal scrolling.
- FAQ uses native accessible disclosure controls.
- Inquiry buttons route to the existing contact page; no new form or dependency is introduced.

## Verification

- Use test-driven development: add the focused page contract and observe it fail before implementation.
- Run the focused verifier, all existing product verifiers, ESLint, and the Next.js production build.
- Inspect the rendered route at desktop and `390 × 844` mobile viewport.
- Confirm exactly one H1, exactly 18 primary sections, no framework overlay, no relevant console errors, no document-level horizontal overflow, all ten real application images load, the table scrolls locally, and one FAQ opens correctly.
- Push `main`, wait for Vercel production deployment, and confirm the live route contains the dedicated page marker.
