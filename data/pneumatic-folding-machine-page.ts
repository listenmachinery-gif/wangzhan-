export type PneumaticFoldingHero = {
  title: string;
  subtitle: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  proofPoints: string[];
};

export type PneumaticFoldingTextCard = {
  title: string;
  text: string;
};

export type PneumaticFoldingApplication = PneumaticFoldingTextCard & {
  image: string;
  alt: string;
};

export type PneumaticFoldingSolution = {
  title: string;
  suitableFor: string;
  recommendedUse: string;
  productionValue: string;
};

export type PneumaticFoldingComparisonRow = {
  item: string;
  manual: string;
  pneumatic: string;
  electric: string;
  hydraulic: string;
};

export type PneumaticFoldingEquipment = {
  title: string;
  role: string;
  href: string;
};

export type PneumaticFoldingFaq = {
  question: string;
  answer: string;
};

export type PneumaticFoldingMachinePageContent = {
  hero: PneumaticFoldingHero;
  problems: PneumaticFoldingTextCard[];
  solutions: PneumaticFoldingSolution[];
  applications: PneumaticFoldingApplication[];
  materials: PneumaticFoldingTextCard[];
  materialNote: string;
  airRequirement: {
    facts: string[];
    airPressure: string;
    airConsumption: string;
  };
  process: PneumaticFoldingTextCard[];
  advantages: PneumaticFoldingTextCard[];
  comparison: PneumaticFoldingComparisonRow[];
  equipment: PneumaticFoldingEquipment[];
  equipmentSummary: string;
  selectionQuestions: string[];
  faqs: PneumaticFoldingFaq[];
  finalCta: {
    title: string;
    text: string;
    primaryCta: string;
    secondaryCta: string;
  };
};

export const technicalHeadings = [
  { source: "Model", label: "Model", unit: "" },
  { source: "Minimum Bending Angle", label: "Minimum Bending Angle", unit: "(deg)" },
  { source: "Bending Thickness", label: "Bending Thickness", unit: "(mm)" },
  { source: "Bending Width", label: "Bending Width", unit: "(mm)" },
  { source: "Weight", label: "Weight", unit: "(kg)" },
  { source: "Overall Dimensions", label: "Overall Dimensions", unit: "(mm)" },
] as const;

export const pneumaticFoldingMachinePageContent: PneumaticFoldingMachinePageContent = {
  hero: {
    title: "Pneumatic Folding Machine",
    subtitle:
      "Efficient air-driven sheet metal folding solution for HVAC duct fabrication and thin metal forming.",
    description:
      "A practical pneumatic folding machine for thin sheet metal bending, duct panel folding and edge forming. Driven by compressed air, it helps workshops reduce manual labor, improve daily folding efficiency and support rectangular duct production.",
    primaryCta: "Get Pneumatic Folding Solution",
    secondaryCta: "Request Machine Configuration",
    proofPoints: [
      "Air-driven Folding",
      "Suitable for HVAC Duct Panels",
      "Easier Than Manual Folding",
      "Practical for Thin Sheet Metal",
    ],
  },
  problems: [
    {
      title: "Manual folding is tiring for repeated duct work",
      text: "Pneumatic drive reduces repeated lifting, clamping and edge-folding effort, making it more practical for regular duct-panel work.",
    },
    {
      title: "Thin sheet edges need stable folding",
      text: "The clamping and folding actions support basic edge bending and forming for galvanized sheet, thin mild steel, suitable stainless steel and aluminum.",
    },
    {
      title: "HVAC workshops need faster duct panel processing",
      text: "The machine folds rectangular duct panels before lock forming, beading, flange forming, seam closing and final assembly.",
    },
    {
      title: "Small and medium workshops need practical equipment",
      text: "Its pneumatic structure is a practical step up from manual folding for workshops that already operate a suitable compressed-air supply.",
    },
    {
      title: "Operators need safer and easier daily production",
      text: "Foot-pedal control and separated pneumatic clamping and folding actions reduce the physical effort of purely manual operation when used correctly.",
    },
  ],
  solutions: [
    {
      title: "HVAC Duct Fabrication",
      suitableFor: "Rectangular duct factories, ventilation installation teams and HVAC duct workshops",
      recommendedUse: "Duct-panel edge folding before joining, flanging and rectangular duct assembly",
      productionValue: "Works with shearing, lock forming, beading, TDF flange forming and seam-closing equipment in a complete duct workflow",
    },
    {
      title: "Medium-volume Sheet Metal Workshop",
      suitableFor: "Small and medium sheet-metal plants, repair points and non-standard fabrication workshops",
      recommendedUse: "Repeated thin-sheet edge folding, hemming and straightforward forming",
      productionValue: "Reduces manual effort while keeping a direct, practical production method for recurring jobs",
    },
    {
      title: "Construction & Ventilation Job Site",
      suitableFor: "Ventilation contractors, architectural sheet-metal teams and installation crews",
      recommendedUse: "Duct-panel and thin-sheet folding where safe machine placement and suitable compressed air are available",
      productionValue: "Adds an air-driven folding step for selected workshop or site requirements without a hydraulic station",
    },
  ],
  applications: [
    {
      title: "HVAC duct panel folding",
      text: "Creates basic folds in thin duct panels before flange, seam and assembly operations.",
      image: "/products/pneumatic-folding-applications/hvac-duct-panel-folding.webp",
      alt: "Exposed rectangular HVAC ductwork in a finished industrial interior",
    },
    {
      title: "Rectangular air duct fabrication",
      text: "Supports the edge-forming stage used to prepare rectangular ventilation duct sections.",
      image: "/products/pneumatic-folding-applications/rectangular-air-duct-fabrication.webp",
      alt: "Installed rectangular metal air ducts on a modern building exterior",
    },
    {
      title: "Ventilation duct workshop",
      text: "Fits workshops that combine cutting, beading, lock forming, flanging, folding and seam closing.",
      image: "/products/pneumatic-folding-applications/ventilation-duct-workshop.webp",
      alt: "Large interior with exposed metal ventilation ducts and workshop-style services",
    },
    {
      title: "Galvanized sheet folding",
      text: "A practical forming method for suitable galvanized thin sheet used in ducts and light enclosures.",
      image: "/products/pneumatic-folding-applications/galvanized-sheet-folding.webp",
      alt: "Metalworker cutting a large sheet-metal panel in a fabrication workshop",
    },
    {
      title: "Light sheet metal fabrication",
      text: "Handles recurring edge folds and basic forms for suitable light-gauge workshop parts.",
      image: "/products/pneumatic-folding-applications/light-sheet-metal-fabrication.webp",
      alt: "Two workshop trainees wearing safety glasses at a metal fabrication bench",
    },
    {
      title: "Electrical cabinet and enclosure",
      text: "Supports suitable thin-sheet flanges and enclosure parts after capacity and material review.",
      image: "/products/pneumatic-folding-applications/electrical-cabinet-enclosure.webp",
      alt: "Technician working inside an industrial electrical control panel",
    },
    {
      title: "Stainless steel light forming",
      text: "Can form suitable stainless steel thin sheet when strength, thickness and folding length are confirmed together.",
      image: "/products/pneumatic-folding-applications/stainless-steel-light-forming.webp",
      alt: "Protected industrial worker fabricating bright metal in a workshop",
    },
    {
      title: "Construction sheet metal work",
      text: "Useful for selected ventilation and architectural metal preparation where safe compressed-air operation is available.",
      image: "/products/pneumatic-folding-applications/construction-sheet-metal-work.webp",
      alt: "Construction worker wearing safety equipment on a metal roof",
    },
  ],
  materials: [
    { title: "Galvanized Sheet", text: "Common for rectangular HVAC duct panels and general ventilation work." },
    { title: "Mild Steel Sheet", text: "Suitable when thickness, strength and folding length match the selected QS model." },
    { title: "Stainless Steel Sheet", text: "Requires confirmation because higher material strength reduces workable thickness." },
    { title: "Aluminum Sheet", text: "Useful for light forming after alloy, thickness and bend requirement are reviewed." },
    { title: "Color Steel Sheet", text: "Relevant to selected enclosure, architectural trim and ventilation applications." },
    { title: "Thin Metal Plate", text: "Match material strength, bending length and air-driven machine configuration before production." },
  ],
  materialNote:
    "The suitable thickness depends on material strength, bending length, air pressure and machine configuration. Please confirm your material, thickness and bending requirement before quotation.",
  airRequirement: {
    facts: [
      "Pneumatic folding requires a stable compressed air supply.",
      "Air pressure and air volume should match the selected machine model.",
      "Clean, correctly prepared compressed air helps protect the pneumatic system.",
      "Before quotation, confirm whether your workshop already has an air compressor.",
    ],
    airPressure: "Air pressure: Please confirm with our sales engineer",
    airConsumption: "Air consumption: Depends on machine model and production frequency",
  },
  process: [
    { title: "Sheet Cutting", text: "Cut the sheet to the required duct-panel size before folding." },
    { title: "Positioning", text: "Position the sheet according to the flange size or marked folding line." },
    { title: "Pneumatic Clamping", text: "Use pneumatic force to help clamp the sheet before the folding action." },
    { title: "Pneumatic Folding", text: "The air-driven structure completes edge bending with less physical effort than manual operation." },
    { title: "Angle Checking", text: "Check the folding angle and adjust the work according to the required duct panel." },
    { title: "Duct Assembly", text: "Continue with lock forming, flange forming, beading, seam closing or installation." },
  ],
  advantages: [
    { title: "Air-driven folding for easier operation", text: "Compressed air powers the repeated clamping and folding actions." },
    { title: "Four-cylinder pneumatic structure", text: "Two cylinders perform folding while two separate cylinders perform clamping." },
    { title: "Foot-pedal control", text: "The operator controls clamping, folding and releasing while keeping both hands available for sheet positioning." },
    { title: "Practical for HVAC duct panels", text: "Supports thin-sheet edge folding within a rectangular duct fabrication workflow." },
    { title: "Suitable for repeated thin-sheet work", text: "Reduces the physical effort of recurring folds compared with purely manual operation." },
    { title: "No hydraulic station required", text: "The pneumatic drive offers a simpler utility and maintenance arrangement for workshops with suitable compressed air." },
    { title: "Compact support for small and medium workshops", text: "A practical forming station for mixed workshop production and selected site layouts." },
    { title: "Adjustable forming for suitable workpieces", text: "Adjustable upper and lower die movements support selected box, tray and multi-sided folded parts." },
  ],
  comparison: [
    {
      item: "Power source",
      manual: "Handwheel and lever operation",
      pneumatic: "Compressed-air-driven clamping and folding",
      electric: "Motor-driven clamping and folding",
      hydraulic: "Hydraulic power unit and cylinders",
    },
    {
      item: "Suitable production volume",
      manual: "One-off and small-batch work",
      pneumatic: "Repeated small-to-medium batch thin-sheet work",
      electric: "Repeated workshop production",
      hydraulic: "Medium-to-high load and larger work",
    },
    {
      item: "Operation effort",
      manual: "Highest direct operator effort",
      pneumatic: "Air assistance reduces repeated physical effort",
      electric: "Motor drive reduces manual effort",
      hydraulic: "Powered clamping and folding for heavier requirements",
    },
    {
      item: "Folding efficiency",
      manual: "Practical for low-frequency and varied jobs",
      pneumatic: "Well suited to recurring duct-panel folds",
      electric: "Stable option for daily repeated cycles",
      hydraulic: "Suited to higher-load production cycles",
    },
    {
      item: "Air / power requirement",
      manual: "No air or electrical supply required for folding",
      pneumatic: "Stable compressed air is required",
      electric: "Matched electrical supply is required",
      hydraulic: "Matched electrical supply and hydraulic system are required",
    },
    {
      item: "Cost level",
      manual: "Lower-complexity entry level",
      pneumatic: "Practical middle option where air is already available",
      electric: "Higher electrical and drive configuration level",
      hydraulic: "Higher system and capacity level",
    },
    {
      item: "Recommended use",
      manual: "Low-volume, mixed or site work",
      pneumatic: "HVAC duct panels and medium-volume thin sheet",
      electric: "Repeated thin-sheet workshop folding",
      hydraulic: "Larger formats, higher loads and heavier folding needs",
    },
  ],
  equipment: [
    { title: "Shearing Machine", role: "Cuts the flat sheet to the required blank size.", href: "/products/compact-electric-shearing-machine" },
    { title: "Beading Machine", role: "Adds reinforcement beads to duct panels.", href: "/products/five-line-beading-machine" },
    { title: "Lock Forming Machine", role: "Forms Pittsburgh and other duct-lock profiles.", href: "/products/multi-function-lock-forming-machine" },
    { title: "TDF Flange Forming Machine", role: "Forms integrated flange edges for rectangular duct assembly.", href: "/products/tdf-flange-forming-machine" },
    { title: "Pneumatic Folding Machine", role: "Folds duct-panel edges and suitable thin-sheet returns.", href: "/products/pneumatic-sheet-metal-folding-machine" },
    { title: "Lock Seam Closing Machine", role: "Closes formed seams during rectangular duct assembly.", href: "/products/pneumatic-duct-seam-closing-machine" },
    { title: "Press Brake", role: "Handles thicker sheet or applications needing press-brake tooling.", href: "/products/nc-hydraulic-press-brake" },
  ],
  equipmentSummary:
    "The pneumatic folding machine is not only a single machine, but also a practical supporting machine in a complete HVAC duct fabrication workflow.",
  selectionQuestions: [
    "Sheet material",
    "Maximum sheet thickness",
    "Maximum bending length",
    "Required bending angle",
    "Flange size",
    "Flat sheet folding or duct sheet folding",
    "Workshop use or job site use",
    "Daily production quantity",
    "Available air pressure",
    "Air compressor capacity",
    "Need to match with shearing machine, lock former, beading machine or TDF flange machine",
  ],
  faqs: [
    {
      question: "What is a pneumatic folding machine?",
      answer: "It uses compressed air to assist thin-sheet clamping, duct-panel folding and edge forming. It is commonly considered for HVAC duct fabrication and light sheet-metal workshops.",
    },
    {
      question: "What materials can this machine bend?",
      answer: "Typical materials include galvanized sheet, thin mild steel, suitable stainless steel, aluminum and color steel. Actual capacity depends on material strength, thickness, folding length and machine model.",
    },
    {
      question: "Is a pneumatic folding machine suitable for HVAC duct fabrication?",
      answer: "Yes. It can fold rectangular duct panels and work with shearing, lock forming, beading, TDF flange forming and seam-closing equipment.",
    },
    {
      question: "What is the difference between manual and pneumatic folding machine?",
      answer: "A manual folder needs no air supply and suits simple, low-volume work. A pneumatic folder requires compressed air but reduces repeated operating effort for duct-panel and thin-sheet folding.",
    },
    {
      question: "What is the difference between pneumatic and hydraulic folding machine?",
      answer: "A pneumatic folder has a lighter air-driven structure for thin sheet and duct work. A hydraulic folder is generally selected for larger formats, higher loads or heavier folding requirements.",
    },
    {
      question: "Does this machine need an air compressor?",
      answer: "Yes. Confirm that the workshop has a stable compressor and that available pressure and air volume match the selected machine before quotation.",
    },
    {
      question: "Can it bend stainless steel?",
      answer: "It can process suitable stainless steel thin sheet, but workable thickness is affected by material strength and must be confirmed against the selected model and bending length.",
    },
    {
      question: "What information should I provide before quotation?",
      answer: "Provide material, thickness, bending length, angle, application, daily quantity, compressed-air conditions, required companion equipment and the destination country or port.",
    },
    {
      question: "Can the machine be customized?",
      answer: "Working length, pneumatic structure and folding requirements can be reviewed for configuration. Final availability and specifications must be confirmed by the engineering team.",
    },
  ],
  finalCta: {
    title: "Need an Air-driven Sheet Metal Folding Solution?",
    text: "Send your sheet material, thickness, bending length, air pressure and application. We will recommend a suitable pneumatic folding machine configuration for your workshop.",
    primaryCta: "Request a Quote",
    secondaryCta: "Contact Engineer",
  },
};
