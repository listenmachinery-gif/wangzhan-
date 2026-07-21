# Reel Shear Beading Machine Product Page Design

## Objective

Rename the current `Slitting and Beading Machine` product to `Reel Shear Beading Machine` and replace its shared product layout with a dedicated, solution-oriented detail page for thin-sheet cutting and reinforcement beading. Preserve the verified parameter values already stored in the project and deploy the completed page to the existing production site.

## Selected Approach

Use a dedicated page component and a product-specific content configuration.

This approach is selected over two alternatives:

1. A name-and-table-only edit would be smaller but would not satisfy the requested solution positioning, materials, workflow, comparison, FAQ, and inquiry guidance.
2. Extending the shared page for all products would increase reuse but would couple unrelated product categories to reel-shear-specific content and presentation.

The dedicated component will continue to use the global header, footer, typography, brand colors, buttons, and responsive conventions.

## Product Identity and URL Migration

- Product display name and H1: `Reel Shear Beading Machine`.
- Canonical product URL: `/products/reel-shear-beading-machine`.
- Permanently redirect the previous canonical URL `/products/slitting-and-beading-machine` and the existing alias `/products/roller-shear-beading-machine` to the new canonical URL.
- Keep using the existing product image at `/products/catalog/slitting-and-beading-machine.png`; do not generate, modify, or fabricate detail images.
- Image alt: `Reel shear beading machine for sheet metal cutting and duct beading`.

## Page Architecture

The dedicated page will contain one H1 and the following modules:

1. Hero with solution positioning, four value points, and two contact CTAs.
2. Customer pain points explaining the production problems the machine can address.
3. Three solution-fit cards for job-site duct work, small HVAC workshops, and supporting use in duct lines.
4. Application grid for HVAC, ventilation, galvanized sheet, construction-site, light sheet, and duct reinforcement work.
5. Material cards with a non-fabrication capacity disclaimer.
6. Six-stage sheet-to-reinforced-panel workflow.
7. Machine advantages based only on verified functions and current product information.
8. Objective comparison between a reel shear beading machine and a multi-line duct beading machine.
9. Selection checklist and configuration inquiry CTA.
10. Technical parameter table using the existing verified values.
11. FAQ accordion and FAQPage structured data.
12. Internal links to relevant duct and sheet-metal machines.
13. Final consultation CTA.

## Verified Technical Parameters

The parameter values remain unchanged:

| Model | Sheet Thickness | Shape | Power | Weight | Dimensions L × W × H |
| --- | --- | --- | --- | --- | --- |
| LQ-15 | 0.5–1.2 mm | Beading / slitting profiles | 1.5 kW | 260 kg | 1600 × 630 × 1120 mm |

The header row will keep each field label on one unbroken line. When a field has a unit, the unit will render on a separate centered line below the label. The table will remain horizontally scrollable on narrow screens.

## Content and Truthfulness Rules

- Describe the machine as a compact cutting and beading solution for thin sheet and HVAC duct preparation.
- Do not claim CNC, automatic operation, guaranteed performance gains, maximum capacity beyond the verified table, prices, stock, ratings, reviews, or unsupported customization.
- Material suitability remains conditional on material strength, thickness, configuration, and tooling confirmation.
- Tooling customization language remains conditional on engineering confirmation.
- Do not position the machine as a replacement for a complete automatic duct production line.

## Visual System and Responsiveness

- Reuse the current industrial system: `#0B0D10`, titanium/black gradients, white and neutral text, and `#76B900` accents.
- Use the existing product image once as the hero visual on a dark industrial stage.
- Use restrained borders, open editorial bands, process connectors, comparison tables, and light hover elevation instead of promotional tiles or excessive icons.
- Desktop hero: copy left, image right.
- Mobile hero: stacked layout, single-column cards, full-width CTAs, no page-level horizontal overflow.
- Only the technical and comparison table wrappers may scroll horizontally on mobile.

## SEO and Structured Data

- Meta title: `Reel Shear Beading Machine | Sheet Metal Cutting and Beading Solution`.
- Meta description: `Compact reel shear beading machine for thin sheet metal cutting, plate opening and reinforcement beading. Suitable for HVAC duct fabrication, ventilation duct workshops and light sheet metal processing.`
- Include the requested primary and supporting keywords in metadata and natural page copy.
- Add ProductModel, BreadcrumbList, and FAQPage JSON-LD.
- Omit offers, price, availability, rating, and review fields.

## Implementation Boundaries

- Add one dedicated content configuration and one dedicated server component.
- Add a product-specific metadata and render guard in the existing dynamic route.
- Add a product image override to the seed model so the renamed product can reuse its existing asset without duplicating files.
- Preserve all other product pages, global navigation, global footer, and shared layout behavior.

## Verification and Deployment

- Update the existing reel-shear contract test before production code and confirm it fails for the missing behavior.
- Make the minimal implementation pass the updated contract.
- Run all existing verification scripts, TypeScript checking, the requested lint command, and a production build.
- Verify the page at desktop and mobile widths, including one H1, image loading, no page overflow, table header layout, CTA navigation, and valid JSON-LD.
- Deploy through the repository's existing Vercel project, then verify the canonical production URL, redirects, sitemap, and production HTML.
