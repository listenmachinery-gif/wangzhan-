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

const expectedDetailItems = [
  {
    image: "/products/shearing/small-electric/details/welded-steel-plate-construction-clean.png",
    title: "Welded Steel Plate Construction",
    text: "Rigid all-steel frame helps reduce deflection and maintain stable blade alignment for consistent cuts.",
  },
  {
    image: "/products/shearing/small-electric/details/ball-transfer-units-clean.png",
    title: "Ball Transfer Units",
    text: "Low-friction ball supports make sheet positioning smoother and reduce effort during feeding.",
  },
  {
    image: "/products/shearing/small-electric/details/polyurethane-hold-down-system-clean.png",
    title: "Polyurethane Hold-Down System",
    text: "Resilient hold-down pads secure the sheet while helping protect its surface during cutting.",
  },
  {
    image: "/products/shearing/small-electric/details/direct-coupled-motor-gear-reducer-clean.png",
    title: "Direct-Coupled Motor & Gear Reducer",
    text: "Compact direct drive delivers steady torque with fewer transmission components and reliable power transfer.",
  },
  {
    image: "/products/shearing/small-electric/details/brake-assembly-clean.png",
    title: "Brake Assembly",
    text: "Controls shaft overrun for precise, repeatable stopping between cutting cycles.",
  },
  {
    image: "/products/shearing/small-electric/details/high-alloy-tool-steel-blade-clean.png",
    title: "High-Alloy Tool Steel Blade",
    text: "Wear-resistant blade material retains a sharp cutting edge for clean, consistent results.",
  },
  {
    image: "/products/shearing/small-electric/details/manual-backgauge-clean.png",
    title: "Manual Backgauge",
    text: "Simple hand adjustment sets repeat dimensions quickly for accurate small-batch production.",
  },
  {
    image: "/products/shearing/small-electric/details/electrical-control-box-clean.png",
    title: "Electrical Control Box",
    text: "Centralized, clearly arranged components simplify operation, inspection, and routine maintenance.",
  },
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

const detailGallery = smallElectricShearPageContent.detailGallery;
assert.ok(detailGallery, "The Small Electric page must include its machine-detail gallery");
assert.equal(detailGallery?.eyebrow, "Machine Details");
assert.equal(detailGallery?.title, "Small Electric Shearing Machine Details");
const detailItems = detailGallery?.items ?? [];
assert.equal(detailItems.length, 8, "The gallery must contain eight machine-detail images");
assert.deepEqual(
  detailItems.map(({ image, title, text }) => ({ image, title, text })),
  expectedDetailItems,
  "The eight detail images, English names, benefits, and user-requested order must remain exact",
);
assert.equal(
  new Set(detailItems.map((item) => item.image)).size,
  8,
  "Every machine-detail card must use a distinct image",
);
for (const item of detailItems) {
  assert.match(item.image, /^\/products\/shearing\/small-electric\/details\/.+\.png$/);
  assert.ok(item.alt.length >= 32, `${item.image} alt text is not descriptive enough`);
  assert.ok(existsSync(resolve(root, `public${item.image}`)), `${item.image} does not exist`);
}

const expectedShowcaseImages = [
  {
    image: "/products/shearing/small-electric/showcase/front-left.webp",
    label: "Front Left View",
  },
  {
    image: "/products/shearing/small-electric/showcase/front-right.webp",
    label: "Front Right View",
  },
  {
    image: "/products/shearing/small-electric/showcase/rear-left.webp",
    label: "Rear Left View",
  },
  {
    image: "/products/shearing/small-electric/showcase/rear-right.webp",
    label: "Rear Right View",
  },
];
const productShowcase = smallElectricShearPageContent.productShowcase;
assert.ok(productShowcase, "The Small Electric page must include its four-image product showcase");
assert.equal(productShowcase?.eyebrow, "Product Showcase");
assert.equal(productShowcase?.title, "Explore the Machine from Every Angle");
assert.equal(
  productShowcase?.description,
  "Review the front, side and rear construction of the Q11G small electric shearing machine before selecting a model.",
);
const showcaseImages = productShowcase?.images ?? [];
assert.deepEqual(
  showcaseImages.map(({ image, label }) => ({ image, label })),
  expectedShowcaseImages,
  "The product showcase must keep the four supplied views in the approved order",
);
assert.equal(new Set(showcaseImages.map((item) => item.image)).size, 4, "Every showcase image must be distinct");
for (const item of showcaseImages) {
  assert.match(item.image, /^\/products\/shearing\/small-electric\/showcase\/.+\.webp$/);
  assert.ok(item.alt.length >= 32, `${item.image} alt text is not descriptive enough`);
  assert.ok(existsSync(resolve(root, `public${item.image}`)), `${item.image} does not exist`);
}

const expectedBackgaugeOptions = [
  {
    image: "/products/shearing/small-electric/backgauge-options/manually-adjustable-backgauge.webp",
    title: "Manually Adjustable Backgauge",
    text: "A straightforward, economical choice for flexible small-batch work, with direct stop positioning and simple day-to-day adjustment.",
  },
  {
    image: "/products/shearing/small-electric/backgauge-options/handwheel-adjustable-backgauge.webp",
    title: "Handwheel-Adjustable Backgauge",
    text: "Fine handwheel control makes precise dimensional changes easier and supports repeatable positioning without powered adjustment.",
  },
  {
    image: "/products/shearing/small-electric/backgauge-options/motorized-backgauge.webp",
    title: "Motorized Backgauge",
    text: "Powered positioning speeds up size changes, reduces manual setup effort, and improves repeatability for higher-volume production.",
  },
];

const expectedMaterialRangeItems = [
  {
    image: "/products/shearing/small-electric/material-range/mild-steel-sheet.webp",
    title: "Mild Steel Sheet",
  },
  {
    image: "/products/shearing/small-electric/material-range/aluminum-sheet.webp",
    title: "Aluminum Sheet",
  },
  {
    image: "/products/shearing/small-electric/material-range/galvanized-steel-sheet.webp",
    title: "Galvanized Steel Sheet",
  },
  {
    image: "/products/shearing/small-electric/material-range/stainless-steel-sheet.webp",
    title: "Stainless Steel Sheet",
  },
  {
    image: "/products/shearing/small-electric/material-range/copper-sheet.webp",
    title: "Copper Sheet",
  },
  {
    image: "/products/shearing/small-electric/material-range/printed-circuit-board.webp",
    title: "Printed Circuit Board",
  },
  {
    image: "/products/shearing/small-electric/material-range/stainless-steel-security-mesh.webp",
    title: "Stainless Steel Security Mesh",
  },
  {
    image: "/products/shearing/small-electric/material-range/prepainted-steel-sheet.webp",
    title: "Prepainted Steel Sheet",
  },
  {
    image: "/products/shearing/small-electric/material-range/glass-epoxy-laminate-sheet.webp",
    title: "Glass-Epoxy Laminate Sheet",
  },
];

const expectedIndustryGalleryItems = [
  {
    image: "/products/shearing/small-electric/industries/sheet-metal-fabrication-and-machinery-manufacturing.webp",
    title: "Sheet Metal Fabrication and Machinery Manufacturing",
    text: "Machine tool enclosures, production line drive guards, equipment shields",
  },
  {
    image: "/products/shearing/small-electric/industries/hvac-and-ventilation-systems.webp",
    title: "HVAC and Ventilation Systems",
    text: "Galvanized steel side panels for rectangular ducts, duct access panels",
  },
  {
    image: "/products/shearing/small-electric/industries/electrical-and-power-distribution-equipment-manufacturing.webp",
    title: "Electrical and Power Distribution Equipment Manufacturing",
    text: "Control cabinet doors, distribution box side panels, electrical component mounting plates",
  },
  {
    image: "/products/shearing/small-electric/industries/metal-building-envelopes-and-architectural-finishes.webp",
    title: "Metal Building Envelopes and Architectural Finishes",
    text: "Metal roof edge trim, window sill flashing, decorative ceiling panels",
  },
  {
    image: "/products/shearing/small-electric/industries/commercial-signage-fabrication.webp",
    title: "Commercial Signage Fabrication",
    text: "Aluminum storefront sign panels, backing panels for wayfinding signs, lightbox back panels",
  },
  {
    image: "/products/shearing/small-electric/industries/industrial-equipment-repair-and-retrofitting.webp",
    title: "Industrial Equipment Repair and Retrofitting",
    text: "Compressor access covers, replacement guard panels for existing equipment, sheet metal repair patches",
  },
  {
    image: "/products/shearing/small-electric/industries/commercial-kitchen-and-foodservice-equipment-manufacturing.webp",
    title: "Commercial Kitchen and Foodservice Equipment Manufacturing",
    text: "Stainless steel worktops, kitchen cabinet side panels, sink enclosure panels",
  },
  {
    image: "/products/shearing/small-electric/industries/home-appliance-and-commercial-refrigeration-equipment-manufacturing.webp",
    title: "Home Appliance and Commercial Refrigeration Equipment Manufacturing",
    text: "Freezer side panels, refrigerated display case back panels, washing machine rear covers",
  },
  {
    image: "/products/shearing/small-electric/industries/metal-furniture-and-storage-equipment-manufacturing.webp",
    title: "Metal Furniture and Storage Equipment Manufacturing",
    text: "Steel storage locker doors, tool cabinet drawer fronts, shelf panels for light-duty racks",
  },
];
const backgaugeCarousel = smallElectricShearPageContent.backgaugeCarousel;
assert.ok(backgaugeCarousel, "The Small Electric page must include its three-option backgauge carousel");
assert.equal(backgaugeCarousel?.eyebrow, "Backgauge Options");
assert.equal(backgaugeCarousel?.title, "Choose the Right Backgauge for Your Workflow");
assert.equal(
  backgaugeCarousel?.intro,
  "Compare three positioning systems for different setup, precision, and production requirements.",
);
const backgaugeOptions = backgaugeCarousel?.items ?? [];
assert.deepEqual(
  backgaugeOptions.map(({ image, title, text }) => ({ image, title, text })),
  expectedBackgaugeOptions,
  "The backgauge carousel must keep the three supplied options and approved English benefits in order",
);
assert.equal(backgaugeOptions.length, 3, "The carousel must contain exactly three backgauge options");
assert.equal(new Set(backgaugeOptions.map((item) => item.image)).size, 3, "Every backgauge option must use a distinct image");
for (const item of backgaugeOptions) {
  assert.match(item.image, /^\/products\/shearing\/small-electric\/backgauge-options\/.+\.webp$/);
  assert.ok(item.alt.length >= 32, `${item.image} alt text is not descriptive enough`);
  assert.ok(existsSync(resolve(root, `public${item.image}`)), `${item.image} does not exist`);
}

const materialRangeGallery = smallElectricShearPageContent.materialRangeGallery;
assert.ok(materialRangeGallery, "The Small Electric page must include its nine-image material range gallery");
assert.equal(materialRangeGallery?.eyebrow, "Material Versatility");
assert.equal(materialRangeGallery?.title, "Wide Application Range for Multiple Sheet Materials");
const materialRangeItems = materialRangeGallery?.items ?? [];
assert.deepEqual(
  materialRangeItems.map(({ image, title }) => ({ image, title })),
  expectedMaterialRangeItems,
  "The material gallery must keep all nine supplied images and English names in order",
);
assert.equal(materialRangeItems.length, 9, "The material gallery must contain exactly nine items");
assert.equal(new Set(materialRangeItems.map((item) => item.image)).size, 9, "Every material card must use a distinct image");
for (const item of materialRangeItems) {
  assert.match(item.image, /^\/products\/shearing\/small-electric\/material-range\/.+\.webp$/);
  assert.ok(item.alt.length >= 32, `${item.image} alt text is not descriptive enough`);
  assert.ok(existsSync(resolve(root, `public${item.image}`)), `${item.image} does not exist`);
}

const industryGallery = smallElectricShearPageContent.industryGallery;
assert.ok(industryGallery, "The Small Electric page must include its nine-card applicable-industries gallery");
assert.equal(industryGallery?.eyebrow, "Applicable Industries");
assert.equal(industryGallery?.title, "Built for Diverse Sheet Metal Industries");
const industryGalleryItems = industryGallery?.items ?? [];
assert.deepEqual(
  industryGalleryItems.map(({ image, title, text }) => ({ image, title, text })),
  expectedIndustryGalleryItems,
  "The industry gallery must keep all nine supplied images, titles, descriptions, and requested order",
);
assert.equal(industryGalleryItems.length, 9, "The industry gallery must contain exactly nine cards");
assert.equal(new Set(industryGalleryItems.map((item) => item.image)).size, 9, "Every industry card must use a distinct image");
for (const item of industryGalleryItems) {
  assert.match(item.image, /^\/products\/shearing\/small-electric\/industries\/.+\.webp$/);
  assert.ok(item.alt.length >= 32, `${item.image} alt text is not descriptive enough`);
  assert.ok(existsSync(resolve(root, `public${item.image}`)), `${item.image} does not exist`);
}

const backgaugeComponentPath = resolve(root, "components/BackgaugeCarousel.tsx");
assert.ok(existsSync(backgaugeComponentPath), "The backgauge carousel client component must exist");
const backgaugeComponentSource = readFileSync(backgaugeComponentPath, "utf8");
assert.match(backgaugeComponentSource, /^"use client";/, "The interactive backgauge carousel must be a client component");
assert.match(backgaugeComponentSource, /aria-pressed=\{index === activeIndex\}/, "Backgauge selectors must expose selected state");
assert.match(backgaugeComponentSource, /Previous backgauge option/, "The carousel must include an accessible previous control");
assert.match(backgaugeComponentSource, /Next backgauge option/, "The carousel must include an accessible next control");
assert.match(backgaugeComponentSource, /items\.length\) % items\.length/, "Previous and next controls must wrap");
assert.match(backgaugeComponentSource, /onPointerDown=\{handlePointerDown\}/, "The carousel must start pointer swipe tracking");
assert.match(backgaugeComponentSource, /onPointerUp=\{handlePointerUp\}/, "The carousel must complete pointer swipe tracking");
assert.match(backgaugeComponentSource, /touch-pan-y/, "The carousel must preserve vertical touch scrolling");
assert.match(backgaugeComponentSource, /motion-reduce:/, "Carousel motion must respect reduced-motion preferences");
assert.match(backgaugeComponentSource, /aspect-\[4\/3\]/, "The mobile image stage must leave enough height for readable overlay copy");
assert.match(backgaugeComponentSource, /data-section="backgauge-options"/, "The carousel must expose its section identity");
assert.match(backgaugeComponentSource, /window\.setInterval/, "Backgauge options must advance automatically");
assert.match(backgaugeComponentSource, /prefers-reduced-motion: reduce/, "Backgauge autoplay must respect reduced motion");
assert.doesNotMatch(backgaugeComponentSource, /onMouseEnter/, "Backgauge autoplay must not stop when a desktop pointer rests on the section");
assert.doesNotMatch(backgaugeComponentSource, /setIsPaused/, "Backgauge autoplay must remain continuous after pointer and keyboard interaction");
assert.match(backgaugeComponentSource, /data-mobile-copy-below/, "Backgauge copy must render below the image on phone and tablet layouts");
assert.match(backgaugeComponentSource, /lg:hidden/, "Backgauge copy must use its separate phone and tablet layout below the image");

const showcaseComponentPath = resolve(root, "components/ProductShowcase.tsx");
assert.ok(existsSync(showcaseComponentPath), "The product showcase client component must exist");
const showcaseComponentSource = readFileSync(showcaseComponentPath, "utf8");
assert.match(showcaseComponentSource, /^"use client";/, "The interactive showcase must be a client component");
assert.match(showcaseComponentSource, /aria-pressed=\{index === activeIndex\}/, "Active thumbnails must expose selected state");
assert.match(showcaseComponentSource, /setActiveIndex\(index\)/, "Each thumbnail must select its own image");
assert.match(showcaseComponentSource, /Previous product view/, "The showcase must include an accessible previous control");
assert.match(showcaseComponentSource, /Next product view/, "The showcase must include an accessible next control");
assert.match(showcaseComponentSource, /images\.length\) % images\.length/, "Previous and next controls must wrap");
assert.match(showcaseComponentSource, /object-contain/, "Showcase images must remain uncropped");
assert.match(showcaseComponentSource, /data-section="product-showcase"/, "The showcase must expose its section identity");
assert.match(showcaseComponentSource, /window\.setInterval/, "Product showcase views must advance automatically");
assert.match(showcaseComponentSource, /prefers-reduced-motion: reduce/, "Product showcase autoplay must respect reduced motion");
assert.doesNotMatch(showcaseComponentSource, /onMouseEnter/, "Product showcase autoplay must not stop when a desktop pointer rests on the section");
assert.doesNotMatch(showcaseComponentSource, /setIsPaused/, "Product showcase autoplay must remain continuous after pointer and keyboard interaction");

const solutionPageSource = readFileSync(resolve(root, "components/ShearingSolutionPage.tsx"), "utf8");
const expectedModelCards = [
  {
    model: "Q11G-2X600",
    image: "/products/shearing/small-electric/models/q11g-2x600-small-electric-shearing-machine.webp",
    values: ["2 mm", "600 mm", "1°30′", "720 mm", "30 times/min", "500 mm", "3 kW", "1200 × 640 × 1100 mm"],
  },
  {
    model: "Q11G-2X800",
    image: "/products/shearing/small-electric/models/q11g-2x800-small-electric-shearing-machine.webp",
    values: ["2 mm", "800 mm", "1°30′", "720 mm", "30 times/min", "500 mm", "3 kW", "1400 × 640 × 1100 mm"],
  },
  {
    model: "Q11G-2X1000",
    image: "/products/shearing/small-electric/models/q11g-2x1000-small-electric-shearing-machine.webp",
    values: ["2 mm", "1000 mm", "1°30′", "720 mm", "30 times/min", "500 mm", "3 kW", "1600 × 640 × 1100 mm"],
  },
  {
    model: "Q11G-2X1300",
    image: "/products/shearing/small-electric/models/q11g-2x1300-small-electric-shearing-machine.webp",
    values: ["2 mm", "1300 mm", "1°30′", "720 mm", "30 times/min", "500 mm", "3 kW", "1900 × 640 × 1100 mm"],
  },
  {
    model: "Q11G-2X1600",
    image: "/products/shearing/small-electric/models/q11g-2x1600-small-electric-shearing-machine.webp",
    values: ["2 mm", "1600 mm", "1°30′", "720 mm", "30 times/min", "500 mm", "3 kW", "2200 × 640 × 1100 mm"],
  },
  {
    model: "Q11G-1.5X2000",
    image: "/products/shearing/small-electric/models/q11g-1-5x2000-small-electric-shearing-machine.webp",
    values: ["1.5 mm", "2000 mm", "1°30′", "720 mm", "30 times/min", "500 mm", "3 kW", "2600 × 640 × 1100 mm"],
  },
  {
    model: "Q11G-1.2X2500",
    image: "/products/shearing/small-electric/models/q11g-1-2x2500-small-electric-shearing-machine.webp",
    values: ["1.2 mm", "2500 mm", "1°30′", "720 mm", "30 times/min", "500 mm", "3 kW", "3100 × 640 × 1100 mm"],
  },
];
const modelCards = smallElectricShearPageContent.modelCards ?? [];
assert.deepEqual(
  modelCards.map(({ model, image, specifications }) => ({
    model,
    image,
    values: specifications.map(({ value }) => value),
  })),
  expectedModelCards,
  "The technical section must keep all seven supplied model images and exact published values in order",
);
assert.equal(modelCards.length, 7, "The technical section must contain exactly seven model cards");
assert.equal(new Set(modelCards.map((card) => card.image)).size, 7, "Every model card must use its own image");
for (const card of modelCards) {
  assert.equal(card.specifications.length, 8, `${card.model} must show all eight published specifications`);
  assert.equal(card.specifications[3]?.label, "Worktable Height", `${card.model} must place worktable height after shearing angle`);
  assert.equal(card.specifications[3]?.value, "720 mm", `${card.model} must use the requested worktable height`);
  assert.ok(card.alt.length >= 32, `${card.model} needs descriptive image alt text`);
  assert.match(card.image, /^\/products\/shearing\/small-electric\/models\/.+\.webp$/);
  assert.ok(existsSync(resolve(root, `public${card.image}`)), `${card.model} image does not exist`);
}
const technicalSectionStart = solutionPageSource.indexOf('data-section="technical"');
const technicalSectionEnd = solutionPageSource.indexOf('data-section="industry-gallery"');
const technicalSectionSource = solutionPageSource.slice(technicalSectionStart, technicalSectionEnd);
assert.match(technicalSectionSource, /data-technical-model-cards/);
assert.match(technicalSectionSource, /<ModelCardCarousel cards=\{content\.modelCards\} \/>/);

const modelCarouselPath = resolve(root, "components/ModelCardCarousel.tsx");
assert.ok(existsSync(modelCarouselPath), "The technical model carousel client component must exist");
const modelCarouselSource = readFileSync(modelCarouselPath, "utf8");
assert.match(modelCarouselSource, /^"use client";/, "The model carousel must be a client component");
assert.match(modelCarouselSource, /Previous model/);
assert.match(modelCarouselSource, /Next model/);
assert.match(modelCarouselSource, /aria-pressed=\{index === activeIndex\}/);
assert.match(modelCarouselSource, /onKeyDown=\{handleKeyDown\}/);
assert.match(modelCarouselSource, /lg:grid-cols-\[minmax\(0,0\.92fr\)_minmax\(0,1\.08fr\)\]/);
assert.match(modelCarouselSource, /sizes="\(min-width: 1024px\) 560px, 100vw"/);
assert.match(modelCarouselSource, /window\.setInterval/, "Model cards must advance automatically");
assert.match(modelCarouselSource, /prefers-reduced-motion: reduce/, "Model card autoplay must respect reduced motion");
assert.doesNotMatch(modelCarouselSource, /onMouseEnter/, "Model card autoplay must not stop when a desktop pointer rests on the carousel");
assert.doesNotMatch(modelCarouselSource, /setIsPaused/, "Model card autoplay must remain continuous after pointer and keyboard interaction");
assert.match(solutionPageSource, /data-detail-image/);
assert.match(solutionPageSource, /data-detail-copy/);
assert.match(solutionPageSource, /data-detail-copy[^>]*className="[^"]*lg:absolute/);
const requestedHiddenSections = [
  "problems",
  "solution",
  "process",
  "applications",
  "materials",
  "advantages",
  "structure",
  "model-guide",
  "comparison",
  "energy-comparison",
  "workflow",
  "manufacturer",
  "related",
  "cta",
];
assert.deepEqual(
  smallElectricShearPageContent.hiddenSections,
  requestedHiddenSections,
  "The small electric shear page must hide exactly the fourteen requested long-form modules",
);
for (const section of requestedHiddenSections) {
  assert.match(
    solutionPageSource,
    new RegExp(`isSectionVisible\\(\"${section}\"\\)`),
    `The shared renderer must guard the ${section} section`,
  );
}
for (const retainedSection of [
  "overview",
  "product-showcase",
  "details-gallery",
  "backgauge-options",
  "material-range-gallery",
  "technical",
  "industry-gallery",
  "faq",
]) {
  assert.ok(
    !requestedHiddenSections.includes(retainedSection),
    `${retainedSection} must remain visible on the small electric shear page`,
  );
}
assert.match(solutionPageSource, /import ProductShowcase from "@\/components\/ProductShowcase";/);
const showcasePlacement = solutionPageSource.indexOf("<ProductShowcase");
const detailsPlacement = solutionPageSource.indexOf("data-section=\"details-gallery\"");
const backgaugePlacement = solutionPageSource.indexOf("<BackgaugeCarousel");
const materialRangePlacement = solutionPageSource.indexOf('data-section="material-range-gallery"');
const problemsPlacement = solutionPageSource.indexOf("data-section=\"problems\"");
const technicalPlacement = solutionPageSource.indexOf('data-section="technical"');
const industryGalleryPlacement = solutionPageSource.indexOf('data-section="industry-gallery"');
const modelGuidePlacement = solutionPageSource.indexOf('data-section="model-guide"');
assert.ok(showcasePlacement >= 0, "The solution page must render the product showcase section");
assert.ok(
  detailsPlacement > showcasePlacement,
  "The product showcase must appear immediately before the machine-detail section",
);
assert.match(solutionPageSource, /import BackgaugeCarousel from "@\/components\/BackgaugeCarousel";/);
assert.ok(backgaugePlacement > detailsPlacement, "The backgauge carousel must appear after the machine-detail section");
assert.ok(materialRangePlacement > backgaugePlacement, "The material gallery must appear after the backgauge carousel");
assert.ok(problemsPlacement > materialRangePlacement, "The material gallery must appear before the problem section");
assert.match(solutionPageSource, /data-section="material-range-gallery"[\s\S]*lg:grid-cols-3/);
assert.match(solutionPageSource, /data-section="material-range-gallery"[\s\S]*text-center/);
assert.match(solutionPageSource, /group-hover:scale-\[1\.035\]/);
assert.ok(industryGalleryPlacement > technicalPlacement, "The industry gallery must appear after the technical parameters");
assert.ok(
  modelGuidePlacement < 0 || industryGalleryPlacement < modelGuidePlacement,
  "The industry gallery must appear before the model guide",
);
assert.match(solutionPageSource, /data-section="industry-gallery"[\s\S]*lg:grid-cols-3/);
assert.match(solutionPageSource, /data-industry-image[\s\S]*data-industry-copy/);
assert.match(solutionPageSource, /group-hover:scale-\[1\.035\][\s\S]*motion-reduce:/);

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
