# About ZYRON Company Page Design

**Date:** 2026-07-30  
**Status:** Approved by the user's instruction to follow the recommended approach without pausing for confirmation.

## Objective

Replace the current lightweight `/factory` page with one authoritative English
Company Profile + Factory Strength page for international machinery buyers.
The page must answer whether ZYRON is a manufacturer, what production and
engineering work it supports, how machines are checked before shipment, and
what buyers can expect during configuration, packing, delivery, and support.

## Chosen approach

Keep `/factory` as the only canonical About ZYRON page and make the header entry
a direct navigation link rather than a dropdown.

This approach:

- avoids duplicate Company, About, and Factory routes;
- preserves current internal links and sitemap coverage;
- retains the existing Header, Footer, product navigation, language entry,
  inquiry endpoint, contact information, and Vercel setup;
- provides one page that can act as both a supplier-evaluation resource and a
  conversion path.

## Navigation

- Desktop label: `ABOUT ZYRON`
- Mobile label: `About ZYRON`
- Route: `/factory`
- Remove the Company dropdown and its four child links.
- Retain all product, support, showcase, contact, language, and quote controls.
- Update footer naming from `Factory & Solutions` to `About ZYRON`.

## Information architecture

The page will render the following primary sections in order:

1. Hero
2. Company Overview
3. Company Strength
4. Manufacturing Capability
5. Product Manufacturing System
6. Engineering and Configuration
7. Customization / OEM / ODM
8. Quality Control
9. Testing Before Delivery
10. Certificates and Compliance
11. Factory and Production Gallery
12. Packaging and Global Delivery
13. Global Service and After-Sales Support
14. Why Choose ZYRON
15. FAQ
16. Factory Visit and Inquiry CTA

## Visual system

- Use the existing ZYRON palette: `#0B0D10`, deep titanium gray, cold white,
  metal gray, and `#76B900` for selective emphasis.
- Alternate dark and light sections so the page does not become an uninterrupted
  black product catalog.
- Maximum container width: 1440px.
- Editorial body-copy width: 680–850px.
- Use full-width evidence photography, alternating manufacturing rows, process
  rails, and a restrained gallery rather than repeating identical cards.
- Preserve the current Montserrat/DIN/Eurostile/Arial font stack.
- Use only subtle CSS hover and transition effects and respect reduced motion.

## Evidence and photography rules

The page may reuse the following existing site assets:

- `/brand/factory-showcase.png`
- `/brand/certificates-showcase.png`
- `/brand/exhibition/exhibition-booth-01.png` through `06.png`
- `/products/detail-*.jpg`
- existing product-category and series imagery from `/products/catalog` and
  `/products/series-heroes`
- `/brand/zyron-hero-video.mp4`

Existing assets will be described accurately:

- the factory showcase image is used as the current site’s factory identity
  image;
- detail photographs are described as finished-machine, component, electrical,
  control, adjustment, and workshop evidence—not as unsupported processes;
- the certificate image remains uncropped and is presented as one document
  group; the page will not imply that every certificate applies automatically
  to every machine;
- exhibition photographs prove market-facing participation but will not be
  presented as customer logos or endorsements.

No competitor images, fake inspection reports, invented customer logos, or AI
factory evidence will be added. Missing evidence photography is documented in
`docs/company-page-photo-shot-list.md`.

## Content and data truthfulness

Create `data/company.ts` as the single source for:

- company identity and contact details;
- current website statistics;
- company focus;
- manufacturing capability descriptions;
- product-system mappings;
- engineering and customization content;
- quality-control and testing processes;
- certificate descriptions;
- gallery entries;
- packing, service, reasons-to-choose, and FAQ content.

The current site already publishes:

- 15+ Years of Experience
- 60+ Countries Served
- 200+ Team Members
- 10,000m²+ Factory Area
- CE Machinery Directive
- ISO 9001 Quality Management
- Business Registration
- Trademark Protection

These values may remain on the page as existing-site data but must be grouped in
one config object and marked in code with `VERIFY BEFORE PUBLISHING`. No new
headcount, output, export-country, patent, engineer, delivery, or customer
numbers will be invented.

## Component architecture

Server-rendered page content stays in focused components:

- `components/company/CompanyPage.tsx` — page composition and JSON-LD
- `components/company/CompanyHero.tsx`
- `components/company/CompanyOverview.tsx`
- `components/company/ManufacturingCapabilities.tsx`
- `components/company/ProductSystem.tsx`
- `components/company/EngineeringQualitySections.tsx`
- `components/company/CompanySupportSections.tsx`

Small interactive islands:

- `components/company/CompanyMediaDialog.tsx` — accessible certificate and
  gallery viewer with focus management and Escape close;
- `components/company/CompanyFaq.tsx` — button-controlled accordion with
  `aria-expanded`;
- `components/company/CompanyInquiryForm.tsx` — extended inquiry form using the
  existing `/api/inquiry` delivery path;
- `components/company/TestingVideo.tsx` only if the existing local video needs a
  click-to-load wrapper.

The route file `app/factory/page.tsx` owns metadata and renders `CompanyPage`.

## Inquiry flow

The company inquiry form posts to the existing `/api/inquiry` endpoint and
preserves the email fallback. It collects:

- name;
- company;
- email;
- WhatsApp / phone;
- country / region;
- product interest;
- material;
- thickness range;
- working length;
- target output;
- message.

The endpoint will accept the additional optional fields while preserving the
existing Contact-page payload. Required fields remain name, email, and message /
production requirement. A hidden honeypot rejects obvious automated
submissions. Labels, required status, errors, success state, keyboard access,
and mobile sizing are explicit.

## SEO and structured data

Metadata:

- Title: `About ZYRON Heavy Industry | Sheet Metal Machinery Manufacturer`
- Description: `Explore ZYRON Heavy Industry’s factory, manufacturing process, quality control, product range, testing, export packing, certificates, and global machinery support.`
- Canonical: `/factory`
- Robots: index, follow
- Open Graph and Twitter use `/brand/factory-showcase.png`.

JSON-LD:

- `Organization`
- `WebPage`
- `BreadcrumbList`
- `FAQPage`

Organization data comes from `data/company.ts`. `sameAs` remains empty unless a
real existing social profile is present in the project.

## Accessibility

- Exactly one H1.
- Each primary section has an H2; subtopics use H3.
- Meaningful image alt text and empty alt for decoration.
- Strong focus-visible states.
- FAQ controls are real buttons with `aria-expanded`.
- Dialogs support Escape, backdrop close, labelled titles, focus entry, and
  focus restoration.
- Form labels, required indicators, status messages, and error relationships
  are explicit.
- Anchors use `scroll-margin-top` to clear the sticky header.

## Responsive and performance behavior

- Desktop hero: copy left, factory evidence right/background, CTAs fully visible.
- Mobile hero: copy first, image second, single-column CTA buttons.
- Manufacturing rows alternate only on desktop; mobile always shows image first.
- Product system: four columns at wide desktop, two at tablet, one on mobile.
- Gallery: editorial grid on desktop, one or two columns on mobile.
- Certificates use `object-contain` and are never cropped.
- Non-hero images use lazy loading and responsive `sizes`.
- Use `next/image`; no new animation or gallery dependency.
- All long page copy remains server rendered in initial HTML.

## Verification

- Add a focused source contract for header, section markers, SEO, schemas,
  current stats, real assets, FAQ, form, and unsupported-claim exclusions.
- Run the focused contract before implementation to prove failure.
- Run lint, TypeScript through the production build, all existing focused page
  contracts, and `next build`.
- Test `/factory` in the in-app browser at 360, 390, 430, 768, 1024, 1280,
  1440, and 1920 widths.
- Exercise FAQ, certificate dialog, gallery dialog, inquiry validation, anchor
  scrolling, and header/mobile navigation.
- Confirm no page-level horizontal overflow, image 404s, console errors, or
  framework overlays.
- Deploy through the existing Vercel project and verify the production domain,
  metadata, section count, imagery, and sitemap.
