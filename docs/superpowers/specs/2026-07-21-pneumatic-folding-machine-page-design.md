# Pneumatic Folding Machine Solution Page Design

**Date:** 2026-07-21  
**Status:** Approved for implementation planning  
**Route:** `/products/pneumatic-sheet-metal-folding-machine`

## Goal

Replace the shared product-detail presentation for the Pneumatic Sheet Metal Folding Machine with a dedicated, professional solution page for thin-sheet pneumatic folding and rectangular HVAC duct fabrication. Preserve the existing site shell and verified product data while making compressed-air requirements, workflow fit, machine selection and real application environments easy to understand.

## Confirmed implementation approach

Create a dedicated page component and a dedicated typed content module. Reuse the existing header, footer, navigation, contact route, color tokens, typography, button treatment and responsive conventions. Do not refactor the existing Manual Folding Machine page or enlarge the shared `ProductSolutionPage` with product-specific logic.

The dedicated route will be selected in `app/products/[id]/page.tsx` before the shared fallback.

## Page structure

The page uses the following ordered sections:

1. Hero
2. What Problems Can It Solve?
3. Pneumatic Sheet Metal Folding Solution
4. Applications
5. Materials
6. Compressed Air Requirement
7. From Flat Sheet to Folded Duct Panel
8. Why Choose This Pneumatic Folding Machine?
9. Pneumatic vs Manual vs Electric vs Hydraulic Folding Machine
10. Build a Complete HVAC Duct Fabrication Workflow
11. How to Choose the Right Pneumatic Folding Machine?
12. Technical Specifications
13. FAQ
14. Final CTA

The global `SiteHeader` and `SiteFooter` remain unchanged.

## Hero

Use the approved left-copy/right-product layout on a dark titanium-gray industrial background. The existing catalog image `/products/catalog/pneumatic-sheet-metal-folding-machine.png` is the only machine image and must retain its structure, proportion, colors and branding. It may receive a restrained drop shadow, glass-platform frame and subtle background light, but no generated or simulated close-up imagery.

Visible copy is fixed to the supplied brief:

- H1: `Pneumatic Folding Machine`
- Subtitle: `Efficient air-driven sheet metal folding solution for HVAC duct fabrication and thin metal forming.`
- Description: `A practical pneumatic folding machine for thin sheet metal bending, duct panel folding and edge forming. Driven by compressed air, it helps workshops reduce manual labor, improve daily folding efficiency and support rectangular duct production.`
- Primary CTA: `Get Pneumatic Folding Solution`
- Secondary CTA: `Request Machine Configuration`
- Proof points: `Air-driven Folding`, `Suitable for HVAC Duct Panels`, `Easier Than Manual Folding`, `Practical for Thin Sheet Metal`

Both CTAs link to `/contact`. The image alternative text is `Pneumatic folding machine for HVAC duct sheet metal folding`.

## Content and evidence boundaries

Use the supplied English content for pain points, solution cards, applications, materials, compressed-air guidance, process steps, comparison table, workflow equipment, selection prompts, FAQs and final CTA. Copy may be edited only for grammar, consistent terminology and responsive readability; it must not introduce unsupported performance numbers or commercial claims.

The existing project data verifies these pneumatic-machine statements and they may be used:

- Compressed air is the power source.
- The machine has a four-cylinder pneumatic structure.
- Two cylinders perform folding and two cylinders perform clamping.
- Foot-pedal control operates clamping, folding and releasing.
- The machine is intended for thin-sheet folding, flanging and angle forming.
- The upper and lower die movements are adjustable for suitable box, tray and multi-sided workpieces.

Do not claim an oil-water separator, pressure gauge, heavy welded frame, precise air pressure, air consumption, production rate or any other unverified structure or capacity. The compressed-air section uses the supplied non-numeric confirmation language:

- `Air pressure: Please confirm with our sales engineer`
- `Air consumption: Depends on machine model and production frequency`

## Real application photography

Applications use eight new, non-repeating real photographs. They must not reuse any file or source photo from `public/products/manual-folding-applications`. The eight stable local paths are:

- `/products/pneumatic-folding-applications/hvac-duct-panel-folding.webp`
- `/products/pneumatic-folding-applications/rectangular-air-duct-fabrication.webp`
- `/products/pneumatic-folding-applications/ventilation-duct-workshop.webp`
- `/products/pneumatic-folding-applications/galvanized-sheet-folding.webp`
- `/products/pneumatic-folding-applications/light-sheet-metal-fabrication.webp`
- `/products/pneumatic-folding-applications/electrical-cabinet-enclosure.webp`
- `/products/pneumatic-folding-applications/stainless-steel-light-forming.webp`
- `/products/pneumatic-folding-applications/construction-sheet-metal-work.webp`

Select photos from a source that permits commercial website use, download them rather than hotlinking, convert them to consistent local WebP assets and record the license page, source page, creator and access date in `public/products/pneumatic-folding-applications/SOURCES.md`. The manifest must state that the images illustrate general application environments and do not depict ZYRON customers, customer projects or the exact ZYRON machine.

Every application card uses a descriptive alt value, a consistent 16:9 media area, responsive `sizes` and `object-cover`. Below-the-fold photos retain lazy loading. Reject images with prominent third-party branding, unsafe work, irrelevant machinery or misleading product identity.

## Component and data design

Add a serializable typed content module at `data/pneumatic-folding-machine-page.ts`. It owns the page copy, application image mappings, comparison content, workflow links, selection questions and FAQ data.

Add a server component at `components/PneumaticFoldingMachineSolutionPage.tsx`. Small internal helpers may cover section introductions, technical-heading presentation and escaped JSON-LD. Keep all code-native text, tables, links and controls as HTML/React content. Do not ship a screenshot as interface content.

The component must fail clearly during development when `product.technicalParameters` is absent. Optional internal-link entries are rendered only after their routes are verified in the catalog.

## Technical specification contract

Use the existing `pneumatic-folding-machine` data in `data/bending-details.ts` as the single parameter source. Preserve all five rows and every cell exactly:

| Model | Minimum Bending Angle | Bending Thickness | Bending Width | Weight | Overall Dimensions |
| --- | --- | --- | --- | --- | --- |
| QS-1.5 x 1000 | 60 deg | 0.3-1.5 mm | 1000 mm | 380 kg | 1650 x 680 x 1350mm |
| QS-1.5 x 1300 | 60 deg | 0.3-1.5 mm | 1300 mm | 420 kg | 1980 x 800 x 1350mm |
| QS-1.5 x 1500 | 60 deg | 0.3-1.5 mm | 1500 mm | 550 kg | 2180 x 800 x 1350mm |
| QS-1.5 x 2000 | 60 deg | 0.3-1.5 mm | 2000 mm | 620 kg | 2680 x 800 x 1350mm |
| QS-1.5 x 2500 | 60 deg | 0.3-1.5 mm | 2500 mm | 700 kg | 3180 x 800 x 1350mm |

Do not edit those values to normalize spacing or units. The dedicated component applies presentation-only headings:

| Connected label | Centered unit line |
| --- | --- |
| Model | none |
| Minimum Bending Angle | `(deg)` |
| Bending Thickness | `(mm)` |
| Bending Width | `(mm)` |
| Weight | `(kg)` |
| Overall Dimensions | `(mm)` |

The connected label has `white-space: nowrap`. The unit is a centered block on the next line. Desktop presents the complete table within the content region; narrow screens scroll only the table wrapper horizontally. The note below the table is: `Final specifications depend on sheet material, thickness, bending length, air pressure and selected machine configuration.`

## Visual and responsive system

- Backgrounds: `#0B0D10`, graphite and titanium-gray gradients, plus controlled white or pale-gray reading sections.
- Accent: existing `#76B900` and current hover token.
- Text: white and zinc on dark sections; neutral near-black and gray on light sections.
- Containers: open sections, fine dividers and restrained glass panels; no repetitive nested card shells.
- Cards: fine borders, small or square corners, restrained shadows and a subtle hover lift.
- Typography: existing font stack with exactly one H1 and semantic H2/H3 hierarchy.
- Motion: no decorative or exaggerated animation; respect reduced-motion preferences.
- Desktop: two-column hero, three-column solution cards and four-column application grid where space permits.
- Tablet: two-column photo grid and wrapped workflow layout.
- Mobile: stacked hero, single-column cards, full-width CTA buttons, no document-level horizontal overflow and table-only horizontal scrolling.

Do not use line drawings in the Applications section. Any code-native process visualization must be limited to numbered steps and connectors, not a substitute for the required real industry photographs.

## Comparison and workflow behavior

The Manual, Pneumatic, Electric and Hydraulic comparison remains neutral. It compares power source, production volume, operator effort, folding efficiency, utilities, cost level and recommended use without disparaging any machine type.

The HVAC workflow lists shearing, beading, lock forming, TDF flange forming, pneumatic folding, lock seam closing and press-brake roles. Only existing catalog routes may be linked. The section must explain that the pneumatic folder is a supporting machine in a complete rectangular-duct fabrication workflow, not only an isolated product.

The selection section lists the supplied material, thickness, length, angle, flange, work type, location, quantity, air-pressure, compressor-capacity and companion-equipment questions. Its CTA links to `/contact`.

## SEO and structured data

- Title: `Pneumatic Folding Machine | HVAC Duct Sheet Metal Folding Solution`
- Description: `Pneumatic folding machine for thin sheet metal bending, HVAC duct panel folding, galvanized sheet forming and rectangular air duct fabrication. Get a suitable air-driven folding solution.`
- Canonical: `/products/pneumatic-sheet-metal-folding-machine`
- Open Graph and Twitter image: existing pneumatic product image
- Keywords: all ten phrases supplied in the brief
- JSON-LD: `ProductModel`, `BreadcrumbList` and `FAQPage`

The product schema includes brand, manufacturer, category, URL, image, description and properties derived from the verified parameter table. It omits offers, prices, availability, ratings and reviews.

## Verification

Add a focused source contract for the dedicated route. It verifies:

- Exact route and metadata
- Exactly one H1
- All fourteen sections in the approved order
- Hero copy and image alt
- All five exact QS rows from the existing source
- Connected table labels and centered second-line units
- Table-only mobile horizontal scrolling
- Eight unique local WebP application paths that do not overlap the Manual Folding Machine set
- Non-empty photo alt values and a complete source manifest
- Safe JSON-LD without commercial or review fields
- Valid catalog-backed internal links

Update the all-product solution-page contract to include the new dedicated route. Then run the focused contract, all existing product-page verification scripts, ESLint, TypeScript through the Next.js production build and `npm run build`.

Use the in-app browser for final visual QA at desktop and narrow mobile sizes. Check first-viewport balance, every image crop and load state, heading hierarchy, FAQ operation, CTA and internal links, console health, document-level overflow and table-only scrolling. Capture the final desktop and mobile page for inspection before handoff.

## Scope boundary

Change only the Pneumatic Sheet Metal Folding Machine dedicated experience, its page-specific data, local application photographs, metadata, route selection and focused verification files. Do not change global navigation or footer content, alter unrelated product pages, rewrite the shared product system, add dependencies, deploy the site, invent detail imagery, or modify the original technical parameter values.
