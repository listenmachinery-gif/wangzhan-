# Small Electric Shear Product Showcase Design

## Goal

Create a product showcase from the four supplied, unmodified machine photographs and place it immediately before the existing `Machine Details` section.

## Layout and Interaction

- A separate light-neutral section sits after Product Overview and before Machine Details.
- English copy: `Product Showcase`, `Explore the Machine from Every Angle`, and one concise buyer-oriented description.
- One large 1672:941 image is shown at a time without cropping.
- Four thumbnail buttons select Front Left, Front Right, Rear Left, and Rear Right views.
- Previous/next controls wrap through all four views. The active thumbnail and focus state are clearly visible.
- Mobile keeps the large image full width and provides a horizontally scrollable thumbnail row without page overflow.
- Only the four supplied photographs are used; no AI-generated intermediate views appear in the module.

## Verification

- Require exactly four distinct local WebP assets with descriptive alt text and exact view labels.
- Verify the module renders before Machine Details and keeps the existing eight detail cards unchanged.
- Run media/SEO checks, lint, production build, and desktop/mobile browser interaction QA.

