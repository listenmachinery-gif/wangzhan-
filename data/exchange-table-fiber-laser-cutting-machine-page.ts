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
  automaticLine: string;
};

export type WorkflowItem = ContentCard & {
  href?: string;
};

export type SpecificationField = {
  heading: string;
  source: "name" | "spec" | "application" | "confirmed";
  sourceIndex?: number;
  confirmedValue?: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const confirmationPlaceholder =
  "Customizable / Please confirm with our sales engineer";

export const applicationPhotos: readonly ApplicationPhoto[] = [
  {
    title: "Sheet metal fabrication",
    text: "Supports repeatable cutting of profiles, holes and mixed sheet-metal parts for daily fabrication work, subject to the selected configuration.",
    image:
      "/products/electro-hydraulic-servo-cnc-press-brake-applications/precision-sheet-metal-fabrication.jpg",
    alt: "Sheet metal fabrication workshop preparing metal parts",
  },
  {
    title: "Electrical cabinet and enclosure",
    text: "Suitable for cabinet panels, control-box openings and enclosure components that move on to bending and assembly.",
    image:
      "/products/electro-hydraulic-servo-cnc-press-brake-applications/electrical-cabinet-manufacturing.jpg",
    alt: "Electrical cabinet manufacturing workshop with real production equipment",
  },
  {
    title: "Stainless steel products",
    text: "Cuts stainless-steel product blanks and appearance parts when power, gas and edge requirements are correctly matched.",
    image:
      "/products/electro-hydraulic-servo-cnc-press-brake-applications/stainless-steel-products.jpg",
    alt: "Real stainless steel product fabrication in an industrial workshop",
  },
  {
    title: "Kitchen equipment",
    text: "Prepares panels, openings and shaped parts for commercial kitchen fabrication before forming and welding.",
    image:
      "/products/electric-folding-applications/stainless-steel-fabrication.webp",
    alt: "Real stainless steel kitchen equipment fabrication scene",
  },
  {
    title: "Advertising signage",
    text: "Handles varied outlines, lettering components and mounting features for metal sign production, depending on material choice.",
    image: "/products/electric-folding-applications/signage-fabrication.webp",
    alt: "Real metal advertising signage fabrication work",
  },
  {
    title: "HVAC duct and ventilation parts",
    text: "Prepares flat duct parts, flanges and ventilation components for subsequent forming and connection processes.",
    image:
      "/products/electro-hydraulic-servo-cnc-press-brake-applications/hvac-duct-and-ventilation.jpg",
    alt: "Real HVAC duct and ventilation parts production area",
  },
  {
    title: "Machinery manufacturing",
    text: "Cuts covers, brackets, guards and structural sheet components for machinery-building workflows.",
    image:
      "/products/electro-hydraulic-servo-cnc-press-brake-applications/machinery-manufacturing.jpg",
    alt: "Real machinery manufacturing workshop processing metal components",
  },
  {
    title: "Metal door and window parts",
    text: "Prepares architectural sheet parts and profile-related panels for door, window and façade fabrication.",
    image: "/products/electric-folding-applications/architectural-sheet-metal.webp",
    alt: "Real architectural metal door and window fabrication application",
  },
  {
    title: "Steel structure components",
    text: "Supports repeatable cutting of connection plates, brackets and related sheet components within the configured cutting range.",
    image:
      "/products/electro-hydraulic-servo-cnc-press-brake-applications/steel-structure-components.jpg",
    alt: "Real steel structure component fabrication workshop",
  },
  {
    title: "General metalworking workshop",
    text: "A practical front-end cutting platform for mixed orders, batch blanks and varied workshop production.",
    image:
      "/products/electro-hydraulic-servo-cnc-press-brake-applications/general-metalworking-workshop.jpg",
    alt: "Real general metalworking workshop with active fabrication work",
  },
] as const;

export const technicalSpecificationFields: readonly SpecificationField[] = [
  { heading: "Model", source: "name" },
  { heading: "Working Area (mm)", source: "confirmed" },
  { heading: "Laser Power (kW)", source: "spec", sourceIndex: 0 },
  {
    heading: "Cutting Material",
    source: "confirmed",
    confirmedValue:
      "Mild steel, stainless steel, galvanized sheet, aluminum, copper and brass depending on configuration",
  },
  { heading: "Maximum Cutting Thickness (mm)", source: "confirmed" },
  {
    heading: "Exchange Table Type",
    source: "confirmed",
    confirmedValue: "Dual exchange platforms",
  },
  { heading: "Exchange Time (s)", source: "confirmed" },
  { heading: "Positioning Accuracy (mm)", source: "confirmed" },
  { heading: "Max Cutting Speed (m/min)", source: "confirmed" },
  { heading: "Transmission System", source: "spec", sourceIndex: 2 },
  { heading: "Control System", source: "spec", sourceIndex: 3 },
  { heading: "Cooling System", source: "confirmed" },
  { heading: "Machine Size L × W × H (mm)", source: "confirmed" },
  { heading: "Machine Weight (kg)", source: "confirmed" },
  { heading: "Application", source: "application" },
] as const;

export const exchangeTableFiberLaserCuttingMachinePage = {
  hero: {
    H1: "Exchange-Table Fiber Laser Cutting Machine",
    subtitle:
      "High-efficiency sheet metal laser cutting solution with dual exchange platforms.",
    description:
      "An exchange-table fiber laser cutting machine designed for continuous sheet metal cutting, higher workshop productivity and batch fabrication. The dual-platform structure allows loading and unloading on one table while the other table is cutting, helping workshops reduce waiting time and improve daily production flow.",
    primaryCta: "Get High-efficiency Cutting Solution",
    secondaryCta: "Request Machine Configuration",
    values: [
      "Dual Exchange Platforms",
      "Reduce Loading Waiting Time",
      "Suitable for Batch Sheet Cutting",
      "Practical for Fabrication Workshops",
    ],
  },
  painPoints: [
    {
      title: "Single-table loading takes too much waiting time",
      text: "With two working platforms, material can be loaded or finished parts removed from the standby table while the other table remains in the cutting area.",
    },
    {
      title: "Batch sheet cutting needs higher efficiency",
      text: "The alternating-table workflow suits recurring production in fabrication, cabinet, stainless-steel product and general metalworking workshops.",
    },
    {
      title: "Traditional cutting cannot handle complex shapes well",
      text: "Fiber laser cutting supports complex profiles, hole patterns, irregular parts and mixed sheet jobs when the process is correctly configured.",
    },
    {
      title: "Workshops need a front-end cutting machine for full production",
      text: "Cut parts can continue to bending, rolling, welding, polishing, surface treatment and final assembly.",
    },
    {
      title: "Better productivity without building a full material line",
      text: "An exchange-table machine can improve cutting continuity without implying a separate material-storage or loading system that is not included in the confirmed configuration.",
    },
  ] satisfies readonly ContentCard[],
  solutions: [
    {
      title: "Batch Sheet Metal Cutting",
      text: "A practical solution for recurring flat-sheet orders and mixed batches.",
      suitableFor:
        "Medium- and higher-output fabrication shops, cabinet factories and general metalworking workshops.",
      recommendedUse:
        "Daily batch cutting of flat sheet parts, profiles and holes.",
      productionValue:
        "Dual-platform exchange reduces loading and unloading interruptions between cutting cycles.",
    },
    {
      title: "Stainless Steel & Cabinet Fabrication",
      text: "A flexible cutting stage for appearance panels, openings and enclosure components.",
      suitableFor:
        "Stainless-steel products, kitchen equipment, electrical cabinets, control cabinets and equipment enclosures.",
      recommendedUse:
        "Complex contours, hole patterns and parts that continue to bending and welding.",
      productionValue:
        "Keeps front-end blank preparation organized for downstream forming and assembly.",
    },
    {
      title: "Complete Fabrication Workflow",
      text: "Connects the cutting stage with the workshop's existing forming and joining equipment.",
      suitableFor:
        "Workshops with press brakes, shears, plate rollers, welding and surface-treatment processes.",
      recommendedUse:
        "Front-end sheet preparation for a coordinated fabrication sequence.",
      productionValue:
        "Creates a clear path from drawing and sheet cutting to finished metal products.",
    },
  ] satisfies readonly SolutionCard[],
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
  cuttingProcess: [
    {
      title: "Drawing Import",
      text: "Import DXF or compatible cutting files according to the nesting software and control system.",
    },
    {
      title: "Material Loading",
      text: "Load the metal sheet on the standby exchange table while the other table is cutting.",
    },
    {
      title: "Cutting Parameter Setting",
      text: "Set laser power, cutting speed, focus, gas type and pressure according to material and thickness.",
    },
    {
      title: "Fiber Laser Cutting",
      text: "The fiber laser system cuts flat sheet metal into required contours, holes and profiles.",
    },
    {
      title: "Table Exchange",
      text: "The working tables exchange positions so the next cutting cycle can continue with less non-cutting time.",
    },
    {
      title: "Part Sorting",
      text: "Remove finished parts and scrap from the table outside the cutting area.",
    },
    {
      title: "Next Process",
      text: "Continue with bending, rolling, welding, polishing, surface treatment or final assembly.",
    },
  ] satisfies readonly ContentCard[],
  exchangeTablePoints: [
    "Two working platforms alternate between loading, cutting and unloading positions.",
    "While one table is inside the cutting area, the other table can be prepared outside.",
    "The arrangement helps reduce non-cutting time caused by sheet loading and part removal.",
    "It is more suitable for recurring batch production than a single-table workflow.",
    "It is a practical choice where higher cutting continuity is needed without a full material-storage system.",
  ],
  powerGuide: [
    "Thinner sheets generally require less laser power than thicker plate.",
    "Thicker material or higher cutting-speed targets may require a different power configuration.",
    "Stainless steel, aluminum, copper and brass can require different laser and cutting-gas choices.",
    "Edge requirement, cutting quality and production speed should be evaluated together.",
    "Final selection depends on material, maximum thickness, common thickness, cutting quantity and budget.",
  ],
  gasGuide: [
    {
      title: "Oxygen",
      text: "Often considered for carbon-steel cutting depending on material thickness, cutting process and edge requirement.",
    },
    {
      title: "Nitrogen",
      text: "Can help control oxidation on stainless steel and some non-ferrous metals when the machine and gas system are suitably configured.",
    },
    {
      title: "Compressed Air",
      text: "May be considered for cost-sensitive cutting tasks depending on material, thickness and acceptable edge quality.",
    },
  ] satisfies readonly ContentCard[],
  advantages: [
    "Dual exchange platforms for higher cutting continuity",
    "Less waiting during sheet loading and finished-part removal",
    "Suitable for recurring batch sheet-metal cutting",
    "Practical for medium- and higher-output workshops",
    "Supports different metal materials depending on configuration",
    "Flexible cutting of contours, holes and sheet-metal parts",
    "Connects with bending, shearing, rolling and welding processes",
    "More continuous workflow than a single-table machine for repeated jobs",
  ],
  comparison: [
    {
      label: "Working table structure",
      singleTable: "One cutting table",
      exchangeTable: "Two alternating working platforms",
      automaticLine: "Cutting platform with a separately configured material-handling system",
    },
    {
      label: "Loading and unloading",
      singleTable: "Machine pauses while the working table is cleared and reloaded",
      exchangeTable: "Standby table can be prepared while the other table is cutting",
      automaticLine: "Material handling is coordinated by the selected loading and unloading system",
    },
    {
      label: "Investment level",
      singleTable: "Entry-level production structure",
      exchangeTable: "Mid-level productivity upgrade",
      automaticLine: "Higher system investment and integration scope",
    },
    {
      label: "Production continuity",
      singleTable: "Suitable for moderate output and flexible jobs",
      exchangeTable: "Better suited to recurring batches with less table waiting",
      automaticLine: "Designed for highly continuous production when fully configured",
    },
    {
      label: "Automation level",
      singleTable: "Manual material handling",
      exchangeTable: "Table exchange does not by itself include material loading",
      automaticLine: "Higher material-handling automation",
    },
    {
      label: "Workshop space",
      singleTable: "More compact layout",
      exchangeTable: "Requires clear exchange and loading zones",
      automaticLine: "Requires additional storage, handling and safety space",
    },
    {
      label: "Suitable workshop",
      singleTable: "Small and medium workshops or first-time upgrades",
      exchangeTable: "Medium- and higher-output batch fabrication workshops",
      automaticLine: "High-output plants with stable production planning",
    },
    {
      label: "Recommended use",
      singleTable: "General flat-sheet cutting with controlled investment",
      exchangeTable: "Continuous batch cutting with reduced loading interruption",
      automaticLine: "Integrated production where reduced manual handling is a priority",
    },
  ] satisfies readonly ComparisonRow[],
  workflow: [
    {
      title: "Exchange-Table Fiber Laser Cutting Machine",
      text: "Cuts complex profiles, openings and sheet-metal blanks.",
    },
    {
      title: "Shearing Machine",
      text: "Handles straight blanking and simple sheet division.",
    },
    {
      title: "Press Brake",
      text: "Forms cut blanks into angles, cabinets and enclosures.",
    },
    {
      title: "Plate Rolling Machine",
      text: "Produces arcs, cylinders and curved sheet components.",
    },
    {
      title: "Hydraulic Press",
      text: "Supports pressing, assembly and forming operations.",
    },
    {
      title: "Welding Machine",
      text: "Joins formed parts into finished structures.",
    },
    {
      title: "Surface Treatment",
      text: "Completes grinding, coating and other finishing stages.",
    },
    {
      title: "Loading System Upgrade",
      text: "Can be evaluated separately when higher output or reduced handling is required.",
    },
  ] satisfies readonly WorkflowItem[],
  selectionInputs: [
    "Sheet material",
    "Maximum cutting thickness",
    "Common sheet size",
    "Required cutting quality",
    "Daily cutting quantity",
    "Main products or applications",
    "Required laser power",
    "Open type or enclosed cover",
    "Exchange-table cycle requirement",
    "Smoke exhaust requirement",
    "Available workshop space",
    "Voltage requirement",
    "Cooling system requirement",
    "Cutting gas condition",
    "Budget range",
    "Matching bending, shearing or loading equipment",
  ],
  safety: [
    "Prepare a stable power supply according to the confirmed machine configuration.",
    "Confirm cutting-gas supply and pressure requirements for the selected process.",
    "Plan smoke extraction or dust collection for the workshop layout.",
    "Prepare the cooling system and a clean, level installation area.",
    "Keep sufficient clear space for table exchange, sheet loading and part unloading.",
    "Operators must follow laser-safety instructions and applicable local regulations.",
    "When a protective enclosure is selected, use doors, viewing windows and safety interlocks according to the manufacturer's instructions.",
  ],
  faqs: [
    {
      question: "What is an exchange-table fiber laser cutting machine?",
      answer:
        "It is a fiber laser cutting machine with two working platforms that alternate between cutting, loading and unloading positions. The layout is intended to improve sheet-cutting continuity and workshop production flow.",
    },
    {
      question: "What materials can this machine cut?",
      answer:
        "Depending on the selected laser source, cutting head, gas system and process, it can be configured for carbon steel, stainless steel, galvanized sheet, aluminum, copper and brass. Capability must be confirmed against material and thickness.",
    },
    {
      question:
        "What is the difference between exchange-table and single-table fiber laser cutting machines?",
      answer:
        "A single-table machine uses one working table and offers a simpler production structure. An exchange-table machine uses two platforms, allowing the standby table to be prepared while the other table is cutting, which better suits recurring batches.",
    },
    {
      question: "Is it suitable for high-volume sheet metal cutting?",
      answer:
        "It is generally better suited to batch cutting and continuous production than a single-table workflow. Suitability still depends on sheet size, thickness, selected laser power, material handling and shift planning.",
    },
    {
      question: "Can it cut stainless steel and aluminum?",
      answer:
        "It can be configured for stainless steel and aluminum, but the final process depends on material thickness, laser power, cutting gas and the required edge condition.",
    },
    {
      question: "How do I choose the right laser power?",
      answer:
        "Confirm the material, maximum and common thicknesses, desired cutting speed, edge requirement, production quantity and budget. A suitable power configuration can then be recommended.",
    },
    {
      question: "What cutting gas should I use?",
      answer:
        "Oxygen, nitrogen or compressed air may be selected according to material, thickness, edge requirement and operating cost. Final gas selection should follow the confirmed cutting process.",
    },
    {
      question: "Does the exchange table mean automatic loading and unloading?",
      answer:
        "No. The exchange table refers to two working platforms that alternate positions. Separate loading, unloading or material-storage equipment is required for a material-handling line and must be confirmed as an additional configuration.",
    },
    {
      question: "Can this machine replace a shearing machine?",
      answer:
        "Laser cutting is suited to complex contours, openings and flexible nesting, while a shearing machine is efficient for straight blanking. Many workshops use both according to the part and production plan.",
    },
    {
      question: "What information should I provide before quotation?",
      answer:
        "Please provide the material, maximum and common thicknesses, standard sheet size, daily quantity, edge requirement, application, voltage, related equipment needs and destination country or port.",
    },
    {
      question: "Can the machine be customized?",
      answer:
        "Configuration can be confirmed for working area, laser power, control and cooling systems, extraction, protective enclosure, exchange-table arrangement, voltage and optional material handling, subject to engineering review.",
    },
  ] satisfies readonly FaqItem[],
  internalLinks: [
    {
      title: "Single-table fiber laser cutting machine",
      href: "/products/single-table-fiber-laser-cutting-machine",
    },
    { title: "Sheet metal shearing machine", href: "/categories/shearing-machines" },
    { title: "Hydraulic press brake", href: "/products/nc-hydraulic-press-brake" },
    {
      title: "CNC press brake",
      href: "/products/electro-hydraulic-servo-cnc-press-brake",
    },
    { title: "Plate rolling machine", href: "/categories/plate-rolling-machines" },
    { title: "Hydraulic press", href: "/products/four-column-hydraulic-press" },
    { title: "Sheet metal bending machine", href: "/categories/bending-machines" },
    { title: "Laser cutting machine for metal sheet", href: "/categories/laser-cutting-machines" },
    { title: "Laser cutting system consultation", href: "/contact" },
  ],
  finalCta: {
    title: "Need a High-efficiency Sheet Metal Laser Cutting Solution?",
    text: "Send your material, thickness, sheet size and production requirement. We will recommend a suitable exchange-table fiber laser cutting machine configuration for your workshop.",
    primary: "Request a Quote",
    secondary: "Contact Engineer",
  },
} as const;
