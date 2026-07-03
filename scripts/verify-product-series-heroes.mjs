import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const productsSource = readFileSync(join(root, "data/products.ts"), "utf8");
const seriesPageSource = readFileSync(
  join(root, "app/products/series/[id]/page.tsx"),
  "utf8",
);
const productsPageSource = readFileSync(
  join(root, "app/products/page.tsx"),
  "utf8",
);

const expectedHeroes = {
  "shearing-machines": "shearing-machine-series.png",
  "bending-machines": "bending-machine-series.png",
  "laser-cutting-machines": "fiber-laser-cutting-machine-series.png",
  "plate-rolling-machines": "plate-rolling-machine-series.png",
  "press-machines": "press-machine-series.png",
  "rectangular-duct-production":
    "rectangular-duct-production-machine-series.png",
  "round-duct-production": "round-duct-production-machine-series.png",
  shredders: "shredder-series.png",
};

assert.match(
  productsSource,
  /heroImage:\s*string/,
  "ProductCategory must expose a heroImage field",
);

for (const [categoryId, filename] of Object.entries(expectedHeroes)) {
  const assetPath = join(root, "public/products/series-heroes", filename);
  assert.ok(existsSync(assetPath), `Missing series hero asset: ${filename}`);

  const categoryPattern = new RegExp(
    `id:\\s*"${categoryId}"[\\s\\S]*?heroImage:\\s*"/products/series-heroes/${filename.replaceAll(
      ".",
      "\\.",
    )}"`,
  );
  assert.match(
    productsSource,
    categoryPattern,
    `Missing heroImage mapping for ${categoryId}`,
  );
}

assert.match(
  seriesPageSource,
  /data-series-hero/,
  "Series page must expose the hero hook",
);
assert.match(
  seriesPageSource,
  /data-series-hero-mask/,
  "Series page must expose the mask hook",
);
assert.match(
  seriesPageSource,
  /src=\{category\.heroImage\}/,
  "Series page must render the dedicated hero image",
);
assert.match(
  productsPageSource,
  /data-products-hero-mask/,
  "Products index must expose the strengthened hero mask",
);

console.log("Product series hero contract verified.");
