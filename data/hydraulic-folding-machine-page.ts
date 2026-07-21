export type HydraulicFoldingTextCard = {
  title: string;
  text: string;
};

export type HydraulicFoldingSolution = {
  title: string;
  suitableFor: string;
  recommendedUse: string;
  productionValue: string;
};

export type HydraulicFoldingApplication = {
  title: string;
  text: string;
  image: string;
  alt: string;
};

export type HydraulicFoldingComparisonRow = {
  item: string;
  manual: string;
  electric: string;
  pneumatic: string;
  hydraulic: string;
  pressBrake: string;
};

export type HydraulicFoldingEquipment = {
  title: string;
  role: string;
  href: string;
};

export type HydraulicFoldingFaq = {
  question: string;
  answer: string;
};

export const hydraulicFoldingMachinePageContent = {
  hero: {
    title: "Hydraulic Folding Machine",
    subtitle:
      "Heavy-duty sheet metal folding solution for HVAC duct fabrication, long edge bending and workshop production.",
    description:
      "A hydraulic folding machine designed for thin sheet metal bending, duct panel folding, long edge forming and daily workshop production. It provides stronger clamping force and more stable folding performance for customers who need higher capacity than manual, pneumatic or electric folding machines.",
    primaryCta: "Get Hydraulic Folding Solution",
    secondaryCta: "Request Machine Configuration",
    proofPoints: [
      "Hydraulic Clamping & Folding",
      "Suitable for Long Sheet Metal Parts",
      "Stable for Workshop Production",
      "Practical for HVAC Duct Fabrication",
    ],
  },
  problems: [
    {
      title: "Manual or pneumatic folding is not enough for heavier work",
      text: "When sheets are longer, folding is more frequent or the forming load increases, hydraulic drive is a more suitable basis for stable workshop production.",
    },
    {
      title: "Long sheet edges need stable clamping",
      text: "Hydraulic clamping helps reduce sheet movement during long-edge folding and repeated edge-forming work.",
    },
    {
      title: "Workshops need consistent folding quality",
      text: "The supported folding method suits repeated hems, duct-panel edges, sheet-metal wrapping and thin-sheet forming where stable results matter.",
    },
    {
      title: "HVAC duct panels need efficient forming",
      text: "Fold rectangular duct panels alongside cutting, beading, lock forming, flange forming and seam-closing operations.",
    },
    {
      title: "Customers need a stronger machine without using a large press brake",
      text: "For suitable thin-sheet long-edge work, a hydraulic folder offers a direct folding-beam process without automatically moving to a large press brake.",
    },
  ] satisfies HydraulicFoldingTextCard[],
  solutions: [
    {
      title: "HVAC Duct Fabrication",
      suitableFor: "Rectangular duct factories, ventilation installation teams and HVAC duct workshops.",
      recommendedUse:
        "Duct-panel folding alongside shearing, beading, lock forming, TDF flange forming and seam closing.",
      productionValue:
        "Adds a stable long-edge folding stage to a complete rectangular duct fabrication workflow.",
    },
    {
      title: "Medium & Heavy-duty Sheet Metal Workshop",
      suitableFor: "Medium sheet-metal factories, enclosure plants and non-standard fabrication workshops.",
      recommendedUse: "Long-edge bending, thin-sheet hemming, repeated folding and routine workshop production.",
      productionValue:
        "Provides a higher-load option when manual, electric or pneumatic folding no longer matches the requirement.",
    },
    {
      title: "Roofing & Architectural Metal",
      suitableFor: "Roofing, facade-panel, decorative-panel, trim and architectural sheet-metal fabricators.",
      recommendedUse: "Long panel edges, hems, flashing, trim profiles and architectural sheet-metal parts.",
      productionValue:
        "Supports longer edge-forming work after material, thickness, folding length and angle are confirmed.",
    },
  ] satisfies HydraulicFoldingSolution[],
  applications: [
    {
      title: "HVAC duct panel folding",
      text: "Forms suitable duct-panel edges before rectangular duct joining, flanging and assembly.",
      image: "/products/hydraulic-folding-applications/hvac-duct-panel-folding.webp",
      alt: "Modern industrial ventilation ductwork inside a large building",
    },
    {
      title: "Rectangular air duct fabrication",
      text: "Supports long straight folds used to prepare rectangular air-duct panels for the next forming stage.",
      image: "/products/hydraulic-folding-applications/rectangular-air-duct-fabrication.webp",
      alt: "Industrial building ventilation ducts and metal air inlets",
    },
    {
      title: "Roofing sheet metal work",
      text: "Useful for suitable roofing panels, flashing and trim parts that require long folded edges.",
      image: "/products/hydraulic-folding-applications/roofing-sheet-metal-work.webp",
      alt: "Construction workers installing metal roof panels on a building",
    },
    {
      title: "Architectural sheet metal",
      text: "Supports cladding, edging and architectural parts where the selected model matches the material requirement.",
      image: "/products/hydraulic-folding-applications/architectural-sheet-metal.webp",
      alt: "Modern building facade formed from reflective metal panels",
    },
    {
      title: "Electrical cabinet and enclosure",
      text: "Prepares long flanges and enclosure edges for suitable cabinet, chassis and door-panel production.",
      image: "/products/hydraulic-folding-applications/electrical-cabinet-enclosure.webp",
      alt: "Technician working on an industrial electrical control enclosure",
    },
    {
      title: "Stainless steel light fabrication",
      text: "Handles suitable thin stainless-steel work after grade, thickness and folding length are confirmed.",
      image: "/products/hydraulic-folding-applications/stainless-steel-light-fabrication.webp",
      alt: "Protected metalworker fabricating steel in an industrial workshop",
    },
    {
      title: "Long edge sheet metal bending",
      text: "Hydraulic clamping and folding suit long workpieces that need stable support during edge forming.",
      image: "/products/hydraulic-folding-applications/long-edge-sheet-metal-bending.webp",
      alt: "Factory worker handling a large steel sheet in an industrial plant",
    },
    {
      title: "General sheet metal workshop",
      text: "A practical folding station for mixed daily work across suitable materials, lengths and production quantities.",
      image: "/products/hydraulic-folding-applications/general-sheet-metal-workshop.webp",
      alt: "Machine operator working inside a general industrial workshop",
    },
  ] satisfies HydraulicFoldingApplication[],
  materials: [
    { title: "Galvanized Sheet", text: "Common for rectangular HVAC ducts and general workshop sheet-metal work." },
    { title: "Mild Steel Sheet", text: "Suitable within the verified thickness and length of the selected HWS model." },
    { title: "Stainless Steel Sheet", text: "Requires capacity confirmation because its material strength affects workable thickness." },
    { title: "Aluminum Sheet", text: "Review alloy, thickness, bend radius and folding length before configuration." },
    { title: "Color Steel Sheet", text: "Used in suitable roofing, enclosure and architectural trim applications." },
    { title: "Thin Metal Plate", text: "Match material strength, folding length, angle and machine configuration together." },
  ] satisfies HydraulicFoldingTextCard[],
  materialNote:
    "The suitable thickness depends on material strength, bending length, folding angle and machine configuration. Please confirm your material, thickness and bending requirement before quotation.",
  hydraulicSystem: [
    {
      title: "Stronger, stable clamping",
      text: "Hydraulic power provides stronger and more stable clamping than purely manual operation for suitable longer or higher-load work.",
    },
    {
      title: "Prepared for repeated production",
      text: "The system is suited to longer sheet-metal parts and repeated workshop folding after the production requirement is confirmed.",
    },
    {
      title: "Controlled clamping and folding movement",
      text: "A hydraulic valve system controls the machine's clamping and folding sequence without unsupported pressure or pump claims.",
    },
    {
      title: "Maintenance remains part of selection",
      text: "Hydraulic oil condition, cooling requirements and routine inspection matter for dependable long-term operation.",
    },
    {
      title: "Confirm the real production load",
      text: "Before quotation, provide material, thickness, bending length, folding angle and daily production frequency.",
    },
  ] satisfies HydraulicFoldingTextCard[],
  process: [
    { title: "Sheet Cutting", text: "Cut the sheet to the required size before folding." },
    { title: "Positioning", text: "Position the sheet by flange size, duct-panel size or folding line." },
    { title: "Hydraulic Clamping", text: "Use hydraulic force to secure the sheet before folding." },
    { title: "Hydraulic Folding", text: "The folding beam completes the required edge-bending operation." },
    { title: "Angle Checking", text: "Check the result and adjust it to the required part angle." },
    { title: "Next Process", text: "Continue to locking, beading, flanging, riveting, welding, assembly or installation." },
  ] satisfies HydraulicFoldingTextCard[],
  advantages: [
    { title: "Strong hydraulic clamping", text: "Provides stable sheet holding for suitable long-edge folding work." },
    { title: "Long-edge folding support", text: "Suitable for longer workpieces when the model, thickness and material are correctly matched." },
    { title: "Repeated workshop production", text: "More suitable than purely manual operation for frequent routine folding." },
    { title: "HVAC duct-panel use", text: "Practical for rectangular duct-panel edges within the verified machine capacity." },
    { title: "Supported folding method", text: "The sheet remains supported while the folding beam rotates through the forming step." },
    { title: "Workflow compatibility", text: "Works alongside shearing, beading, lock forming and TDF flange-forming equipment." },
    { title: "Higher-load selection", text: "A practical choice when manual, pneumatic or electric folding no longer matches the load." },
  ] satisfies HydraulicFoldingTextCard[],
  comparison: [
    {
      item: "Power source",
      manual: "Human-operated",
      electric: "Electric motor drive",
      pneumatic: "Compressed air",
      hydraulic: "Hydraulic power",
      pressBrake: "Hydraulic or servo-hydraulic",
    },
    {
      item: "Suitable production volume",
      manual: "Small batches and varied work",
      electric: "Small-to-medium repeated work",
      pneumatic: "Repeated duct and thin-sheet work",
      hydraulic: "Medium-to-high-frequency workshop work",
      pressBrake: "Batch and complex bending production",
    },
    {
      item: "Operation effort",
      manual: "Highest direct manual effort",
      electric: "Powered folding reduces effort",
      pneumatic: "Air-driven repeated action",
      hydraulic: "Powered clamping and folding",
      pressBrake: "Powered ram and tooling operation",
    },
    {
      item: "Folding capacity",
      manual: "Basic light-gauge folding",
      electric: "Routine thin-sheet folding",
      pneumatic: "Repeated thin-sheet duct folding",
      hydraulic: "Higher-load thin-sheet and long-edge folding",
      pressBrake: "Thicker plate and tooling-based bending",
    },
    {
      item: "Suitable sheet length",
      manual: "Selected short-to-long models",
      electric: "Selected workshop lengths",
      pneumatic: "Selected duct-panel lengths",
      hydraulic: "Well suited to longer supported workpieces",
      pressBrake: "Depends on bed length and tonnage",
    },
    {
      item: "Cost level",
      manual: "Lower-complexity equipment",
      electric: "Powered equipment level",
      pneumatic: "Machine plus compressed-air supply",
      hydraulic: "Higher hydraulic-system complexity",
      pressBrake: "Higher tooling, control and machine investment",
    },
    {
      item: "Recommended use",
      manual: "Site work, small batches and limited budgets",
      electric: "Daily thin-sheet edge folding",
      pneumatic: "Duct workshops with an existing air supply",
      hydraulic: "Long sheets, higher loads and stable clamping",
      pressBrake: "Thicker material, complex angles and press tooling",
    },
  ] satisfies HydraulicFoldingComparisonRow[],
  equipment: [
    { title: "Shearing Machine", role: "Cuts the sheet to blank size before positioning and folding.", href: "/products/hydraulic-guillotine-shear" },
    { title: "Beading Machine", role: "Adds reinforcement beads to suitable duct panels.", href: "/products/five-line-beading-machine" },
    { title: "Lock Forming Machine", role: "Forms the lock profile used to connect rectangular duct sections.", href: "/products/multi-function-lock-forming-machine" },
    { title: "TDF Flange Forming Machine", role: "Forms integrated flange edges for a TDF duct workflow.", href: "/products/tdf-flange-forming-machine" },
    { title: "Hydraulic Folding Machine", role: "Creates duct-panel folds, long bends and suitable thin-sheet hems.", href: "/products/hydraulic-sheet-metal-folding-machine" },
    { title: "Lock Seam Closing Machine", role: "Closes the prepared seam after panel forming and assembly.", href: "/products/electric-duct-seam-closing-machine" },
    { title: "Press Brake", role: "Handles thicker material or tooling-based complex bends.", href: "/products/nc-hydraulic-press-brake" },
  ] satisfies HydraulicFoldingEquipment[],
  equipmentSummary:
    "The hydraulic folding machine is not only a single machine, but also a practical supporting machine in a complete sheet metal or HVAC duct fabrication workflow.",
  relatedLinks: [
    { label: "Manual Folding Machine", href: "/products/manual-sheet-metal-folding-machine" },
    { label: "Electric Folding Machine", href: "/products/electric-sheet-metal-folding-machine" },
    { label: "Pneumatic Folding Machine", href: "/products/pneumatic-sheet-metal-folding-machine" },
    { label: "Shearing Machines", href: "/products/series/shearing-machines" },
    { label: "Lock Forming Machine", href: "/products/multi-function-lock-forming-machine" },
    { label: "Beading Machine", href: "/products/five-line-beading-machine" },
    { label: "TDF Flange Forming Machine", href: "/products/tdf-flange-forming-machine" },
    { label: "Lock Seam Closing Machine", href: "/products/electric-duct-seam-closing-machine" },
    { label: "Press Brake", href: "/products/nc-hydraulic-press-brake" },
    { label: "HVAC Duct Production Line", href: "/products/u-shaped-auto-duct-production-line-5" },
  ],
  selectionQuestions: [
    "Sheet material",
    "Maximum sheet thickness",
    "Maximum bending length",
    "Required folding angle",
    "Flange size",
    "Flat sheet folding or duct sheet folding",
    "Daily production quantity",
    "Required clamping force or production load",
    "Workshop voltage",
    "Need hydraulic cooling system",
    "Need to match with shearing machine, beading machine, lock former or TDF flange machine",
  ],
  selectionCta: { title: "Send Your Hydraulic Folding Requirement", cta: "Request Recommendation" },
  technical: {
    title: "Technical Specifications",
    note:
      "Final specifications depend on sheet material, thickness, bending length, hydraulic configuration and selected machine structure.",
  },
  faqs: [
    {
      question: "What is a hydraulic folding machine?",
      answer: "It uses hydraulic power to clamp and fold thin sheet metal. Typical uses include long-edge bending, duct-panel folding, architectural sheet metal and workshop forming.",
    },
    {
      question: "What materials can this machine bend?",
      answer: "Typical materials include galvanized sheet, mild steel, thin stainless steel, aluminum and color steel. Capacity depends on strength, thickness, folding length and machine specification.",
    },
    {
      question: "Is a hydraulic folding machine suitable for HVAC duct fabrication?",
      answer: "Yes. It can fold rectangular duct panels and work with shearing, beading, lock forming, TDF flange forming and seam-closing equipment.",
    },
    {
      question: "What is the difference between hydraulic and pneumatic folding machines?",
      answer: "Pneumatic folders suit thin sheet and workshops with an air supply. Hydraulic folders provide stronger clamping and are better matched to longer sheets or higher-load requirements.",
    },
    {
      question: "What is the difference between hydraulic and electric folding machines?",
      answer: "Electric folders suit routine thin-sheet work. Hydraulic folders are selected for longer workpieces, higher loads and more stable clamping requirements.",
    },
    {
      question: "What is the difference between a hydraulic folding machine and a press brake?",
      answer: "A press brake is suited to thicker plate, complex angles and tooling-based bends. A hydraulic folder is more direct for supported thin-sheet long-edge folding, duct panels and hems.",
    },
    {
      question: "Can it bend stainless steel?",
      answer: "It can process suitable thin stainless steel, but workable thickness is affected by grade and strength. Confirm the material, thickness, folding length and selected model.",
    },
    {
      question: "What information should I provide before quotation?",
      answer: "Provide material, thickness, bending length, angle, application, daily quantity, voltage, companion machines and destination country or port.",
    },
    {
      question: "Can the machine be customized?",
      answer: "Working length, hydraulic configuration, angle range and support arrangement can be reviewed against the application. Final availability depends on the engineer-approved configuration.",
    },
  ] satisfies HydraulicFoldingFaq[],
  finalCta: {
    title: "Need a Stronger Sheet Metal Folding Solution?",
    text: "Send your sheet material, thickness, bending length, voltage and application. We will recommend a suitable hydraulic folding machine configuration for your workshop.",
    primaryCta: "Request a Quote",
    secondaryCta: "Contact Engineer",
  },
};
