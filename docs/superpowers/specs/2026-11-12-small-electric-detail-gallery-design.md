# Small Electric Shearing Machine Detail Gallery Design

## Intent

Add the eight supplied machine-detail images immediately after Product Overview on the Small Electric Shearing Machine page so buyers can inspect the machine construction before reading the problem/solution sections.

## Goals

- Preserve all eight supplied 1672×941 PNG images without recompression or visual overlays.
- Render two images per row across four rows on desktop and one image per row on narrow screens.
- Keep the gallery scoped to `/products/compact-electric-shearing-machine`; other shearing pages retain their current section order.
- Maintain the existing industrial black, white, blue, and ZYRON green visual system.

## Non-goals

- Do not edit the text embedded in the supplied images.
- Do not add a carousel, modal, animation, client-side state, or dependency.
- Do not change hero, technical parameters, metadata, schema, or downstream copy.

## Content and Layout

- Section eyebrow: `Machine Details`
- Section heading: `Small Electric Shearing Machine Details`
- Position: directly after `data-section="overview"` and before `data-section="problems"`.
- Desktop/tablet at 768 px and wider: two equal columns with the native 1672:941 aspect ratio.
- Mobile below 768 px: one full-width column.
- Images appear in the supplied order: Welded Steel Plate Construction; Polyurethane Hold-Down System; Ball Transfer Units; Direct-Coupled Motor & Gear Reducer; Brake Assembly; High-Alloy Tool Steel Blade; Manual Backgauge; Electrical Control Box.

## Architecture

Add an optional typed detail-gallery object to `ShearingSolutionContent`. The shared `ShearingSolutionPage` renders the section only when this object exists, while `smallElectricShearPageContent` provides the heading and eight image records. Use `next/image` with responsive `sizes`, stable aspect-ratio containers, and descriptive alt text.

## Approaches

1. **Optional shared gallery field — selected.** Explicitly scopes the data, reuses the shared page, remains type-safe, and avoids duplicating the long product page.
2. Hard-code the gallery inside `ShearingSolutionPage`. Smaller initial diff but couples one product's assets to every shared page render path.
3. Create a dedicated Small Electric full-page component. Strong isolation but duplicates the entire shared product page and raises maintenance cost.

## Validation

- A media contract first fails, then verifies eight distinct local PNG assets, exact ordering, headings, and descriptive alt text.
- Existing Small Electric, energy-saving, hydraulic swing-beam, and reel-shear contracts remain green.
- ESLint and the production build pass.
- Browser QA confirms section order, 2×4 desktop layout, single-column mobile layout, image loading, no overflow, and no runtime errors.
