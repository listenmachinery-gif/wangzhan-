# Remove About ZYRON Sections Design

## Goal

Remove the Manufacturing Capabilities, Testing Before Delivery, Certificates, and Factory Gallery sections from `/factory` without disturbing the remaining About ZYRON content, navigation, inquiry flow, or product links.

## Page structure

The page will render 12 primary sections in this order: hero, stats, overview, product system, engineering support, customization, quality control, packing and delivery, global support, why ZYRON, FAQ, and final inquiry CTA.

The hero's first CTA will change from “Explore Our Manufacturing” to “Explore Product System” and target the product-system section. The route metadata and WebPage schema description will no longer advertise testing or certificates.

## Code cleanup

Remove the four JSX sections, their imports, the standalone manufacturing component, the click-to-load testing video, and the media-dialog component used only by certificates and the gallery. Remove data collections that no longer have a rendered consumer.

## Verification

The About ZYRON contract must assert exactly 12 sections, assert the four removed section markers and headings are absent, and assert the replacement product-system anchor is present. Existing product-page contracts, ESLint, the Next.js production build, responsive browser checks, and the deployed production HTML must remain green.
