import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const productsPath = resolve(root, "data/products.ts");
const contentPath = resolve(root, "data/reel-shear-beading-page.ts");
const componentPath = resolve(root, "components/ReelShearBeadingSolutionPage.tsx");
const routePath = resolve(root, "app/products/[id]/page.tsx");
const nextConfigPath = resolve(root, "next.config.ts");

const readSourceIfPresent = (path) =>
  existsSync(path) ? readFileSync(path, "utf8") : "";

const productsSource = readFileSync(productsPath, "utf8");
const contentSource = readSourceIfPresent(contentPath);
const componentSource = readSourceIfPresent(componentPath);
const routeSource = readFileSync(routePath, "utf8");
const nextConfigSource = readFileSync(nextConfigPath, "utf8");

assert.ok(contentSource, "Dedicated Reel Shear content configuration is missing");
assert.ok(componentSource, "Dedicated Reel Shear solution page component is missing");

const productSeed = productsSource.match(
  /name:\s*"Reel Shear Beading Machine"[\s\S]*?technicalParameters:\s*\{[\s\S]*?\n\s*},\n\s*},/,
);

assert.ok(productSeed, "Reel Shear Beading Machine product seed is missing");

for (const value of [
  'image: "/products/catalog/slitting-and-beading-machine.png"',
  'legacyIds: ["slitting-and-beading-machine", "roller-shear-beading-machine"]',
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
  assert.ok(productSeed[0].includes(value), `Missing Reel Shear product data: ${value}`);
}

assert.match(
  productsSource,
  /image\?:\s*string/,
  "ProductSeed must allow a product-specific image override",
);
assert.match(
  productsSource,
  /image:\s*seed\.image\s*\?\?\s*`\/products\/catalog\/\$\{id\}\.png`/,
  "Product mapping must retain the existing Reel Shear image after the rename",
);
assert.match(
  nextConfigSource,
  /\.\.\.legacyProductRedirects/,
  "Next.js redirects must expose previous Reel Shear product URLs",
);

for (const copy of [
  "Compact cutting and beading solution for thin sheet metal and HVAC duct fabrication.",
  "Manual sheet cutting is slow",
  "On-site Duct Fabrication",
  "Galvanized Sheet",
  "Sheet Preparation",
  "Combines cutting and beading functions",
  "Main function",
  "What is a reel shear beading machine?",
  "Duct Beading Machine",
]) {
  assert.ok(contentSource.includes(copy), `Missing dedicated Reel Shear copy: ${copy}`);
}

for (const section of [
  "hero",
  "problems",
  "solutions",
  "applications",
  "materials",
  "workflow",
  "advantages",
  "comparison",
  "selection",
  "technical",
  "faq",
  "related",
  "cta",
]) {
  assert.ok(
    componentSource.includes(`data-section="${section}"`),
    `Missing Reel Shear section: ${section}`,
  );
}

assert.equal(
  (componentSource.match(/<h1\b/g) ?? []).length,
  1,
  "Reel Shear page must contain exactly one H1 in source",
);
assert.match(
  componentSource,
  /alt="Reel shear beading machine for sheet metal cutting and duct beading"/,
  "Reel Shear hero image must use the approved alt text",
);
assert.match(
  componentSource,
  /const splitColumnHeading/,
  "Technical table must split labels and units intentionally",
);
assert.match(
  componentSource,
  /className="whitespace-nowrap[^\"]*text-center/,
  "Technical table header labels must stay together and remain centered",
);
assert.match(
  componentSource,
  /heading\.unit[\s\S]*className="[^\"]*block[^\"]*text-\[0\.72rem\]/,
  "Technical table units must render on their own centered line",
);
assert.match(
  componentSource,
  /max-w-full overflow-x-auto/,
  "Technical and comparison tables must scroll within their wrappers",
);

for (const schemaType of ["ProductModel", "BreadcrumbList", "FAQPage"]) {
  assert.ok(
    componentSource.includes(`"@type": "${schemaType}"`),
    `Missing ${schemaType} structured data`,
  );
}

assert.doesNotMatch(
  componentSource,
  /priceCurrency|aggregateRating|availability|offers\s*:/,
  "Reel Shear schema must not invent commercial or review data",
);
assert.match(
  routeSource,
  /import ReelShearBeadingSolutionPage/,
  "Product route must import the dedicated Reel Shear page",
);
assert.match(
  routeSource,
  /product\.id === "reel-shear-beading-machine"[\s\S]*?<ReelShearBeadingSolutionPage product=\{product\}/,
  "Product route must render the dedicated Reel Shear page",
);
assert.match(
  routeSource,
  /Reel Shear Beading Machine \| Sheet Metal Cutting and Beading Solution/,
  "Reel Shear page must use the approved meta title",
);
assert.match(
  routeSource,
  /Compact reel shear beading machine for thin sheet metal cutting, plate opening and reinforcement beading\./,
  "Reel Shear page must use the approved meta description",
);

console.log("Reel Shear Beading Machine page contract passed.");
