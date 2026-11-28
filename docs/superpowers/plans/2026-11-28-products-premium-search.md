# Products Premium Search — Implementation Plan

**Goal:** Add a reference-faithful, searchable, admin-editable second module to `/products`.

**Architecture:** A new `PRODUCT_SEARCH` page node owns presentation content. Published catalogue data is converted to a compact search index on the server and ranked by a pure shared matcher used by both the interactive module and `/products/search`.

### Task 1: Configuration, assets, and search ranking

- Add exact supplied SVG files and optimized background asset.
- Add `productSearchContentSchema`, defaults, legacy-safe parser, search item types, normalization, and ranking.
- Test schema defaulting, model/name/alias/category ranking, normalization, unpublished-data boundary, and result limits.

### Task 2: Frontend module and results route

- Build the responsive `ProductSearch` component and CSS module.
- Add combobox keyboard behavior, suggestions, popular links, benefits, analytics, and full-result navigation.
- Render immediately after Product Explorer and add `/products/search` with `noindex, follow`.
- Test rendering, interaction, real links, keyboard behavior, and responsive-safe structure.

### Task 3: Page-builder administration

- Add `PRODUCT_SEARCH` to schema/registry and a dedicated `ProductSearchEditor`.
- Add media pickers, text/style controls, item add/remove/reorder, product association, and restore defaults.
- Ensure older Products drafts receive a default editable node without an immediate database write.
- Test saved payloads and editor behavior.

### Task 4: Publication and release

- Make the Products publisher create/preserve the search node.
- Run focused and full tests, typecheck, lint, production build, and browser/design QA.
- Merge, deploy, and verify public Products, results, login, and admin editor routes.

