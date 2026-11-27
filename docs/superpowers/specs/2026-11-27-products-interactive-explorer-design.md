# Products Interactive Explorer Design

## Objective

Replace the legacy `/products` catalogue landing page with an interactive, CMS-managed product explorer that reads the existing published categories and products from Prisma. The page must keep real URLs, SEO content, navigation, footer, inquiry flow, and product data intact.

## Architecture

- Add one `PRODUCT_EXPLORER` PageBuilder node type. Its JSON content stores copy, visual settings, the default tab, card settings, and exactly eight fixed category slots.
- Each fixed slot stores a real `ProductCategory.id`; labels, numbers, and order are immutable in the editor. Product cards are never copied into PageBuilder JSON.
- `/products` loads the published page document plus `listPublishedCategories()`, resolves the eight mappings, and renders one interactive client component with real published products.
- The server emits all product and category links in the initial HTML. The client only changes the active presentation and scroll position.
- Existing PageService draft/publish/version/rollback behavior remains the persistence and publishing mechanism. No Prisma migration is required.

## Experience

- Visual reference: `/Users/zhangmingwei/Desktop/f356da21-ee95-4c18-9f49-e3636f06cf26.png` (1536 × 1024). Match its dark graphite hero, 42/58 copy-to-machine split, floor line, oversized right-aligned number, lower-right series CTA, eight equal tabs, and light four-card product area.
- A dark 600–700 px industrial hero combines editable HTML copy, a large `object-contain` machine image, a translucent category number, series CTA, and eight keyboard-accessible tabs.
- The selected category changes hero media, series metadata, heading, and product carousel in place. Motion lasts 350 ms and respects `prefers-reduced-motion`.
- Cards use a 3:2 contained image, real product name and summary, CSS snap, touch/trackpad scrolling, arrows, and progress. Desktop shows four cards, tablet two or three, and mobile approximately 1.2.
- Mobile stacks copy above the machine and keeps the tabs horizontally scrollable.

## CMS

- The Products page editor receives published category options from `ProductAdminService` when the principal has `category.read`.
- A specialized editor exposes general copy, media, style, responsive layout, card settings, and eight category mapping panels.
- Each category panel can select a real database category and replace the hero image through the existing media library. The fixed number, navigation label, and order are read-only.
- Per-field PageBuilder typography overrides remain supported via `data-page-text` hooks.

## SEO and Analytics

- Keep existing metadata overlay and canonical URL.
- Emit `BreadcrumbList` and `ItemList` JSON-LD using real category/product URLs only.
- Add consent-aware GA events: `product_category_select`, `product_series_view`, `product_card_click`, and `find_my_machine_click`. These remain GA-only because the first-party analytics event enum has no matching domain events.

## Failure Handling

- Invalid or missing CMS content falls back to a complete default explorer configuration.
- A missing category mapping shows a controlled empty state and never invents products.
- Before the first production CMS publish, unmapped slots fall back by the existing database category position to keep `/products` usable; the deployment publisher writes the real IDs immediately afterward.
- Images use existing series hero assets and real product hero images; broken optional media does not block the product links or copy.

## Verification

- Unit tests cover schema/defaults, real-ID mapping, interaction, links, empty state, analytics typing, and the admin editor.
- Existing typecheck, lint, unit suite, and production build must pass.
- Playwright verifies desktop, tablet, and mobile presentation plus category switching and real links on Preview and Production.

## Source

Implementation authority: `/Users/zhangmingwei/Desktop/关于产品总页的排版.docx`.
