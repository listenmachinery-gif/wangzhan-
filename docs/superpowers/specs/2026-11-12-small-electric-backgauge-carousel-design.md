# Small Electric Shear Backgauge Carousel Design

## Intent

Add a three-option backgauge presentation immediately after the Small Electric Shearing Machine's eight-item Machine Details gallery. The module should help buyers compare manual, handwheel-adjustable, and motorized positioning systems without leaving the product page.

## Goals

- Show the three supplied machine photographs at large, readable scale.
- Place each option's English name and concise buyer benefit in the lower-middle of its photograph.
- Provide clear previous/next controls, direct three-item navigation, keyboard-accessible buttons, and touch swipe.
- Preserve the page's established dark industrial visual system and `#76B900` interaction accent.
- Keep all text as native HTML so it remains responsive, accessible, and indexable.

## Non-goals

- No autoplay, 3D reconstruction, pricing, specification comparison, or backgauge recommendation logic.
- No changes to the existing Product Showcase, Machine Details gallery, or later product-page sections.
- No new third-party carousel dependency.

## Constraints

- The module appears after `data-section="details-gallery"` and before `data-section="problems"`.
- The supplied files are converted to local WebP assets without modifying the source images.
- The image frame uses a stable aspect ratio and preserves all important machine content.
- Motion respects `prefers-reduced-motion`.

## Approaches Considered

1. **Single-image controlled carousel (selected).** One large image, centered lower overlay, arrows, and three direct selectors. This gives every option enough visual space and works well on mobile.
2. **Three-card row.** Faster to scan on desktop but makes the detailed machine images too small and collapses into a long stack on phones.
3. **Automatic slideshow.** Adds movement but may interrupt reading and makes comparison less predictable.

## Selected Design

Use a focused client component with a large 1705:923-style media frame. A bottom gradient protects the centered white title and benefit copy while leaving the machine visible. Circular arrow controls sit at the image edges; three labeled selectors below expose the active state. Clicking, keyboard activation, or a horizontal swipe changes the active option and wraps at either end.

English copy:

- **Manually Adjustable Backgauge:** “A straightforward, economical choice for flexible small-batch work, with direct stop positioning and simple day-to-day adjustment.”
- **Handwheel-Adjustable Backgauge:** “Fine handwheel control makes precise dimensional changes easier and supports repeatable positioning without powered adjustment.”
- **Motorized Backgauge:** “Powered positioning speeds up size changes, reduces manual setup effort, and improves repeatability for higher-volume production.”

## Acceptance

- All three supplied images load locally and appear in the requested order.
- English names and benefits are visible in the lower-middle of each image.
- Previous, next, and direct selectors work and expose accessible labels/state.
- Horizontal swipe works without blocking vertical page scrolling.
- The section is responsive, has no horizontal overflow, and is placed directly below Machine Details.
- Media contract, SEO contract, TypeScript, lint, production build, desktop browser QA, mobile browser QA, and live deployment verification pass.
