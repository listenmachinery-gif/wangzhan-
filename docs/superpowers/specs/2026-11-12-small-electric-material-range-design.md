# Small Electric Shear Material Range Gallery Design

## Intent

Add a dedicated material-capability gallery immediately after the backgauge options on the Small Electric Shearing Machine page. The gallery should help buyers quickly understand the range of sheet materials associated with the machine while keeping material selection technically qualified.

## Goals

- Show the nine supplied material images in the requested order.
- Use a three-column, three-row desktop layout with responsive two- and one-column fallbacks.
- Place each English material name at the lower center of its image.
- Keep the page fast by rendering a static, data-driven gallery with optimized local WebP assets.
- State that actual cutting suitability depends on material and machine-specific factors.

## Non-goals

- Do not replace the existing later-page materials specification section.
- Do not add carousel behavior, filtering, or new client-side JavaScript.
- Do not claim identical thickness capacity for every listed material.

## Approaches

1. **Static responsive grid (selected):** best match for the requested 3 × 3 layout, lets all materials remain visible, and adds no client bundle.
2. Carousel: saves vertical space but hides most materials and conflicts with the explicit three-row request.
3. Reuse the later materials section: reduces code but would move the module away from the requested position and mix marketing imagery with technical capacity guidance.

## Design

The new light-neutral section follows the dark backgauge carousel and precedes the white workshop-problems section. A short English heading and qualification note sit above a responsive grid. Each 4:3 image card uses a subtle bottom gradient and centered white caption. Images gently enlarge on hover and respect reduced-motion preferences.

## Content and Constraints

The labels are the supplied filenames without extensions: Mild Steel Sheet, Aluminum Sheet, Galvanized Steel Sheet, Stainless Steel Sheet, Copper Sheet, Printed Circuit Board, Stainless Steel Security Mesh, Prepainted Steel Sheet, and Glass-Epoxy Laminate Sheet. The section copy must avoid presenting the gallery as a universal capacity guarantee.
