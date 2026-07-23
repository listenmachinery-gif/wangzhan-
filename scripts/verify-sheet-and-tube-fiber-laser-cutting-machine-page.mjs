import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => {
  const absolutePath = resolve(root, path);
  return existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : "";
};

const route = read("app/products/[id]/page.tsx");
const component = read(
  "components/SheetAndTubeFiberLaserCuttingMachineSolutionPage.tsx",
);
const data = read("data/sheet-and-tube-fiber-laser-cutting-machine-page.ts");
const packageJson = JSON.parse(read("package.json"));
const sources = read(
  "public/products/sheet-and-tube-fiber-laser-cutting-machine-applications/SOURCES.md",
);

assert.equal(
  packageJson.scripts?.["verify:sheet-and-tube-laser"],
  "node scripts/verify-sheet-and-tube-fiber-laser-cutting-machine-page.mjs",
  "package.json must expose the focused page verifier",
);

assert.match(
  route,
  /SheetAndTubeFiberLaserCuttingMachineSolutionPage/,
  "route must import the dedicated sheet-and-tube page",
);
assert.match(
  route,
  /product\.id === "sheet-and-tube-fiber-laser-cutting-machine"/,
  "route must dispatch the sheet-and-tube product to its dedicated page",
);
assert.match(
  route,
  /Sheet and Tube Fiber Laser Cutting Machine \| Plate & Pipe Cutting Solution/,
  "route must contain the exact meta title",
);
assert.match(
  route,
  /Sheet and tube fiber laser cutting machine for metal sheet cutting, pipe cutting, furniture, fitness equipment, frame structures and fabrication workshops\./,
  "route must contain the approved meta description",
);

for (const keyword of [
  "Sheet and Tube Fiber Laser Cutting Machine",
  "Plate and Tube Fiber Laser Cutting Machine",
  "Sheet Tube Laser Cutting Machine",
  "Plate Pipe Fiber Laser Cutting Machine",
  "Dual-use Fiber Laser Cutting Machine",
  "Sheet and Pipe Laser Cutter",
  "Metal Sheet and Tube Laser Cutter",
  "CNC Fiber Laser Cutting Machine",
  "Sheet Metal and Tube Cutting Solution",
  "Fiber Laser Cutter for Metal Sheet and Tube",
]) {
  assert.ok(route.includes(keyword), `metadata must include keyword: ${keyword}`);
}

assert.match(
  component,
  /data-sheet-and-tube-fiber-laser-cutting-machine-page/,
  "component must expose the dedicated page marker",
);
assert.equal(
  (component.match(/<h1\b/g) ?? []).length,
  1,
  "component source must contain exactly one H1",
);
assert.match(component, /product\.image/, "component must reuse the original product image");
assert.match(component, /product\.specs/, "component must resolve applicable original specs");
assert.match(
  component,
  /Sheet and tube fiber laser cutting machine for metal sheet and pipe cutting/,
  "component must use the approved product-image alt",
);
assert.match(component, /splitSpecificationHeading/);
assert.match(component, /whitespace-nowrap/);
assert.match(component, /text-center/);
assert.ok(
  (component.match(/overflow-x-auto/g) ?? []).length >= 2,
  "comparison and specification tables must scroll locally",
);
assert.match(component, /loading="lazy"/, "application images must be lazy loaded");

const requiredSections = [
  "hero",
  "pain-points",
  "solutions",
  "applications",
  "sheet-materials",
  "tube-types",
  "sheet-cutting-process",
  "tube-cutting-process",
  "dual-use-design",
  "laser-power",
  "cutting-gas",
  "advantages",
  "comparison",
  "fabrication-workflow",
  "selection-guide",
  "technical-specifications",
  "workshop-safety",
  "faq",
  "internal-links",
  "final-cta",
];

for (const section of requiredSections) {
  assert.ok(
    component.includes(`data-section="${section}"`),
    `component must render data-section=${section}`,
  );
}
assert.equal(
  (component.match(/data-section="/g) ?? []).length,
  requiredSections.length,
  "component must render exactly 20 primary sections",
);

for (const schemaType of ["ProductModel", "FAQPage", "BreadcrumbList"]) {
  assert.ok(component.includes(`"@type": "${schemaType}"`), `missing ${schemaType} schema`);
}

assert.match(
  data,
  /Customizable \/ Please confirm with our sales engineer/,
  "data must use the approved confirmation placeholder",
);
assert.match(data, /Sheet and Tube Fiber Laser Cutting Machine/);
assert.match(
  data,
  /One machine for metal sheet cutting and tube cutting in flexible fabrication workshops\./,
);
assert.match(data, /Get Sheet & Tube Cutting Solution/);
assert.match(data, /Request Machine Configuration/);

for (const sourceIndex of [0, 1, 2, 3]) {
  assert.match(
    data,
    new RegExp(`sourceIndex:\\s*${sourceIndex}`),
    `data must preserve original product spec ${sourceIndex}`,
  );
}

const imagePathPattern =
  /image:\s*"(\/products\/sheet-and-tube-fiber-laser-cutting-machine-applications\/[^"]+)"/g;
const imagePaths = Array.from(data.matchAll(imagePathPattern), (match) => match[1]);
assert.equal(imagePaths.length, 11, "data must contain eleven application image entries");
assert.equal(new Set(imagePaths).size, 11, "application image paths must be unique");

for (const imagePath of imagePaths) {
  assert.doesNotMatch(imagePath, /\.svg$/i, "applications must not use line-art SVG files");
  assert.ok(
    existsSync(resolve(root, `public${imagePath}`)),
    `application image must exist: ${imagePath}`,
  );
}

assert.match(sources, /Pexels License|Unsplash License/);
assert.match(sources, /bodor\.com/i);
assert.match(sources, /senfenglaser\.com/i);
assert.match(sources, /do not define guaranteed ZYRON specifications/i);

const combined = `${route}\n${component}\n${data}`;
assert.doesNotMatch(combined, /offers\s*:/i, "Product schema must omit offers");
assert.doesNotMatch(combined, /\bprice\b|qr code|二维码/i);
assert.doesNotMatch(
  combined,
  /completely replaces? (a )?dedicated tube|zero burr|no oxidation|efficiency (increase|improvement).*%/i,
  "page must avoid unsupported absolute performance claims",
);

console.log("Sheet and Tube Fiber Laser Cutting Machine page contract passed.");
