# Small Electric Shearing Machine SEO Design

## Goal

Improve the existing `/products/compact-electric-shearing-machine` page for English searches centered on “Small Electric Shearing Machine” while preserving its high-end industrial visual system, canonical URL, responsive behavior, and verified Q11G data.

## Approved direction

Keep the shared shearing-solution layout and enhance it with optional product-specific modules instead of creating a duplicate page or redesigning the site. The compact page will own small-workshop, small-batch, compact-footprint, motorized-shear, and Q11G compact-model intent. The energy-saving page will retain energy-use, low-noise, operating-cost, and energy-conscious-workshop intent.

## Metadata and page identity

- Title: `Small Electric Shearing Machine for Sheet Metal | ZYRON`
- Description: `Small electric shearing machine for thin sheet cutting in HVAC, roofing, sign making and light fabrication. Compact Q11G models offer multiple cutting widths.`
- H1: `Small Electric Shearing Machine`
- Hero subtitle: `Compact Electric Sheet Metal Shear for Thin Sheet Cutting`
- Canonical: `https://www.zyroncnc.com/products/compact-electric-shearing-machine`
- Do not output a meta keywords tag.

## Search targeting

- Primary: `Small Electric Shearing Machine`
- Secondary terms appear only in relevant explanations: compact electric shearing machine, electric sheet metal shear, motorized sheet metal shear, small sheet metal shearing machine, mini electric shearing machine, electric sheet metal cutting machine, Q11G electric shearing machine, Q11G small electric shear, and thin sheet metal shearing machine.
- Commercial terms belong in manufacturer, FAQ, selection, and CTA copy.
- Model long-tail terms are generated from the verified shared Q11G technical table, not duplicated as invented data.

## Content architecture

Preserve all high-quality modules and refine or add:

1. Hero with exact H1, separate subtitle, concise product definition, and verified Q11G positioning.
2. Product Overview explaining powered straight cutting, suitable buyer, and compact-workshop fit.
3. Workshop problems and compact small-batch solution.
4. Materials with cautious notes for mild steel, galvanized sheet, aluminum, copper, stainless steel, and other thin sheet. The 2 mm published capacity must not be applied to every material.
5. Electric cutting mechanism and machine structure, grounded in the existing all-steel welded body, guillotine lower drive, integrated motor/reducer/brake, chain drive, high-alloy blades, and adjustable back gauge.
6. Seven practical applications: HVAC ducts, roofing, signs, electrical cabinets, small workshops, small-batch production, and general thin-sheet cutting.
7. Q11G technical table from `product.technicalParameters` with all eight existing rows.
8. Available-model guidance explaining 600–1600 mm 2 mm models and the longer 2000/2500 mm entries with their published lower thickness values.
9. Four-way buyer comparison: foot shear, small electric shear, energy-saving electric shear, and hydraulic shear, with verified internal links.
10. Manufacturer module grounded in existing company requirement review, assembly, inspection, voltage review, packing, and technical-selection data.
11. Nine visible buyer FAQs, including an honest price answer.
12. Related workflow links to shearing machines, foot shear, energy-saving electric shear, hydraulic swing-beam shear, folding machine, and lock-forming machine.
13. Quote CTA requesting model, material, thickness, cutting width, voltage, configuration, destination, and shipping requirements.

## Data integrity

- Keep all Q11G parameters in `data/shearing-details.ts` unchanged.
- Do not claim that stainless steel, aluminum, copper, galvanized steel, and mild steel share the same maximum capacity.
- Do not invent accuracy, lifetime, price, stock, delivery time, certification, rating, review, award, guaranteed energy use, or output beyond the published 30 cuts/minute rows.
- Do not claim that custom cutting length is available unless confirmed; provide model-selection guidance instead.

## Images and accessibility

- Hero ALT: `small electric shearing machine for thin sheet metal cutting`.
- Structure image ALT: `Q11G small electric shearing machine structure`.
- Hero remains priority-loaded and both images retain responsive object containment.
- Do not label generic shared detail images as this product unless their relationship is verified.

## Internal links and cannibalization control

Use only verified routes and descriptive anchors:

- shearing machines
- foot operated shearing machine
- energy-saving electric shearing machine
- hydraulic swing beam shearing machine
- sheet metal folding machine
- HVAC lock forming machine

The small-electric page must explicitly explain its compact/small-batch intent. It may link to energy-saving equipment for buyers prioritizing idle-power reduction, noise, and operating cost, without adopting those phrases as its primary theme.

## Structured data

Server-render Product, BreadcrumbList, Organization, and FAQPage JSON-LD. Link the Product manufacturer to the Organization entity and add verified Q11G technical rows as ProductModel variants without offers. Do not include price, availability, rating, review, award, or certification data.

## Technical SEO and rendering

- Preserve SSG output through the dynamic product route.
- Keep title, description, canonical, H1, product overview, applications, materials, parameters, FAQ, and internal links in initial HTML.
- Split parameter labels and units into centered lines and keep the wide table inside a local horizontal-scroll container.
- Confirm the old `/products/small-electric-shearing-machine` address redirects permanently to the canonical route.
- Verify robots, sitemap, indexability, metadata uniqueness against the energy-saving page, broken links, desktop/mobile layout, console health, and document overflow.

## Verification

1. Replace the partial source assertion with a comprehensive SEO contract and observe it fail on the old metadata/H1/content.
2. Implement shared optional fields and the small-electric content until the contract passes.
3. Run lint, energy-saving regression, foot-shear regression, and a fresh production build.
4. Run the production server and verify HTTP behavior plus initial rendered HTML.
5. Perform desktop and 390 × 844 browser QA, including FAQ expansion, local table scrolling, image loading, console checks, and page overflow.
6. Deploy the verified commit and repeat the critical checks against the live URL.
