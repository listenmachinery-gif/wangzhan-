export type ManualFoldingHero = {
  title: string;
  subtitle: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  proofPoints: string[];
};

export type ManualFoldingTextCard = {
  title: string;
  text: string;
};

export type ManualFoldingApplication = ManualFoldingTextCard & {
  image: string;
  alt: string;
};

export type ManualFoldingSolution = {
  title: string;
  suitableFor: string;
  recommendedUse: string;
  productionValue: string;
};

export type ManualFoldingProcessStep = ManualFoldingTextCard;

export type ManualFoldingComparisonRow = {
  item: string;
  manual: string;
  electric: string;
};

export type ManualFoldingEquipment = {
  title: string;
  role: string;
  href: string;
};

export type ManualFoldingLink = {
  label: string;
  href: string;
};

export type ManualFoldingFaq = {
  question: string;
  answer: string;
};

export type ManualFoldingMachinePageContent = {
  hero: ManualFoldingHero;
  problems: ManualFoldingTextCard[];
  solutions: ManualFoldingSolution[];
  applications: ManualFoldingApplication[];
  materials: ManualFoldingTextCard[];
  materialNote: string;
  process: ManualFoldingProcessStep[];
  advantages: ManualFoldingTextCard[];
  comparison: ManualFoldingComparisonRow[];
  equipment: ManualFoldingEquipment[];
  equipmentSummary: string;
  relatedLinks: ManualFoldingLink[];
  selectionQuestions: string[];
  faqs: ManualFoldingFaq[];
  finalCta: {
    title: string;
    text: string;
    primaryCta: string;
    secondaryCta: string;
  };
};

export const manualFoldingMachinePageContent: ManualFoldingMachinePageContent = {
  hero: {
    title: "Manual Folding Machine",
    subtitle:
      "Practical sheet metal edge bending solution for workshops, duct fabrication and on-site sheet metal work.",
    description:
      "A simple, reliable and cost-effective manual folding machine for thin sheet metal bending, edge folding and duct panel forming. Suitable for HVAC duct workshops, roofing sheet metal, signage, electrical enclosures and light fabrication work.",
    primaryCta: "Get Folding Solution",
    secondaryCta: "Request Machine Configuration",
    proofPoints: [
      "No Power Required",
      "Compact Workshop Equipment",
      "Suitable for Thin Sheet Metal",
      "Practical Edge Bending Solution",
    ],
  },
  problems: [
    {
      title: "Small batches do not need expensive CNC bending",
      text: "A practical choice for small batches, non-standard parts, on-site work and customers working within a controlled equipment budget.",
    },
    {
      title: "Thin sheet edges need clean folding",
      text: "The clamping and folding process supports basic edge folding, hemming and straightforward thin-sheet forming work.",
    },
    {
      title: "Workshop space is limited",
      text: "Its simple mechanical layout suits small sheet-metal workshops and local HVAC duct fabrication points where floor space matters.",
    },
    {
      title: "On-site work needs flexible equipment",
      text: "No electrical power is required for folding, making the machine relevant to selected roofing, architectural sheet-metal and duct installation work.",
    },
    {
      title: "Duct panels need simple folding before assembly",
      text: "It can provide the basic edge folds needed before lock forming, riveting, seam closing or rectangular duct assembly.",
    },
  ],
  solutions: [
    {
      title: "Small Sheet Metal Workshop",
      suitableFor: "Small fabricators, repair shops and non-standard part workshops",
      recommendedUse: "Daily thin-sheet edge folding, hemming and simple forming",
      productionValue: "A straightforward manual process with controlled equipment investment and simple operation",
    },
    {
      title: "HVAC Duct Fabrication",
      suitableFor: "Rectangular duct workshops and ventilation installation teams",
      recommendedUse: "Duct-panel edge folding before lock forming, flanging, joining or assembly",
      productionValue: "Supports a practical workflow with shearing, beading, lock forming and TDF flange equipment",
    },
    {
      title: "Roofing & Architectural Sheet Metal",
      suitableFor: "Roofing, architectural trim, signage and installation teams",
      recommendedUse: "Workshop or job-site edge bending and simple forming of suitable thin sheet",
      productionValue: "Adds a flexible folding step without requiring electrical power at the machine",
    },
  ],
  applications: [
    {
      title: "HVAC duct panel folding",
      text: "Forms basic panel edges before rectangular duct joining and assembly operations.",
      image: "/products/manual-folding-applications/hvac-duct-panel-folding.webp",
      alt: "Installed rectangular HVAC ductwork made from folded sheet metal",
    },
    {
      title: "Roofing sheet metal work",
      text: "Supports edge bends and simple profiles for suitable thin roofing sheet and trim parts.",
      image: "/products/manual-folding-applications/roofing-sheet-metal-work.webp",
      alt: "Worker carrying out metal roofing fabrication on a building",
    },
    {
      title: "Architectural sheet metal",
      text: "Useful for small-batch flashing, edging and light architectural sheet-metal preparation.",
      image: "/products/manual-folding-applications/architectural-sheet-metal.webp",
      alt: "Modern architectural facade formed from reflective sheet metal panels",
    },
    {
      title: "Signage fabrication",
      text: "Handles straightforward edge folds for suitable sign panels, channels and light-gauge components.",
      image: "/products/manual-folding-applications/signage-fabrication.webp",
      alt: "Crafted metal panel being formed for decorative signage work",
    },
    {
      title: "Electrical cabinet and enclosure",
      text: "Supports basic thin-sheet flanges and enclosure parts when the selected model matches the workpiece.",
      image: "/products/manual-folding-applications/electrical-cabinet-enclosure.webp",
      alt: "Technician working inside an industrial electrical control enclosure",
    },
    {
      title: "Light sheet metal workshop",
      text: "A practical general-purpose folder for mixed, low-volume thin-sheet jobs.",
      image: "/products/manual-folding-applications/light-sheet-metal-workshop.webp",
      alt: "Metal fabrication team working across an industrial workshop floor",
    },
    {
      title: "Repair and maintenance workshop",
      text: "Suitable for one-off replacement panels, covers, edging and repair components.",
      image: "/products/manual-folding-applications/repair-maintenance-workshop.webp",
      alt: "Technician repairing a metal component at a workshop bench",
    },
    {
      title: "On-site sheet metal bending",
      text: "Provides manual forming where machine size, weight and the job-site layout allow safe placement.",
      image: "/products/manual-folding-applications/on-site-sheet-metal-bending.webp",
      alt: "Workers assembling metal components at an outdoor job site",
    },
  ],
  materials: [
    {
      title: "Galvanized Sheet",
      text: "Commonly used for HVAC duct panels and general light sheet-metal work.",
    },
    {
      title: "Mild Steel Sheet",
      text: "Suitable within the verified capacity of the selected model and bending length.",
    },
    {
      title: "Stainless Steel Sheet",
      text: "Requires capacity confirmation because material strength affects the workable thickness.",
    },
    {
      title: "Aluminum Sheet",
      text: "Useful for light fabrication when alloy, thickness and bend requirement are reviewed together.",
    },
    {
      title: "Color Steel Sheet",
      text: "Supports selected roofing, enclosure and architectural trim applications.",
    },
    {
      title: "Thin Metal Plate",
      text: "The workpiece must be matched to material strength, folding length and machine configuration.",
    },
  ],
  materialNote:
    "The suitable thickness depends on material strength, bending length and machine configuration. Please confirm your material, thickness and bending requirement before quotation.",
  process: [
    {
      title: "Sheet Cutting",
      text: "Cut the sheet to the required size before bending.",
    },
    {
      title: "Marking / Positioning",
      text: "Position the sheet according to the required flange size.",
    },
    {
      title: "Clamping",
      text: "Clamp the sheet firmly before folding.",
    },
    {
      title: "Manual Folding",
      text: "Use the handwheel, lever and folding-beam structure to complete edge bending.",
    },
    {
      title: "Angle Checking",
      text: "Check the bending angle and make adjustment when needed.",
    },
    {
      title: "Next Process",
      text: "Continue with lock forming, riveting, welding, duct assembly or installation.",
    },
  ],
  advantages: [
    {
      title: "Simple mechanical structure",
      text: "Manual handwheel and lever operation keeps the forming method direct and easy to understand.",
    },
    {
      title: "No power supply required",
      text: "Folding does not rely on an electrical cabinet, hydraulic station or compressed-air source.",
    },
    {
      title: "Controlled clamping and folding",
      text: "The clamping beam secures the sheet before the folding beam forms it along the bending axis.",
    },
    {
      title: "Suitable for thin sheet metal bending",
      text: "Supports edge folding, flanging and basic angle forming within the selected model capacity.",
    },
    {
      title: "Practical for small-batch production",
      text: "Useful for mixed specifications, non-standard parts and low-volume jobs.",
    },
    {
      title: "Compact footprint for limited workshop space",
      text: "A practical supporting machine for small workshops and suitable job-site layouts.",
    },
    {
      title: "Easy to operate and maintain",
      text: "Routine work centers on mechanical inspection, cleaning, lubrication and correct clamping practice.",
    },
    {
      title: "Supports duct and site fabrication",
      text: "Useful as a folding step in HVAC duct preparation, roofing and general light sheet-metal workflows.",
    },
  ],
  comparison: [
    {
      item: "Power source",
      manual: "Manual handwheel and lever operation; no power required for folding",
      electric: "Motor-driven and requires the matched electrical supply",
    },
    {
      item: "Suitable production volume",
      manual: "One-off, mixed and small-batch work",
      electric: "Repeated small-to-medium batch workshop production",
    },
    {
      item: "Operation method",
      manual: "Operator clamps and folds the sheet mechanically",
      electric: "Motor assists the folding cycle and reduces manual effort",
    },
    {
      item: "Cost level",
      manual: "Lower-complexity entry for basic folding requirements",
      electric: "Higher equipment and electrical configuration level",
    },
    {
      item: "Workshop space",
      manual: "Relevant to compact workshops and selected on-site layouts",
      electric: "Best planned as a powered workshop production station",
    },
    {
      item: "Bending efficiency",
      manual: "Practical for low-frequency and varied work",
      electric: "More suitable for repeated cycles and higher daily output",
    },
    {
      item: "Recommended use",
      manual: "Basic thin-sheet folding, limited batches and flexible site work",
      electric: "More frequent folding with reduced manual effort and steadier cycle rhythm",
    },
  ],
  equipment: [
    {
      title: "Shearing Machine",
      role: "Cuts sheet to the required blank size before marking and folding.",
      href: "/products/hydraulic-guillotine-shear",
    },
    {
      title: "Beading Machine",
      role: "Adds reinforcement beads to suitable duct panels before assembly.",
      href: "/products/five-line-beading-machine",
    },
    {
      title: "Lock Forming Machine",
      role: "Forms the lock profile used to connect rectangular duct sections.",
      href: "/products/multi-function-lock-forming-machine",
    },
    {
      title: "TDF Flange Forming Machine",
      role: "Forms the integrated flange edge used in a TDF duct workflow.",
      href: "/products/tdf-flange-forming-machine",
    },
    {
      title: "Manual Folding Machine",
      role: "Creates basic panel folds, return edges and thin-sheet hems.",
      href: "/products/manual-sheet-metal-folding-machine",
    },
    {
      title: "Lock Seam Closing Machine",
      role: "Closes the prepared seam after panel forming and duct assembly.",
      href: "/products/electric-duct-seam-closing-machine",
    },
    {
      title: "Press Brake",
      role: "Handles work that needs a different bending method, thicker material or press-brake tooling.",
      href: "/products/nc-hydraulic-press-brake",
    },
  ],
  equipmentSummary:
    "The manual folding machine is not only a single machine, but also a practical supporting machine in a complete sheet metal or HVAC duct fabrication workflow.",
  relatedLinks: [
    { label: "Electric Folding Machine", href: "/products/electric-sheet-metal-folding-machine" },
    { label: "Hydraulic Folding Machine", href: "/products/hydraulic-sheet-metal-folding-machine" },
    { label: "Shearing Machines", href: "/products/series/shearing-machines" },
    { label: "Lock Forming Machine", href: "/products/multi-function-lock-forming-machine" },
    { label: "Beading Machine", href: "/products/five-line-beading-machine" },
    { label: "TDF Flange Forming Machine", href: "/products/tdf-flange-forming-machine" },
    { label: "Press Brake", href: "/products/nc-hydraulic-press-brake" },
    { label: "HVAC Duct Production Line", href: "/products/u-shaped-auto-duct-production-line-5" },
  ],
  selectionQuestions: [
    "Sheet material",
    "Maximum sheet thickness",
    "Maximum bending length",
    "Required bending angle",
    "Flange size",
    "Flat sheet folding or duct sheet folding",
    "Workshop use or on-site use",
    "Daily production quantity",
    "Need to match with shearing machine, lock former or beading machine",
  ],
  faqs: [
    {
      question: "What is a manual folding machine?",
      answer:
        "A manual folding machine uses a manually operated clamping and folding structure to form thin sheet-metal edges. It is suitable for edge folding, duct-panel folding and small-batch sheet-metal work.",
    },
    {
      question: "What materials can this machine bend?",
      answer:
        "It is commonly used with galvanized sheet, thin mild steel, thin stainless steel, aluminum and color steel sheet. Actual capacity depends on material strength, thickness, bending length and the selected model.",
    },
    {
      question: "Is a manual folding machine suitable for HVAC duct fabrication?",
      answer:
        "Yes. It can support rectangular duct-panel folding and basic thin-sheet forming, working with shears, lock formers, beading machines and TDF flange machines in a matched workflow.",
    },
    {
      question: "What is the difference between manual folding machine and electric folding machine?",
      answer:
        "A manual folding machine needs no electrical power for folding and suits small batches or flexible site work. An electric folding machine reduces manual effort and is better suited to more frequent workshop production.",
    },
    {
      question: "Can it bend stainless steel?",
      answer:
        "It can process suitable thin stainless steel, but the workable thickness is normally lower than for material with lower strength. Confirm the stainless grade, thickness and folding length before selecting a model.",
    },
    {
      question: "Is it suitable for on-site work?",
      answer:
        "Its manual operation can suit selected on-site sheet-metal work. Confirm machine dimensions, weight, safe placement and the actual workpiece before planning job-site use.",
    },
    {
      question: "What information should I provide before quotation?",
      answer:
        "Provide the material, thickness, bending length, angle, application, expected quantity, required supporting machines and destination country or port.",
    },
    {
      question: "Can the machine be customized?",
      answer:
        "Working length, folding structure and application requirements can be reviewed for configuration matching. The final machine specification must be confirmed through the engineering proposal.",
    },
  ],
  finalCta: {
    title: "Need a Practical Sheet Metal Folding Solution?",
    text: "Send your sheet material, thickness, bending length and application. We will recommend a suitable manual folding machine configuration for your workshop or job site.",
    primaryCta: "Request a Quote",
    secondaryCta: "Contact Engineer",
  },
};
