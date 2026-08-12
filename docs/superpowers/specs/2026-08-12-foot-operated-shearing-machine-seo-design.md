# Foot Operated Shearing Machine SEO Design

## Objective

Improve the existing `/products/foot-shear` product page for the commercial query `foot operated shearing machine` while preserving the current industrial visual system, the canonical URL, responsive behavior, and the verified Q11 product data.

## URL and Indexing

- Keep `/products/foot-shear` as the only canonical product URL.
- Keep the existing permanent redirect from `/products/foot-operated-shearing-machine`.
- Keep the canonical page indexable and present in `sitemap.xml`.
- Do not create Q01, keyword-variant, city, country, or doorway pages.
- Do not add a `meta name="keywords"` tag for this page.

## Search Targeting

- Primary query: `foot operated shearing machine`.
- Cover close variants naturally in buyer-focused copy: `foot shearing machine`, `foot shear machine`, `pedal shearing machine`, `foot pedal shearing machine`, `sheet metal foot shear`, `manual sheet metal shearing machine`, `manual metal shear`, and `mechanical shearing machine`.
- Add commercial context through manufacturer/supplier, quotation, model selection, export, and workshop-fit language without repeating exact-match phrases unnaturally.
- Use the verified Q11 model family. Do not present Q01 model terms because the repository contains no Q01 parameter source.

## Metadata

- Title: `Foot Operated Shearing Machine for Sheet Metal | ZYRON`
- Description: `Foot operated shearing machine for accurate cutting of mild steel, galvanized steel and suitable thin sheet. No electricity required; ideal for light fabrication.`
- Canonical: `https://www.zyroncnc.com/products/foot-shear`
- One H1 only: `Foot Operated Shearing Machine`
- Hero subtitle: `Manual Sheet Metal Cutting Without Electricity`

## Page Structure

1. Hero with category breadcrumb, exact H1, buyer summary, and product image.
2. Product Overview explaining the manual mechanical cutting principle and workshop fit.
3. Manual Sheet Metal Cutting Without Electricity explaining the energy path.
4. What Problems This Machine Solves.
5. Why Choose Our Foot Shearing Machine.
6. Materials Suitable for Foot Shearing with a capacity disclaimer.
7. Key Machine Features grounded in repository product data.
8. How the Foot Pedal Mechanism Works.
9. Technical Specifications using the existing HTML Q11 table.
10. Available Models derived from the same Q11 table, not duplicated invented data.
11. Application Industries with six concise use cases.
12. Foot Shear vs Electric Shearing Machine with neutral decision criteria.
13. How to Choose the Right Foot Shearing Machine with six purchasing factors.
14. Manufacturing Details and Quality Control Points, limited to documented construction and order-confirmation facts.
15. Ten buyer FAQs.
16. Related equipment links and Request a Quote CTA.

## Product Data Rules

- Preserve Q11-1 x 1000, Q11-1 x 1300, and Q11-1 x 1500 exactly as stored in `data/shearing-details.ts`.
- Explain that the table's 1.0 mm value is model data and that actual capacity depends on material tensile strength, grade, thickness, sheet condition, and model.
- Mild steel, galvanized steel, and aluminum may be described as suitable thin-sheet materials based on existing product/category content.
- Stainless steel must be described conditionally and requires grade/thickness confirmation.
- Do not claim a copper capacity.
- Do not add price, inventory, ratings, reviews, certificates, awards, sales volume, or unsupported factory metrics.

## Internal Links

- Link the breadcrumb and related-equipment area to `/products/series/shearing-machines`.
- Link higher-volume buyers to `/products/compact-electric-shearing-machine` with descriptive anchor text.
- Link higher-capacity buyers to `/products/hydraulic-swing-beam-shear` and `/products/hydraulic-guillotine-shear` with descriptive anchor text.
- Do not add blog or application backlinks because no relevant article/detail route currently exists.

## Images and Accessibility

- Hero image alt: `foot operated shearing machine for sheet metal cutting`.
- Secondary product image alt: `Q11 foot operated shearing machine with manual pedal linkage`.
- Do not repeat identical alt text for different placements.
- Preserve `next/image`, responsive `sizes`, object containment, and priority loading only for the hero image.

## Structured Data

- Output JSON-LD for `Product`, `BreadcrumbList`, `Organization`, and the ten visible FAQs.
- Link `Product.manufacturer` to the same Organization `@id`.
- Omit offers, price, availability, review, aggregateRating, awards, and certificates.
- Keep structured-data claims aligned with visible page content.

## Verification

- Source contract checks exact metadata, H1, canonical, sections, keywords in natural copy, Q11 data ownership, internal routes, unique alt text, and schema exclusions.
- Production HTML checks SSR/SSG visibility of H1, copy, table, FAQs, links, and JSON-LD.
- Desktop and 390 px mobile checks cover one H1, local table scrolling, no document overflow, image load, native FAQ interaction, and no console errors.
- Run ESLint, `next build`, route/link checks, `robots.txt`, `sitemap.xml`, and live HTTP/HTML verification after deployment.
