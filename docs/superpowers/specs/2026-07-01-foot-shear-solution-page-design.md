# Foot Shear Solution Page Design

## Scope

Create a dedicated English product-detail experience for the existing `foot-shear` product while preserving the shared header, footer, route generation, product image, inquiry path, and all other product pages.

The legacy URL `/products/foot-operated-shearing-machine` continues to redirect to `/products/foot-shear` through the existing redirect configuration.

## Selected Approach

Add a dedicated server component rendered only when `product.id === "foot-shear"` from the existing dynamic product route.

This is preferred over:

1. Adding many foot-shear conditionals to the generic page, which would make the shared template harder to maintain.
2. Replacing the generic product template for every machine, which would exceed the requested scope and risk regressions across 52 other pages.

## Content And Data

- Keep the existing Q11 technical parameter table from `data/shearing-details.ts` as the source of truth.
- Keep and reuse the existing foot-shear product image.
- Reuse confirmed performance and advantage content where it supports the solution narrative.
- Store dedicated page copy, process steps, applications, structure labels, comparison data, FAQ content, and solution services in one page-data module.
- Do not invent additional product photography or unsupported precision claims.

## Page Structure

1. Hero: solution label, SEO-focused H1, summary, three value points, two inquiry CTAs, complete machine image, and compact model facts.
2. Customer problems: four concise pain-point cards.
3. Solution fit: practical positioning copy plus a fit checklist.
4. Cutting workflow: five numbered CSS layout steps from positioning to finished cut.
5. Applications: five industry cards with specific fit explanations.
6. Core advantages: six evidence-based product value cards.
7. Structure overview: the same real machine image plus six numbered structure labels; no fake detail imagery.
8. Technical parameters: the original Q11 table rendered responsively with horizontal scroll on small screens.
9. Solution comparison: foot, electric, and hydraulic shear selection matrix.
10. Service value: four support cards.
11. FAQ: six accessible disclosure items and matching `FAQPage` structured data.
12. Final CTA: quote and engineer-contact actions.

## Visual Direction

- Follow the current ZYRON dark graphite and `#76B900` brand system.
- Use restrained gradients, borders, spacing, image glow, and hover states.
- Do not use promotional pricing, fake metrics, decorative card nesting, handcrafted SVG artwork, or fabricated machine detail images.
- Desktop uses editorial two-column sections where useful; mobile collapses to one column without horizontal page overflow.

## SEO And Structured Data

- Dedicated title and meta description from the supplied brief.
- Exactly one H1 and logical H2/H3 hierarchy.
- Product, BreadcrumbList, and FAQPage JSON-LD on the page.
- Canonical URL remains `/products/foot-shear` so redirects and sitemap stay consistent.
- Product image alt text: `Foot operated shearing machine for sheet metal cutting`.

## Interactions

- Existing links and inquiry paths remain functional.
- FAQ disclosures use native accessible details/summary behavior.
- Hover transitions are subtle and CSS-only.
- No client-side animation dependency is added.

## Verification

- TypeScript and production build pass.
- Existing product pages remain rendered by the generic template.
- Desktop and 390 px mobile screenshots show no cropping, overlap, or horizontal page overflow.
- Original Q11 parameter values match the existing data source.
- Structured data scripts include Product, BreadcrumbList, and FAQPage.
- Live deployment is checked after pushing the implementation.
