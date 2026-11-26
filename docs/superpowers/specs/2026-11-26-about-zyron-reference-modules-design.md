# About ZYRON Reference Modules Design

## Goal

Refine the existing `/factory` About ZYRON page without changing its URL, business data, inquiry API, or the third manufacturing module. Rebuild modules four through eight as high-fidelity, CMS-editable sections based on the supplied visual references while using only ZYRON-owned media and publish-safe claims.

## Page structure

1. `ABOUT_HERO`: keep the current content and diagonal composition; constrain the copy column so all text remains inside the dark/gray overlay at desktop and tablet widths.
2. `ABOUT_COMPANY_OVERVIEW`: keep the current content and 2×2 gallery; render the gallery on the left and the copy on the right on desktop. Preserve a readable mobile order.
3. `ABOUT_MANUFACTURING`: unchanged.
4. `ABOUT_NUMBERS`: centered dark trust section with title, four editable proof points, and a full-width factory image. Defaults use verifiable workflow/category facts instead of unconfirmed years, countries, floor area, or annual volume.
5. `ABOUT_QUALITY`: light split section with four editable quality-control items and a real workshop image. Certification labels are optional and empty by default so no CE/ISO/SGS claim is published without evidence.
6. `ABOUT_ENGINEERING`: dark engineering section with copy, a large feature image, and four numbered image cards.
7. `ABOUT_GLOBAL_DELIVERY`: dark global-support section with a lightweight decorative world graphic, editable verified proof points, and editable delivery workflow cards. It must not present fictional shipment records.
8. `ABOUT_QUOTE`: dark/light split conversion section. The left side is editable brand copy, services, and media; the right side reuses the existing real `InquiryForm`, `/api/inquiry`, analytics tracking, and product-category data.

## CMS behavior

Each new section is a first-class PageBuilder component with:

- enabled/disabled state;
- editable eyebrow, headings, body and links;
- editable lists for proof points, process cards and services;
- media-library-compatible site-relative image fields and independent alt text;
- existing node add, duplicate, delete, reorder, draft, preview, publish and rollback behavior.

The current page document remains eight ordered nodes. No database schema migration is required because component content remains inside the existing JSON page document.

## SEO and safety

- Preserve the single page H1 in the hero and use H2/H3/H4 headings below it.
- Keep all meaningful copy server-rendered and all content images supplied with descriptive alt text.
- Preserve the current AboutPage, Organization and breadcrumb metadata path.
- Use internal links to existing routes only.
- Do not publish unverified certification, export-country, production-volume, facility-size or customer-count claims.
- Do not use the supplied reference screenshots as page assets because they contain third-party branding or unverified composite content.

## Responsive behavior

- Desktop: closely follow the supplied two-column and multi-column compositions.
- Tablet: reduce scale and collapse dense grids where necessary.
- Mobile: single-column reading order, no horizontal scrolling, tap targets at least 44px, images cropped with stable aspect ratios.
- Respect reduced-motion preferences.

## Verification

Validate schema/registry coverage, DOM heading order, media alt text, internal links, safe default claims, real inquiry form reuse, TypeScript, lint, unit/integration tests, production build, and visual screenshots at 1440, 1024, 768 and 390 pixels.
