# Small Electric Shearing Machine Hero Design

## Intent

Replace only the first screen of the Small Electric Shearing Machine product page with the supplied industrial hero image. Use the image's dark left-side negative space for concise English sales copy and two contact actions so buyers immediately understand the product and can request model advice.

## Goals

- Use `7aa94a5a-7545-4089-923f-c41a1f052881.png` as the complete hero artwork.
- Keep the machine and operator visible on desktop while placing copy in the left blank area.
- Preserve the existing page route, metadata, downstream sections, brand typography, green accent, header, footer, and inquiry destinations.
- Keep the hero readable and professionally cropped on desktop, tablet, and mobile.

## Non-goals

- Do not redesign the rest of the product page.
- Do not change Q11G technical data, SEO metadata, schemas, navigation, or other product pages.
- Do not add client-side JavaScript, animation, fabricated claims, prices, or stock information.

## Approved Copy

- H1: `Small Electric Shearing Machine`
- Supporting line: `Compact Q11G cutting power for everyday thin-sheet production.`
- Description: `Straight, repeatable cutting for HVAC duct, roofing, sign making and light fabrication—without the footprint of a hydraulic shear.`
- Proof point: `600–2500 mm published cutting widths`
- Proof point: `Foot-pedal control for practical workshop operation`
- Primary CTA: `Request a Quote`
- Secondary CTA: `Get Q11G Model Advice`

Both CTA buttons continue to `/contact`.

## Layout

Desktop uses a full-width, image-led hero with the supplied 1672:941 artwork filling the section. Copy occupies a restrained left column aligned to the site's normal content gutter. A localized black-to-transparent gradient behind the left column protects legibility without tinting the machine or operator. The machine remains the visual focus in the center and the operator remains visible at the right edge.

On tablet and mobile, the copy remains above the artwork within the dark hero. The image is positioned toward the machine and operator and receives enough reserved height to avoid turning into a narrow decorative strip. Buttons stack when needed, text remains within the viewport, and no page-level horizontal scrolling is introduced.

## Architecture

Extend the shared `ShearingSolutionContent` contract with optional hero-background fields. The shared `ShearingSolutionPage` renders the new full-bleed composition only when those fields are present; every existing solution page continues through the current two-column hero branch unchanged. The Small Electric content module supplies the approved copy and asset path.

## Approaches

1. **Optional shared hero variant — selected.** Keeps one solution-page component, scopes the new composition through explicit content fields, and avoids duplicating the long product page.
2. Dedicated Small Electric full-page component. Strong isolation but duplicates hundreds of lines of shared sections and raises maintenance cost.
3. Replace the hero globally. Smallest code diff but changes unrelated products and violates the requested scope.

## Validation

- A source contract fails before implementation and then verifies the asset, approved copy, optional content fields, scoped hero branch, optimized `Image`, and both CTA links.
- Existing Small Electric SEO and media contracts continue to pass.
- ESLint and the Next.js production build pass.
- Browser QA checks desktop and mobile first viewports, image loading, H1/copy/buttons, CTA navigation, no framework overlay, console health, and absence of horizontal overflow.
- Final visual QA compares the supplied artwork and rendered screenshots directly.
