# Torsion Bar CNC Press Brake visual inventory

## Accepted concept set

- `concept-hero.png`: hero, open numbered problem rail, three-column solution positioning.
- `concept-applications.png`: eight-photo application grid, material band, process rail, torsion synchronization and CNC control.
- `concept-technical.png`: machine advantages, comparison, workflow, selection, specifications, tooling, FAQ and final CTA.

The concepts lock composition, hierarchy, spacing rhythm, palette, typography relationships and component families. Generated sample claims, sample parameter values, controller numbers, form fields, phone/WhatsApp text, tooling renders and FAQ copy are not content sources. The implementation uses only approved page copy, current product data, the original product image and existing real application photos.

## Tokens

- Dark canvas: `#0B0D10`; dark surface: `#12161A`; titanium surface: `#171C21`.
- Reading canvases: true white `#FFFFFF` and cool light gray `#F4F6F8` only.
- Primary light text: `#FFFFFF`; muted light text: `#B9C0C7`.
- Primary dark text: `#101214`; muted dark text: `#606872`.
- Accent: exactly `#76B900`; hover: `#8DDB00`.
- Borders: `rgba(255,255,255,.14)` on dark and `rgba(16,18,20,.14)` on light.
- Radius: 2px buttons; 4px photo and information frames. No pills or giant rounded wrappers.
- Shadows: subtle `0 18px 55px rgba(0,0,0,.14)` for the hero platform and selection CTA only.
- Container: 1280px max width with 20px mobile / 32px desktop gutters.
- Section padding: 64px mobile / 96px desktop.
- Motion: border/accent transition and up to `translateY(-2px)` over 200ms; disable movement for reduced motion.

## Typography

- Site stack: Montserrat, DIN, Eurostile, Arial, sans-serif.
- H1: 42/46 mobile, 64/68 desktop, semibold, tight negative tracking.
- H2: 32/38 mobile, 48/54 desktop, semibold.
- H3: 18–24px, semibold.
- Body: 15–17px, line-height 1.75–1.9.
- Section labels: 12px uppercase, 0.18em tracking, `#76B900`.
- Table labels: 12–13px semibold, one unbroken line; units 11px medium, centered below.

## Above-the-fold copy lock

- H1: `Torsion Bar CNC Press Brake`
- Subheading: `Cost-effective CNC bending solution for standard sheet metal fabrication.`
- Description: approved paragraph beginning `A torsion bar CNC press brake designed for regular sheet metal bending...`
- Primary CTA: `Get CNC Bending Solution`
- Secondary CTA: `Request Machine Configuration`
- Value labels: `Torsion Bar Synchronization`, `CNC Controlled Bending`, `Hydraulic Bending Force`, `Cost-effective Workshop Solution`
- No hero eyebrow, badge, pill, price, metric or additional promotional statement.

## Section and container rules

- Hero: dark full-width band, text left and complete protected machine image right on a low platform; no tint or overlay on the machine.
- Problems: true-white open numbered rows separated by thin rules; do not convert to a rounded card grid.
- Solutions: three bordered dark columns using the labels Suitable for, Recommended use and Production value.
- Applications: real-photo 2 × 4 desktop grid, two columns tablet, one column mobile; 4:3 frames with `object-cover` and restrained black caption gradient.
- Materials: six text-led items in one dark horizontal band, no material images.
- Process: six numbered steps with simple lucide-style directional icons, not scene illustrations.
- Torsion synchronization: editorial two-column light section with verified text and a restrained code-native axis/synchronization motif; no fake detail photograph.
- CNC control: editorial text plus compact dark configuration list. Do not render numeric inputs or fabricated controller values from the concept.
- Advantages: complete original machine image paired with eight open text rows.
- Comparison and specifications: square/open table containers, black headers, thin row rules, no rounded outer card; both scroll locally on mobile.
- Workflow: connected seven-step rail with the current product step emphasized by a dark field, not a glow.
- Selection: fourteen-row checklist paired with a dark CTA information panel only; do not reproduce generated form fields or phone/WhatsApp copy.
- Tooling: text-led split layout; do not ship generated tooling imagery because it is not a verified project asset.
- FAQ: native `details/summary` rows with clear focus and open state.
- Final CTA: full-width dark band with two buttons and no proof-stat/icon strip.

## Icon inventory

- Use the existing lucide-react family with 1.5–2px outline stroke for arrows, checks, gauge/settings, tooling and FAQ chevrons.
- Application meaning comes from real photos, never line icons.
- Numbered rails use typographic numerals rather than decorative badges.
- Icons remain square/unstyled or sit in a subtle 1px square frame; no colored circles or pills unless required for a process number.

## Responsive rules

- Below 1024px, hero content stacks before the machine while keeping the machine fully visible.
- Below 768px, CTA buttons become full width and editorial two-column sections become one column.
- Below 640px, application and content grids become one column with 20px page gutters.
- Process/workflow steps continue vertically on mobile; connectors may be hidden when the numbered order remains clear.
- Only comparison and specification wrappers may scroll horizontally; the page root must not overflow.
- Specification labels preserve `whitespace-nowrap`; units remain separate centered blocks.

## Intentional concept deviations

- Generated hero and advantage copy is replaced by the user-approved, evidence-backed copy.
- Generated problem statements, performance claims and comparison values are replaced by the approved objective wording.
- Generated controller values and selection form fields are omitted; the page presents conditional configuration text and a `/contact` CTA.
- Generated parameter rows are ignored; the implementation renders all 9 columns and 37 original rows from `product.technicalParameters`.
- Generated application photos are not shipped; eight existing local real photographs with source records are used.
- Generated tooling renders are omitted because the repository has no verified torsion-bar tooling photo set.
- The existing site header and its responsive breakpoint are preserved instead of recreating the concept header.
