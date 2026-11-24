# Machines Mega Menu Style and Media Design

## Goal

Extend the existing versioned Machines Mega Menu editor so administrators can control menu typography and spacing, curate individual product cards with permanent media-library images, scroll through long product lists, and send visitors to the active product category instead of a generic products page.

## Data model

Keep the existing `NavigationDocument` JSON and version workflow. Add optional, bounded style properties to `MachinesMenuConfig.settings`; resolve missing values from `DEFAULT_NAVIGATION` so already-published documents remain valid. Colors accept six-digit hex values only and numeric controls use conservative ranges suitable for the menu layout.

## Admin experience

- Add grouped Chinese controls for left category typography/spacing and right content typography.
- Preserve automatic product synchronization; explain that card-level add/remove and image overrides require manual mode.
- In manual mode, keep the category product selector, add an explicit remove action to each selected card, and replace raw image-path editing with the existing media resource picker.
- Show the selected replacement image and provide a restore-original action.
- Keep desktop and mobile draft previews.

## Public menu

- Apply the resolved style settings to category names, active category styling, headings, descriptions, product titles/descriptions, and utility links.
- Put the product grid in an accessible, keyboard-focusable scroll region with a bounded viewport; keep the header and footer actions visible.
- Replace the generic `All Machines` footer link with `View All {active category}` and the active category route.

## Compatibility and safety

- No Prisma migration and no production database mutation.
- Media references use `/api/media/{id}`, not expiring external URLs.
- Existing navigation snapshots without style fields parse and render with defaults.
- Invalid style values are rejected by the existing navigation validation boundary.

## Verification

Add unit coverage for legacy fallback, validation, editor changes, media selection, product removal, applied styles, scrolling semantics, and active-category links. Run the full type, lint, test, build, and targeted Playwright navigation checks before a Preview deployment.
