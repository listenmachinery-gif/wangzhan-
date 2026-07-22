export type ContentCard = {
  title: string;
  text: string;
};

export type SolutionCard = ContentCard & {
  suitableFor: string;
  recommendedUse: string;
  productionValue: string;
};

export type ApplicationPhoto = ContentCard & {
  image: string;
  alt: string;
};

export type ComparisonRow = {
  label: string;
  singleTable: string;
  exchangeTable: string;
  plasma: string;
};

export type WorkflowItem = ContentCard & {
  href?: string;
};

export type SpecificationField = {
  heading: string;
  source: "name" | "spec" | "confirmed";
  sourceIndex?: number;
  confirmedValue?: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const applicationPhotos: readonly ApplicationPhoto[] = [
  {
    title: "Sheet metal fabrication",
    text: "Cuts contours, holes and profiles for general fabrication before bending, welding and assembly.",
    image: "/products/single-table-fiber-laser-cutting-machine-applications/sheet-metal-fabrication.jpg",
    alt: "Real sheet metal laser cutting in a fabrication workshop",
  },
  {
    title: "Electrical cabinet and enclosure",
    text: "Supports repeatable cutting of cabinet panels, doors, mounting plates, ventilation openings and brackets.",
    image: "/products/single-table-fiber-laser-cutting-machine-applications/electrical-cabinet-enclosure.jpg",
    alt: "Real electrical cabinet and enclosure production environment",
  },
  {
    title: "Advertising signage",
    text: "Produces letters, logos, decorative profiles and mounting parts from suitable metal sheets.",
    image: "/products/single-table-fiber-laser-cutting-machine-applications/advertising-signage.jpg",
    alt: "Real advertising signage fabrication work",
  },
  {
    title: "Stainless steel products",
    text: "Processes suitable stainless panels and parts when power, gas and edge requirements are matched to the job.",
    image: "/products/single-table-fiber-laser-cutting-machine-applications/stainless-steel-products.jpg",
    alt: "Real stainless steel sheet product manufacturing environment",
  },
  {
    title: "Kitchen equipment",
    text: "Prepares stainless panels and components for commercial kitchen equipment, counters and housings.",
    image: "/products/single-table-fiber-laser-cutting-machine-applications/kitchen-equipment.jpg",
    alt: "Real stainless steel commercial kitchen equipment",
  },
  {
    title: "HVAC duct and ventilation parts",
    text: "Cuts flat blanks, flanges, transitions and ventilation components before forming and joining.",
    image: "/products/single-table-fiber-laser-cutting-machine-applications/hvac-ventilation-parts.jpg",
    alt: "Real HVAC duct and ventilation installation",
  },
  {
    title: "Machinery manufacturing",
    text: "Supplies guards, covers, brackets and machine parts to a coordinated fabrication workflow.",
    image: "/products/single-table-fiber-laser-cutting-machine-applications/machinery-manufacturing.jpg",
    alt: "Real machinery manufacturing workshop",
  },
  {
    title: "Metal door and window parts",
    text: "Cuts suitable frame inserts, panels, brackets and decorative parts for metal doors and windows.",
    image: "/products/single-table-fiber-laser-cutting-machine-applications/metal-door-window-parts.jpg",
    alt: "Real fabricated metal door and window product",
  },
  {
    title: "General metalworking workshop",
    text: "Adds flexible flat-sheet cutting for mixed orders, repair work and daily metal-part production.",
    image: "/products/single-table-fiber-laser-cutting-machine-applications/general-metalworking-workshop.jpg",
    alt: "Real general metalworking workshop",
  },
] as const;

export const singleTableFiberLaserCuttingMachinePage = {
  hero: {
    title: "Single-Table Fiber Laser Cutting Machine",
    subtitle:
      "Cost-effective sheet metal laser cutting solution for small and medium fabrication workshops.",
    description:
      "A single-table fiber laser cutting machine designed for flat metal sheet cutting, workshop production and practical fabrication use. It helps customers upgrade from traditional cutting methods to fiber laser cutting with a simpler structure, controlled investment and flexible sheet metal processing capability.",
    primaryCta: "Get Laser Cutting Solution",
    secondaryCta: "Request Machine Configuration",
    values: [
      "Single-table Open Structure",
      "Suitable for Metal Sheet Cutting",
      "Cost-effective Entry Solution",
      "Practical for Sheet Metal Workshops",
    ],
  },
  painPoints: [
    {
      title: "Traditional cutting methods are slow or rough",
      text: "Compared with plasma, flame or manual cutting, fiber laser cutting better serves work that needs controlled edge quality and complex contours.",
    },
    {
      title: "First-time laser buyers need controlled investment",
      text: "A single-table structure provides a direct entry route for workshops purchasing their first laser cutter or managing a defined equipment budget.",
    },
    {
      title: "Workshops need flexible sheet metal processing",
      text: "One cutting platform can process different sheet materials, thicknesses and profiles when the laser, gas and parameters are configured correctly.",
    },
    {
      title: "Small workshops have limited floor space",
      text: "The simpler single-platform layout can suit small and medium workshops that do not require an exchange-table production system.",
    },
    {
      title: "The machine must fit the full fabrication workflow",
      text: "Cut parts can continue to bending, rolling, welding, grinding, coating and final assembly.",
    },
  ] satisfies readonly ContentCard[],
  solutions: [
    {
      title: "Entry-level Laser Cutting Upgrade",
      suitableFor:
        "First-time laser buyers, repair workshops and general metalworking businesses.",
      recommendedUse:
        "Upgrade suitable sheet work from traditional cutting to programmable contour cutting.",
      productionValue:
        "A controlled path to broader cutting capability without selecting a high-output exchange-table line.",
      text: "Final configuration is matched to material, thickness, sheet size and daily workload.",
    },
    {
      title: "Small & Medium Sheet Metal Workshop",
      suitableFor:
        "Sheet-metal factories, cabinet makers, signage producers and stainless-steel workshops.",
      recommendedUse:
        "Daily cutting of mild steel, stainless steel, galvanized sheet, aluminum and other configured materials.",
      productionValue:
        "Flexible production for changing drawings, mixed orders and small or medium batches.",
      text: "Nesting, CNC control and suitable handling equipment help organize routine production.",
    },
    {
      title: "Supporting Machine in a Fabrication Line",
      suitableFor:
        "Workshops already using press brakes, shears, rolling machines and welding equipment.",
      recommendedUse:
        "Front-end cutting for parts that continue into forming, joining and surface treatment.",
      productionValue:
        "Connects accurate sheet preparation with the rest of the fabrication process.",
      text: "Plan the laser cutter together with downstream machine capacity and part flow.",
    },
  ] satisfies readonly SolutionCard[],
  applications: applicationPhotos,
  applicationIntro:
    "Nine real photographs show representative production environments and downstream products. They are application references, not customer cases or photos of this exact machine.",
  materials: [
    "Mild Steel",
    "Stainless Steel",
    "Galvanized Sheet",
    "Aluminum Plate",
    "Copper Sheet",
    "Brass Sheet",
    "Thin Metal Plate",
  ],
  materialNote:
    "The suitable cutting thickness depends on laser power, material type, cutting gas, cutting speed, cutting quality requirement and machine configuration. Please confirm your material and cutting requirement before quotation.",
  processSteps: [
    {
      title: "Drawing Import",
      text: "Import DXF or compatible cutting files according to the nesting software and control system.",
    },
    {
      title: "Material Loading",
      text: "Place the metal sheet on the single working table manually or with suitable lifting equipment.",
    },
    {
      title: "Cutting Parameter Setting",
      text: "Set laser power, speed, focus, gas type and pressure for the material and thickness.",
    },
    {
      title: "Fiber Laser Cutting",
      text: "Cut the flat sheet into the required contours, holes and profiles.",
    },
    {
      title: "Part Sorting",
      text: "Remove finished parts and scrap from the working table after cutting.",
    },
    {
      title: "Next Process",
      text: "Continue with bending, rolling, welding, polishing, coating or final assembly.",
    },
  ] satisfies readonly ContentCard[],
  singleTablePoints: [
    "One working platform is used for loading, cutting and unloading.",
    "The structure is simpler than an exchange-table system and easier for an entry-level workshop to understand.",
    "It is positioned for flexible sheet cutting instead of high-volume continuous production.",
    "The open structure makes manual sheet loading and part removal straightforward.",
    "It is a practical choice for small and medium workshops with controlled investment.",
  ],
  laserPowerCards: [
    {
      title: "Material and thickness",
      text: "Thinner sheets typically need less power; thicker plate or higher throughput can require more.",
    },
    {
      title: "Material behavior",
      text: "Stainless steel, aluminum, copper and brass can require different power and gas choices.",
    },
    {
      title: "Quality and output",
      text: "Edge finish, production speed, part geometry and operating budget should be assessed together.",
    },
  ] satisfies readonly ContentCard[],
  laserPowerValue: "Customizable / Please confirm with our sales engineer",
  gasCards: [
    {
      title: "Oxygen",
      text: "Often considered for carbon steel depending on thickness, process and edge requirements.",
    },
    {
      title: "Nitrogen",
      text: "Can help manage oxidation on stainless steel and some non-ferrous metals, depending on configuration.",
    },
    {
      title: "Compressed air",
      text: "May suit cost-sensitive tasks when the material, edge result and system specification allow it.",
    },
  ] satisfies readonly ContentCard[],
  gasNote:
    "Final gas selection depends on material, thickness, edge-quality target, cutting process and operating cost.",
  advantages: [
    "Cost-effective fiber laser cutting entry solution",
    "Suitable for flat metal sheet cutting",
    "Simple single-table structure for easier daily operation",
    "Good choice for small and medium workshops",
    "Supports different metal materials depending on configuration",
    "Flexible cutting for contours, holes and sheet metal parts",
    "Works with bending, shearing, rolling and welding processes",
    "Suitable for customers upgrading from traditional cutting methods",
  ],
  configuredSystems: [
    "Open-type single table",
    "Fiber laser source and cutting head",
    "Precision guide rails and rack drive",
    "Servo control and CNC cutting workflow",
    "Water cooling, exhaust, gas and electrical systems confirmed by configuration",
  ],
  comparisonRows: [
    {
      label: "Working table structure",
      singleTable: "One open working platform",
      exchangeTable: "Two coordinated working platforms",
      plasma: "Open slat table in common configurations",
    },
    {
      label: "Loading and unloading",
      singleTable: "Performed on the same platform",
      exchangeTable: "Prepared on a second platform during the cycle",
      plasma: "Performed on the cutting table",
    },
    {
      label: "Investment level",
      singleTable: "Controlled entry position",
      exchangeTable: "Higher-output system position",
      plasma: "Often selected for cost-sensitive work",
    },
    {
      label: "Cutting flexibility",
      singleTable: "Flexible flat-sheet profiles and holes",
      exchangeTable: "Similar process with higher production coordination",
      plasma: "Useful for suitable plate applications",
    },
    {
      label: "Production efficiency",
      singleTable: "Suitable for moderate and mixed production",
      exchangeTable: "Better suited to continuous, higher-volume schedules",
      plasma: "Depends strongly on plate and quality target",
    },
    {
      label: "Edge quality",
      singleTable: "Laser process selected for controlled detail and finish",
      exchangeTable: "Laser process selected for controlled detail and finish",
      plasma: "Heat-affected zone and finish require application review",
    },
    {
      label: "Suitable workshop",
      singleTable: "Small and medium fabrication workshop",
      exchangeTable: "Higher-output production workshop",
      plasma: "Heavy or cost-sensitive cutting workshop",
    },
    {
      label: "Recommended use",
      singleTable: "Entry upgrade and flexible sheet cutting",
      exchangeTable: "Repeated production with loading coordination",
      plasma: "Suitable plate work where laser finish is not required",
    },
  ] satisfies readonly ComparisonRow[],
  workflow: [
    { title: "Single-Table Fiber Laser", text: "Complex contours, holes and sheet cutting." },
    { title: "Shearing Machine", text: "Straight cuts and simple sheet division.", href: "/products/series/shearing-machines" },
    { title: "Press Brake", text: "Forms cut blanks into finished profiles.", href: "/products/series/bending-machines" },
    { title: "Plate Rolling Machine", text: "Creates curved panels and cylinders.", href: "/products/series/rolling-machines" },
    { title: "Hydraulic Press", text: "Supports forming, pressing and assembly tasks.", href: "/products/series/hydraulic-presses" },
    { title: "Welding Machine", text: "Joins prepared components and subassemblies." },
    { title: "Surface Treatment", text: "Grinding, coating and final product finishing." },
  ] satisfies readonly WorkflowItem[],
  workflowNote:
    "The single-table fiber laser cutting machine is a front-end cutting machine within a complete sheet metal fabrication workflow.",
  selectionItems: [
    "Sheet material",
    "Maximum and common cutting thickness",
    "Common sheet size",
    "Required cutting quality",
    "Daily cutting quantity",
    "Main products or applications",
    "Required laser power",
    "Open type or optional enclosure",
    "Smoke exhaust requirement",
    "Available workshop space",
    "Voltage requirement",
    "Cooling-system requirement",
    "Cutting-gas condition",
    "Budget range",
    "Machines to coordinate with the laser cutter",
  ],
  selectionCta: {
    title: "Send Your Sheet Metal Cutting Requirement",
    text: "Share drawings or material, thickness, sheet size, daily quantity, edge requirement and workshop conditions.",
    label: "Request Recommendation",
  },
  specificationFields: [
    { heading: "Model", source: "name" },
    { heading: "Working Area (mm)", source: "confirmed", confirmedValue: "Customizable / Please confirm with our sales engineer" },
    { heading: "Laser Power (kW)", source: "spec", sourceIndex: 0 },
    { heading: "Cutting Material", source: "confirmed", confirmedValue: "Mild steel, stainless steel, galvanized sheet, aluminum, copper and brass depending on configuration" },
    { heading: "Maximum Cutting Thickness (mm)", source: "confirmed", confirmedValue: "Customizable / Please confirm with our sales engineer" },
    { heading: "Positioning Accuracy (mm)", source: "confirmed", confirmedValue: "Customizable / Please confirm with our sales engineer" },
    { heading: "Max Cutting Speed (m/min)", source: "confirmed", confirmedValue: "Customizable / Please confirm with our sales engineer" },
    { heading: "Transmission System", source: "spec", sourceIndex: 2 },
    { heading: "Control System", source: "confirmed", confirmedValue: "CNC cutting control system; final brand and functions depend on configuration" },
    { heading: "Cooling System", source: "confirmed", confirmedValue: "Customizable / Please confirm with our sales engineer" },
    { heading: "Machine Size L × W × H (mm)", source: "confirmed", confirmedValue: "Customizable / Please confirm with our sales engineer" },
    { heading: "Machine Weight (kg)", source: "confirmed", confirmedValue: "Customizable / Please confirm with our sales engineer" },
    { heading: "Application", source: "confirmed", confirmedValue: "Flat metal sheet cutting for fabrication, cabinets, signage, stainless products, HVAC parts and general metalworking" },
  ] satisfies readonly SpecificationField[],
  specificationNote:
    "Final specifications depend on sheet material, thickness, working area, laser power, cutting gas, control system and selected machine configuration.",
  safetyPoints: [
    "Prepare stable electrical power for the confirmed machine configuration.",
    "Confirm cutting-gas supply, storage and pressure requirements.",
    "Plan smoke exhaust or dust collection for the workshop layout.",
    "Prepare the cooling system and a clean installation area.",
    "Operators must follow laser-safety instructions and local regulations.",
    "Open-type machines require especially careful eye protection, access control and safety management.",
  ],
  faqs: [
    {
      question: "What is a single-table fiber laser cutting machine?",
      answer: "It is a fiber laser machine that uses one working table for loading, cutting and unloading, primarily for flat metal sheet processing.",
    },
    {
      question: "What materials can this machine cut?",
      answer: "Typical configured applications include mild steel, stainless steel, galvanized sheet, aluminum, copper and brass. Capability depends on laser power, thickness, cutting gas and process settings.",
    },
    {
      question: "What is the difference between single-table and exchange-table fiber laser cutting machines?",
      answer: "A single-table machine has one work platform and a simpler structure for controlled-investment workshops. An exchange-table system coordinates a second platform to reduce loading waits in higher-output production.",
    },
    {
      question: "Is it suitable for first-time laser cutting machine buyers?",
      answer: "It can suit small and medium workshops buying their first laser cutter, provided the configuration is confirmed against material, sheet size and production quantity.",
    },
    {
      question: "Can it cut stainless steel and aluminum?",
      answer: "Yes, in a suitable configuration. Material thickness, laser power, cutting gas and edge-quality requirements must be reviewed first.",
    },
    {
      question: "How do I choose the right laser power?",
      answer: "Provide the material, maximum and common thicknesses, speed and finish targets, production quantity and budget so an engineer can recommend the configuration.",
    },
    {
      question: "What cutting gas should I use?",
      answer: "Oxygen, nitrogen or compressed air may be selected according to material, thickness, edge requirement, process and operating cost.",
    },
    {
      question: "Can this machine replace a shearing machine?",
      answer: "Laser cutting serves complex contours, holes and flexible nesting; a shear remains efficient for suitable straight cuts. Many workshops use both.",
    },
    {
      question: "What information should I provide before quotation?",
      answer: "Send material, thickness, sheet dimensions, daily quantity, quality target, product application, voltage, supporting-equipment needs and destination country or port.",
    },
    {
      question: "Can the machine be customized?",
      answer: "Working area, laser power, control, cooling, exhaust, optional enclosure and voltage can be reviewed and confirmed for the required configuration.",
    },
  ] satisfies readonly FaqItem[],
  internalLinks: [
    { label: "Exchange table fiber laser cutting machine", href: "/products/exchange-table-fiber-laser-cutting-machine" },
    { label: "Sheet metal shearing machine", href: "/products/series/shearing-machines" },
    { label: "Hydraulic press brake", href: "/products/hydraulic-press-brake" },
    { label: "CNC press brake", href: "/products/cnc-hydraulic-press-brake" },
    { label: "Plate rolling machine", href: "/products/series/rolling-machines" },
    { label: "Hydraulic press", href: "/products/series/hydraulic-presses" },
    { label: "Sheet metal bending machine", href: "/products/series/bending-machines" },
    { label: "Laser cutting machine for metal sheet", href: "/products/series/laser-cutting-machines" },
  ],
  finalCta: {
    title: "Need a Cost-effective Sheet Metal Laser Cutting Solution?",
    text: "Send your material, thickness, sheet size and production requirement. We will recommend a suitable single-table fiber laser cutting machine configuration for your workshop.",
    primary: "Request a Quote",
    secondary: "Contact Engineer",
  },
} as const;
