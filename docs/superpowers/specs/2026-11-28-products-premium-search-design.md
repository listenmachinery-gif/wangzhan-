# Products Premium Search — Design

## Intent

Add a second, independently managed Products-page module for buyers who already know a machine, series, or model name. It must visually follow the supplied dark industrial reference, use the supplied ZYRON SVG system, search only real published catalogue data, and leave the existing Product Explorer untouched.

## Chosen approach

Use a dedicated `PRODUCT_SEARCH` page-builder node and a client search index assembled on the server from published products, categories, models, and page-configured aliases. This keeps the experience instant, automatically follows publication state, avoids an additional public search endpoint, and keeps all presentation settings in the existing Products Page Management workflow. A separate `/products/search` route provides shareable full results and is `noindex, follow`.

Alternatives considered:

- Extend `PRODUCT_EXPLORER`: fewer files, but couples two independent modules and makes editing/restoration risky.
- Public database search API: useful for very large catalogues, but adds request cancellation, rate limiting, and extra latency while the present catalogue is small enough for a compact server-built index.

## Visual and interaction contract

- Faithfully recreate the supplied 1920px reference as responsive HTML/CSS; never use the screenshot as the rendered section.
- Use the generated background-only precision-metal photograph with left-side negative space.
- Use the supplied nine 64×64 SVG assets through CSS masks so admin colors and hover colors work without unsafe inline markup.
- Keep the two-line segmented H2, dark overlays, wide clipped search shell, four popular links, and three lower benefit columns.
- Provide accessible combobox behavior: debounced suggestions, keyboard up/down, Enter, Escape, outside click, loading/empty states, and visible focus.
- Popular entries fill and submit their keyword. Suggestions link to real `/products/{slug}` pages. “View all” links to `/products/search?q=`.

## Search behavior

Normalize case, whitespace, hyphens, `×`/`x`, and punctuation. Rank exact model, exact product name, name prefix, name token, configured alias, category, then description. Only published products received from the public catalogue repository can enter the index. Results include real image, product name, category, and model summary.

## Admin behavior

Within Page Management → Products, the Product Search editor supports:

- enable/disable and restore defaults;
- all copy and status labels;
- segmented heading typography/colors;
- desktop/tablet/mobile backgrounds through Media Library;
- background positioning, overlay, section dimensions, search geometry, colors;
- popular item add/remove/reorder, keyword, linked product, icon, visibility, icon styles;
- benefit add/remove/reorder, copy, icon, visibility, icon styles;
- responsive heading and search dimensions.

If an older Products draft has no `PRODUCT_SEARCH` node, the admin route supplies the default node so the editor appears immediately; the public route also renders the default safely until the editor is first saved and published.

## SEO, analytics, and safety

- Preserve the existing Products H1; the module uses H2 and real crawlable links.
- Search results are `noindex, follow` and excluded from the sitemap.
- Record consent-aware `product_search`, popular/suggestion/result clicks, and no-result events without transmitting raw search text.
- Media paths remain site-relative and existing authenticated PageService persistence/versioning remains unchanged.

## Non-goals

- No change to the first Product Explorer module, product URLs, SEO records, or product publication rules.
- No independent admin application or duplicate authentication system.
- No destructive database migration.

