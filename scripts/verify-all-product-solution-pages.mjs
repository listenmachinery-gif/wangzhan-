import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const readSource = (relativePath) => {
  const filePath = path.join(projectRoot, relativePath);
  assert.ok(existsSync(filePath), `${relativePath} must exist`);
  return readFileSync(filePath, "utf8");
};

const productSource = readSource("data/products.ts");
const routeSource = readSource("app/products/[id]/page.tsx");
const profileSource = readSource("data/product-solution-profiles.ts");
const componentSource = readSource("components/ProductSolutionPage.tsx");

const productSeedSource = productSource.slice(
  productSource.indexOf("const productSeeds"),
  productSource.indexOf("export const products"),
);
const productCount = (productSeedSource.match(/^\s{6}name:/gm) ?? []).length;

const dedicatedIds = [
  "foot-shear",
  "compact-electric-shearing-machine",
  "energy-saving-electric-shearing-machine",
  "hydraulic-swing-beam-shear",
  "hydraulic-guillotine-shear",
];

const expectedProfileIds = [
  "shearing-machines",
  "bending-machines",
  "laser-cutting-machines",
  "plate-rolling-machines",
  "press-machines",
  "rectangular-duct-production",
  "round-duct-production",
  "shredders",
];

const requiredSections = [
  "hero",
  "challenges",
  "fit",
  "workflow",
  "advantages",
  "applications",
  "selection",
  "technical",
  "support",
  "related",
  "cta",
];

assert.equal(productCount, 53, "product seed count must stay at 53");

for (const productId of dedicatedIds) {
  assert.match(
    routeSource,
    new RegExp(`product\\.id === ["']${productId}["']`),
    `${productId} must retain its dedicated route guard`,
  );
}

assert.match(
  routeSource,
  /<ProductSolutionPage\s/,
  "the generic route branch must delegate to ProductSolutionPage",
);

for (const profileId of expectedProfileIds) {
  assert.match(
    profileSource,
    new RegExp(`["']${profileId}["']\\s*:`),
    `${profileId} must have a solution profile`,
  );
}

for (const section of requiredSections) {
  assert.match(
    componentSource,
    new RegExp(`data-section=["']${section}["']`),
    `ProductSolutionPage must render the ${section} section`,
  );
}

assert.match(
  componentSource,
  /md:grid-cols-\[1\.08fr_0\.92fr\]/,
  "the solution hero must switch to two columns at tablet width",
);
assert.match(
  componentSource,
  /sm:text-5xl lg:text-6xl/,
  "the solution hero title must use a restrained tablet type size",
);

assert.match(componentSource, /["']@type["']:\s*["']ProductModel["']/);
assert.match(componentSource, /["']@type["']:\s*["']BreadcrumbList["']/);

for (const unsafeField of [
  '"@type": "Offer"',
  "aggregateRating:",
  "priceCurrency:",
  "availability:",
  "review:",
]) {
  assert.ok(
    !componentSource.includes(unsafeField),
    `ProductSolutionPage must not include unsupported schema field ${unsafeField}`,
  );
}

const sharedPageCount = productCount - dedicatedIds.length;
assert.equal(sharedPageCount, 48);

console.log(
  `All-product solution page contract passed: ${productCount} products, ${dedicatedIds.length} dedicated, ${sharedPageCount} shared solution pages.`,
);
