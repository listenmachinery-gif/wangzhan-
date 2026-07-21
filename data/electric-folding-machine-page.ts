export type ElectricFoldingHero = {
  title: string;
  subtitle: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  proofPoints: string[];
};

export type ElectricFoldingTextCard = {
  title: string;
  text: string;
};

export type ElectricFoldingSolution = {
  title: string;
  suitableFor: string;
  recommendedUse: string;
  productionValue: string;
};

export type ElectricFoldingApplication = {
  title: string;
  text: string;
  image: string;
  alt: string;
};

export type ElectricFoldingProcessStep = ElectricFoldingTextCard;

export type ElectricFoldingComparisonRow = {
  item: string;
  manual: string;
  electric: string;
  hydraulic: string;
};

export type ElectricFoldingEquipment = {
  title: string;
  role: string;
  href: string;
};

export type ElectricFoldingLink = {
  label: string;
  href: string;
};

export type ElectricFoldingFaq = {
  question: string;
  answer: string;
};

export type ElectricFoldingMachinePageContent = {
  hero: ElectricFoldingHero;
  problems: ElectricFoldingTextCard[];
  solutions: ElectricFoldingSolution[];
  applications: ElectricFoldingApplication[];
  materials: ElectricFoldingTextCard[];
  materialNote: string;
  process: ElectricFoldingProcessStep[];
  advantages: ElectricFoldingTextCard[];
  comparison: ElectricFoldingComparisonRow[];
  equipment: ElectricFoldingEquipment[];
  equipmentSummary: string;
  relatedLinks: ElectricFoldingLink[];
  selectionQuestions: string[];
  selectionCta: {
    title: string;
    cta: string;
  };
  technical: {
    title: string;
    note: string;
  };
  faqs: ElectricFoldingFaq[];
  finalCta: {
    title: string;
    text: string;
    primaryCta: string;
    secondaryCta: string;
  };
};

export const electricFoldingMachinePageContent: ElectricFoldingMachinePageContent = {
  hero: {
    title: "Electric Folding Machine",
    subtitle:
      "Efficient sheet metal edge bending solution for workshops, HVAC duct fabrication and light metal forming.",
    description:
      "A practical electric folding machine for thin sheet metal bending, edge folding and duct panel forming. It helps workshops improve folding efficiency, reduce manual labor and keep more consistent bending results for daily sheet metal production.",
    primaryCta: "Get Folding Solution",
    secondaryCta: "Request Machine Configuration",
    proofPoints: [
      "Electric Driven Folding",
      "Suitable for Thin Sheet Metal",
      "Stable Angle Control",
      "Practical for Duct Fabrication",
    ],
  },
  problems: [
    {
      title: "Manual folding is slow for repeated work",
      text: "Electric drive reduces repeated manual lifting and folding actions, making it suitable for routine edge-folding work.",
    },
    {
      title: "Thin sheet edges need consistent bending",
      text: "Suitable thin-sheet hemming, duct-panel folding and edge forming help keep bending results more consistent.",
    },
    {
      title: "Small workshops need efficient equipment",
      text: "A practical powered folding option for small and medium sheet-metal workshops, duct shops and repair fabrication points.",
    },
    {
      title: "Duct panels require folding before assembly",
      text: "Supports rectangular duct-panel folds before lock forming, beading, flanging and seam-closing operations.",
    },
    {
      title: "Operators need easier daily production",
      text: "Electric folding reduces purely manual operating effort for more frequent thin-sheet edge-folding requirements.",
    },
  ],
  solutions: [
    {
      title: "HVAC Duct Fabrication",
      suitableFor: "Rectangular duct fabricators, ventilation installation teams and HVAC duct workshops.",
      recommendedUse:
        "Fold duct panels alongside shearing, lock forming, beading, TDF flange forming and seam closing operations.",
      productionValue:
        "Adds a practical folding stage to a complete rectangular duct fabrication workflow.",
    },
    {
      title: "Sheet Metal Workshop",
      suitableFor: "Small sheet-metal factories, repair fabrication points and non-standard part workshops.",
      recommendedUse: "Daily thin-sheet edge folding, hemming and simple forming.",
      productionValue: "Better suited to repeated production than purely manual folding equipment.",
    },
    {
      title: "Roofing & Architectural Metal",
      suitableFor: "Roofing metal workers, architectural panel fabricators, signage makers and installation teams.",
      recommendedUse: "Architectural trim, edge wrapping, panel folds and light sheet-metal forming.",
      productionValue: "Supports suitable building-metal and light panel-forming work.",
    },
  ],
  applications: [
    {
      title: "HVAC duct panel folding",
      text: "Forms duct-panel edges before rectangular duct joining and assembly operations.",
      image: "/products/electric-folding-applications/hvac-duct-panel-folding.webp",
      alt: "Industrial HVAC ventilation ductwork installed on an exterior wall",
    },
    {
      title: "Ventilation duct fabrication",
      text: "Supports repeatable folding steps for ventilation duct panels before their next forming and joining process.",
      image: "/products/electric-folding-applications/ventilation-duct-fabrication.webp",
      alt: "Exposed ventilation ductwork inside an industrial building",
    },
    {
      title: "Roofing sheet metal work",
      text: "Useful for suitable thin roofing sheet, flashing and trim parts that need folded edges.",
      image: "/products/electric-folding-applications/roofing-sheet-metal-work.webp",
      alt: "Corrugated gray metal roofing sheets for sheet metal fabrication",
    },
    {
      title: "Architectural sheet metal",
      text: "Supports light architectural panels, edging and trim components where the material matches the selected model.",
      image: "/products/electric-folding-applications/architectural-sheet-metal.webp",
      alt: "Architectural sheet metal panels with folded edge details",
    },
    {
      title: "Electrical cabinet and enclosure",
      text: "Helps prepare suitable thin-sheet flanges and enclosure parts for fabrication and assembly.",
      image: "/products/electric-folding-applications/electrical-cabinet-enclosure.webp",
      alt: "Technician working inside an industrial electrical control enclosure",
    },
    {
      title: "Signage fabrication",
      text: "Handles straightforward edge folds for suitable sign panels, channels and light-gauge components.",
      image: "/products/electric-folding-applications/signage-fabrication.webp",
      alt: "Hands holding a finished sign for a fabrication project",
    },
    {
      title: "Stainless steel light fabrication",
      text: "Supports selected thin stainless steel work after material strength, thickness and bending length are confirmed.",
      image: "/products/electric-folding-applications/stainless-steel-fabrication.webp",
      alt: "Industrial worker grinding metal in a light fabrication workshop",
    },
    {
      title: "General sheet metal workshop",
      text: "A practical powered folding step for mixed thin-sheet edge-forming work in a general workshop.",
      image: "/products/electric-folding-applications/general-sheet-metal-workshop.webp",
      alt: "Metalworker welding sheet metal parts in a general fabrication workshop",
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
      text: "Requires capacity confirmation because material strength affects workable thickness.",
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
      title: "Positioning",
      text: "Position the sheet according to the required flange size or duct panel size.",
    },
    {
      title: "Clamping",
      text: "Clamp the sheet firmly before folding.",
    },
    {
      title: "Electric Folding",
      text: "Use the electric folding mechanism to complete edge bending more efficiently than manual operation.",
    },
    {
      title: "Angle Checking",
      text: "Check the bending angle and adjust according to the required part.",
    },
    {
      title: "Next Process",
      text: "Continue with lock forming, riveting, welding, duct assembly, installation or final product assembly.",
    },
  ],
  advantages: [
    {
      title: "Electric driven folding for easier operation",
      text: "Motor-driven folding reduces manual lifting and folding effort in routine thin-sheet work.",
    },
    {
      title: "Suitable for thin sheet metal edge bending",
      text: "Supports folding, flanging, edge wrapping and angle forming for suitable thin metal sheets.",
    },
    {
      title: "More efficient than manual folding for repeated work",
      text: "A motor-assisted folding cycle is practical for repeated small-to-medium batch workshop production.",
    },
    {
      title: "Compact structure for small and medium workshops",
      text: "The electric folding machine has a relatively simple structure for conventional thin-sheet folding applications.",
    },
    {
      title: "Practical for HVAC duct fabrication",
      text: "Useful for duct-panel edge forming before lock forming, flanging, joining and assembly.",
    },
    {
      title: "Useful supporting machine in sheet metal production",
      text: "Fits as a folding stage beside cutting, reinforcement, lock-forming and joining equipment.",
    },
    {
      title: "Simple operation and easy maintenance",
      text: "Its practical clamping, folding, electrical-control and angle-adjustment sections support routine workshop use.",
    },
    {
      title: "Works with matched duct and forming equipment",
      text: "Can work with a shearing machine, lock forming machine, beading machine and flange forming machine.",
    },
  ],
  comparison: [
    {
      item: "Power source",
      manual: "Manual operation; no electrical supply required for folding.",
      electric: "Motor-driven and requires the matched electrical supply.",
      hydraulic: "Hydraulic power system with the matched electrical supply.",
    },
    {
      item: "Suitable production volume",
      manual: "One-off, mixed and small-batch work.",
      electric: "Repeated small-to-medium batch thin-sheet production.",
      hydraulic: "Continuous or higher-load folding requirements.",
    },
    {
      item: "Operation method",
      manual: "The operator clamps and folds the sheet mechanically.",
      electric: "Motor assistance reduces manual effort in the folding cycle.",
      hydraulic: "Hydraulic clamping and folding provide powered operation.",
    },
    {
      item: "Folding efficiency",
      manual: "Practical for lower-frequency and varied work.",
      electric: "Suitable for repeated daily folding cycles with less manual effort.",
      hydraulic: "Suitable for higher-load or more demanding folding work.",
    },
    {
      item: "Cost level",
      manual: "Lower-complexity equipment for basic folding requirements.",
      electric: "Powered equipment and electrical configuration level.",
      hydraulic: "Higher-complexity hydraulic equipment configuration.",
    },
    {
      item: "Workshop space",
      manual: "Relevant to compact workshops and selected site layouts.",
      electric: "A practical powered station for small and medium workshops.",
      hydraulic: "Usually planned for a larger, higher-load workshop station.",
    },
    {
      item: "Recommended use",
      manual: "Basic thin-sheet folding, limited batches and flexible site work.",
      electric: "Daily repeated thin-sheet folding, duct panels and workshop production.",
      hydraulic: "Larger specifications, higher loads or heavier folding requirements.",
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
      title: "Electric Folding Machine",
      role: "Creates duct-panel folds, return edges and suitable thin-sheet hems.",
      href: "/products/electric-sheet-metal-folding-machine",
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
    "The electric folding machine is not only a single machine, but also a practical supporting machine in a complete sheet metal or HVAC duct fabrication workflow.",
  relatedLinks: [
    { label: "Manual Folding Machine", href: "/products/manual-sheet-metal-folding-machine" },
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
    "Workshop use or site use",
    "Daily production quantity",
    "Voltage requirement",
    "Need to match with shearing machine, lock former, beading machine or TDF flange machine",
  ],
  selectionCta: {
    title: "Send Your Sheet Metal Folding Requirement",
    cta: "Request Recommendation",
  },
  technical: {
    title: "Technical Specifications",
    note:
      "Final specifications depend on sheet material, thickness, bending length, voltage and selected machine configuration.",
  },
  faqs: [
    {
      question: "What is an electric folding machine?",
      answer:
        "An electric folding machine uses electric drive to complete thin-sheet edge folding, hemming and basic forming. It is suitable for routine workshop sheet-metal work and duct-panel folding.",
    },
    {
      question: "What materials can this machine bend?",
      answer:
        "It is commonly used with galvanized sheet, thin mild steel, thin stainless steel, aluminum and color steel sheet. Actual capability depends on material strength, thickness and machine specification.",
    },
    {
      question: "Is an electric folding machine suitable for HVAC duct fabrication?",
      answer:
        "Yes. It supports rectangular duct-panel folding and basic thin-sheet forming, and can work with shearing, lock forming, beading, TDF flange forming and seam-closing equipment in a matched workflow.",
    },
    {
      question: "What is the difference between manual folding machine and electric folding machine?",
      answer:
        "A manual folding machine needs no electrical power and suits small batches or site work. An electric folding machine reduces manual operating effort and is better suited to daily repeated folding and small-to-medium batch production.",
    },
    {
      question: "What is the difference between electric folding machine and hydraulic folding machine?",
      answer:
        "An electric folding machine is suitable for thin-sheet and small-to-medium workshop folding. A hydraulic folding machine is better suited to larger specifications, higher loads or heavier folding requirements.",
    },
    {
      question: "Can it bend stainless steel?",
      answer:
        "It can process suitable thin stainless steel, but workable thickness is affected by material strength. Confirm the selected machine model, stainless grade, thickness and folding length.",
    },
    {
      question: "What information should I provide before quotation?",
      answer:
        "Provide material, thickness, bending length, bending angle, application, production quantity, voltage, required supporting equipment and destination country or port.",
    },
    {
      question: "Can the machine be customized?",
      answer:
        "Working length, voltage, folding structure, angle range and application can be reviewed for configuration matching. Final details are confirmed through the engineering proposal.",
    },
  ],
  finalCta: {
    title: "Need an Efficient Sheet Metal Folding Solution?",
    text:
      "Send your sheet material, thickness, bending length, voltage and application. We will recommend a suitable electric folding machine configuration for your workshop.",
    primaryCta: "Request a Quote",
    secondaryCta: "Contact Engineer",
  },
};
