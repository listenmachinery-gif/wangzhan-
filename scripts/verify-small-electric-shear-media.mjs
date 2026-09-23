import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";

const root = process.cwd();
const { smallElectricShearPageContent } = await import("../data/small-electric-shear-page.ts");
const { shearingProductDetails } = await import("../data/shearing-details.ts");

const expectedApplicationTitles = [
  "HVAC and Duct Fabrication",
  "Roofing and Architectural Sheet Work",
  "Sign Making and Metal Panel Preparation",
  "Electrical Cabinet and Enclosure Fabrication",
  "General Sheet Metal Fabrication",
  "Repair and Maintenance Workshops",
  "Small-Batch and Mixed Production",
  "Material Preparation Before Forming",
];

const expectedMaterialTitles = [
  "Mild Steel Sheet",
  "Galvanized Steel Sheet",
  "Aluminum Sheet",
  "Stainless Steel Sheet",
  "Copper Sheet",
  "Brass Sheet",
];

const expectedParameterRows = [
  ["Q11G-2 x 600", "2", "600", "1 deg 30 min", "30", "500", "3", "1200 x 640 x 1100"],
  ["Q11G-2 x 800", "2", "800", "1 deg 30 min", "30", "500", "3", "1400 x 640 x 1100"],
  ["Q11G-2 x 1000", "2", "1000", "1 deg 30 min", "30", "500", "3", "1600 x 640 x 1100"],
  ["Q11G-2 x 1300", "2", "1300", "1 deg 30 min", "30", "500", "3", "1900 x 640 x 1100"],
  ["Q11G-2 x 1500", "2", "1500", "1 deg 30 min", "30", "500", "3", "2100 x 640 x 1100"],
  ["Q11G-2 x 1600", "2", "1600", "1 deg 30 min", "30", "500", "3", "2200 x 640 x 1100"],
  ["Q11G-1.5 x 2000", "1.5", "2000", "1 deg 30 min", "30", "500", "3", "2600 x 640 x 1100"],
  ["Q11G-1.2 x 2500", "1.2", "2500", "1 deg 30 min", "30", "500", "3", "3100 x 640 x 1100"],
];

const expectedFaqs = [
  {
    question: "What is a small electric shearing machine?",
    answer:
      "It is a compact powered shear for straight cutting of suitable thin sheet. The Q11G design uses an electric motor, reducer, brake and mechanical transmission instead of manual pedal or hydraulic power.",
  },
  {
    question: "What is an electric sheet metal shear used for?",
    answer:
      "It prepares straight blanks for HVAC ducts, roofing, signs, electrical cabinets, light fabrication and other small-batch sheet-metal work.",
  },
  {
    question: "What thickness can a small electric shearing machine cut?",
    answer:
      "The published compact Q11G rows range from 1.2 to 2 mm depending on cutting width. Q11G-2 models cover widths up to 1600 mm, while the listed 2000 and 2500 mm models have lower published maximum thicknesses. Material strength must also be confirmed.",
  },
  {
    question: "Which Q11G model should I choose?",
    answer:
      "Choose from material and grade, thickness, required cutting width, daily volume, back-gauge requirement, floor space and voltage. Do not select only from the 2 mm label.",
  },
  {
    question: "Can a small electric shear cut galvanized sheet?",
    answer:
      "Galvanized sheet is a listed application, but the coating, base-metal grade, tensile strength, thickness and width must match the selected model.",
  },
  {
    question: "Is a small electric shear suitable for HVAC duct fabrication?",
    answer:
      "Yes, it can prepare confirmed galvanized blanks before folding, lock forming, flange forming and duct assembly. It does not replace those downstream machines.",
  },
  {
    question: "What is the difference between a small electric shear and an energy-saving electric shear?",
    answer:
      "The small electric page emphasizes compact footprint, small workshops, small batches and the compact Q11G range. The energy-saving page emphasizes reduced unnecessary power use, lower noise and operating-cost control.",
  },
  {
    question: "What is the difference between an electric shear and a hydraulic shear?",
    answer:
      "A compact electric shear uses a motorized mechanical drive for suitable thin-sheet work. A hydraulic shear provides greater shearing force and is generally selected for heavier material or more demanding production, with a more complex hydraulic system.",
  },
  {
    question: "How much does a small electric shearing machine cost?",
    answer:
      "Small electric shearing machine price depends on model, material, thickness, cutting width, voltage, configuration, destination and shipping requirement. Request a confirmed quotation rather than relying on an unverified fixed price for a small electric shearing machine for sale.",
  },
];

assert.deepEqual(
  smallElectricShearPageContent.applications.map((item) => item.title),
  expectedApplicationTitles,
  "The document's eight application scenarios must be visible in order",
);
assert.deepEqual(
  smallElectricShearPageContent.materials.items.map((item) => item.title),
  expectedMaterialTitles,
  "The document's six material categories must be visible in order",
);
assert.equal(smallElectricShearPageContent.advantages.length, 10, "The document requires ten buyer advantages");
assert.deepEqual(smallElectricShearPageContent.faqs, expectedFaqs, "The existing nine FAQs must remain unchanged");
assert.deepEqual(
  shearingProductDetails["small-electric-shearing-machine"]?.technicalParameters.rows,
  expectedParameterRows,
  "The original eight Q11G parameter rows must remain unchanged",
);

const mediaItems = [
  ...smallElectricShearPageContent.applications,
  ...smallElectricShearPageContent.materials.items,
];
for (const item of mediaItems) {
  assert.equal(typeof item.image, "string", `${item.title} is missing its real photograph`);
  assert.match(item.image, /^\/products\/.+\.webp$/, `${item.title} must use a local WebP photograph`);
  assert.equal(typeof item.alt, "string", `${item.title} is missing image alt text`);
  assert.ok(item.alt.length >= 32, `${item.title} alt text is not descriptive enough`);
  assert.ok(existsSync(resolve(root, `public${item.image}`)), `${item.title} image file does not exist`);
}
assert.equal(
  new Set(mediaItems.map((item) => item.image)).size,
  14,
  "Every application and material card must use a distinct real photograph",
);

const sourcePhotoIds = mediaItems.map((item) => {
  const sourceManifest = readFileSync(resolve(root, `public${dirname(item.image)}`, "SOURCES.md"), "utf8");
  const sourceLine = sourceManifest
    .split("\n")
    .find((line) => line.includes(`\`${basename(item.image)}\``));
  const sourcePhotoId = sourceLine?.match(/Photo (\d+)/)?.[1];

  assert.ok(sourcePhotoId, `${item.title} is missing a traceable source-photo ID`);
  return sourcePhotoId;
});
assert.equal(
  new Set(sourcePhotoIds).size,
  14,
  "Every application and material card must come from a genuinely distinct source photograph",
);

const refreshedDocumentSections = JSON.stringify({
  overview: smallElectricShearPageContent.overview,
  applications: smallElectricShearPageContent.applications,
  materials: smallElectricShearPageContent.materials,
  advantages: smallElectricShearPageContent.advantages,
});
assert.doesNotMatch(
  refreshedDocumentSections,
  /foot[- ]operated shear|foot shear/i,
  "Copied foot-shear wording must be corrected in refreshed document sections",
);
assert.doesNotMatch(
  refreshedDocumentSections,
  /more repeatable powered output/i,
  "The page must not make an unsupported comparative output claim",
);
assert.match(
  smallElectricShearPageContent.materials.note,
  /material type[\s\S]*grade[\s\S]*tensile strength[\s\S]*hardness or temper[\s\S]*sheet thickness[\s\S]*cutting length[\s\S]*blade condition[\s\S]*blade clearance/i,
  "The document's material-capacity factors must remain explicit",
);

console.log("Small Electric Shear document and real-image contract passed.");
