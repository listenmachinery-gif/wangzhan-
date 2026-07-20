import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const productsPath = resolve(root, "data/products.ts");
const productPagePath = resolve(root, "app/products/[id]/page.tsx");
const productSolutionPagePath = resolve(root, "components/ProductSolutionPage.tsx");
const nextConfigPath = resolve(root, "next.config.ts");

const productsSource = readFileSync(productsPath, "utf8");
const productPageSource = readFileSync(productPagePath, "utf8");
const productSolutionPageSource = readFileSync(productSolutionPagePath, "utf8");
const nextConfigSource = readFileSync(nextConfigPath, "utf8");

const productSeed = productsSource.match(
  /name:\s*"Slitting and Beading Machine"[\s\S]*?seoTerms:\s*\[[^\]]*"Reel Shear Beading Machine"[^\]]*\],[\s\S]*?\n\s*},/,
);

assert.ok(productSeed, "Slitting and Beading Machine product seed is missing");

for (const value of [
  'legacyIds: ["reel-shear-beading-machine", "roller-shear-beading-machine"]',
  "technicalParameters",
  "Sheet Thickness (mm)",
  "Shape",
  "Power (kW)",
  "Weight (kg)",
  "Dimensions L × W × H (mm)",
  "LQ-15",
  "0.5–1.2",
  "Beading / slitting profiles",
  "1.5",
  "260",
  "1600 × 630 × 1120",
]) {
  assert.ok(productSeed[0].includes(value), `Missing Reel Shear parameter: ${value}`);
}

assert.match(
  nextConfigSource,
  /\.\.\.legacyProductRedirects/,
  "Next.js redirects must expose Reel and Roller product aliases",
);

assert.match(
  productsSource,
  /technicalParameters\?:\s*TechnicalParameterTable/,
  "ProductSeed must accept a dedicated technical-parameter table",
);
assert.match(
  productsSource,
  /technicalParameters:\s*seed\.technicalParameters\s*\?\?\s*detail\?\.technicalParameters/,
  "Product mapping must prefer product-specific technical parameters",
);
assert.match(
  productPageSource,
  /<ProductSolutionPage\s/,
  "Product detail route must delegate generic products to ProductSolutionPage",
);
assert.match(
  productSolutionPageSource,
  /technicalParameters\.columns\.map/,
  "ProductSolutionPage must render technical-parameter columns",
);
assert.match(
  productSolutionPageSource,
  /technicalParameters\.rows\.map/,
  "ProductSolutionPage must render technical-parameter rows",
);

console.log("Slitting and Beading Machine parameter contract passed.");
