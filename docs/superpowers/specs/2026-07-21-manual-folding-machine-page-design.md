# Manual Folding Machine Product Page Design

## Objective

Replace the generic Manual Sheet Metal Folding Machine detail view with a dedicated, solution-led page for thin-sheet edge folding, HVAC duct preparation, workshop fabrication, and on-site sheet-metal work. Preserve the existing site header, footer, routes, product image, verified specifications, and global industrial design language.

## Approved source of truth

The user-provided brief is the approved design direction. The page must use `Manual Folding Machine` as its single H1 while retaining the existing catalog product name and canonical route `/products/manual-sheet-metal-folding-machine`.

Only verified project data may be presented as machine facts:

- Manual handwheel and lever operation
- Clamping beam followed by folding-beam forming
- No electrical, hydraulic, or compressed-air power required
- The four existing WS model rows and their current values

Do not claim eccentric-wheel lifting, a large handwheel, screw lifting, a heavy welded frame, or other structures that are not verified in the current product data. Do not add prices, availability, ratings, performance percentages, detail photography, or generated machine imagery.

## Architecture

Use the same dedicated-page pattern as the Reel Shear Beading Machine:

- `data/manual-folding-machine-page.ts` owns typed page copy and internal-link configuration.
- `components/ManualFoldingMachineSolutionPage.tsx` is a server component responsible for composition, semantic markup, responsive presentation, accessible SVG diagrams, tables, FAQ disclosure elements, and JSON-LD.
- `app/products/[id]/page.tsx` selects the dedicated component and supplies product-specific metadata.
- Existing product parameters remain in `data/bending-details.ts`; the new page consumes them without rewriting their values.
- A focused verification script defines the contract before implementation and joins the all-product verification suite.

## Information architecture

The page contains these sections in order:

1. Hero with left-aligned copy, two CTAs, four proof labels, and the existing product image on a titanium-gray presentation surface
2. Five customer problems and practical solution directions
3. Three solution-fit groups: small workshop, HVAC duct fabrication, and roofing/architectural sheet metal
4. Eight application scenarios using restrained line illustrations rather than fake photos
5. Six material families with a material-strength qualification note
6. Six-step flat-sheet-to-folded-part workflow
7. Verified machine advantages beside the real product image or a code-native folding diagram
8. Objective manual-versus-electric folding comparison
9. Supporting-equipment workflow with real internal links where matching products exist
10. Nine-question selection guide with contact CTA
11. Responsive technical table using all four existing WS model rows
12. Eight FAQ items
13. Final quotation and engineering CTA

## Technical table contract

The existing column meaning and row values are preserved exactly. Column headings are normalized for display:

- The label remains on one unbroken line.
- A parenthesized unit such as `(deg)`, `(kg)`, or `(mm)` moves to its own centered second line.
- Values already containing a unit, including `0.3-1.5 mm`, remain unchanged.
- The desktop table fits its container when possible; mobile uses horizontal scrolling inside the table wrapper only.
- The note below the table reads: `Final specifications depend on sheet material, thickness, bending length and selected machine structure.`

## Visual system

- Background anchor: `#0B0D10`, titanium and graphite surfaces, true white text, zinc-gray secondary text
- Accent: `#76B900` with the existing hover color
- Geometry: square or small-radius panels, fine borders, restrained shadows, no promotional badges or excessive icon grids
- Page rhythm: alternate dark narrative bands with light specification/comparison sections for long-page readability while retaining the industrial palette
- Typography: existing Montserrat/DIN/Eurostile stack with one H1 and semantic H2/H3 hierarchy
- Interaction: subtle hover lift, native disclosure FAQ, visible focus styles, no decorative animation
- Mobile: stacked hero, one-column cards, full-width CTAs, no document-level horizontal overflow, table-only horizontal scrolling

## Image handling

Use `/products/catalog/manual-sheet-metal-folding-machine.png` without altering machine structure, proportions, colors, or branding. Use `next/image`, descriptive alt text `Manual folding machine for sheet metal edge bending`, and lazy loading as required by the brief. The surrounding frame may add shadow, a neutral reflection line, and a titanium-gray platform, but no color overlay may obscure the machine.

## SEO and structured data

- Title: `Manual Folding Machine | Sheet Metal Edge Bending Solution`
- Description: `Manual folding machine for thin sheet metal bending, edge folding, HVAC duct panel forming, roofing sheet metal and light fabrication workshops. Get a suitable manual sheet metal folding solution.`
- Canonical: `/products/manual-sheet-metal-folding-machine`
- Keywords: all nine phrases from the brief
- Open Graph and Twitter metadata use the existing product image and exact descriptive alt text
- JSON-LD types: `ProductModel`, `BreadcrumbList`, and `FAQPage`
- Product schema contains brand, manufacturer, URL, category, image, description, and verified parameter properties only; it omits `offers`, price, availability, review, and rating data

## Internal links

Link only to product routes that exist in the current catalog. The page should connect to electric and hydraulic folding machines, shearing machines, lock forming machines, beading machines, TDF flange forming, press brakes, seam closing, and rectangular duct lines when a matching route is available. Link labels may describe the workflow role, but must not imply unsupported specifications.

## Verification

- Contract script proves the dedicated route, exact metadata, one H1, all required sections, exact verified rows, unit-line table behavior, internal links, and safe JSON-LD.
- Existing product solution scripts remain green and expected dedicated/shared page counts are updated.
- Run ESLint, TypeScript, and the Next.js production build.
- Render the page at a desktop viewport and a narrow mobile viewport; verify page identity, no framework overlay, console health, image loading, FAQ interaction, CTA navigation, no page overflow, and table-only mobile scrolling.
- Compare the implemented render against this written design and the existing dedicated product-page visual system. No fake visual asset is needed or permitted.

## Scope boundary

This task changes and commits the product page locally. It does not deploy, push, or mutate the production environment unless the user separately requests deployment.
