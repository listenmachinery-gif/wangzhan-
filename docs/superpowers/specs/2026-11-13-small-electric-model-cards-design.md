# Small Electric Shear Model Cards Design

## Intent

Extend the existing technical-parameters section with seven model-specific cards so buyers can match each Q11G model image to its published dimensions and cutting specifications. The cards belong directly below the existing table and do not introduce a separate page module or heading.

## Chosen approach

Add an optional typed `modelCards` collection to the shared shearing-page content. Render it only inside the existing `technical` section after the table. Each card uses a responsive split layout: a 4:3 image on the left and a compact definition list on the right at desktop sizes, stacking vertically on small screens.

This approach keeps model data close to the technical table, preserves other shearing pages, and avoids a one-off component or client-side JavaScript. The supplied images are converted to local WebP assets for faster delivery without changing their composition.

## Content and behavior

- Exactly seven cards, ordered from Q11G-2X600 through Q11G-1.2X2500.
- Model name is the card heading; the remaining seven values appear as labeled specifications.
- No additional section eyebrow or heading is added.
- Cards use `next/image`, descriptive alt text, local WebP assets, and responsive image sizes.
- Desktop cards render image left / specifications right; mobile cards stack without horizontal overflow.
