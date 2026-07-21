export type ReelShearCard = {
  title: string;
  text: string;
};

export type ReelShearSolution = {
  title: string;
  suitableFor: string;
  recommendedUse: string;
  productionValue: string;
};

export type ReelShearComparisonRow = {
  label: string;
  reelShear: string;
  multiLine: string;
};

export type ReelShearFaq = {
  question: string;
  answer: string;
};

export type ReelShearRelatedLink = {
  label: string;
  href: string;
};

export const reelShearBeadingPageContent = {
  hero: {
    eyebrow: "Thin Sheet Cutting & Beading Solution",
    title: "Reel Shear Beading Machine",
    subtitle:
      "Compact cutting and beading solution for thin sheet metal and HVAC duct fabrication.",
    description:
      "A practical machine for sheet metal cutting, plate opening and reinforcement beading. Suitable for ventilation duct workshops, HVAC sheet metal processing, construction duct fabrication and light sheet metal forming.",
    valuePoints: [
      "Cutting and Beading in One Machine",
      "Suitable for Thin Sheet Metal",
      "Compact Workshop Equipment",
      "Practical for Duct Fabrication",
    ],
  },
  problems: [
    {
      title: "Manual sheet cutting is slow",
      text: "Support basic thin-sheet blanking and sectional cutting with less fully manual handling.",
    },
    {
      title: "Flat duct sheets need more rigidity",
      text: "Form reinforcement beads that help reduce deformation across flat duct panels.",
    },
    {
      title: "Small workshops need compact machines",
      text: "Fit duct-processing points, job sites and small sheet-metal workshops where floor space is limited.",
    },
    {
      title: "Separate tools increase handling time",
      text: "Bring cutting and beading into one compact workstation to reduce process changes.",
    },
    {
      title: "Duct fabrication needs flexible processing",
      text: "Support varied thin-sheet and duct-panel preparation requirements in daily work.",
    },
  ] satisfies ReelShearCard[],
  solutions: [
    {
      title: "On-site Duct Fabrication",
      suitableFor: "Ventilation installation teams and job-site fabrication points",
      recommendedUse:
        "Basic thin-sheet cutting and reinforcement beading near the installation area",
      productionValue: "A compact supporting machine for flexible site work",
    },
    {
      title: "Small HVAC Workshop",
      suitableFor: "Small duct factories and repair or fabrication shops",
      recommendedUse: "Daily sheet opening, trimming and duct-panel reinforcement",
      productionValue: "Combines two practical preparation steps in one workstation",
    },
    {
      title: "Supporting Machine in Duct Production Line",
      suitableFor:
        "Workshops already using lock formers, folding machines, shears or TDF/TDC flange machines",
      recommendedUse: "Auxiliary cutting and beading within the wider duct workflow",
      productionValue: "Fills a focused preparation role without replacing the full line",
    },
  ] satisfies ReelShearSolution[],
  applications: [
    {
      title: "HVAC duct fabrication",
      text: "Prepare thin duct sheets before folding, locking, flanging and assembly.",
    },
    {
      title: "Ventilation duct installation",
      text: "Support practical cutting and beading tasks near the installation workflow.",
    },
    {
      title: "Galvanized sheet processing",
      text: "Handle suitable galvanized thin sheet after material and thickness confirmation.",
    },
    {
      title: "Construction site duct work",
      text: "Provide a compact preparation station where large production equipment is impractical.",
    },
    {
      title: "Light sheet metal workshop",
      text: "Combine two common preparation operations for mixed small-batch work.",
    },
    {
      title: "Air duct reinforcement",
      text: "Add reinforcement beads to help improve the rigidity of suitable duct panels.",
    },
  ] satisfies ReelShearCard[],
  materials: [
    "Galvanized Sheet",
    "Mild Steel Sheet",
    "Stainless Steel Sheet",
    "Aluminum Sheet",
    "Color Steel Sheet",
    "Thin Metal Plate",
  ],
  materialsNote:
    "The suitable thickness depends on material strength, machine configuration and selected roller or tooling. Please confirm your material and thickness before quotation.",
  workflow: [
    {
      title: "Sheet Preparation",
      text: "Prepare galvanized sheet or thin metal plate according to duct size.",
    },
    {
      title: "Cutting / Plate Opening",
      text: "Use the machine for basic sheet cutting or plate opening.",
    },
    {
      title: "Beading Reinforcement",
      text: "Form reinforcement ribs to improve sheet rigidity.",
    },
    {
      title: "Folding or Lock Forming",
      text: "Continue with a folding machine, lock former or flange forming machine.",
    },
    {
      title: "Duct Assembly",
      text: "Assemble duct panels for ventilation or HVAC projects.",
    },
    {
      title: "Installation",
      text: "Move finished ducts to the planned site installation.",
    },
  ] satisfies ReelShearCard[],
  advantages: [
    "Combines cutting and beading functions",
    "Compact structure for small workshops",
    "Suitable for confirmed thin sheet metal processing",
    "Helps reinforce duct panels",
    "Practical operation for daily fabrication",
    "Supporting equipment for duct production",
    "Works in a wider flow with folding, lock forming and flange forming machines",
  ],
  comparison: [
    {
      label: "Main function",
      reelShear: "Basic thin-sheet cutting and reinforcement beading",
      multiLine: "Continuous multi-line reinforcement beading",
    },
    {
      label: "Cutting ability",
      reelShear: "Included for suitable thin-sheet preparation",
      multiLine: "Not the primary function",
    },
    {
      label: "Beading ability",
      reelShear: "Focused beading for flexible preparation",
      multiLine: "Multiple reinforcement lines for duct panels",
    },
    {
      label: "Suitable workshop",
      reelShear: "Job sites and small or mixed-production workshops",
      multiLine: "Duct workshops with regular panel reinforcement work",
    },
    {
      label: "Production flexibility",
      reelShear: "Combines two basic operations in one compact machine",
      multiLine: "Specialized for repeat multi-line beading",
    },
    {
      label: "Recommended use",
      reelShear: "Flexible cutting and beading support",
      multiLine: "Batch duct-panel reinforcement",
    },
  ] satisfies ReelShearComparisonRow[],
  selectionQuestions: [
    "Sheet material",
    "Maximum sheet thickness",
    "Sheet width or working length",
    "Cutting requirement",
    "Beading shape requirement",
    "Daily production quantity",
    "Workshop type: factory or job site",
    "Voltage requirement",
    "Need to match with a folding machine, lock former or flange machine",
  ],
  faqs: [
    {
      question: "What is a reel shear beading machine?",
      answer:
        "It is a practical machine for suitable thin-sheet cutting and reinforcement beading, commonly used in duct fabrication and job-site sheet-metal preparation.",
    },
    {
      question:
        "What is the difference between a reel shear beading machine and a duct beading machine?",
      answer:
        "A conventional multi-line duct beading machine focuses on forming several reinforcement beads, while a reel shear beading machine combines basic cutting and beading functions.",
    },
    {
      question: "What materials can this machine process?",
      answer:
        "Typical applications include galvanized sheet, thin mild steel, stainless steel, aluminum and color steel. Actual suitability depends on material strength, thickness, configuration and tooling.",
    },
    {
      question: "Is it suitable for HVAC duct fabrication?",
      answer:
        "It can support basic preparation work in HVAC duct workshops, ventilation projects, job sites and small fabrication shops.",
    },
    {
      question: "Can it replace a full automatic duct production line?",
      answer:
        "No. It is better positioned as compact workshop equipment, a job-site machine or a supporting station in a wider duct-production process.",
    },
    {
      question: "Can it work with other duct machines?",
      answer:
        "It can be placed in a workflow with lock formers, folding machines, flange machines and shears when the overall process is matched correctly.",
    },
    {
      question: "What information should I provide before quotation?",
      answer:
        "Provide material, thickness, sheet width, required cutting and beading work, daily quantity, voltage and destination country or port.",
    },
    {
      question: "Can the roller or tooling be customized?",
      answer:
        "Tooling options may be reviewed for the required bead shape and process. Final availability must be confirmed by a sales engineer.",
    },
  ] satisfies ReelShearFaq[],
  relatedLinks: [
    { label: "Duct Beading Machine", href: "/products/five-line-beading-machine" },
    {
      label: "Lock Forming Machine",
      href: "/products/multi-function-lock-forming-machine",
    },
    { label: "Folding Machine", href: "/products/manual-sheet-metal-folding-machine" },
    { label: "TDF Flange Forming Machine", href: "/products/tdf-flange-forming-machine" },
    {
      label: "Electric Shearing Machine",
      href: "/products/compact-electric-shearing-machine",
    },
    {
      label: "HVAC Duct Production Line",
      href: "/products/u-shaped-auto-duct-production-line-5",
    },
  ] satisfies ReelShearRelatedLink[],
  finalCta: {
    title: "Need a Compact Cutting and Beading Solution?",
    text: "Send your sheet material, thickness, working width and duct fabrication requirement. We will recommend a suitable reel shear beading machine configuration for your workshop.",
  },
};
