import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), "utf8");

const route = read("app/products/[id]/page.tsx");
const shared = read("components/ShearingSolutionPage.tsx");
const wrapper = read("components/SmallElectricShearSolutionPage.tsx");
const data = read("data/small-electric-shear-page.ts");
const types = read("data/shearing-solution-types.ts");
const productData = read("data/shearing-details.ts");
const energyData = read("data/energy-saving-electric-shear-page.ts");
const energyContract = read("scripts/verify-energy-saving-electric-shear-page.mjs");
const nextConfig = read("next.config.ts");
const sitemap = read("app/sitemap.ts");
const robots = read("app/robots.ts");
const combined = `${shared}\n${wrapper}\n${data}`;

const metadataBranch = route.match(
  /if \(product\.id === "compact-electric-shearing-machine"\) \{[\s\S]*?\n\s*}\n\n\s*if \(product\.id === "energy-saving-electric-shearing-machine"\)/,
);
assert.ok(metadataBranch, "Dedicated Small Electric metadata branch is missing");
assert.ok(
  metadataBranch[0].includes("Small Electric Shearing Machine for Sheet Metal | ZYRON"),
  "Small Electric page must use the approved title",
);
assert.ok(
  metadataBranch[0].includes(
    "Small electric shearing machine for thin sheet cutting in HVAC, roofing, sign making and light fabrication. Compact Q11G models offer multiple cutting widths.",
  ),
  "Small Electric page must use the approved description",
);
assert.doesNotMatch(metadataBranch[0], /\bkeywords\s*:/, "Do not output meta keywords");
assert.match(metadataBranch[0], /canonical:\s*`\/products\/\$\{product\.id\}`/);

assert.match(route, /import SmallElectricShearSolutionPage/);
assert.match(
  route,
  /product\.id === "compact-electric-shearing-machine"[\s\S]*?<SmallElectricShearSolutionPage product=\{product\}/,
);
assert.match(wrapper, /smallElectricShearPageContent/);
assert.equal((shared.match(/<h1\b/g) ?? []).length, 1, "Shared page must render one H1");
assert.ok(data.includes('title: "Small Electric Shearing Machine"'), "H1 content is incorrect");
assert.ok(
  data.includes('heroSubtitle: "Compact Electric Sheet Metal Shear for Thin Sheet Cutting"'),
  "Hero subtitle is missing",
);

for (const keyword of [
  "Compact electric shearing machine",
  "electric sheet metal shear",
  "electric shearing machine",
  "motorized sheet metal shear",
  "small sheet metal shearing machine",
  "mini electric shearing machine",
  "electric sheet metal cutting machine",
  "Q11G electric shearing machine",
  "Q11G small electric shear",
  "thin sheet metal shearing machine",
  "Small Electric Shearing Machine Manufacturer",
  "small electric shearing machine supplier",
  "small electric shear manufacturer",
  "electric sheet metal shear manufacturer",
  "compact electric shearing machine manufacturer",
  "small electric shearing machine for sale",
  "small electric shearing machine price",
  "Q11G electric shearing machine manufacturer",
  "2mm small electric shearing machine",
  "2mm electric sheet metal shear",
  "small electric shear for galvanized sheet",
  "small electric shear for HVAC duct fabrication",
  "compact sheet metal shear for small workshop",
  "electric sheet metal shear for small batch production",
]) {
  assert.ok(data.toLowerCase().includes(keyword.toLowerCase()), `Missing keyword: ${keyword}`);
}

const compactDetail = productData.match(
  /"small-electric-shearing-machine":\s*\{[\s\S]*?\n\s*},\n\s*"energy-saving-electric-shearing-machine":/,
);
assert.ok(compactDetail, "Small electric Q11G source data is missing");
for (const model of [
  "Q11G-2 x 600",
  "Q11G-2 x 800",
  "Q11G-2 x 1000",
  "Q11G-2 x 1300",
  "Q11G-2 x 1500",
  "Q11G-2 x 1600",
  "Q11G-1.5 x 2000",
  "Q11G-1.2 x 2500",
]) {
  assert.ok(compactDetail[0].includes(model), `Missing verified Q11G model: ${model}`);
  assert.ok(data.includes(model), `Missing natural model guidance: ${model}`);
}
assert.ok(compactDetail[0].includes("30"));
assert.ok(compactDetail[0].includes("500"));
assert.ok(compactDetail[0].includes("3"));
assert.ok(compactDetail[0].includes("3100 x 640 x 1100"));

for (const section of [
  "hero",
  "overview",
  "problems",
  "solution",
  "process",
  "applications",
  "materials",
  "advantages",
  "structure",
  "technical",
  "model-guide",
  "comparison",
  "energy-comparison",
  "workflow",
  "manufacturer",
  "faq",
  "related",
  "cta",
]) {
  assert.ok(shared.includes(`data-section="${section}"`), `Missing shared section marker: ${section}`);
}

for (const heading of [
  "Product Overview",
  "What Problems Does This Small Electric Shear Solve?",
  "Compact Electric Sheet Metal Cutting for Small Workshops",
  "What Materials Can This Q11G Electric Shear Cut?",
  "How the Electric Shearing Mechanism Works",
  "Q11G Technical Specifications",
  "Available Q11G Models and Cutting Widths",
  "Small Electric Shear vs Foot, Energy-Saving and Hydraulic Shears",
  "How to Choose the Right Q11G Model",
  "Small Electric Shearing Machine Manufacturer",
  "Small Electric Shearing Machine FAQ",
  "Request a Small Electric Shearing Machine Quote",
]) {
  assert.ok(combined.includes(heading), `Missing buyer-facing heading: ${heading}`);
}

for (const material of [
  "Mild Steel",
  "Galvanized Sheet",
  "Aluminum Sheet",
  "Copper Sheet",
  "Stainless Steel",
  "Other Thin Sheet Materials",
]) {
  assert.ok(data.includes(material), `Missing material guidance: ${material}`);
}
assert.match(
  data,
  /Actual cutting capacity depends on material grade, tensile strength, sheet thickness and machine model\./,
);

for (const question of [
  "What is a small electric shearing machine?",
  "What is an electric sheet metal shear used for?",
  "What thickness can a small electric shearing machine cut?",
  "Which Q11G model should I choose?",
  "Can a small electric shear cut galvanized sheet?",
  "Is a small electric shear suitable for HVAC duct fabrication?",
  "What is the difference between a small electric shear and an energy-saving electric shear?",
  "What is the difference between an electric shear and a hydraulic shear?",
  "How much does a small electric shearing machine cost?",
]) {
  assert.ok(data.includes(question), `Missing FAQ: ${question}`);
}
assert.equal((data.match(/question:/g) ?? []).length, 9, "Expected exactly nine FAQs");
assert.match(
  data,
  /model[\s\S]*material[\s\S]*thickness[\s\S]*cutting width[\s\S]*voltage[\s\S]*configuration[\s\S]*destination[\s\S]*shipping/i,
  "Price answer must list quotation inputs",
);

for (const [label, href] of [
  ["shearing machines", "/products/series/shearing-machines"],
  ["foot operated shearing machine", "/products/foot-shear"],
  ["energy-saving electric shearing machine", "/products/energy-saving-electric-shearing-machine"],
  ["hydraulic swing beam shearing machine", "/products/hydraulic-swing-beam-shear"],
  ["sheet metal folding machine", "/products/electric-sheet-metal-folding-machine"],
  ["HVAC lock forming machine", "/products/multi-function-lock-forming-machine"],
]) {
  assert.ok(data.includes(`label: "${label}"`), `Missing internal anchor: ${label}`);
  assert.ok(data.includes(`href: "${href}"`), `Missing internal route: ${href}`);
}

assert.ok(data.includes('imageAlt: "small electric shearing machine for thin sheet metal cutting"'));
assert.ok(data.includes('structureImageAlt: "Q11G small electric shearing machine structure"'));
assert.match(shared, /<Image[\s\S]{0,500}\bpriority\b/);
assert.match(shared, /alt=\{content\.structureImageAlt \?\? content\.imageAlt\}/);

for (const schemaType of ["Product", "ProductModel", "BreadcrumbList", "Organization", "FAQPage"]) {
  assert.ok(shared.includes(`"@type": "${schemaType}"`), `Missing ${schemaType} schema`);
}
for (const forbidden of [
  /priceCurrency/,
  /aggregateRating/,
  /availability/,
  /\boffers\s*:/,
  /\breview\s*:/,
  /\baward\s*:/,
]) {
  assert.doesNotMatch(shared, forbidden, "Schema must not invent commercial data");
}

assert.match(shared, /product\.technicalParameters/);
assert.match(shared, /splitColumnHeading/);
assert.match(shared, /data-table-heading-unit/);
assert.match(shared, /max-w-full overflow-x-auto/);
assert.match(types, /heroSubtitle\?:\s*string/);
assert.match(types, /manufacturer\?:/);
assert.match(types, /relatedLinks\?:/);

assert.doesNotMatch(
  energyData,
  /title:\s*"Small Electric Shearing Machine"/,
  "Energy-saving page must not target the Small Electric exact H1",
);
assert.ok(energyData.includes("Energy-Saving Electric Shearing Machine"));
assert.ok(energyData.includes("reduce unnecessary power use"));
assert.match(energyContract, /Energy-Saving Electric Shear page source contract passed/);

assert.match(nextConfig, /\.\.\.legacyProductRedirects/);
assert.match(sitemap, /\.\.\.products\.map/);
assert.match(robots, /allow:\s*"\/"/);
assert.match(robots, /sitemap:\s*`\$\{siteUrl\}\/sitemap\.xml`/);

console.log("Small Electric Shearing Machine SEO contract passed.");
