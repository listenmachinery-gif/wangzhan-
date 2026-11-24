# Machines Mega Menu Premium Visual Design

## Intent

Refine the existing PRODUCTS mega menu into a premium international industrial catalogue while preserving the current navigation data, category routes, product images, accessibility, scrolling behavior, and CMS controls.

## Direction

Use a restrained “precision industrial editorial” treatment: black, warm white, technical gray, and ZYRON green; strong typographic hierarchy; indexed category rows; flat image stages; thin rules; and purposeful hover/focus feedback. Avoid rounded cards, decorative gradients, excessive shadows, and new claims or content.

## Public menu

- Add an indexed, high-contrast category rail with a compact catalogue summary.
- Strengthen the active series header with catalogue context and product count.
- Present product cards as numbered technical catalogue entries with a defined image stage and clear title/description hierarchy.
- Keep the product grid as the only scrolling area so the series header and action bar remain visible.
- Retain the category-specific “View All” destination and all keyboard semantics.

## CMS

Keep the completed editor controls for typography, colors, spacing, product add/remove/reorder, media-library image replacement, original-image restoration, and desktop/mobile preview. The premium public layout must consume those existing settings without a schema or database migration.

## Verification

Prove the catalogue hierarchy, active-category link, scroll region, and product links through component and browser tests. Verify at 1440px and the existing mobile navigation breakpoints, then update the existing Draft PR and Vercel Preview only.
