# Small Electric Shear Applicable Industries Gallery Design

## Intent

Add a dedicated applicable-industries module immediately below the Q11G technical-parameter section on the Small Electric Shearing Machine product page. The module should connect the machine to nine concrete manufacturing industries and representative fabricated parts.

## Goals

- Use all nine supplied industry images in the requested order.
- Display three cards per row across three rows on desktop, with two- and one-column responsive fallbacks.
- Keep every industry title and application description below the image, never overlaid on it.
- Add a subtle image-only hover enlargement that does not shift the card layout.
- Optimize the supplied PNG files as local WebP assets without adding client-side JavaScript.

## Non-goals

- Do not replace the existing earlier application-scenarios section.
- Do not turn the gallery into a carousel or filterable interface.
- Do not imply that every listed component can be cut at the same thickness or with every Q11G model.

## Approaches

1. **Static data-driven card grid (selected):** exactly matches the requested three-by-three presentation, keeps all industries visible, and adds no client bundle.
2. Carousel: reduces page height but hides most industries and conflicts with the requested three-row layout.
3. Extend the existing application section: reduces new markup but cannot meet the requested placement below the parameter table and would mix two different content purposes.

## Design

The new dark-neutral section follows the white technical-parameter block. A concise English heading introduces the industries. Each card uses a 4:3 image inside an overflow-hidden frame, followed by a separate light content panel containing the filename-derived title and the supplied description. The image scales to 1.035 on hover and respects reduced-motion preferences.

## Content and Placement

The module appears directly after `data-section="technical"` and before the optional model guide. Titles are the supplied filenames without extensions; descriptions reproduce the user-provided English copy exactly. Desktop uses three columns, tablet two columns, and mobile one column.
