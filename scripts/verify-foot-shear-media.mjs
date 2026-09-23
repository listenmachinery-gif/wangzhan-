import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const { footShearPageContent } = await import("../data/foot-shear-page.ts");

const applicationItems = footShearPageContent.applications.items;
const materialItems = footShearPageContent.materials.items;

assert.equal(applicationItems.length, 8, "Eight application scenarios must remain visible");
assert.equal(materialItems.length, 6, "Six material types from the document must remain visible");

const mediaItems = [...applicationItems, ...materialItems];
for (const item of mediaItems) {
  assert.equal(typeof item.image, "string", `${item.title} is missing its real image`);
  assert.match(item.image, /^\/products\/foot-shear-content\/.+\.webp$/);
  assert.equal(typeof item.alt, "string", `${item.title} is missing alt text`);
  assert.ok(item.alt.length >= 28, `${item.title} alt text is not descriptive enough`);
  assert.ok(existsSync(resolve(root, `public${item.image}`)), `${item.title} image file is missing`);
}

assert.equal(
  new Set(mediaItems.map((item) => item.image)).size,
  mediaItems.length,
  "Every application and material entry must use a distinct image",
);

console.log("Foot Shear real-image content contract passed.");
