# Small Electric Shearing Machine DOCX Refresh Design

## Goal

Refresh `/products/compact-electric-shearing-machine` from the supplied Word document while preserving the established ZYRON design system, the original Q11G technical parameters, and the existing nine FAQs.

## Content decisions

- Keep the existing route, metadata strategy, navigation, footer, hero product photography, comparison modules, manufacturer section, internal links, and quotation CTA.
- Rewrite the overview around compact motor-driven straight cutting for HVAC, roofing, signage, enclosure, and small/mixed-batch work.
- Present the documented all-steel welded frame, motor, cycloidal pinwheel reducer, brake, mechanical transmission, tool-steel blades, and adjustable back gauge without inventing performance claims.
- Expand the advantages to ten buyer-facing points from the document. The published 30 cuts per minute is described as cycle frequency, not finished-part throughput.
- Replace the applications with the eight document scenarios and the materials with mild steel, galvanized steel, aluminum, stainless steel, copper, and brass.
- Correct the Word document's copied references to a foot-operated shear so every statement accurately describes the Q11G small electric machine.

## Photography

Applications and materials use fourteen distinct, existing licensed real photographs already stored in the project. Every item supplies a descriptive alt attribute. The imagery illustrates representative environments and materials; it is not presented as a photograph of a ZYRON customer, project, or exact machine.

The shared shearing item type gains optional `image` and `alt` fields. The shared page renders a photo-led card only when an item provides media, preserving the current icon-only layout for other shearing pages.

## Data integrity

- `data/shearing-details.ts` remains unchanged.
- All eight existing Q11G rows remain the source of truth for the technical table and ProductModel schema.
- Table labels stay on one line and their units stay centered on a second line.
- The nine existing FAQs stay unchanged.
- Capacity guidance continues to require material grade, tensile strength, hardness or temper, thickness, cutting length, blade condition, and blade clearance review.

## Validation

- A media/content contract must fail before implementation and pass afterward.
- The existing small-electric SEO contract, energy-saving shear contract, and foot-shear contracts must remain green.
- ESLint and a production Next.js build must pass.
- Browser QA covers desktop and mobile layouts, real image loading, table overflow containment, FAQ interaction, and console health.
- The verified commit is merged to `main`, pushed, and the live canonical URL is checked after deployment.
