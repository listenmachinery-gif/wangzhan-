# Small Electric Shear Section Removal Design

## Goal

Remove the fourteen requested long-form modules from the Compact Electric Shearing Machine product page without changing the shared layout of other shearing-machine pages.

## Approach

Add a typed, optional `hiddenSections` list to `ShearingSolutionContent`. The shared page renderer will check that list before rendering only the removable sections. The small-electric-shear data will opt out of `problems`, `solution`, `process`, `applications`, `materials`, `advantages`, `structure`, `model-guide`, `comparison`, `energy-comparison`, `workflow`, `manufacturer`, `related`, and `cta`.

The hero, overview, product showcase, detail gallery, backgauge carousel, material-range gallery, technical parameters, industry gallery, and FAQ remain visible.

## Verification

- Contract test confirms the exact hidden-section list and retained sections.
- TypeScript/build verification confirms all shared pages compile.
- Browser DOM verification confirms the fourteen headings are absent while retained modules remain.
- Production verification repeats the DOM checks after deployment.
