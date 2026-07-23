# Fiber Tube Laser Cutting Machine Visual System

## Accepted Concept Set

- `01-hero-problems-solutions.png` — 1536 × 1024; hero, proof rail, tube-cutting problems, and solution pillars.
- `02-applications-process-systems.png` — 864 × 1821; real-photo applications, profiles, materials, process, chuck, loading, power, and gas.
- `03-comparison-technical-cta.png` — 864 × 1821; advantages, objective comparison, workflow, selection, specifications, safety, FAQ, internal links, and CTA.

The concepts are implementation references, not shippable UI assets. Website text, buttons, tables, diagrams, disclosures, and profile cross-sections remain code-native. Any generated chuck, loading, cutting, or tube-detail image in a concept is explicitly non-shippable. Production uses only the original machine image and licensed real application photography.

## Creative Direction

- Premium industrial editorial design centered on tube-flow clarity.
- True-white content bands alternate with near-black titanium bands.
- The sole accent is `#76B900`, sampled from the machine.
- Strong horizontal rails, clipped-corner actions, open columns, and locally scrollable tables replace rounded bento-card layouts.
- Section rhythm alternates between product-led, photograph-led, diagram-led, comparison-led, and checklist-led composition.
- No hero eyebrow, badge, pill, price, QR code, fake metric, certificate, testimonial, or unsupported automation claim.

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
| Accent | `#76B900` |
| Accent hover | `#8DDB00` |
| Maximum content width | `1280px` |
| Desktop gutter | `32px` |
| Mobile gutter | `20px` |
| Section spacing | `80–112px` desktop, `56–72px` mobile |
| Motion | `180–240ms` ease-out, disabled under reduced motion |

## Typography

- Reuse the site stack: Montserrat, DIN, Eurostile, Arial, sans-serif.
- H1: `clamp(2.5rem, 5vw, 5rem)`, 0.92–1 line height, 800–900 weight, about `-0.045em` tracking.
- Section heading: `clamp(2rem, 3.8vw, 4rem)`, 0.95–1 line height, 800 weight.
- Body: 15–18px, 1.65–1.75 line height.
- UI and table labels: 12–14px, 700 weight, deliberate letter spacing.
- Above-the-fold copy is locked to the supplied H1, subtitle, description, two CTAs, and four value phrases.

## Containers and Components

- Full-width section bands share one centered `max-w-7xl` container.
- Necessary cards use sharp 0–4px corners and hairline rules; avoid nested cards.
- Primary action uses lime background, near-black text, 14px/700 type, and clipped opposing corners.
- Secondary action uses a transparent or white surface with a thin contrasting border and the same geometry.
- Lucide icons use consistent 1.75–2px strokes only where they clarify process or action.
- Hover behavior is limited to a subtle border/accent shift, image scale no greater than 1.025, or arrow movement.

## Media Treatment

- `/products/catalog/fiber-tube-laser-cutting-machine.png` is the only machine image. Preserve proportions, color, logo, controller, enclosure, chuck, and bed exactly. Use `object-contain`; do not place a color overlay over the image.
- Applicable Industries uses twelve local real raster photographs with a source ledger. Use `object-cover`, consistent 4:3 frames, meaningful alt text, and lazy loading.
- Tube profiles, chuck relationships, process flow, gas choices, loading options, and selection guidance are code-native diagrams or editorial rails.
- Do not ship generated or stock machine-detail crops from the concepts.

## Technical Table

- Use one wide table with one header row containing all requested fields.
- Keep each parameter label as a no-wrap block. A parenthesized unit becomes a second centered block below the label.
- Use a local `overflow-x-auto` wrapper and a deliberate minimum table width; the root document must not overflow.
- Resolve original qualitative product values where compatible. Missing product-specific values use exactly `Customizable / Please confirm with our sales engineer`.
- Do not show borrowed numeric values, prices, or offers.

## Responsive Behavior

- Hero becomes a single column with the machine below the CTA row.
- CTA buttons become full width on narrow screens.
- Applications collapse from four columns to two and then one while preserving 4:3 crops.
- Tube profiles and materials use horizontal/stacked code-native rails without document overflow.
- Process, chuck, loading, comparison, and selection regions preserve reading order when stacked.
- Technical and comparison tables scroll inside their own containers.
- FAQ uses semantic `details` and `summary` rows with generous touch targets.

## Fidelity Notes

- The first concept accurately locks the hero balance, typography, dark value rail, problem section, and white solution band.
- The second concept locks photo-grid density and middle-page rhythm. Its generated chuck/loading/cutting imagery is replaced by code-native diagrams or textual rails in production.
- The third concept locks the comparison, selection, specification, FAQ, and CTA rhythms. Its accidentally assertive sample claims are replaced by the approved cautious copy and original project data.
- All visible copy follows the user attachment and the design specification, not Image Gen sample text.

## Image Generation Record

Built-in Image Gen was used in `ui-mockup` mode with the original machine image as a product reference. The prompt locked the titanium/white/lime visual system, real-photo Applications requirement, code-native tables and diagrams, original parameter safeguards, and prohibition on prices, invented values, fake machine details, QR codes, testimonials, and exaggerated claims.
