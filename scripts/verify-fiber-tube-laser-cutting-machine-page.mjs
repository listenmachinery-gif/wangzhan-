import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const readSource = (relativePath) => {
  const absolutePath = path.join(root, relativePath);
  return fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, "utf8") : "";
};

const route = readSource("app/products/[id]/page.tsx");
const data = readSource("data/fiber-tube-laser-cutting-machine-page.ts");
const component = readSource(
  "components/FiberTubeLaserCuttingMachineSolutionPage.tsx",
);
const products = readSource("data/products.ts");
const combinedPageSource = `${data}\n${component}`;

assert.match(route, /FiberTubeLaserCuttingMachineSolutionPage/);
assert.match(route, /product\.id === "fiber-tube-laser-cutting-machine"/);
assert.match(
  route,
  /Fiber Tube Laser Cutting Machine \| Metal Pipe Cutting Solution/,
);
assert.match(
  route,
  /Fiber tube laser cutting machine for round tube, square tube, rectangular tube, profile tube, metal furniture, fitness equipment, guardrail, frame structures and tube fabrication workshops\./,
);

for (const section of [
  "hero",
  "pain-points",
  "solutions",
  "applications",
  "tube-types",
  "materials",
  "process",
  "chuck-system",
  "loading-unloading",
  "laser-power",
  "cutting-gas",
  "advantages",
  "comparison",
  "workflow",
  "selection",
  "technical",
  "safety",
  "faq",
  "internal-links",
  "cta",
]) {
  assert.match(
    component,
    new RegExp(`data-section=["']${section}["']`),
    `dedicated page must render the ${section} section`,
  );
}

assert.match(component, /data-fiber-tube-laser-cutting-machine-page/);
assert.equal((component.match(/<h1\b/g) ?? []).length, 1);
assert.match(component, /product\.specs/);
assert.match(component, /splitSpecificationHeading/);
assert.match(component, /heading\.label/);
assert.match(component, /heading\.unit/);
assert.match(component, /block whitespace-nowrap/);
assert.match(component, /block text-center/);
assert.match(component, /overflow-x-auto/);
assert.match(component, /loading="lazy"/);
assert.match(component, /"@type": "Product"/);
assert.match(component, /"@type": "FAQPage"/);
assert.match(component, /"@type": "BreadcrumbList"/);
assert.doesNotMatch(combinedPageSource, /["']offers["']\s*:/i);

assert.match(data, /H1:\s*"Fiber Tube Laser Cutting Machine"/);
assert.match(
  data,
  /subtitle:\s*"Professional CNC laser tube cutting solution for round, square, rectangular and profile tubes\."/,
);
assert.match(data, /Get Tube Cutting Solution/);
assert.match(data, /Request Machine Configuration/);
assert.match(data, /Dedicated Tube Laser Cutting/);
assert.match(data, /Round \/ Square \/ Rectangular Tubes/);
assert.match(data, /CNC Pipe Cutting Workflow/);
assert.match(data, /Practical for Metal Structure Fabrication/);
assert.match(
  data,
  /Customizable \/ Please confirm with our sales engineer/,
);

const applicationImageMatches = [
  ...data.matchAll(/image:\s*"(\/products\/fiber-tube-laser-cutting-machine-applications\/[^"\n]+)"/g),
].map((match) => match[1]);

assert.equal(applicationImageMatches.length, 12);
assert.equal(new Set(applicationImageMatches).size, 12);
assert.ok(
  applicationImageMatches.every((image) => /\.(?:jpe?g|webp|png)$/i.test(image)),
  "application media must use real raster image files",
);
assert.doesNotMatch(data, /image:\s*"[^"]+\.svg"/i);

for (const heading of [
  "Model",
  "Laser Power (kW)",
  "Tube Type",
  "Tube Diameter / Section Range (mm)",
  "Tube Length (mm)",
  "Maximum Tube Wall Thickness (mm)",
  "Chuck Type",
  "Loading Method",
  "Unloading Method",
  "Positioning Accuracy (mm)",
  "Max Cutting Speed (m/min)",
  "Transmission System",
  "Control System",
  "Cooling System",
  "Machine Size L × W × H (mm)",
  "Machine Weight (kg)",
  "Application",
]) {
  assert.match(data, new RegExp(heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}

assert.match(products, /name:\s*"Fiber Tube Laser Cutting Machine"/);
assert.ok(
  fs.existsSync(
    path.join(
      root,
      "public/products/catalog/fiber-tube-laser-cutting-machine.png",
    ),
  ),
  "the original Fiber Tube product image must remain available",
);
assert.match(
  component,
  /Fiber tube laser cutting machine for metal pipe and profile cutting/,
);
assert.doesNotMatch(combinedPageSource, /qr\s*code|二维码/i);

console.log("Fiber Tube Laser Cutting Machine page contract passed.");
