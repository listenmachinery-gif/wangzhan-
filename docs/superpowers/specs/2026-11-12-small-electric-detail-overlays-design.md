# Small Electric Shearing Machine Detail Overlay Design

## Intent

Turn the existing eight-image Machine Details gallery into a clearer buyer-facing feature presentation by replacing the old text-baked images with the newly supplied clean images and adding searchable, maintainable English names and benefits in the webpage itself.

## Goals

- Preserve the existing gallery position after Product Overview and its two-column desktop / one-column mobile layout.
- Replace all eight public gallery assets byte-for-byte with the newly supplied clean 1672×941 PNG files.
- Add an English feature name and one concise benefit at the lower left of each image.
- Add a restrained image-only hover zoom on pointer devices while keeping the text stationary and respecting reduced-motion preferences.
- Keep the change scoped to the Small Electric Shearing Machine page.

## Non-goals

- Do not change the hero, section heading, technical parameters, metadata, schema, or downstream page copy.
- Do not add a carousel, modal, client-side state, JavaScript hover handler, dependency, or image recompression.
- Do not bake the new names or benefits into the PNG files.

## Content and Order

1. `Welded Steel Plate Construction` — `Rigid all-steel frame helps reduce deflection and maintain stable blade alignment for consistent cuts.`
2. `Ball Transfer Units` — `Low-friction ball supports make sheet positioning smoother and reduce effort during feeding.`
3. `Polyurethane Hold-Down System` — `Resilient hold-down pads secure the sheet while helping protect its surface during cutting.`
4. `Direct-Coupled Motor & Gear Reducer` — `Compact direct drive delivers steady torque with fewer transmission components and reliable power transfer.`
5. `Brake Assembly` — `Controls shaft overrun for precise, repeatable stopping between cutting cycles.`
6. `High-Alloy Tool Steel Blade` — `Wear-resistant blade material retains a sharp cutting edge for clean, consistent results.`
7. `Manual Backgauge` — `Simple hand adjustment sets repeat dimensions quickly for accurate small-batch production.`
8. `Electrical Control Box` — `Centralized, clearly arranged components simplify operation, inspection, and routine maintenance.`

## Visual System

- The image remains the card surface with the native 1672:941 frame and no added card padding.
- A neutral black bottom gradient supports white text readability without tinting the whole image.
- Title: bold white, compact line-height; benefit: smaller neutral-white text with comfortable line-height.
- Hover: scale the image to `1.035` over 500 ms with ease-out; the gradient and caption do not move.
- Reduced motion: remove the transition and transform.

## Architecture

Extend `ShearingDetailImage` with `title` and `text`, populate the exact content in `smallElectricShearPageContent`, and render the visible `figcaption` as an absolutely positioned overlay inside the existing shared server component. Tailwind group-hover utilities provide the interaction without converting the page to a client component.

## Approaches

1. **Code-native overlay inside each figure — selected.** Searchable, accessible, responsive, easy to revise, and compatible with the supplied clean images.
2. Put captions below each image in normal flow. Most readable but does not satisfy the requested lower-left placement and makes the four-row gallery much taller.
3. Burn text into the images. Matches a fixed composition but harms accessibility, responsiveness, maintenance, and English copy quality.

## Validation

- The media contract first fails, then verifies the exact ordered records, English title/benefit fields, descriptive alt text, and eight local files.
- Existing Small Electric and related shear contracts remain green; lint and production build pass.
- Rendered QA checks eight visible captions, 2×4 desktop and 1×8 mobile layouts, successful image loads, no overflow or console errors, image-only hover scaling, stationary text, and reduced-motion-safe CSS.

