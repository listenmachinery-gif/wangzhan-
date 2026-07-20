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
  heroImage: string;
  capability: string;
};

export type Product = {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  parentName?: string;
  tagline: string;
  image: string;
  specs: Spec[];
  highlights: string[];
  applications: string[];
  options: string[];
  seoTerms?: string[];
  performanceFeatures?: string;
  advantages?: string[];
  technicalParameters?: TechnicalParameterTable;
};

export type ProductDirectoryGroup = {
  id: string;
  name: string;
  products: Product[];
  isDirectProduct: boolean;
};

type ProductSeed = {
  name: string;
  tagline: string;
  parentName?: string;
  detailKey?: string;
  legacyIds?: string[];
  seoTerms?: string[];
  specs?: Spec[];
  highlights?: string[];
  applications?: string[];
  options?: string[];
  technicalParameters?: TechnicalParameterTable;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const productCategories: ProductCategory[] = [
  {
    id: "shearing-machines",
    name: "Shearing Machine Series",
    navLabel: "Shearing Machines",
    summary: "Foot, slitting, compact electric, energy-saving electric, swing beam, and guillotine shears.",
    description:
      "A complete sheet metal cutting range for trimming, slitting, light workshop production, and heavy-duty plate processing.",
    image: "/products/catalog/hydraulic-guillotine-shear.png",
    heroImage: "/products/series-heroes/shearing-machine-series.png",
    capability: "Sheet cutting and blanking",
  },
  {
    id: "bending-machines",
    name: "Bending Machine Series",
    navLabel: "Bending Machines",
    summary: "Manual, pneumatic, electric, hydraulic, NC, torsion bar CNC, and servo CNC bending machines.",
    description:
      "Folding machines and press brakes for HVAC panels, cabinets, enclosures, structural parts, and precision sheet metal forming.",
    image: "/products/catalog/electro-hydraulic-servo-cnc-press-brake.png",
    heroImage: "/products/series-heroes/bending-machine-series.png",
    capability: "Sheet forming and bending",
  },
  {
    id: "laser-cutting-machines",
    name: "Fiber Laser Cutting Machine Series",
    navLabel: "Fiber Laser Cutting",
    summary: "Single-table, exchange-table, sheet-and-tube, and dedicated tube fiber laser systems.",
    description:
      "Fiber laser cutting platforms for high-speed plate processing, integrated sheet-and-tube work, and dedicated tube production.",
    image: "/products/catalog/exchange-table-fiber-laser-cutting-machine.png",
    heroImage: "/products/series-heroes/fiber-laser-cutting-machine-series.png",
    capability: "Precision fiber laser cutting",
  },
  {
    id: "plate-rolling-machines",
    name: "Plate Rolling Machine Series",
    navLabel: "Plate Rolling Machines",
    summary: "Electric two-roll, semi-automatic three-roll, automatic three-roll, and hydraulic four-roll machines.",
    description:
      "Plate rolling equipment for cylinders, arcs, cones, tanks, pressure-vessel parts, and general curved sheet production.",
    image: "/products/catalog/hydraulic-four-roll-plate-rolling-machine.png",
    heroImage: "/products/series-heroes/plate-rolling-machine-series.png",
    capability: "Plate rolling and curved forming",
  },
  {
    id: "press-machines",
    name: "Press Machine Series",
    navLabel: "Press Machines",
    summary: "Mechanical punch presses, pneumatic punch presses, and four-column hydraulic presses.",
    description:
      "Press equipment for punching, stamping, forming, correction, assembly, and repeatable production operations.",
    image: "/products/catalog/four-column-hydraulic-press.png",
    heroImage: "/products/series-heroes/press-machine-series.png",
    capability: "Punching, stamping, and pressing",
  },
  {
    id: "rectangular-duct-production",
    name: "Rectangular Duct Production Machine Series",
    navLabel: "Rectangular Duct",
    summary: "Beading, lock forming, flange, seam closing, riveting, notching, plasma cutting, and auto duct lines.",
    description:
      "A complete equipment directory for rectangular HVAC duct preparation, forming, closing, corner assembly, and automated production.",
    image: "/products/catalog/u-shaped-auto-duct-production-line-5.png",
    heroImage: "/products/series-heroes/rectangular-duct-production-machine-series.png",
    capability: "Rectangular HVAC duct production",
  },
  {
    id: "round-duct-production",
    name: "Round Duct Production Machine Series",
    navLabel: "Round Duct",
    summary: "Rolling, elbow forming, beading, angle-iron flange rolling, and spiral duct production equipment.",
    description:
      "Round duct machinery for circular forming, elbow production, beading, flange-ring rolling, and continuous spiral duct manufacturing.",
    image: "/products/catalog/steel-strip-spiral-duct-production-line.png",
    heroImage: "/products/series-heroes/round-duct-production-machine-series.png",
    capability: "Round and spiral duct production",
  },
  {
    id: "shredders",
    name: "Shredder Series",
    navLabel: "Shredders",
    summary: "Industrial granulators, single-shaft shredders, and dual-shaft shredders.",
    description:
      "Material size-reduction systems for recycling, scrap recovery, production waste, and downstream separation lines.",
    image: "/products/catalog/dual-shaft-shredder.png",
    heroImage: "/products/series-heroes/shredder-series.png",
    capability: "Recycling and size reduction",
  },
];

const categoryBlueprints: Record<
  string,
  Pick<Product, "specs" | "highlights" | "applications" | "options">
> = {
  "shearing-machines": {
    specs: [
      { label: "Working range", value: "Selected by material, maximum thickness, and required cutting width" },
      { label: "Material", value: "Mild steel, stainless steel, aluminum, and galvanized sheet" },
      { label: "Drive", value: "Foot-operated, electric, energy-saving electric, or hydraulic" },
      { label: "Configuration", value: "Blade, back gauge, front support, and safety systems matched by model" },
    ],
    highlights: ["Clean sheet cutting", "Stable machine structure", "Practical operating cost", "Accessible maintenance layout"],
    applications: ["Sheet metal workshops", "Electrical cabinets", "HVAC fabrication", "General metal processing"],
    options: ["Back gauge system", "Blade material upgrade", "Front support arms", "Safety protection"],
  },
  "bending-machines": {
    specs: [
      { label: "Working range", value: "Selected by bending length, material thickness, and finished angle" },
      { label: "Drive", value: "Manual, pneumatic, electric, hydraulic, NC, or CNC" },
      { label: "Control", value: "Entry-level NC, torsion bar CNC, or electro-hydraulic servo CNC" },
      { label: "Tooling", value: "Standard segmented tools and custom forming tooling available" },
    ],
    highlights: ["Consistent bending angles", "Flexible tooling selection", "Operator-focused controls", "Rigid frame construction"],
    applications: ["Cabinet manufacturing", "HVAC duct forming", "Metal furniture", "Enclosure fabrication"],
    options: ["CNC controller", "Servo back gauge", "Quick clamping", "Custom upper and lower tooling"],
  },
  "laser-cutting-machines": {
    specs: [
      { label: "Laser source", value: "Fiber laser power selected by material and maximum cutting thickness" },
      { label: "Cutting format", value: "Sheet, tube, or integrated sheet-and-tube processing" },
      { label: "Motion system", value: "Precision guide rails, rack drive, and servo control" },
      { label: "Software", value: "Compatible with common CAD/CAM nesting and cutting workflows" },
    ],
    highlights: ["High cutting speed", "Smooth cut quality", "Efficient material use", "Automation-ready configuration"],
    applications: ["Sheet metal processing", "Machinery parts", "Tube fabrication", "Metal furniture"],
    options: ["Exchange table", "Enclosed cover", "Tube chuck system", "Automatic loading"],
  },
  "plate-rolling-machines": {
    specs: [
      { label: "Rolling capacity", value: "Selected by plate thickness, width, material, and minimum diameter" },
      { label: "Roll structure", value: "Two-roll, three-roll, or four-roll construction" },
      { label: "Operation", value: "Electric, semi-automatic, fully automatic, or hydraulic" },
      { label: "Workpiece", value: "Cylinders, arcs, cones, and curved sheet components" },
    ],
    highlights: ["Stable rolling force", "Smooth curved forming", "Reduced rework", "Rigid industrial structure"],
    applications: ["Tank production", "Duct fabrication", "Pressure-vessel parts", "Metal forming workshops"],
    options: ["Digital display", "Hydraulic drop end", "Cone rolling device", "Custom roller hardness"],
  },
  "press-machines": {
    specs: [
      { label: "Press capacity", value: "Configured by tonnage, stroke, table size, and process" },
      { label: "Drive", value: "Mechanical, pneumatic, or four-column hydraulic" },
      { label: "Operation", value: "Foot pedal, two-hand control, or automated line integration" },
      { label: "Safety", value: "Emergency stop, overload protection, guarding, and optional light curtain" },
    ],
    highlights: ["Reliable pressing force", "Repeatable production", "Practical floor space", "Multiple tooling options"],
    applications: ["Punching", "Stamping", "Forming", "Assembly and correction"],
    options: ["Feeding system", "Custom dies", "PLC control", "Safety light curtain"],
  },
  "rectangular-duct-production": {
    specs: [
      { label: "Duct process", value: "Blanking, notching, beading, locking, flanging, closing, and corner assembly" },
      { label: "Material", value: "Galvanized sheet, stainless steel, and aluminum sheet" },
      { label: "Line layout", value: "Standalone machines or integrated auto duct production lines" },
      { label: "Support", value: "Machine matching, layout guidance, training, and spare parts" },
    ],
    highlights: ["Consistent duct quality", "Faster production flow", "Reduced manual work", "Flexible line combinations"],
    applications: ["HVAC factories", "Ventilation contractors", "Duct workshops", "Building-service suppliers"],
    options: ["Custom roll sets", "Line integration", "Pneumatic assist", "Variable speed"],
  },
  "round-duct-production": {
    specs: [
      { label: "Duct process", value: "Rolling, beading, elbow forming, flange-ring rolling, and spiral duct forming" },
      { label: "Material", value: "Galvanized sheet, stainless steel, and aluminum sheet" },
      { label: "Production", value: "Standalone equipment or matched round duct production cells" },
      { label: "Application", value: "Ventilation, dust collection, exhaust, and industrial airflow systems" },
    ],
    highlights: ["Accurate circular forming", "Stable seam quality", "Flexible diameter range", "Durable mechanical structure"],
    applications: ["Spiral duct production", "HVAC installation", "Industrial ventilation", "Dust collection"],
    options: ["Diameter tooling", "Variable speed", "Custom roller sets", "Auxiliary forming stations"],
  },
  shredders: {
    specs: [
      { label: "Material", value: "Plastic, wood, packaging, production waste, and mixed recyclable material" },
      { label: "Rotor", value: "Granulator, single-shaft, or dual-shaft configuration" },
      { label: "Output", value: "Selected by blade, screen, and downstream process requirements" },
      { label: "Integration", value: "Conveyor, separator, dust collection, and recycling-line options" },
    ],
    highlights: ["Strong torque output", "Wear-resistant cutters", "Stable continuous operation", "Service-friendly layout"],
    applications: ["Recycling plants", "Scrap recovery", "Waste processing", "Production waste handling"],
    options: ["Conveyor system", "Custom blades", "Screen selection", "Magnetic separation"],
  },
};

const productSeeds: Record<string, ProductSeed[]> = {
  "shearing-machines": [
    {
      name: "Foot Shear",
      tagline: "Foot-operated sheet cutting for light-gauge workshop trimming without electrical power.",
      detailKey: "foot-operated-shearing-machine",
      legacyIds: ["foot-operated-shearing-machine"],
      seoTerms: ["Foot-Operated Sheet Metal Shear"],
    },
    {
      name: "Slitting and Beading Machine",
      tagline: "Combined straight slitting and edge beading for light sheet-metal preparation.",
      seoTerms: ["Roller Shear Beading Machine", "Reel Shear Beading Machine"],
      technicalParameters: {
        columns: [
          "Model",
          "Sheet Thickness (mm)",
          "Shape",
          "Power (kW)",
          "Weight (kg)",
          "Dimensions L × W × H (mm)",
        ],
        rows: [
          [
            "LQ-15",
            "0.5–1.2",
            "Beading / slitting profiles",
            "1.5",
            "260",
            "1600 × 630 × 1120",
          ],
        ],
      },
    },
    {
      name: "Compact Electric Shearing Machine",
      tagline: "Compact motorized shearing for small factories, repair shops, and light sheet production.",
      detailKey: "small-electric-shearing-machine",
      legacyIds: ["small-electric-shearing-machine"],
      seoTerms: ["Small Electric Sheet Metal Shear"],
    },
    {
      name: "Energy-Saving Electric Shearing Machine",
      tagline: "Efficient electric cutting with low noise and practical operating cost for daily production.",
      detailKey: "energy-saving-electric-shearing-machine",
      seoTerms: ["Energy-Efficient Electric Shear"],
    },
    {
      name: "Hydraulic Swing Beam Shear",
      tagline: "A proven hydraulic swing-beam platform for stable medium-duty sheet processing.",
      detailKey: "hydraulic-swing-beam-shearing-machine",
      legacyIds: ["hydraulic-swing-beam-shearing-machine"],
      seoTerms: ["Hydraulic Swing Beam Shearing Machine"],
    },
    {
      name: "Hydraulic Guillotine Shear",
      tagline: "Rigid guillotine cutting for heavier plate, clean edges, and dependable production.",
      detailKey: "hydraulic-guillotine-shearing-machine",
      legacyIds: ["hydraulic-guillotine-shearing-machine"],
      seoTerms: ["Hydraulic Guillotine Shearing Machine"],
    },
  ],
  "bending-machines": [
    {
      name: "Manual Sheet Metal Folding Machine",
      tagline: "Simple and durable manual folding for light sheet-metal work and on-site fabrication.",
      detailKey: "manual-folding-machine",
      legacyIds: ["manual-folding-machine"],
      seoTerms: ["Manual Folder", "Manual Swivel Bending Machine"],
    },
    {
      name: "Pneumatic Sheet Metal Folding Machine",
      tagline: "Air-assisted clamping and folding for faster operation with reduced manual effort.",
      detailKey: "pneumatic-folding-machine",
      legacyIds: ["pneumatic-folding-machine"],
    },
    {
      name: "Electric Sheet Metal Folding Machine",
      tagline: "Motorized folding performance for repeatable workshop and HVAC production.",
      detailKey: "electric-folding-machine",
      legacyIds: ["electric-folding-machine"],
      seoTerms: ["Motorized Sheet Metal Folder"],
    },
    {
      name: "Hydraulic Sheet Metal Folding Machine",
      tagline: "Hydraulic folding force for heavier sheet and demanding forming applications.",
      detailKey: "hydraulic-folding-machine",
      legacyIds: ["hydraulic-folding-machine"],
      seoTerms: ["Hydraulic Folding Machine"],
    },
    {
      name: "NC Hydraulic Press Brake",
      tagline: "Practical entry-level numerical control for productive and repeatable bending.",
      detailKey: "simple-nc-press-brake",
      legacyIds: ["simple-nc-press-brake"],
    },
    {
      name: "Torsion Bar CNC Press Brake",
      tagline: "Torsion-bar synchronization and CNC positioning for stable industrial bending.",
      detailKey: "torsion-bar-nc-press-brake",
      legacyIds: ["torsion-bar-nc-press-brake"],
      seoTerms: ["Torsion-Bar Synchronized CNC Press Brake"],
    },
    {
      name: "Electro-Hydraulic Servo CNC Press Brake",
      tagline: "High-precision synchronized CNC bending with servo control and flexible tooling.",
      detailKey: "electro-hydraulic-servo-cnc-press-brake",
      seoTerms: ["CNC Press Brake with Electro-Hydraulic Servo Drive"],
    },
  ],
  "laser-cutting-machines": [
    {
      name: "Single-Table Fiber Laser Cutting Machine",
      tagline: "An open single-table fiber laser platform for practical plate cutting and general fabrication.",
      legacyIds: ["single-table-fiber-laser-cutting-machine"],
      seoTerms: ["Single-Platform Fiber Laser Cutter"],
    },
    {
      name: "Exchange-Table Fiber Laser Cutting Machine",
      tagline: "Continuous sheet cutting with automated table exchange to reduce loading downtime.",
      legacyIds: ["exchange-table-fiber-laser-cutting-machine"],
      seoTerms: ["Shuttle-Table Fiber Laser Cutting Machine"],
    },
    {
      name: "Sheet and Tube Fiber Laser Cutting Machine",
      tagline: "Integrated plate and tube processing for flexible mixed-production requirements.",
      legacyIds: ["tube-and-sheet-fiber-laser-cutting-machine"],
      seoTerms: ["Combined Sheet-and-Tube Fiber Laser Cutting System"],
    },
    {
      name: "Fiber Tube Laser Cutting Machine",
      tagline: "Dedicated fiber laser cutting for round, square, rectangular, and profile tubes.",
      legacyIds: ["tube-laser-cutting-machine"],
      seoTerms: ["Tube Fiber Laser Cutter"],
    },
  ],
  "plate-rolling-machines": [
    {
      name: "Electric Two-Roll Plate Rolling Machine",
      tagline: "Motorized two-roll forming for efficient thin-sheet cylinder production.",
      seoTerms: ["Motorized 2-Roll Plate Roller"],
    },
    {
      name: "Semi-Automatic Three-Roll Plate Rolling Machine",
      tagline: "Flexible three-roll forming with assisted operation for varied workshop production.",
      legacyIds: ["semi-automatic-plate-rolling-machine"],
      seoTerms: ["Semi-Automatic 3-Roll Plate Roller"],
    },
    {
      name: "Fully Automatic Three-Roll Plate Rolling Machine",
      tagline: "Automated three-roll cycles for improved throughput and repeatable curved forming.",
      legacyIds: ["fully-automatic-plate-rolling-machine"],
      seoTerms: ["Automatic 3-Roll Plate Roller"],
    },
    {
      name: "Hydraulic Four-Roll Plate Rolling Machine",
      tagline: "Hydraulic four-roll pre-bending and rolling for heavy-duty production accuracy.",
      legacyIds: ["hydraulic-plate-rolling-machine", "four-roller-plate-rolling-machine"],
      seoTerms: ["Hydraulic 4-Roll Plate Roll"],
    },
  ],
  "press-machines": [
    {
      name: "Mechanical Punch Press",
      tagline: "Reliable flywheel-driven punching for continuous stamping and forming operations.",
      seoTerms: ["Mechanical Stamping Press"],
    },
    {
      name: "Pneumatic Punch Press",
      tagline: "Fast pneumatic power pressing for repeatable punching and sheet-metal production.",
      seoTerms: ["Pneumatic Power Press"],
    },
    {
      name: "Four-Column Hydraulic Press",
      tagline: "Stable four-column hydraulic pressing for forming, assembly, correction, and deep drawing.",
      seoTerms: ["4-Post Hydraulic Press"],
    },
  ],
  "rectangular-duct-production": [
    {
      name: "Five-Line Beading Machine",
      tagline: "Five-line reinforcement beading for rectangular duct panels and HVAC sheet production.",
      seoTerms: ["5-Line Beading Machine"],
    },
    {
      name: "Multi-Function Lock Forming Machine",
      tagline: "Multiple lock-seam profiles for Pittsburgh, drive-cleat, and related duct connections.",
      legacyIds: ["multifunctional-lock-forming-machine"],
    },
    {
      name: "TDF Flange Forming Machine",
      tagline: "Efficient transverse duct flange forming for modern rectangular duct assembly.",
    },
    {
      name: "Electric Duct Seam Closing Machine",
      parentName: "Rectangular Duct Seam Closing Machine",
      tagline: "Portable electric seam locking for fast rectangular duct closing on the shop floor or job site.",
      seoTerms: ["Electric Seam Locker"],
    },
    {
      name: "Pneumatic Duct Seam Closing Machine",
      parentName: "Rectangular Duct Seam Closing Machine",
      tagline: "Pneumatic seam closing for repeatable rectangular duct assembly with reduced manual work.",
      legacyIds: ["pneumatic-seam-closing-machine"],
      seoTerms: ["Pneumatic Seam Locker"],
    },
    {
      name: "Hydraulic Duct Seam Closing Machine",
      parentName: "Rectangular Duct Seam Closing Machine",
      tagline: "Hydraulic seam closing force for stable, high-volume rectangular duct production.",
      seoTerms: ["Hydraulic Seam Locker"],
    },
    {
      name: "Hydraulic Riveting Machine",
      tagline: "Mobile hydraulic riveting for duct flange, corner, and sheet-metal assembly work.",
    },
    {
      name: "TDF Corner Inserting Machine",
      tagline: "Fast and consistent TDF corner insertion for rectangular duct flange assembly.",
      legacyIds: ["corner-code-installation-machine"],
      seoTerms: ["Corner Insert Machine", "TDF Corner Installing Machine"],
    },
    {
      name: "Foot-Operated Notching Machine",
      parentName: "Sheet Metal Notching Machine",
      tagline: "Foot-operated corner notching for light-gauge sheet and compact HVAC workshops.",
      seoTerms: ["Foot Notcher"],
    },
    {
      name: "Pneumatic Notching Machine",
      parentName: "Sheet Metal Notching Machine",
      tagline: "Pneumatic corner notching for faster repetitive sheet preparation.",
      seoTerms: ["Pneumatic Corner Notcher"],
    },
    {
      name: "Hydraulic Notching Machine",
      parentName: "Sheet Metal Notching Machine",
      tagline: "Hydraulic corner notching for thicker sheet and dependable production cycles.",
      seoTerms: ["Hydraulic Corner Notcher"],
    },
    {
      name: "CNC Plasma Cutting Machine",
      tagline: "CNC plasma profiling for rectangular duct blanks, fittings, and general sheet components.",
    },
    {
      name: "Auto Duct Production Line 2",
      parentName: "Auto Duct Production Line",
      tagline: "Compact automated feeding, leveling, beading, and cutting for rectangular duct blanks.",
      seoTerms: ["Duct Line 2"],
    },
    {
      name: "Auto Duct Production Line 3",
      parentName: "Auto Duct Production Line",
      tagline: "Integrated rectangular duct blank production with higher automation and repeatability.",
      seoTerms: ["Duct Line 3"],
    },
    {
      name: "U-Shaped Auto Duct Production Line 5",
      parentName: "Auto Duct Production Line",
      tagline: "U-shaped fully automated duct line for high-output rectangular duct production.",
      seoTerms: ["U-Shape Auto Duct Line 5"],
    },
    {
      name: "Angle Steel Flange Production Line",
      tagline: "Automated angle-steel flange cutting, punching, and welding for rectangular duct systems.",
      seoTerms: ["Angle Iron Flange Production Line"],
    },
  ],
  "round-duct-production": [
    {
      name: "Asymmetric Three-Roll Plate Rolling Machine",
      tagline: "Asymmetric three-roll forming for round duct, cylinders, and light sheet-metal curves.",
      legacyIds: ["electric-eccentric-three-roller-rolling-machine"],
      seoTerms: ["Asymmetric 3-Roll Bending Machine"],
    },
    {
      name: "Electric Round Duct Elbow Making Machine",
      parentName: "Round Duct Elbow Making Machine",
      tagline: "Electric elbow forming for segmented round duct fittings and ventilation components.",
      legacyIds: ["elbow-making-machine"],
      seoTerms: ["Electric Elbow Making Machine"],
    },
    {
      name: "Hydraulic Round Duct Elbow Making Machine",
      parentName: "Round Duct Elbow Making Machine",
      tagline: "Hydraulic elbow forming for larger diameters and demanding round duct production.",
      seoTerms: ["Hydraulic Elbow Making Machine"],
    },
    {
      name: "Manual Duct Beading Machine",
      parentName: "Duct Beading Machine",
      tagline: "Manual rotary beading for light round duct reinforcement and edge forming.",
      seoTerms: ["Manual Rotary Beading Machine"],
    },
    {
      name: "Electric Duct Beading Machine",
      parentName: "Duct Beading Machine",
      tagline: "Motorized rotary beading for faster round duct reinforcement and repeatable profiles.",
      legacyIds: ["electric-wiring-machine"],
      seoTerms: ["Electric Rotary Beading Machine"],
    },
    {
      name: "Electric Angle Iron Flange Rolling Machine",
      parentName: "Angle Iron Flange Rolling Machine",
      tagline: "Electric angle-iron rolling for compact flange-ring and circular-frame production.",
      legacyIds: ["angle-iron-rolling-machine"],
      seoTerms: ["Electric Angle Steel Rolling Machine"],
    },
    {
      name: "Vertical Hydraulic Angle Iron Flange Rolling Machine",
      parentName: "Angle Iron Flange Rolling Machine",
      tagline: "Vertical hydraulic ring rolling for controlled angle-iron flange production.",
    },
    {
      name: "Horizontal Hydraulic Angle Iron Flange Rolling Machine",
      parentName: "Angle Iron Flange Rolling Machine",
      tagline: "Horizontal hydraulic ring rolling with operator-friendly loading and CNC control.",
    },
    {
      name: "Steel-Strip Spiral Duct Production Line",
      parentName: "Spiral Duct Production Line",
      tagline: "Continuous steel-strip spiral duct forming for HVAC and industrial ventilation systems.",
      legacyIds: ["spiral-duct-production-line"],
      seoTerms: ["Steel Strip Spiral Tube Former"],
    },
    {
      name: "Mold-Type Spiral Duct Production Line",
      parentName: "Spiral Duct Production Line",
      tagline: "Mold-type spiral duct forming for stable diameters and efficient tube production.",
      seoTerms: ["Mold-Type Spiral Tube Former"],
    },
  ],
  shredders: [
    {
      name: "Industrial Granulator",
      tagline: "Compact granulation for plastic, production waste, and recycling preparation.",
      legacyIds: ["crusher"],
      seoTerms: ["Granulator", "Crusher"],
    },
    {
      name: "Single Shaft Shredder",
      tagline: "Controlled single-shaft shredding for plastic, wood, packaging, and production waste.",
    },
    {
      name: "Dual Shaft Shredder",
      tagline: "High-torque dual-shaft shredding for mixed material, scrap, and recycling lines.",
      legacyIds: ["double-shaft-shredder"],
      seoTerms: ["Twin-Shaft Shredder", "Double-Shaft Shredder"],
    },
  ],
};

export const products: Product[] = productCategories.flatMap((category) => {
  const blueprint = categoryBlueprints[category.id];

  return productSeeds[category.id].map((seed) => {
    const id = slugify(seed.name);
    const detail = shearingProductDetails[seed.detailKey ?? id] ?? bendingProductDetails[seed.detailKey ?? id];

    return {
      id,
      name: seed.name,
      categoryId: category.id,
      categoryName: category.name,
      parentName: seed.parentName,
      tagline: seed.tagline,
      image: `/products/catalog/${id}.png`,
      specs: seed.specs ?? blueprint.specs,
      highlights: seed.highlights ?? blueprint.highlights,
      applications: seed.applications ?? blueprint.applications,
      options: seed.options ?? blueprint.options,
      seoTerms: seed.seoTerms,
      performanceFeatures: detail?.performanceFeatures,
      advantages: detail?.advantages,
      technicalParameters: seed.technicalParameters ?? detail?.technicalParameters,
    };
  });
});

export const legacyProductRedirects = Object.values(productSeeds)
  .flat()
  .flatMap((seed) =>
    (seed.legacyIds ?? [])
      .filter((legacyId) => legacyId !== slugify(seed.name))
      .map((legacyId) => ({
        source: `/products/${legacyId}`,
        destination: `/products/${slugify(seed.name)}`,
        permanent: true,
      })),
  );

export const featuredProductIds = [
  "energy-saving-electric-shearing-machine",
  "hydraulic-guillotine-shear",
  "electro-hydraulic-servo-cnc-press-brake",
  "exchange-table-fiber-laser-cutting-machine",
  "u-shaped-auto-duct-production-line-5",
  "dual-shaft-shredder",
];

export const featuredProducts = featuredProductIds
  .map((id) => products.find((product) => product.id === id))
  .filter((product): product is Product => Boolean(product));

export function getProductsByCategory(categoryId: string) {
  return products.filter((product) => product.categoryId === categoryId);
}

export function getCategoryDirectory(categoryId: string): ProductDirectoryGroup[] {
  const directory = new Map<string, ProductDirectoryGroup>();

  for (const product of getProductsByCategory(categoryId)) {
    const key = product.parentName ?? product.id;
    const current = directory.get(key);

    if (current) {
      current.products.push(product);
      continue;
    }

    directory.set(key, {
      id: slugify(key),
      name: product.parentName ?? product.name,
      products: [product],
      isDirectProduct: !product.parentName,
    });
  }

  return Array.from(directory.values());
}

export function getCategoryById(categoryId: string) {
  return productCategories.find((category) => category.id === categoryId);
}

export function getCategoryHref(categoryId: string) {
  return `/products/series/${categoryId}`;
}
