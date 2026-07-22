# Exchange-Table Fiber Laser Cutting Machine — Visual System

## Accepted concept set

- `01-hero-pain-solutions.png` — 1536 × 1024; hero, proof rail, pain points, solution pillars.
- `02-applications-process-selection.png` — 1536 × 1024; real-photo application rail, materials, process, exchange-table principle, power and assist-gas guidance.
- `03-technical-faq-cta.png` — 1536 × 1024; advantages, comparison, workflow, selection, specifications, safety, FAQ, internal links, final CTA.

The three images are coordinated section references, not shippable UI assets. All text, controls, tables, diagrams, and disclosures are code-native. Generated sample copy and values are visual-only; the implementation uses the approved product brief and original project data.

## Creative direction

- Premium industrial editorial design with a titanium-machine aesthetic.
- True-white content bands alternate with near-black titanium bands.
- One lime accent, sampled from the existing machine: `#76B900`.
- Strong horizontal rails, sharp dividing rules, clipped-corner buttons, and open layouts replace generic rounded card grids.
- Section rhythm varies between product-led, photo-led, diagram-led, table-led, and editorial-list compositions.
- No hero eyebrow, pretitle, badge, pill, price, QR code, fake metric, certificate, testimonial, or unsupported automation claim.

## Tokens

| Role | Value |
| --- | --- |
| Page white | `#FFFFFF` |
| Soft surface | `#F5F5F7` |
| Titanium | `#15181B` |
| Deep titanium | `#0B0D10` |
| Primary text | `#111315` |
| Muted text | `#5F6368` |
| Dark-band text | `#F7F8F8` |
| Rule light | `#D7D9DC` |
| Rule dark | `rgba(255,255,255,0.18)` |
| Brand accent | `#76B900` |
| Accent hover | `#8DDB00` |
| Max content width | `1280px` |
| Desktop gutter | `32px` |
| Mobile gutter | `20px` |
| Section spacing | `80–112px` desktop, `56–72px` mobile |
| Motion | `180–240ms`, ease-out; disabled under reduced motion |

## Typography

- UI and body: the site's existing `Montserrat, DIN, Eurostile, Arial, sans-serif` stack.
- Display headings: use the same stack with `font-stretch`-safe condensed visual treatment through tight tracking, uppercase text, heavy weight, and narrower max widths; do not load an unrelated font solely for the concept.
- H1: `clamp(2.5rem, 5vw, 5rem)`, 0.92–1 line-height, 800–900 weight, `-0.045em` tracking.
- Section heading: `clamp(2rem, 3.8vw, 4rem)`, 0.95–1 line-height, 800 weight, uppercase where shown in the reference.
- Body: 16–18px desktop, 15–16px mobile, 1.65–1.75 line-height.
- UI labels/table headings: 12–14px, 700 weight, deliberate letter spacing.
- Above-the-fold visible-copy lock: the approved H1, subtitle, description, two CTAs, and four proof phrases only. The site header remains the existing global component.

## Container and component rules

- Full-width horizontal section bands with one shared centered content container.
- Avoid nested wrappers and rounded bento grids. Where a card is necessary, use a sharp 0–4px radius with a hairline border.
- Primary button: lime background, black text, clipped bottom-right corner, deliberate 14px/700 control typography.
- Secondary button: transparent/white surface with a dark 1px border and the same clipped-corner geometry.
- Rules and arrows: code-native SVG/Lucide geometry with consistent 1.75–2px strokes.
- Hover: lime color shift, image scale no greater than 1.025, and small arrow translation only.

## Media treatment

- The original product image `/products/catalog/exchange-table-fiber-laser-cutting-machine.png` is the only product image. Preserve its proportions, colors, logo, controller, and enclosure exactly. No overlay or tint; only a neutral edge fade or matching surface is allowed.
- Applicable Industries uses ten existing real workshop/industry photographs. No generated industry art, line drawings, icon-only tiles, or fake machine-detail photos.
- Real photos use stable aspect ratios, `object-cover`, restrained contrast, thin rules, and lazy loading below the fold.
- Exchange-table, workflow, gas, and selection explanations are code-native diagrams/rows, not raster detail images.

## Technical table

- Full-width, locally scrollable table inside `overflow-x-auto`; the document root must never overflow.
- Each parameter name is a no-wrap phrase. If a unit exists, it is a separate centered block below the name.
- Desktop may use multiple visual columns only if every field remains readable; mobile uses a clear minimum table width and local scrolling.
- Original qualitative product values are used where available. Missing confirmed values use exactly `Customizable / Please confirm with our sales engineer`.
- No borrowed model-specific numeric value is shown without exact model attribution; no price/offers markup.

## Responsive behavior

- Hero becomes a single column; product image stays below the CTAs and never crops essential machine geometry.
- CTA buttons become full width on narrow screens.
- Photo rail becomes a two-column grid, then one column where needed; labels remain outside image focal areas.
- Process and comparison regions become vertical rails with preserved order.
- The technical table scrolls inside its own container. Header phrases and units keep their intended line behavior.
- FAQ uses semantic `details/summary` rows with generous touch targets.

## Concept-only details intentionally excluded

- Any accidental invented numeric value, unsupported performance claim, sample drawing filename, or generated product schematic detail.
- The generated concepts' sample machine-table renderings. The implementation uses simple code-native platform diagrams.
- Any generated stock-like application crop not already present in the repository. The implementation uses the selected existing real photographs only.
- Any concept copy that conflicts with the approved attachment or original project data.

## Prompt summary

Built-in Image Gen was used in `ui-mockup` mode. The three prompts requested a practical Next.js/Tailwind design reference, preserved the supplied product image, required real application photos, locked the titanium/white/lime visual system, specified code-native UI and diagrams, and prohibited invented specifications, prices, QR codes, fake metrics, product-detail imagery, and line-art industry illustrations.
