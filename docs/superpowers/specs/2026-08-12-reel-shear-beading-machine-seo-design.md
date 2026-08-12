# Reel Shear Beading Machine SEO Design

## Goal

Improve the existing `/products/reel-shear-beading-machine` page for English Google searches around “Reel Shear Beading Machine” while preserving the current visual system, URL, responsive behavior, and verified LQ-15 product data.

## Approved direction

Use one canonical, commercially useful product page instead of creating keyword variants. Keep the current dark industrial hero, alternating light/dark sections, tables, FAQ accordions, and related-product cards. Strengthen the page by adding buyer-oriented copy to the existing information architecture rather than redesigning the site.

## Search targeting

- Primary keyword: `Reel Shear Beading Machine`
- Secondary coverage: reel shearing beading machine, sheet metal reel shear beading machine, HVAC duct reel shear beading machine, sheet metal cutting and beading machine, sheet metal shearing and beading machine, shearing and beading machine, reel shear machine, reel bead cutting machine, roller shear and beading machine, thin sheet metal beading machine.
- Commercial coverage belongs in the manufacturer, FAQ, selection, and CTA sections—not the hero keyword cluster.
- Long-tail coverage must remain consistent with the confirmed LQ-15 cutting, beading, and slitting-profile data.

## Metadata

- Title: `Reel Shear Beading Machine for HVAC Duct | ZYRON`
- Description: `Reel shear beading machine for thin sheet metal cutting, slitting and reinforcement beading. Built for HVAC duct fabrication, galvanized sheet work and compact workshops.`
- H1: `Reel Shear Beading Machine`
- Canonical: `https://www.zyroncnc.com/products/reel-shear-beading-machine`
- Do not output a meta keywords tag.

## Content architecture

Preserve the existing page structure and add or refine these buyer-facing areas:

1. Hero defining the machine, its confirmed cutting/beading/slitting role, HVAC context, and compact-workshop fit.
2. Product overview explaining what the combined workstation does and where it fits in a duct workflow.
3. Problems and suitable workshop profiles.
4. A clear operations module for sheet cutting, reinforcement beading, sheet slitting, and bead/groove forming. The profile outcome remains tooling-dependent.
5. Application explanations for HVAC duct fabrication, ventilation duct manufacturing, galvanized sheet processing, construction-site duct work, small HVAC workshops, light sheet metal fabrication, and air-duct reinforcement.
6. Material cards with unique, cautious explanations for galvanized sheet, mild steel, stainless steel, aluminum, color steel, and thin metal plate. Do not assign unverified material-specific capacity.
7. Workflow, advantages, machine comparison, and configuration selection.
8. Manufacturer module grounded in the project’s existing company data: requirement review, assembly and inspection, voltage/tooling review, export packing, and technical selection support.
9. Technical table rendered from `product.technicalParameters`, preserving LQ-15, 0.5–1.2 mm, beading/slitting profiles, 1.5 kW, 260 kg, and 1600 × 630 × 1120 mm.
10. Ten visible buyer FAQs, including price without publishing a fabricated price.
11. Six descriptive internal links to verified existing product routes.
12. Quote CTA requesting material, thickness, width, required profile, voltage, destination, and shipping needs.

## Data integrity

- The product record in `data/products.ts` remains the source of truth for technical specifications and the catalog image.
- Do not claim that every material can be processed at 1.2 mm. Capacity depends on material strength and tooling confirmation.
- Do not invent production speed, working width, accuracy, tooling inventory, price, delivery time, stock, certification, rating, review, award, or performance guarantees.
- Explain “slitting” only because the verified shape/function field contains `Beading / slitting profiles`.

## Images and accessibility

- Keep the existing catalog product image and set its hero ALT to `reel shear beading machine for HVAC sheet metal fabrication`.
- The current process diagram remains a supporting explanatory graphic with an accurate accessible label; it is not presented as product photography.
- Give the hero image priority because it is above the fold. Retain responsive image sizing and object containment.

## Internal linking

Use only existing routes and descriptive anchors:

- multi-line duct beading machine
- HVAC lock forming machine
- sheet metal folding machine
- TDF flange forming machine
- electric shearing machine
- HVAC duct production line

Legacy product IDs continue to redirect permanently to the canonical URL.

## Structured data

Server-render JSON-LD for:

- Product, including manufacturer linkage and verified properties
- BreadcrumbList
- Organization, using existing company identity data
- FAQPage, exactly matching the visible ten FAQs

Do not add offers, price, availability, aggregate rating, review, awards, or certifications.

## Technical SEO and rendering

- Keep the route statically generated through the existing product route.
- Ensure the title, description, canonical, one H1, product copy, materials, applications, specifications, FAQ, and internal links are present in initial HTML.
- Keep technical and comparison tables within local horizontal-scroll wrappers on small screens.
- Verify sitemap inclusion, robots allowance, legacy redirects, internal-link status, no duplicate metadata output, and no document-level horizontal overflow.

## Verification

1. Extend the source-level Reel Shear SEO contract and observe it fail before implementation.
2. Run the updated contract, lint, relevant regression contracts, and a production build.
3. Run the production server and inspect initial HTML, metadata, JSON-LD, canonical, H1 count, links, and redirect status.
4. Perform desktop and 390 px mobile browser QA, including FAQ expansion, table scrolling, images, console output, and document overflow.
5. Deploy the verified commit and repeat the critical HTTP and HTML checks against the live URL.
