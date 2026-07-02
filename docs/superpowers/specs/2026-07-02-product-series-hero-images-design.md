# Product Series Hero Images Design

## Goal

Replace the hero media on all eight product-series pages with the supplied series-specific images, while keeping the current English copy, product hierarchy, directory, and product cards unchanged. Improve text contrast on both the products index hero and series heroes with deliberate dark masks.

## Confirmed Direction

- Keep the existing products index and series page content structure.
- Use the supplied landscape image as a full-bleed background on each series hero.
- Apply an overall dimming layer plus a stronger left-to-right mask behind the left-aligned copy.
- Keep the image visible on the right side and preserve all current calls to action.
- Strengthen the products index hero mask without replacing its existing image.
- Do not change product detail pages, category descriptions, navigation, or product-card content.

## Image Mapping

| Series | Hero asset |
| --- | --- |
| Shearing Machine Series | `shearing-machine-series.png` |
| Bending Machine Series | `bending-machine-series.png` |
| Fiber Laser Cutting Machine Series | `fiber-laser-cutting-machine-series.png` |
| Plate Rolling Machine Series | `plate-rolling-machine-series.png` |
| Press Machine Series | `press-machine-series.png` |
| Rectangular Duct Production Machine Series | `rectangular-duct-production-machine-series.png` |
| Round Duct Production Machine Series | `round-duct-production-machine-series.png` |
| Shredder Series | `shredder-series.png` |

## Visual Treatment

The hero image fills the section using `object-cover`. A neutral black dimming layer controls overall image brightness. A second left-to-right gradient is darkest behind the text and progressively clears toward the right, retaining machine detail. A bottom fade anchors the hero into the next section. On mobile, the mask remains strong enough that text never depends on a quiet area of the photograph.

## Data and Accessibility

Each category receives a dedicated `heroImage` field. Existing category `image` values remain untouched because they are used by product and category cards. Hero images use descriptive alt text derived from the category name, and the foreground content remains real HTML above decorative overlays.

## Verification

- Contract test verifies all eight hero image mappings and mask hooks.
- TypeScript and production build must pass.
- Desktop and mobile browser checks cover the products index and all eight series routes.
- Final deployment is verified on the production domain after the push completes.
