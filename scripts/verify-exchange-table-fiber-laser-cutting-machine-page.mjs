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
const data = readSource("data/exchange-table-fiber-laser-cutting-machine-page.ts");
const component = readSource(
  "components/ExchangeTableFiberLaserCuttingMachineSolutionPage.tsx",
);
const products = readSource("data/products.ts");
const combinedPageSource = `${data}\n${component}`;

assert.match(route, /ExchangeTableFiberLaserCuttingMachineSolutionPage/);
assert.match(
  route,
  /product\.id === "exchange-table-fiber-laser-cutting-machine"/,
);
assert.match(
  route,
  /Exchange-Table Fiber Laser Cutting Machine \| High-efficiency Sheet Metal Cutting Solution/,
);
assert.match(
  route,
  /Exchange-table fiber laser cutting machine for high-efficiency sheet metal cutting, batch fabrication, stainless steel products, cabinet manufacturing and workshop production\./,
);

for (const section of [
  "hero",
  "pain-points",
  "solutions",
  "applications",
  "materials",
  "process",
  "exchange-table-design",
  "laser-power",
  "assist-gas",
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

assert.match(component, /data-exchange-table-fiber-laser-cutting-machine-page/);
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

assert.match(
  data,
  /H1:\s*"Exchange-Table Fiber Laser Cutting Machine"/,
);
assert.match(
  data,
  /subtitle:\s*"High-efficiency sheet metal laser cutting solution with dual exchange platforms\."/,
);
assert.match(data, /Get High-efficiency Cutting Solution/);
assert.match(data, /Request Machine Configuration/);
assert.match(data, /Dual Exchange Platforms/);
assert.match(data, /Reduce Loading Waiting Time/);
assert.match(data, /Suitable for Batch Sheet Cutting/);
assert.match(data, /Practical for Fabrication Workshops/);
assert.match(
  data,
  /Customizable \/ Please confirm with our sales engineer/,
);

const applicationImageMatches = [
  ...data.matchAll(/image:\s*"(\/products\/(?:[^"\n]+))"/g),
].map((match) => match[1]);
assert.equal(applicationImageMatches.length, 10);
assert.equal(new Set(applicationImageMatches).size, 10);
assert.ok(
  applicationImageMatches.every((image) => /\.(?:jpe?g|webp|png)$/i.test(image)),
  "application media must use real raster image files",
);
assert.doesNotMatch(data, /image:\s*"[^"]+\.svg"/i);

for (const heading of [
  "Model",
  "Working Area (mm)",
  "Laser Power (kW)",
  "Cutting Material",
  "Maximum Cutting Thickness (mm)",
  "Exchange Table Type",
  "Exchange Time (s)",
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

assert.match(
  products,
  /image:\s*"\/products\/catalog\/exchange-table-fiber-laser-cutting-machine\.png"/,
);
assert.match(
  component,
  /Exchange-table fiber laser cutting machine for sheet metal cutting/,
);
assert.doesNotMatch(combinedPageSource, /\bprice\b|qr\s*code|二维码/i);

console.log("Exchange-Table Fiber Laser Cutting Machine page contract passed.");
