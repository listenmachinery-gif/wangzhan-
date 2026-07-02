# Small Electric Shear Solution Page Design

## Scope

Create a dedicated solution-oriented detail page for the existing `compact-electric-shearing-machine` product. Preserve the current Header, Footer, brand colors, typography, buttons, product image, canonical route, legacy redirect, and all eight original Q11G technical parameter rows.

The existing Foot Shear page remains visually and behaviorally unchanged.

## Architecture

Extract the current Foot Shear layout into a reusable server component for solution-oriented shearing pages. The shared component receives:

- the existing `Product` object for image and original technical parameters;
- a centralized content object for headings, body copy, applications, comparisons, FAQs, CTA copy, schema copy, and table presentation options.

Thin product-specific wrappers select the appropriate content object. The dynamic product route renders the Small Electric Shear wrapper only when `product.id === "compact-electric-shearing-machine"`; all other generic product pages continue using the existing template.

## Content And UX

The page follows the approved Foot Shear structure:

1. Dark industrial hero with one complete product image, four value points, parameter summary, and two CTAs.
2. Four buyer pain points.
3. Compact workshop solution positioning and Best Fit For checklist.
4. Five-step electric cutting workflow.
5. Six real workshop applications.
6. Six operational advantages.
7. Structure overview using the same real product image and six numbered explanations.
8. Foot, small electric, and hydraulic shear comparison.
9. Original eight-row Q11G technical parameter table.
10. Cutting-to-duct-assembly workflow.
11. Four project support items.
12. Seven FAQs.
13. Final inquiry CTA with required quotation information.

No fabricated detail images, price labels, inventory claims, or unsupported performance claims are added.

## Technical Parameter Table

The table reads `product.technicalParameters` from `data/shearing-details.ts`; values are not copied into page content.

Column headings such as `Max. Shearing Thickness(mm)` are parsed into two centered lines:

- `Max. Shearing Thickness`
- `(mm)`

On mobile, the table scrolls inside its own container while the page itself remains fixed to the viewport width. Data cells remain on one line to avoid distorted column widths.

## SEO

- Title: `Small Electric Shearing Machine | Compact Sheet Metal Cutting Solution | ZYRON`
- Meta description: supplied English description.
- Exactly one H1.
- Canonical: `/products/compact-electric-shearing-machine`.
- Product, BreadcrumbList, and FAQPage JSON-LD.
- Image alt: `Small electric shearing machine for thin sheet metal cutting`.
- No price or stock fields in Product schema.

## Validation

- Source contract verifies route isolation, centralized content, original parameter reuse, seven FAQs, SEO strings, and schema types.
- TypeScript and production build must pass.
- Desktop and mobile browser tests verify image loading, responsive width, internal table scrolling, eight original rows, heading-unit formatting, legacy redirect, and no regression on an unrelated generic product page.
