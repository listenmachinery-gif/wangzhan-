import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), "utf8");

const productsSource = read("data/products.ts");
const contentSource = read("data/reel-shear-beading-page.ts");
const componentSource = read("components/ReelShearBeadingSolutionPage.tsx");
const routeSource = read("app/products/[id]/page.tsx");
const nextConfigSource = read("next.config.ts");
const sitemapSource = read("app/sitemap.ts");
const robotsSource = read("app/robots.ts");

const productSeed = productsSource.match(
  /name:\s*"Reel Shear Beading Machine"[\s\S]*?technicalParameters:\s*\{[\s\S]*?\n\s*},\n\s*},/,
);
assert.ok(productSeed, "Reel Shear Beading Machine product seed is missing");

for (const value of [
  'image: "/products/catalog/slitting-and-beading-machine.png"',
  'legacyIds: ["slitting-and-beading-machine", "roller-shear-beading-machine"]',
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
  assert.ok(productSeed[0].includes(value), `Missing verified product data: ${value}`);
}

const metadataBranch = routeSource.match(
  /if \(product\.id === "reel-shear-beading-machine"\) \{[\s\S]*?\n\s*}\n\n\s*if \(product\.id === "foot-shear"\)/,
);
assert.ok(metadataBranch, "Dedicated Reel Shear metadata branch is missing");
assert.ok(
  metadataBranch[0].includes("Reel Shear Beading Machine for HVAC Duct | ZYRON"),
  "Reel Shear page must use the approved SEO title",
);
assert.ok(
  metadataBranch[0].includes(
    "Reel shear beading machine for thin sheet metal cutting, slitting and reinforcement beading. Built for HVAC duct fabrication, galvanized sheet work and compact workshops.",
  ),
  "Reel Shear page must use the approved meta description",
);
assert.doesNotMatch(metadataBranch[0], /\bkeywords\s*:/, "Do not output meta keywords");
assert.match(metadataBranch[0], /canonical:\s*`\/products\/\$\{product\.id\}`/);

assert.equal(
  (componentSource.match(/<h1\b/g) ?? []).length,
  1,
  "Reel Shear page must contain exactly one H1 in source",
);
assert.ok(contentSource.includes('title: "Reel Shear Beading Machine"'));

for (const keyword of [
  "Reel shearing beading machine",
  "sheet metal reel shear beading machine",
  "HVAC duct reel shear beading machine",
  "sheet metal cutting and beading machine",
  "sheet metal shearing and beading machine",
  "shearing and beading machine",
  "reel shear machine",
  "reel bead cutting machine",
  "roller shear and beading machine",
  "thin sheet metal beading machine",
  "Reel Shear Beading Machine Manufacturer",
  "reel shear beading machine supplier",
  "reel shear beading machine factory",
  "reel shear beading machine for sale",
  "reel shear beading machine price",
  "LQ-15 reel shear beading machine",
  "reel shear beading machine for galvanized sheet",
  "sheet metal beading and slitting machine",
  "reel shear beading machine for small HVAC workshop",
]) {
  assert.ok(
    contentSource.toLowerCase().includes(keyword.toLowerCase()),
    `Missing natural keyword coverage: ${keyword}`,
  );
}

for (const section of [
  "hero",
  "overview",
  "problems",
  "solutions",
  "operations",
  "applications",
  "materials",
  "workflow",
  "advantages",
  "comparison",
  "selection",
  "manufacturer",
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

for (const heading of [
  "Product Overview",
  "Sheet Metal Cutting, Slitting and Beading",
  "Materials for LQ-15 Processing Review",
  "Reel Shear Beading Machine Manufacturer",
  "LQ-15 Reel Shear Beading Machine Specifications",
  "Reel Shear Beading Machine FAQ",
]) {
  assert.ok(
    contentSource.includes(heading) || componentSource.includes(heading),
    `Missing buyer-facing heading: ${heading}`,
  );
}

for (const question of [
  "What is a reel shear beading machine?",
  "What is a reel shearing beading machine used for?",
  "Can a reel shear beading machine cut galvanized sheet?",
  "Is a reel shear beading machine suitable for HVAC duct fabrication?",
  "What is the difference between a reel shear beading machine and a duct beading machine?",
  "What sheet thickness can the LQ-15 process?",
  "What is the difference between shearing, slitting and beading?",
  "How much does a reel shear beading machine cost?",
  "How do I choose a reel shear beading machine?",
  "Can the beading roller or tooling be customized?",
]) {
  assert.ok(contentSource.includes(question), `Missing FAQ: ${question}`);
}
assert.match(
  contentSource,
  /configuration[\s\S]*tooling[\s\S]*voltage[\s\S]*material[\s\S]*destination[\s\S]*shipping/i,
  "Price FAQ must explain the verified quotation factors",
);

for (const link of [
  ["multi-line duct beading machine", "/products/five-line-beading-machine"],
  ["HVAC lock forming machine", "/products/multi-function-lock-forming-machine"],
  ["sheet metal folding machine", "/products/manual-sheet-metal-folding-machine"],
  ["TDF flange forming machine", "/products/tdf-flange-forming-machine"],
  ["electric shearing machine", "/products/compact-electric-shearing-machine"],
  ["HVAC duct production line", "/products/u-shaped-auto-duct-production-line-5"],
]) {
  assert.ok(contentSource.includes(`label: "${link[0]}"`), `Missing anchor: ${link[0]}`);
  assert.ok(contentSource.includes(`href: "${link[1]}"`), `Missing route: ${link[1]}`);
}

assert.match(
  componentSource,
  /alt="reel shear beading machine for HVAC sheet metal fabrication"/,
  "Hero image must use the approved descriptive ALT",
);
assert.match(componentSource, /<Image[\s\S]{0,600}\bpriority\b/);
assert.match(componentSource, /const splitColumnHeading/);
assert.match(componentSource, /max-w-full overflow-x-auto/);

for (const schemaType of ["Product", "BreadcrumbList", "Organization", "FAQPage"]) {
  assert.ok(
    componentSource.includes(`"@type": "${schemaType}"`),
    `Missing ${schemaType} structured data`,
  );
}
for (const forbidden of [
  /priceCurrency/,
  /aggregateRating/,
  /availability/,
  /\boffers\s*:/,
  /\breview\s*:/,
  /\baward\s*:/,
]) {
  assert.doesNotMatch(componentSource, forbidden, "Schema must not invent commercial data");
}

assert.match(nextConfigSource, /\.\.\.legacyProductRedirects/);
assert.match(sitemapSource, /\.\.\.products\.map/);
assert.match(robotsSource, /allow:\s*"\/"/);
assert.match(robotsSource, /sitemap:\s*`\$\{siteUrl\}\/sitemap\.xml`/);
assert.match(
  routeSource,
  /product\.id === "reel-shear-beading-machine"[\s\S]*?<ReelShearBeadingSolutionPage product=\{product\}/,
);

console.log("Reel Shear Beading Machine SEO contract passed.");
