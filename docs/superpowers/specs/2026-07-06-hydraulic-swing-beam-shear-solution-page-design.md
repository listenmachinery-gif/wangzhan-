# Hydraulic Swing Beam Shear Solution Page Design

## Scope

Create a dedicated solution-oriented product page for the existing `hydraulic-swing-beam-shear` route. Preserve the current Header, Footer, brand colors, typography, product image, inquiry destinations, canonical route, and every original technical parameter row from `data/shearing-details.ts`.

The Foot Shear, Compact Electric Shearing Machine, Energy-Saving Electric Shearing Machine, and generic product pages remain visually and behaviorally unchanged.

## Architecture

Reuse the established `ShearingSolutionPage` server component. Add one focused wrapper and one centralized content module for the Hydraulic Swing Beam Shear. The dynamic product route selects the wrapper only for `product.id === "hydraulic-swing-beam-shear"`.

Extend the shared content contract with optional, backward-compatible modules for material capability, a two-machine comparison, and image callout positions. Existing product content does not opt into these modules and therefore keeps its current rendering. The shared component continues to read the real product image and original technical parameter values from the existing `Product` object.

## Content And UX

The page follows the approved shearing solution-page visual system and changes the narrative to stable hydraulic sheet cutting:

1. Dark industrial hero with the complete real product image, three production badges, three value points, and two inquiry CTAs.
2. Four buyer problems covering edge consistency, throughput, batch sizing, and maintenance.
3. Hydraulic cutting solution positioning with four configuration-focused fit points.
4. Four-step cutting process from loading to finished blank.
5. Six application cards for fabrication, HVAC, cabinets, stainless products, doors and windows, and structural parts.
6. Six material cards with model-dependent capacity wording and no unsupported thickness claims.
7. Six core feature modules using factual claims from the supplied content and existing product description.
8. One real product image with seven numbered callouts on desktop and a numbered text list on mobile; no fabricated detail imagery.
9. An objective Hydraulic Swing Beam Shear versus Hydraulic Guillotine Shear comparison.
10. The original technical parameter table from `data/shearing-details.ts`.
11. Six optional configuration cards.
12. Four-step selection, production, inspection, and support workflow.
13. Six FAQs.
14. Final CTA requesting material, thickness, cutting length, production frequency, and application.

The page does not add prices, stock status, invented capacities, fabricated detail photographs, or unverified CNC features as standard equipment.

## Technical Parameter Table

The table reads `product.technicalParameters` directly from `data/shearing-details.ts`; no original row or value is duplicated, reformatted, or replaced.

Column headings such as `CuttingThickness(mm)` render as two centered lines:

- `CuttingThickness`
- `(mm)`

The text before the unit remains intact. Data cells stay on one line. On mobile, the table scrolls horizontally inside its own container while the page itself remains within the viewport.

## SEO

- Title: `Hydraulic Swing Beam Shearing Machine | Sheet Metal Cutting Solution`
- Meta description: `Reliable hydraulic swing beam shearing machine for sheet metal cutting, suitable for carbon steel, stainless steel, galvanized sheet, aluminum and general fabrication workshops.`
- Exactly one H1: `Hydraulic Swing Beam Shearing Machine`
- Canonical: `/products/hydraulic-swing-beam-shear`
- Product, BreadcrumbList, and FAQPage JSON-LD without price, inventory, or offer data.
- Image alt: `Hydraulic swing beam shearing machine for sheet metal cutting`
- Buyer keywords appear naturally in editorial copy and metadata without keyword blocks.

## Validation

- A source contract verifies route isolation, centralized content, original parameter reuse, the six material cards, binary comparison, seven image callouts, six FAQs, SEO strings, schema types, and heading-unit formatting.
- TypeScript and the production build must pass.
- Desktop and mobile browser checks verify the full product image, callout fallback, page width, table-contained horizontal scrolling, original row count, centered unit headings, CTA links, FAQ behavior, and no regression on the three existing solution pages.
- The production page and sitemap entry are verified after deployment.
