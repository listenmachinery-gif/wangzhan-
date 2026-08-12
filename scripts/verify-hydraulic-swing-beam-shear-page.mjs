import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), "utf8");

const requiredFiles = [
  "app/products/[id]/page.tsx",
  "components/ShearingSolutionPage.tsx",
  "components/HydraulicSwingBeamShearSolutionPage.tsx",
  "data/hydraulic-swing-beam-shear-page.ts",
  "data/hydraulic-guillotine-shear-page.ts",
  "data/shearing-details.ts",
  "next.config.ts",
];
for (const path of requiredFiles) {
  assert.ok(existsSync(resolve(root, path)), `Missing Swing Beam page dependency: ${path}`);
}

const route = read("app/products/[id]/page.tsx");
const component = read("components/ShearingSolutionPage.tsx");
const wrapper = read("components/HydraulicSwingBeamShearSolutionPage.tsx");
const data = read("data/hydraulic-swing-beam-shear-page.ts");
const guillotine = read("data/hydraulic-guillotine-shear-page.ts");
const source = read("data/shearing-details.ts");
const nextConfig = read("next.config.ts");
const combined = `${route}\n${component}\n${wrapper}\n${data}`;

const metadata = route.match(
  /if \(product\.id === "hydraulic-swing-beam-shear"\) \{([\s\S]*?)\n  \}\n\n  if \(product\.id === "hydraulic-guillotine-shear"\)/,
)?.[1];
assert.ok(metadata, "Hydraulic Swing Beam metadata branch is missing");
assert.match(metadata, /Hydraulic Swing Beam Shearing Machine \| ZYRON/);
assert.match(
  metadata,
  /Hydraulic swing beam shearing machine for reliable sheet metal cutting with QC12Y\/QC12K series, hydraulic drive, adjustable blade clearance and multiple capacities\./,
);
assert.match(metadata, /canonical: `\/products\/\$\{product\.id\}`/);
assert.match(metadata, /alt: "hydraulic swing beam shearing machine for sheet metal cutting"/);
assert.doesNotMatch(metadata, /keywords\s*:/);

assert.match(wrapper, /hydraulicSwingBeamShearPageContent/);
assert.match(route, /<HydraulicSwingBeamShearSolutionPage product=\{product\}/);
assert.match(data, /title: "Hydraulic Swing Beam Shearing Machine"/);
assert.match(
  data,
  /heroSubtitle:\s*"QC12Y\/QC12K Hydraulic Sheet Metal Shear for Reliable Plate Cutting"/,
);
assert.match(data, /structureImageAlt:\s*"QC12Y hydraulic swing beam shear structure"/);

for (const heading of [
  "Hydraulic Swing Beam Shearing Machine Overview",
  "What Problems Does a Hydraulic Swing Beam Shear Solve?",
  "How the Swing Beam Shearing Mechanism Works",
  "Why Choose a Hydraulic Swing Beam Shearing Machine?",
  "Materials a Hydraulic Swing Beam Shear Can Cut",
  "Hydraulic, Blade, Hold-Down and Back-Gauge Systems",
  "QC12Y/QC12K Technical Specifications",
  "Available Cutting Thicknesses and Lengths",
  "Hydraulic Swing Beam Shear vs Hydraulic Guillotine Shear",
  "How to Choose the Right Hydraulic Shearing Machine",
  "Hydraulic Swing Beam Shearing Machine Manufacturer",
  "Hydraulic Swing Beam Shearing Machine FAQ",
  "Request a Hydraulic Swing Beam Shearing Machine Quote",
]) {
  assert.ok(combined.includes(heading), `Missing buyer-facing heading: ${heading}`);
}

for (const keyword of [
  "Hydraulic Swing Beam Shear",
  "Swing Beam Shearing Machine",
  "Hydraulic Shearing Machine",
  "Hydraulic Sheet Metal Shear",
  "Sheet Metal Shearing Machine",
  "Metal Shearing Machine",
  "Hydraulic Metal Cutting Machine",
  "NC Hydraulic Swing Beam Shear",
  "CNC Hydraulic Swing Beam Shear",
  "QC12Y Hydraulic Swing Beam Shear",
  "QC12K Hydraulic Swing Beam Shear",
]) {
  assert.ok(data.toLowerCase().includes(keyword.toLowerCase()), `Missing semantic coverage: ${keyword}`);
}

for (const material of [
  "Mild Steel",
  "Carbon Steel",
  "Stainless Steel",
  "Galvanized Sheet",
  "Aluminum Sheet",
  "Copper Sheet",
  "Other Metal Plate",
]) {
  assert.ok(data.includes(material), `Missing material: ${material}`);
}
assert.match(
  data,
  /Actual cutting capacity depends on material grade, tensile strength, sheet thickness, working length and machine configuration\./,
);

for (const application of [
  "Sheet Metal Fabrication",
  "Machinery Manufacturing",
  "Steel Structure Fabrication",
  "Electrical Cabinet Manufacturing",
  "HVAC Equipment Manufacturing",
  "Metal Enclosure Production",
  "Automotive Sheet Metal Processing",
  "General Metalworking",
]) {
  assert.ok(data.includes(application), `Missing application: ${application}`);
}

const sourceBlock = source.match(
  /"hydraulic-swing-beam-shearing-machine": \{([\s\S]*?)\n  \},\n  "hydraulic-guillotine-shearing-machine"/,
)?.[1];
assert.ok(sourceBlock, "Original Swing Beam source block is missing");
assert.equal((sourceBlock.match(/\n          "\d+ x \d+",/g) ?? []).length, 40, "Expected forty source rows");
for (const model of [
  "4 x 2500", "4 x 6000", "6 x 2500", "6 x 6000", "8 x 2500", "8 x 6000",
  "10 x 2500", "10 x 6000", "12 x 2500", "12 x 8000", "16 x 2500", "16 x 8000",
  "20 x 2500", "20 x 6000", "25 x 2500", "25 x 3200", "30 x 2500", "30 x 3200",
  "40 x 2500", "40 x 3200",
]) {
  assert.ok(sourceBlock.includes(`"${model}"`), `Missing original capacity row: ${model}`);
  assert.ok(data.includes(model), `Model guide does not cover source capacity: ${model}`);
}
for (const field of [
  "CuttingThickness(mm)",
  "CuttingWidth(mm)",
  "CuttingAngle(deg)",
  "MaterialStrength(kN/cm)",
  "BackgaugeTravel(mm)",
  "CuttingTimes(T/min)",
  "Main MotorPower(kW)",
  "Overall DimensionsL x W x H(mm)",
]) {
  assert.ok(sourceBlock.includes(`"${field}"`), `Missing original parameter field: ${field}`);
}
assert.match(data, /NEEDS PRODUCT DATA VERIFICATION/);
assert.match(data, /exact QC12Y\/QC12K model prefix and controller mapping/i);

const expectedFaqs = [
  "What is a hydraulic swing beam shearing machine?",
  "How does a hydraulic swing beam shear work?",
  "What is a QC12Y hydraulic swing beam shear?",
  "What materials can a hydraulic swing beam shear cut?",
  "Can it cut stainless steel?",
  "What thickness can a hydraulic swing beam shear cut?",
  "What cutting lengths are available?",
  "What is the difference between a swing beam shear and a guillotine shear?",
  "What is the difference between QC12Y and QC12K?",
  "How do I choose the correct hydraulic shearing machine?",
  "What information is required for machine selection?",
  "How much does a hydraulic swing beam shearing machine cost?",
];
assert.equal((data.match(/question:/g) ?? []).length, 12, "Expected twelve FAQs");
for (const faq of expectedFaqs) assert.ok(data.includes(faq), `Missing FAQ: ${faq}`);

const links = [
  ["shearing machines", "/products/series/shearing-machines"],
  ["hydraulic guillotine shearing machine", "/products/hydraulic-guillotine-shear"],
  ["small electric shearing machine", "/products/compact-electric-shearing-machine"],
  ["energy-saving electric shearing machine", "/products/energy-saving-electric-shearing-machine"],
  ["NC hydraulic press brake", "/products/nc-hydraulic-press-brake"],
  ["hydraulic four-roll plate rolling machine", "/products/hydraulic-four-roll-plate-rolling-machine"],
  ["ZYRON factory", "/factory"],
];
for (const [label, href] of links) {
  assert.ok(data.includes(`label: "${label}"`), `Missing internal-link label: ${label}`);
  assert.ok(data.includes(`href: "${href}"`), `Missing internal-link URL: ${href}`);
}
assert.match(guillotine, /label: "hydraulic swing beam shearing machine"/);
assert.match(guillotine, /href: "\/products\/hydraulic-swing-beam-shear"/);
assert.match(guillotine, /near-linear guided blade-holder movement/);
assert.doesNotMatch(guillotine, /QC12Y\/QC12K platform/);
assert.doesNotMatch(guillotine, /Uses a practical arc-motion blade holder/);

for (const type of ["Product", "ProductModel", "BreadcrumbList", "FAQPage", "Organization"]) {
  assert.ok(component.includes(`"${type}"`), `Missing schema type: ${type}`);
}
assert.match(component, /hasVariant: technicalParameters\.rows\.map/);
assert.match(component, /manufacturer\?\.intro/);
assert.match(component, /splitColumnHeading/);
assert.match(component, /data-table-heading-unit/);
assert.match(component, /overflow-x-auto/);
assert.match(nextConfig, /\.\.\.legacyProductRedirects/);

for (const prohibited of [
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

console.log("Hydraulic Swing Beam Shear page source contract passed. SEO requirements verified.");
