# Energy-Saving Electric Shear Solution Page Design

## Scope

Create a dedicated solution-oriented product page for the existing `energy-saving-electric-shearing-machine` route. Preserve the current Header, Footer, brand colors, typography, product image, inquiry destinations, canonical route, and every original technical parameter row from `data/shearing-details.ts`.

The existing Foot Shear, Small Electric Shearing Machine, and generic product pages remain visually and behaviorally unchanged.

## Architecture

Reuse the established `ShearingSolutionPage` server component that already powers the Foot Shear and Small Electric Shearing Machine pages. Add a focused product wrapper and a centralized content module for the Energy-Saving Electric Shearing Machine. The dynamic product route selects the new wrapper only when `product.id === "energy-saving-electric-shearing-machine"`.

The shared component continues to read the product image and original technical parameter values from the existing `Product` object. Product-specific headings, buyer problems, solution copy, workflow, applications, advantages, structure explanations, comparison data, support copy, FAQs, and schema copy live in the new centralized content module.

## Content And UX

The page follows the established solution-page visual system while adapting the narrative to energy-conscious thin-sheet production:

1. Dark industrial hero with one complete product image, four energy-saving value points, three product badges, and two inquiry CTAs.
2. Four buyer problems covering power cost, idle power waste, noise, and maintenance complexity.
3. Thin-sheet cutting solution positioning with a seven-item Solution Fit checklist.
4. A dedicated energy-use logic section explaining standby, cutting action, and daily workshop operation without unsupported percentage claims.
5. Five-step cutting workflow from sheet preparation to the next forming process.
6. Six application cards for HVAC, galvanized sheet, roofing, cabinets, small-batch work, and general metalworking.
7. Seven operational advantages using restrained, verifiable industrial language.
8. Structure overview using the existing real product image and seven numbered explanations; no fabricated detail images.
9. Foot-operated, energy-saving electric, and hydraulic shear comparison to support buyer selection.
10. Original technical parameter table from `data/shearing-details.ts`.
11. Cutting-to-duct-assembly workflow.
12. Four project support items.
13. Eight FAQs.
14. Final inquiry CTA requesting material, thickness, cutting length, daily frequency, and application.

The page does not add prices, stock status, unsupported energy-saving percentages, fabricated performance claims, or fake equipment imagery.

## Technical Parameter Table

The table reads `product.technicalParameters` from `data/shearing-details.ts`; the original rows and values are not duplicated or replaced.

Column headings such as `Max. Shearing Thickness(mm)` render as two centered lines:

- `Max. Shearing Thickness`
- `(mm)`

The text before the unit remains intact. Data cells remain on one line to prevent irregular wrapping. On mobile, the table scrolls horizontally inside its own container while the page stays within the viewport.

## SEO

- Title: `Energy-Saving Electric Shearing Machine | Thin Sheet Cutting Solution | ZYRON`
- Meta description: `Energy-saving electric shearing machine for thin sheet metal cutting, HVAC duct fabrication, galvanized sheet processing and daily workshop production. Get a lower-cost cutting solution from ZYRON Heavy Industry.`
- Exactly one H1: `Energy-Saving Electric Shearing Machine for Thin Sheet Cutting`
- Canonical: `/products/energy-saving-electric-shearing-machine`
- Product, BreadcrumbList, and FAQPage JSON-LD without price, inventory, or offer data.
- Image alt: `Energy-saving electric shearing machine for thin sheet metal cutting`
- Keywords are used naturally in visible copy and metadata without repetition blocks.

## Validation

- A source contract verifies route isolation, centralized content, original parameter reuse, eight FAQs, SEO strings, schema types, and heading-unit formatting.
- TypeScript and the production build must pass.
- Desktop and mobile browser checks verify image loading, viewport width, internal table scrolling, original row count, centered unit headings, CTA links, FAQ rendering, and no regression on the Foot Shear or Small Electric Shearing Machine pages.
- The production deployment is verified after the GitHub push completes.
