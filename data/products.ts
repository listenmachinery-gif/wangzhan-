import { bendingProductDetails } from "./bending-details";
import { shearingProductDetails, type TechnicalParameterTable } from "./shearing-details";

export type Spec = {
  label: string;
  value: string;
};

export type ProductCategory = {
  id: string;
  name: string;
  navLabel: string;
  summary: string;
  description: string;
  image: string;
  capability: string;
};

export type Product = {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  tagline: string;
  image: string;
  specs: Spec[];
  highlights: string[];
  applications: string[];
  options: string[];
  performanceFeatures?: string;
  advantages?: string[];
  technicalParameters?: TechnicalParameterTable;
};

type ProductSeed = {
  name: string;
  tagline: string;
  image?: string;
  specs?: Spec[];
  highlights?: string[];
  applications?: string[];
  options?: string[];
};

const machineImages = [
  "/products/product-main.jpg",
  "/products/detail-front.jpg",
  "/products/detail-side-body.jpg",
  "/products/detail-back-system.jpg",
  "/products/detail-control-box.jpg",
  "/products/detail-pressing.jpg",
  "/products/detail-welded-body.jpg",
  "/products/detail-adjustment.jpg",
];

export const productCategories: ProductCategory[] = [
  {
    id: "shearing-machines",
    name: "Shearing Machine Series",
    navLabel: "Shearing Machines",
    summary: "Foot, electric, energy-saving, swing beam, and guillotine shearing machines.",
    description:
      "Reliable sheet metal shearing solutions for light-duty workshops, production lines, and heavy plate processing.",
    image: "/products/shearing/hydraulic-guillotine-shearing-machine-transparent.png",
    capability: "Cutting and blanking",
  },
  {
    id: "bending-machines",
    name: "Bending Machine Series",
    navLabel: "Bending Machines",
    summary: "Manual, pneumatic, electric, hydraulic, NC, and CNC bending equipment.",
    description:
      "A complete range of folding machines and press brakes for sheet metal forming, cabinet production, and precision bending.",
    image: "/products/bending/electro-hydraulic-servo-cnc-press-brake.png",
    capability: "Forming and bending",
  },
  {
    id: "laser-cutting-machines",
    name: "Laser Cutting Machine Series",
    navLabel: "Laser Cutting",
    summary: "Single table, exchange table, tube-sheet, and tube laser cutting machines.",
    description:
      "Fiber laser systems for high-speed plate cutting, tube cutting, mixed-material workshops, and automated production.",
    image: "/products/home-categories/laser-cutting-machine.png",
    capability: "Laser cutting",
  },
  {
    id: "plate-rolling-machines",
    name: "Plate Rolling Machine Series",
    navLabel: "Plate Rolling",
    summary: "Semi-automatic, fully automatic, hydraulic, and four-roller rolling machines.",
    description:
      "Plate rolling equipment for cylinders, cones, HVAC parts, pressure vessels, and general metal forming.",
    image: "/products/home-categories/four-roll-hydraulic-plate-rolling-machine.png",
    capability: "Rolling and forming",
  },
  {
    id: "press-machines",
    name: "Press Machine Series",
    navLabel: "Press Machines",
    summary: "Pneumatic, mechanical, hydraulic, and four-column press solutions.",
    description:
      "Press equipment for punching, forming, stamping, flattening, assembling, and workshop production support.",
    image: "/products/home-categories/four-column-hydraulic-press.png",
    capability: "Pressing and punching",
  },
  {
    id: "rectangular-duct-production",
    name: "Rectangular Duct Production Series",
    navLabel: "Rectangular Duct",
    summary: "Beading, lock forming, TDF flange, seam closing, and angle flange lines.",
    description:
      "Machines for rectangular HVAC duct forming, reinforcement, flange making, seam closing, and modular production lines.",
    image: "/products/home-categories/rectangular-air-duct-production-line.png",
    capability: "HVAC rectangular duct",
  },
  {
    id: "round-duct-production",
    name: "Round Duct Production Series",
    navLabel: "Round Duct",
    summary: "Round rolling, elbow forming, spiral duct, wiring, and seam closing machines.",
    description:
      "Round duct machinery for spiral duct manufacturing, elbow fabrication, ring rolling, and circular duct closing.",
    image: "/products/home-categories/spiral-air-duct-production-line.png",
    capability: "HVAC round duct",
  },
  {
    id: "shredders",
    name: "Shredder Series",
    navLabel: "Shredders",
    summary: "Crusher, single shaft shredder, and double shaft shredder equipment.",
    description:
      "Material size-reduction systems for recycling, scrap processing, waste handling, and production line recovery.",
    image: "/products/home-categories/dual-shaft-shredder.png",
    capability: "Size reduction",
  },
];

const categoryBlueprints: Record<
  string,
  Pick<Product, "specs" | "highlights" | "applications" | "options">
> = {
  "shearing-machines": {
    specs: [
      { label: "Working length", value: "Customizable from compact workshop sizes to production formats" },
      { label: "Material range", value: "Mild steel, stainless steel, aluminum, and galvanized sheet" },
      { label: "Control system", value: "Manual, electric, NC, or CNC configuration by model" },
      { label: "Support", value: "Blade, back gauge, safety guard, and spare parts supply" },
    ],
    highlights: ["Clean cutting edges", "Stable frame structure", "Low operating cost", "Easy maintenance access"],
    applications: ["Sheet metal fabrication", "Electrical cabinets", "Metal signage", "Custom workshops"],
    options: ["Back gauge system", "Blade material upgrade", "Front support arms", "Safety light curtain"],
  },
  "bending-machines": {
    specs: [
      { label: "Bending length", value: "Workshop and industrial production sizes available" },
      { label: "Drive mode", value: "Manual, pneumatic, electric, hydraulic, NC, or CNC" },
      { label: "Control system", value: "Simple NC, torsion bar NC, or electro-hydraulic CNC" },
      { label: "Tooling", value: "Segmented dies, custom punches, and forming tools available" },
    ],
    highlights: ["Consistent bending angle", "Flexible tooling selection", "Operator-friendly controls", "Strong machine body"],
    applications: ["Cabinet manufacturing", "HVAC duct forming", "Metal furniture", "Enclosure fabrication"],
    options: ["CNC controller", "Servo back gauge", "Quick clamp", "Custom upper and lower tooling"],
  },
  "laser-cutting-machines": {
    specs: [
      { label: "Laser source", value: "Fiber laser power selected by material and thickness" },
      { label: "Cutting format", value: "Plate, tube, or tube-and-sheet integrated systems" },
      { label: "Motion system", value: "Precision guide rails, rack drive, and servo control" },
      { label: "Nesting support", value: "Compatible with common CAD/CAM cutting workflows" },
    ],
    highlights: ["High-speed cutting", "Smooth cutting surface", "Low material waste", "Automation-ready layout"],
    applications: ["Sheet metal processing", "Machinery parts", "Tube fabrication", "Metal furniture"],
    options: ["Exchange table", "Enclosed cover", "Tube cutting chuck", "Automatic loading system"],
  },
  "plate-rolling-machines": {
    specs: [
      { label: "Rolling capacity", value: "Selected by plate thickness, width, and minimum diameter" },
      { label: "Roll structure", value: "Three-roller, hydraulic, or four-roller configurations" },
      { label: "Operation mode", value: "Semi-automatic or fully automatic by production need" },
      { label: "Workpiece type", value: "Cylinders, cones, arcs, and curved sheet parts" },
    ],
    highlights: ["Stable rolling force", "Smooth curved forming", "Reduced rework", "Industrial frame rigidity"],
    applications: ["Tank production", "Duct fabrication", "Pressure vessel parts", "Metal forming workshops"],
    options: ["Digital display", "Hydraulic drop end", "Cone rolling device", "Custom roller hardness"],
  },
  "press-machines": {
    specs: [
      { label: "Press capacity", value: "Configured by tonnage, stroke, table size, and process type" },
      { label: "Drive mode", value: "Pneumatic, mechanical, hydraulic, or four-column hydraulic" },
      { label: "Operation", value: "Manual, foot pedal, two-hand, or automated line integration" },
      { label: "Safety", value: "Guarding, emergency stop, overload protection, and optional light curtain" },
    ],
    highlights: ["High pressing force", "Reliable repeatability", "Compact production footprint", "Multiple tooling options"],
    applications: ["Punching", "Stamping", "Forming", "Assembly and flattening"],
    options: ["Feeding system", "Custom molds", "PLC control", "Safety light curtain"],
  },
  "rectangular-duct-production": {
    specs: [
      { label: "Duct type", value: "Rectangular HVAC duct, flange, lock seam, and reinforcement processes" },
      { label: "Material", value: "Galvanized sheet, stainless steel, and aluminum sheet" },
      { label: "Line layout", value: "Single machines or combined production line solutions" },
      { label: "Production support", value: "Machine matching, installation guidance, and operator training" },
    ],
    highlights: ["Improved duct consistency", "Faster forming workflow", "Reduced manual labor", "Flexible line combinations"],
    applications: ["HVAC factories", "Ventilation contractors", "Duct workshops", "Building services suppliers"],
    options: ["Custom roll sets", "Line integration", "Pneumatic assist", "Speed control"],
  },
  "round-duct-production": {
    specs: [
      { label: "Duct type", value: "Round duct, spiral duct, elbows, rings, and circular seam closing" },
      { label: "Material", value: "Galvanized sheet, stainless steel, and aluminum sheet" },
      { label: "Production mode", value: "Standalone machines or matched round duct production cells" },
      { label: "Application", value: "Ventilation, dust collection, exhaust, and industrial airflow systems" },
    ],
    highlights: ["Accurate circular forming", "Neat seam closing", "Flexible duct diameter range", "Durable mechanical structure"],
    applications: ["Spiral duct production", "HVAC installation", "Industrial ventilation", "Dust collection systems"],
    options: ["Diameter tooling", "Speed control", "Custom roller set", "Auxiliary forming station"],
  },
  shredders: {
    specs: [
      { label: "Material type", value: "Scrap metal, plastic, wood, packaging waste, and mixed recyclable materials" },
      { label: "Rotor design", value: "Crusher, single shaft, or double shaft configuration" },
      { label: "Output size", value: "Selected by screen, blade, and downstream process requirements" },
      { label: "Integration", value: "Conveyor, separator, dust collection, and recycling line options" },
    ],
    highlights: ["Strong torque output", "Wear-resistant blade design", "Stable continuous operation", "Easy maintenance layout"],
    applications: ["Recycling plants", "Scrap recovery", "Waste processing", "Production waste handling"],
    options: ["Conveyor system", "Custom blades", "Screen selection", "Magnetic separation"],
  },
};

const productSeeds: Record<string, ProductSeed[]> = {
  "shearing-machines": [
    {
      name: "Foot Operated Shearing Machine",
      tagline: "A compact manual shearing solution for light sheet cutting and workshop trimming.",
      image: "/products/shearing/foot-operated-shearing-machine-main.png",
    },
    {
      name: "Small Electric Shearing Machine",
      tagline: "Electric cutting performance for small factories, repair shops, and light sheet production.",
      image: "/products/shearing/small-electric-shearing-machine-transparent.png",
    },
    {
      name: "Energy-Saving Electric Shearing Machine",
      tagline: "Efficient electric drive, low noise operation, and practical cutting performance for daily production.",
      image: "/products/shearing/energy-saving-electric-shearing-machine-transparent.png",
      highlights: ["Energy-saving electric drive", "Lower noise than hydraulic systems", "Simple operation", "Practical workshop footprint"],
    },
    {
      name: "Hydraulic Swing Beam Shearing Machine",
      tagline: "A proven hydraulic shearing platform for stable medium-duty sheet metal processing.",
      image: "/products/shearing/hydraulic-swing-beam-shearing-machine-transparent.png",
    },
    {
      name: "Hydraulic Guillotine Shearing Machine",
      tagline: "High-rigidity guillotine shearing for heavier plate, cleaner cuts, and production reliability.",
      image: "/products/shearing/hydraulic-guillotine-shearing-machine-transparent.png",
      highlights: ["Rigid guillotine frame", "Adjustable cutting angle", "Strong hold-down system", "Production-grade cutting quality"],
    },
  ],
  "bending-machines": [
    {
      name: "Manual Folding Machine",
      tagline: "Simple, durable, and cost-effective folding for light sheet metal work.",
      image: "/products/bending/manual-folding-machine.png",
    },
    {
      name: "Pneumatic Folding Machine",
      tagline: "Air-assisted folding for faster operation and reduced manual effort.",
      image: "/products/bending/pneumatic-folding-machine.png",
    },
    {
      name: "Electric Folding Machine",
      tagline: "Electric drive folding performance for repeatable workshop production.",
      image: "/products/bending/electric-folding-machine.png",
    },
    {
      name: "Hydraulic Folding Machine",
      tagline: "Stronger folding force for demanding sheet metal forming applications.",
      image: "/products/bending/hydraulic-folding-machine.png",
    },
    {
      name: "Simple NC Press Brake",
      tagline: "Entry-level numerical control bending for practical precision and productivity.",
      image: "/products/bending/simple-nc-press-brake.png",
    },
    {
      name: "Torsion Bar NC Press Brake",
      tagline: "Stable torsion bar synchronization for reliable industrial bending.",
      image: "/products/bending/torsion-bar-nc-press-brake.png",
    },
    {
      name: "Electro-Hydraulic Servo CNC Press Brake",
      tagline: "High-precision CNC bending with synchronized control and flexible tooling options.",
      image: "/products/bending/electro-hydraulic-servo-cnc-press-brake.png",
      highlights: ["CNC angle control", "Servo back gauge", "Flexible tooling", "High repeatability"],
    },
  ],
  "laser-cutting-machines": [
    { name: "Single Table Fiber Laser Cutting Machine", tagline: "A practical fiber laser platform for plate cutting and general fabrication." },
    {
      name: "Exchange Table Fiber Laser Cutting Machine",
      tagline: "Higher productivity with exchange table loading for continuous sheet metal cutting.",
      image: "/products/detail-back-system.jpg",
      highlights: ["Faster loading cycle", "High cutting efficiency", "Reduced downtime", "Production-line ready"],
    },
    { name: "Tube and Sheet Fiber Laser Cutting Machine", tagline: "One machine for both sheet and tube cutting requirements." },
    { name: "Tube Laser Cutting Machine", tagline: "Dedicated fiber laser cutting for round, square, and profile tubes." },
  ],
  "plate-rolling-machines": [
    { name: "Semi-Automatic Plate Rolling Machine", tagline: "Flexible plate rolling performance for varied workshop production." },
    { name: "Fully Automatic Plate Rolling Machine", tagline: "Automated rolling cycles for improved repeatability and throughput." },
    { name: "Hydraulic Plate Rolling Machine", tagline: "Hydraulic rolling force for heavier plates and stable forming." },
    { name: "Four-Roller Plate Rolling Machine", tagline: "Efficient pre-bending and rolling accuracy with four-roller structure." },
  ],
  "press-machines": [
    { name: "Pneumatic Punch Press", tagline: "Fast and compact punching for light production and assembly work." },
    { name: "Mechanical Punch Press", tagline: "Reliable mechanical punching performance for continuous stamping operations." },
    { name: "Hydraulic Punch Press", tagline: "Hydraulic punching force for thicker materials and flexible processing." },
    { name: "Four-Column Hydraulic Press", tagline: "Stable four-column hydraulic pressing for forming, assembly, and correction." },
  ],
  "rectangular-duct-production": [
    { name: "Five-Line Beading Machine", tagline: "Reinforcement beading for rectangular duct panels and HVAC sheet production." },
    { name: "Multifunctional Lock Forming Machine", tagline: "Multiple lock seam profiles for HVAC duct fabrication." },
    { name: "TDF Flange Forming Machine", tagline: "Efficient TDF flange forming for modern rectangular duct production." },
    { name: "Pneumatic Seam Closing Machine", tagline: "Air-powered seam closing for cleaner rectangular duct assembly." },
    { name: "Corner Code Installation Machine", tagline: "Fast corner code installation for duct flange assembly." },
    { name: "Angle Steel Flange Production Line", tagline: "Matched production line for angle steel flange forming and duct assembly." },
  ],
  "round-duct-production": [
    { name: "Electric Eccentric Three-Roller Rolling Machine", tagline: "Compact electric rolling for round duct and sheet forming work." },
    { name: "Elbow Making Machine", tagline: "Specialized forming for segmented elbows and round duct fittings." },
    { name: "Angle Iron Rolling Machine", tagline: "Roll angle iron into rings for flange and circular frame production." },
    {
      name: "Spiral Duct Production Line",
      tagline: "Continuous spiral duct forming for HVAC and ventilation manufacturing.",
      image: "/products/detail-feeding-balls.jpg",
      highlights: ["Continuous duct forming", "Stable seam quality", "Flexible diameter range", "High production efficiency"],
    },
    { name: "Electric Wiring Machine", tagline: "Electric wiring and edge forming for round duct reinforcement." },
    { name: "Round Duct Seam Closing Machine", tagline: "Reliable seam closing for round duct assembly and finishing." },
  ],
  shredders: [
    { name: "Crusher", tagline: "Material crushing equipment for recycling preparation and waste reduction." },
    { name: "Single Shaft Shredder", tagline: "Controlled single-shaft shredding for plastic, wood, and production waste." },
    {
      name: "Double Shaft Shredder",
      tagline: "High-torque dual-shaft shredding for mixed materials, scrap, and recycling lines.",
      image: "/products/detail-welded-body.jpg",
      highlights: ["High torque", "Dual-shaft cutting", "Strong material bite", "Recycling line integration"],
    },
  ],
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const products: Product[] = productCategories.flatMap((category, categoryIndex) => {
  const blueprint = categoryBlueprints[category.id];
  return productSeeds[category.id].map((seed, seedIndex) => {
    const id = slugify(seed.name);
    const detail = shearingProductDetails[id] ?? bendingProductDetails[id];

    return {
      id,
      name: seed.name,
      categoryId: category.id,
      categoryName: category.name,
      tagline: seed.tagline,
      image: seed.image ?? machineImages[(categoryIndex + seedIndex) % machineImages.length],
      specs: seed.specs ?? blueprint.specs,
      highlights: seed.highlights ?? blueprint.highlights,
      applications: seed.applications ?? blueprint.applications,
      options: seed.options ?? blueprint.options,
      performanceFeatures: detail?.performanceFeatures,
      advantages: detail?.advantages,
      technicalParameters: detail?.technicalParameters,
    };
  });
});

export const featuredProductIds = [
  "energy-saving-electric-shearing-machine",
  "hydraulic-guillotine-shearing-machine",
  "electro-hydraulic-servo-cnc-press-brake",
  "exchange-table-fiber-laser-cutting-machine",
  "spiral-duct-production-line",
  "double-shaft-shredder",
];

export const featuredProducts = featuredProductIds
  .map((id) => products.find((product) => product.id === id))
  .filter((product): product is Product => Boolean(product));

export function getProductsByCategory(categoryId: string) {
  return products.filter((product) => product.categoryId === categoryId);
}

export function getCategoryById(categoryId: string) {
  return productCategories.find((category) => category.id === categoryId);
}
