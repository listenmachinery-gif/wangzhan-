# Small Electric Shear 360° Viewer Design

## Goal

Add an interactive 360° product-spin presentation above the existing machine-detail gallery on the Small Electric Shearing Machine page, using the four approved product photographs plus four generated in-between angles.

## Experience

- Keep the existing dark `Machine Details` section and place one full-width interactive viewer between its heading and the existing 2 × 4 detail grid.
- Show the machine on its existing light neutral studio background inside a restrained dark frame that matches the section.
- Add the code-native labels `360° Interactive View` and `Move your cursor or drag to rotate`.
- Desktop pointer position maps directly across eight ordered frames; no click is required.
- Touch users drag horizontally. Keyboard users focus the viewer and use Left/Right Arrow.
- Respect `prefers-reduced-motion`; frame changes remain direct and do not add decorative animation.

## Image Sequence

Use eight 1672:941 frames in clockwise order:

1. Front-right supplied photograph.
2. Generated right-side midpoint.
3. Rear-right supplied photograph.
4. Generated rear-center midpoint.
5. Rear-left supplied photograph.
6. Generated left-side midpoint.
7. Front-left supplied photograph.
8. Generated front-center midpoint.

The four generated frames are product-mockup assets derived from all four supplied views. Preserve the blue welded frame, white access panels, yellow foot pedal, control box, blade opening, rear drive system, lighting, scale, and neutral studio background. Do not invent branding, operators, text, or accessories. If a generated angle contains material mechanical drift, prefer fewer accepted frames over shipping a misleading view.

## Architecture

- Add optional `productSpin` content to the shared shearing page schema so only the small-electric page renders the viewer.
- Implement `ProductSpinViewer` as a small client component; keep `ShearingSolutionPage` server-rendered.
- Keep pointer-to-frame and wrapped-step calculations in pure helper functions so behavior can be tested without a browser DOM.
- Render the sequence as stacked `next/image` elements and switch opacity by active index; this avoids network blanks while rotating and adds no WebGL dependency.

## Accessibility and Responsive Behavior

- The viewer is keyboard-focusable and has a descriptive accessible label.
- Left/Right Arrow wrap through the frame sequence.
- Pointer movement is limited to the viewer bounds and clamps safely at both edges.
- Touch scrolling remains available vertically; horizontal dragging controls rotation.
- The stage retains the source aspect ratio on desktop and mobile without cropping the product.

## Verification

- Extend the small-electric media contract to require exactly eight distinct local frames and their accessible copy.
- Add unit assertions for pointer mapping, clamping, invalid dimensions, and wrapped keyboard stepping.
- Run media/SEO verification, lint, production build, and desktop/mobile browser QA.
- Capture the rendered section, inspect it with `view_image`, and verify pointer, touch-equivalent drag, and keyboard frame changes.

