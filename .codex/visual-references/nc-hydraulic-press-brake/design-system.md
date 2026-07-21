# NC Hydraulic Press Brake visual inventory

## Reference set

- `concept-hero.png`: hero, customer problems, three solution positions.
- `concept-content.png`: real-photo application grid, material band, bending process, NC control transition.
- `concept-technical.png`: advantages, comparison, production workflow, selection, specifications, tooling, FAQ, final CTA.

The concepts define composition, hierarchy, density, typography relationships, palette and component families. Their generated sample claims, parameter values, machine-detail crops and photographic subjects are not content sources. The implementation must use the approved copy, original product parameters and existing local application photographs.

## Tokens

- Canvas: `#FFFFFF` and reading band `#F4F6F8`.
- Dark band: `#0B0D10`; raised dark surface: `#12161A`; titanium surface: `#171C21`.
- Primary text: `#101214`; inverted text: `#FFFFFF`; muted light text: `#B9C0C7`; muted dark text: `#606872`.
- Accent: `#76B900`; hover: `#8DDB00`.
- Light border: `rgba(16,18,20,.14)`; dark border: `rgba(255,255,255,.14)`.
- Radius: `2px` for buttons, `4px` for photo and information frames. Do not introduce pill shapes.
- Shadow: subtle `0 18px 55px rgba(0,0,0,.14)` only for the hero display and primary CTA panel.
- Spacing: section padding `64px` mobile, `96px` desktop; container max width `1280px` with `20px / 32px` responsive gutters.
- Motion: border/accent changes and up to `translateY(-2px)` over 200ms; disable movement under reduced-motion preference.

## Typography

- Use the site font stack: Montserrat, DIN, Eurostile, Arial, sans-serif.
- H1: 42/46 mobile, 64/68 desktop, semibold, tight tracking.
- H2: 32/38 mobile, 48/54 desktop, semibold.
- H3: 18–22px, semibold.
- Body: 15–17px with 1.75–1.9 line height.
- Section labels: 12px uppercase, 0.18em tracking, `#76B900`.
- Table heading labels: 12–13px semibold, one uninterrupted line; units: 11px medium, centered underneath.

## Above-the-fold copy lock

- H1: `NC Hydraulic Press Brake`
- Subheading: `Cost-effective sheet metal bending solution for workshops and general metal fabrication.`
- Description: approved paragraph beginning `An NC hydraulic press brake designed for regular sheet metal bending...`
- Primary CTA: `Get Bending Solution`
- Secondary CTA: `Request Machine Configuration`
- Value labels: `NC Controlled Bending`, `Hydraulic Bending Force`, `Cost-effective Workshop Solution`, `Suitable for Sheet Metal Fabrication`
- No hero eyebrow, badge, price, metric or additional promotional statement.

## Components and containers

- Hero: dark full-width band; left copy and CTA cluster; right machine on a low dark platform with radial light. The source image remains intact and uses `object-contain`.
- Problems: editorial rows/cards with one strong number or restrained lucide icon; no nested cards.
- Solution positions: three bordered columns with `Suitable for`, `Recommended use`, and `Production value` labels.
- Applications: 2 × 4 desktop real-photo grid, 2-column tablet and 1-column mobile. Use 16:9 or 4:3 frames with consistent `object-cover`; text sits below or on a restrained bottom gradient.
- Materials: six compact, text-led items in one dark band. Do not create material photography assets.
- Processes: six connected numbered steps; arrows are lucide icons, not line-art illustrations.
- NC control and advantages: alternating editorial two-column bands. Reuse only the full product image; no generated controller/detail crop.
- Comparison/specification: open table containers, black header, thin row lines, no rounded outer card. Both use local `overflow-x-auto` on mobile.
- Selection: checklist paired with one dark CTA panel.
- FAQ: native `details/summary` rows with clear focus and open states.
- Final CTA: full-width dark band with left-aligned copy and two buttons.

## Hero/media treatments

- Product image: no color overlay. Place the transparent PNG above a code-native radial background and platform shadow.
- Application photos: no brand tint; a black bottom gradient is allowed only when captions overlay the image.
- All non-hero images use lazy loading through Next.js Image default behavior.

## Responsive rules

- Below 768px, hero copy precedes the machine; buttons become full width.
- Below 640px, all content grids become one column and section gutters are 20px.
- Process/workflow connectors rotate conceptually into vertical sequencing; arrows may be hidden when the numbered rail is clearer.
- Only comparison and parameter wrappers may scroll horizontally. The page root must not overflow.
- Specification table preserves header labels with `whitespace-nowrap`; parenthesized units remain separate centered blocks.

## Intentional concept deviations

- Generated concepts contain illustrative parameter rows; implementation uses every original `simple-nc-press-brake` parameter row unchanged.
- Generated application photography is replaced with the eight existing local real photographs selected in the implementation plan.
- Generated product detail crops are excluded because the project has only one verified product image.
- Generated claims such as accuracy, productivity, investment return and uptime are excluded unless supported by approved source copy.
