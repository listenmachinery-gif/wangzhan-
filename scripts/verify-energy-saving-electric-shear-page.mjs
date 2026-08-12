import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), "utf8");

const requiredFiles = [
  "app/products/[id]/page.tsx",
  "components/ShearingSolutionPage.tsx",
  "components/EnergySavingElectricShearSolutionPage.tsx",
  "data/energy-saving-electric-shear-page.ts",
  "data/shearing-details.ts",
  "data/shearing-solution-types.ts",
];

for (const path of requiredFiles) {
  assert.ok(existsSync(resolve(root, path)), `Missing Energy-Saving page dependency: ${path}`);
}

const route = read("app/products/[id]/page.tsx");
const component = read("components/ShearingSolutionPage.tsx");
const wrapper = read("components/EnergySavingElectricShearSolutionPage.tsx");
const data = read("data/energy-saving-electric-shear-page.ts");
const source = read("data/shearing-details.ts");
const combined = `${route}\n${component}\n${wrapper}\n${data}`;

const energyMetadataBlock = route.match(
  /if \(product\.id === "energy-saving-electric-shearing-machine"\) \{([\s\S]*?)\n  \}\n\n  if \(product\.id === "hydraulic-swing-beam-shear"\)/,
)?.[1];
assert.ok(energyMetadataBlock, "Energy-Saving metadata branch is missing or misplaced");
assert.match(energyMetadataBlock, /Energy-Saving Electric Shearing Machine \| ZYRON/);
assert.match(
  energyMetadataBlock,
  /Energy-saving electric shearing machine for efficient thin sheet cutting with reduced unnecessary power use, low-noise operation and Q11G models for daily production\./,
);
assert.match(energyMetadataBlock, /canonical: `\/products\/\$\{product\.id\}`/);
assert.match(
  energyMetadataBlock,
  /alt: "energy-saving electric shearing machine for thin sheet metal cutting"/,
);
assert.doesNotMatch(energyMetadataBlock, /keywords\s*:/);

assert.match(wrapper, /energySavingElectricShearPageContent/);
assert.match(route, /<EnergySavingElectricShearSolutionPage product=\{product\}/);
assert.match(data, /title: "Energy-Saving Electric Shearing Machine"/);
assert.match(
  data,
  /heroSubtitle:\s*"Energy-Efficient Electric Sheet Metal Shear for Daily Thin-Sheet Production"/,
);
assert.match(data, /structureImageAlt:\s*"Q11G energy-saving electric shearing machine structure"/);

for (const heading of [
  "Energy-Saving Electric Shearing Machine Overview",
  "What Production Costs Can This Machine Reduce?",
  "How Does the Energy-Saving Mechanism Work?",
  "Reduced Power Consumption During Non-Cutting Time",
  "Low-Noise Daily Workshop Operation",
  "What Materials Can It Cut?",
  "Q11G Technical Specifications",
  "How to Choose the Right Q11G Model",
  "Energy-Saving Electric Shear vs Small Electric Shear",
  "Energy-Saving Electric Shear vs Hydraulic Shearing Machine",
  "Energy-Saving Electric Shearing Machine Manufacturer",
  "Energy-Saving Electric Shearing Machine FAQ",
  "Request an Energy-Saving Electric Shearing Machine Quote",
]) {
  assert.ok(combined.includes(heading), `Missing required buyer-facing heading: ${heading}`);
}

for (const keyword of [
  "Energy Saving Electric Shearing Machine",
  "Electric Sheet Metal Shear",
  "Electric Sheet Metal Shearing Machine",
  "Motorized Sheet Metal Shear",
  "Electric Sheet Metal Cutting Machine",
  "Energy-Efficient Shearing Machine",
  "Energy-Efficient Sheet Metal Shear",
  "Low Energy Electric Shearing Machine",
  "Thin Sheet Metal Shearing Machine",
  "HVAC Sheet Metal Shear",
  "Q11G Electric Shearing Machine",
  "energy-efficient sheet metal cutting",
  "energy-conscious sheet metal workshop",
  "electric mechanical shearing machine",
]) {
  assert.ok(data.toLowerCase().includes(keyword.toLowerCase()), `Missing semantic coverage: ${keyword}`);
}

for (const application of [
  "HVAC Duct Fabrication",
  "Galvanized Sheet Processing",
  "Roofing Sheet Processing",
  "Electrical Cabinet Manufacturing",
  "Metal Enclosure Production",
  "Small and Medium Sheet Metal Workshops",
  "Daily Batch Sheet Cutting",
  "General Metal Fabrication",
]) {
  assert.ok(data.includes(application), `Missing application: ${application}`);
}

for (const material of [
  "Mild Steel",
  "Galvanized Sheet",
  "Stainless Steel",
  "Aluminum Sheet",
  "Copper Sheet",
  "Thin Metal Sheet",
]) {
  assert.ok(data.includes(material), `Missing material guidance: ${material}`);
}
assert.match(
  data,
  /Actual cutting capacity depends on material grade, tensile strength, sheet thickness and selected machine model\./,
);
assert.match(data, /actual energy use depends on model, motor power and cutting frequency/i);

const expectedModels = [
  ["Q11G-2 x 2000", "2", "3000", "4.5"],
  ["Q11G-2 x 2500", "2", "3000", "5.5"],
  ["Q11G-3 x 1300", "3", "1300", "4.5"],
  ["Q11G-3 x 1500", "3", "1500", "4.5"],
  ["Q11G-3 x 1600", "3", "1600", "4.5"],
  ["Q11G-3 x 2000", "3", "2000", "5.5"],
  ["Q11G-3 x 2500", "3", "2500", "5.5"],
  ["Q11G-4 x 1300", "4", "1300", "5.5"],
  ["Q11G-4 x 1500", "4", "1500", "5.5"],
  ["Q11G-4 x 1600", "4", "1600", "5.5"],
  ["Q11G-4 x 2000", "4", "2000", "7.5"],
  ["Q11G-4 x 2500", "4", "2500", "7.5"],
  ["Q11G-6 x 1300", "6", "1300", "7.5"],
  ["Q11G-6 x 1600", "6", "1600", "7.5"],
];

const energySourceBlock = source.match(
  /"energy-saving-electric-shearing-machine": \{([\s\S]*?)\n  \},\n  "hydraulic-swing-beam-shearing-machine"/,
)?.[1];
assert.ok(energySourceBlock, "Energy-Saving source parameter block is missing");
for (const [model, thickness, width, power] of expectedModels) {
  const rowPattern = new RegExp(
    `"${model.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[\\s\\S]{0,160}?"${thickness}"[\\s\\S]{0,80}?"${width}"[\\s\\S]{0,240}?"${power}"`,
  );
  assert.match(energySourceBlock, rowPattern, `Original values changed or model is missing: ${model}`);
  assert.ok(data.includes(model), `Model guide does not cover source model: ${model}`);
}
assert.equal((energySourceBlock.match(/"Q11G-/g) ?? []).length, 14, "Expected fourteen Q11G rows");
assert.match(data, /NEEDS PRODUCT DATA VERIFICATION/);
assert.match(data, /Q11G-2 x 2000/);
assert.match(data, /Q11G-2 x 2500/);
assert.match(data, /published 3000 mm width/i);

const expectedFaqs = [
  "What is an energy-saving electric shearing machine?",
  "How does an energy-saving electric shearing machine save energy?",
  "Does the machine consume power when it is not shearing?",
  "How much power can an energy-saving electric shearing machine save?",
  "What materials can an electric sheet metal shear cut?",
  "Can it cut galvanized steel?",
  "Can it cut stainless steel?",
  "What sheet thickness can it cut?",
  "Which Q11G model should I choose?",
  "What cutting widths are available?",
  "What is the difference between an energy-saving electric shear and a small electric shear?",
  "What is the difference between an electric shear and a hydraulic shear?",
  "How much does an energy-saving electric shearing machine cost?",
];
assert.equal((data.match(/question:/g) ?? []).length, 13, "Expected thirteen FAQs");
for (const faq of expectedFaqs) {
  assert.ok(data.includes(faq), `Missing FAQ: ${faq}`);
}

const expectedLinks = [
  ["shearing machines", "/products/series/shearing-machines"],
  ["small electric shearing machine", "/products/compact-electric-shearing-machine"],
  ["foot operated shearing machine", "/products/foot-shear"],
  ["hydraulic swing beam shearing machine", "/products/hydraulic-swing-beam-shear"],
  ["hydraulic guillotine shearing machine", "/products/hydraulic-guillotine-shear"],
  ["sheet metal folding machine", "/products/electric-sheet-metal-folding-machine"],
  ["HVAC lock forming machine", "/products/multi-function-lock-forming-machine"],
];
for (const [label, href] of expectedLinks) {
  assert.ok(data.includes(`label: "${label}"`), `Missing internal-link label: ${label}`);
  assert.ok(data.includes(`href: "${href}"`), `Missing internal-link href: ${href}`);
}

for (const type of ["Product", "ProductModel", "BreadcrumbList", "FAQPage", "Organization"]) {
  assert.ok(component.includes(`"${type}"`), `Missing schema type: ${type}`);
}
assert.match(component, /hasVariant: technicalParameters\.rows\.map/);
assert.match(component, /manufacturer\?\.intro/);
assert.match(component, /splitColumnHeading/);
assert.match(component, /data-table-heading-unit/);
assert.match(component, /overflow-x-auto/);

for (const prohibited of [
  /(?:30|50|70|90)%\s+(?:energy|power)/i,
  /world[- ]leading/i,
  /best[- ]in[- ]class/i,
  /aggregateRating/,
  /priceCurrency/,
  /availability/,
  /review\s*:/,
  /certification\s*:/,
]) {
  assert.doesNotMatch(combined, prohibited);
}

console.log("Energy-Saving Electric Shear page source contract passed. SEO requirements verified.");
