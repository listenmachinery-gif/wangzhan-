# Manual Folding Machine Application Photos Design

## Goal

Replace the eight line-art illustrations in the Manual Folding Machine “Applications” section with eight distinct, commercially usable real photographs. The rest of the product page content, information architecture, SEO metadata, technical parameters and responsive layout remain unchanged.

## Approved Direction

- Use one different real photograph for each of the eight existing application cards.
- Source photographs from Pexels under the Pexels License, which permits commercial website use.
- Avoid visible third-party trademarks, prominent logos and imagery that could imply a depicted person or company endorses ZYRON.
- Store optimized copies locally in the project instead of hotlinking remote images.

## Application Mapping

Each photograph must visibly support its existing card topic:

1. HVAC duct panel folding — rectangular galvanized duct fabrication or installation.
2. Roofing sheet metal work — metal roofing, flashing or roof-edge sheet-metal work.
3. Architectural sheet metal — architectural metal cladding, trim or façade fabrication.
4. Signage fabrication — metal sign-panel or light-gauge sign fabrication.
5. Electrical cabinet and enclosure — electrical cabinet, enclosure or control-panel fabrication.
6. Light sheet metal workshop — general light-gauge metal fabrication workshop.
7. Repair and maintenance workshop — practical metal repair or maintenance work.
8. On-site sheet metal bending — portable or job-site sheet-metal forming activity.

If an exact folding-machine photograph is unavailable, the image may depict the relevant downstream application or workshop context. It must not claim that a stock-photo subject is a ZYRON customer or that a pictured machine is the exact product model.

## Asset and Presentation Requirements

- Save the eight assets under `public/products/manual-folding-applications/`.
- Convert assets to WebP and use clear, stable filenames based on the application topic.
- Keep a compact source manifest in the same directory containing each Pexels photo-page URL, photographer name when available and access date.
- Render images through Next.js `Image` with responsive `sizes`, descriptive `alt` text and an aspect ratio of 16:9.
- Use `object-cover` so all cards retain a consistent image area without distorting photographs.
- Preserve the current four-column desktop, two-column tablet and one-column mobile card grid.
- Preserve all existing application titles and explanatory copy.
- Remove the `ApplicationSketch` SVG component after all eight cards use photographs.

## Performance and Accessibility

- Keep each WebP reasonably compressed for below-the-fold delivery while retaining professional visual quality.
- Allow Next.js lazy loading for these below-the-fold images.
- Provide application-specific alternative text; do not use generic wording such as “application image.”
- Maintain readable card text, keyboard behavior and color contrast.

## Verification

- Add or update an automated page contract confirming all eight application image paths are configured, unique and locally present.
- Confirm the rendered Applications section contains eight real raster images and no application line-art SVG.
- Verify desktop and mobile layouts for cropping, card alignment, loading and horizontal overflow.
- Check page identity, page content, framework overlay, console warnings/errors and one existing page interaction.
- Run all product-page verification scripts, lint, TypeScript and the production build.
- Deploy to the existing Vercel production project and verify the official URL after deployment.

## Out of Scope

- Changing the eight application titles or descriptions.
- Replacing the product hero image or the folding process diagram.
- Adding customer logos, testimonials or claims about photographed people and companies.
- Changing technical parameters, SEO metadata, schemas or unrelated product pages.
