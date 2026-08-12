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
    eyebrow: "Thin Sheet Cutting, Slitting & Beading",
    title: "Reel Shear Beading Machine",
    subtitle:
      "Compact sheet metal cutting and beading for HVAC duct fabrication.",
    description:
      "This sheet metal reel shear beading machine combines suitable thin-sheet cutting, slitting-profile work and reinforcement beading in one compact workstation. The LQ-15 supports galvanized duct-panel preparation and mixed work in a small HVAC fabrication shop.",
    valuePoints: [
      "Cutting and Beading in One Machine",
      "Verified Beading / Slitting Profiles",
      "0.5–1.2 mm Published Thickness Range",
      "Compact Support for HVAC Duct Work",
    ],
  },
  overview: {
    heading: "Product Overview",
    title: "One compact workstation for preparing thin sheet and duct panels.",
    paragraphs: [
      "The LQ-15 combines appropriate thin-sheet shearing, profile slitting and reinforcement beading before downstream folding, lock forming, flanging and assembly. Combining these preparation steps reduces transfers between separate machines when a workshop handles short runs, mixed parts or site work.",
      "A reel shearing beading machine is useful to HVAC duct manufacturers, contractors and light-fabrication workshops that need flexible sheet preparation rather than a fully automatic duct line. It works as a sheet metal cutting and beading machine for HVAC production support; it does not replace the other machines required to finish a duct.",
      "Compared with a standalone reel shear machine, the combined workstation also provides matched beading and slitting-profile capability for suitable sheet. Buyers should select it from the required operations and tooling rather than from a product label alone.",
    ],
  },
  problems: [
    {
      title: "Separate preparation steps slow short runs",
      text: "Keep suitable cutting, slitting-profile work and beading at one station when batches are small or varied.",
    },
    {
      title: "Flat duct sheets need reinforcement",
      text: "Form beads that help add rigidity to suitable panels before folding and assembly.",
    },
    {
      title: "Small workshops have limited floor space",
      text: "Use a compact machine where a larger automated line would not match the available space or production pattern.",
    },
    {
      title: "Job-site work needs flexible preparation",
      text: "Support confirmed thin-sheet preparation close to the installation workflow.",
    },
  ] satisfies ReelShearCard[],
  solutions: [
    {
      title: "Construction-Site Duct Work",
      suitableFor: "Ventilation contractors and temporary fabrication points",
      recommendedUse:
        "Confirmed thin-sheet trimming, slitting-profile work and reinforcement beading near installation",
      productionValue: "A compact supporting station for flexible site work",
    },
    {
      title: "Small HVAC Workshop",
      suitableFor: "Small duct factories, repair shops and mixed-batch fabricators",
      recommendedUse: "Daily duct-sheet preparation and panel reinforcement",
      productionValue:
        "A reel shear beading machine for small HVAC workshop production without a full automatic line",
    },
    {
      title: "Supporting Duct Production Station",
      suitableFor:
        "Workshops already using lock formers, folding machines, shears or TDF flange machines",
      recommendedUse: "Auxiliary cutting, slitting and beading within the wider duct workflow",
      productionValue: "Fills a focused preparation role without replacing downstream equipment",
    },
  ] satisfies ReelShearSolution[],
  operations: [
    {
      title: "Sheet Metal Cutting",
      text: "Prepare suitable thin sheet for later duct-panel operations. This sheet metal cutting and beading machine is intended for confirmed light-gauge work within the published LQ-15 range.",
    },
    {
      title: "Reinforcement Beading",
      text: "Form reinforcement beads that help stiffen appropriate HVAC panels before folding, locking and assembly. This is the core forming role of the thin sheet metal beading machine.",
    },
    {
      title: "Sheet Metal Slitting",
      text: "The verified LQ-15 function field includes beading / slitting profiles. As a sheet metal beading and slitting machine, its exact profile must be matched to the supplied roller or tooling.",
    },
    {
      title: "Roller Shear and Beading Machine Profiles",
      text: "Profile rollers create the selected bead or groove geometry. For any sheet metal shearing and beading machine, the exact result must match the supplied tooling rather than an assumed universal profile.",
    },
  ] satisfies ReelShearCard[],
  applications: [
    {
      title: "HVAC Duct Fabrication",
      text: "Use the HVAC duct reel shear beading machine to prepare suitable thin sheet before folding, locking, flanging and duct assembly.",
    },
    {
      title: "Ventilation Duct Manufacturing",
      text: "Support short-run and mixed-size panel preparation as an HVAC duct cutting and beading machine within a broader ventilation workflow.",
    },
    {
      title: "Galvanized Sheet Processing",
      text: "A reel shear beading machine for galvanized sheet can cut and form confirmed material after thickness, strength and tooling review.",
    },
    {
      title: "Construction Site Duct Work",
      text: "Provide a compact preparation point where transporting each small task back to a large workshop is impractical.",
    },
    {
      title: "Small HVAC Workshop",
      text: "Combine several focused preparation operations for repair work, custom fittings and mixed small batches.",
    },
    {
      title: "Light Sheet Metal Fabrication",
      text: "Process suitable light-gauge parts when the required cut and profile match the LQ-15 configuration.",
    },
    {
      title: "Air Duct Reinforcement",
      text: "Add beads to suitable flat duct panels to help improve rigidity before final forming and assembly.",
    },
  ] satisfies ReelShearCard[],
  materialsHeading: "Materials for LQ-15 Processing Review",
  materials: [
    {
      title: "Galvanized Sheet",
      text: "Common in HVAC duct work; confirm coating, base-metal thickness and required profile before selection.",
    },
    {
      title: "Mild Steel Sheet",
      text: "Suitable applications depend on actual grade, tensile strength, thickness and installed tooling.",
    },
    {
      title: "Stainless Steel Sheet",
      text: "Its higher forming resistance requires separate capacity confirmation rather than assuming the mild-steel range.",
    },
    {
      title: "Aluminum Sheet",
      text: "Confirm alloy, temper, surface protection and profile geometry to limit marking or distortion.",
    },
    {
      title: "Color Steel Sheet",
      text: "Review coating sensitivity and tooling contact before cutting or forming pre-painted material.",
    },
    {
      title: "Thin Metal Plate",
      text: "Other thin plate should be evaluated from material strength, thickness and the required bead or slit profile.",
    },
  ] satisfies ReelShearCard[],
  materialsNote:
    "The published 0.5–1.2 mm range is machine data, not a promise that every listed material can run at the same maximum thickness. Confirm material grade, strength and tooling before quotation.",
  workflow: [
    {
      title: "Sheet Preparation",
      text: "Confirm sheet material, thickness and duct dimensions.",
    },
    {
      title: "Cutting / Slitting",
      text: "Prepare the blank or required slitting profile with matched tooling.",
    },
    {
      title: "Beading Reinforcement",
      text: "Form the selected reinforcement profile in the panel.",
    },
    {
      title: "Folding or Lock Forming",
      text: "Continue with the appropriate folding, locking or flange-forming process.",
    },
    {
      title: "Duct Assembly",
      text: "Join the prepared panels and install required corners or flanges.",
    },
    {
      title: "Site Installation",
      text: "Move the completed duct sections into the ventilation project.",
    },
  ] satisfies ReelShearCard[],
  advantages: [
    "Combines confirmed cutting, beading and slitting-profile work",
    "Compact structure for small workshops and supporting stations",
    "Published LQ-15 parameters support transparent selection",
    "Helps reinforce suitable duct panels",
    "Supports mixed thin-sheet preparation tasks",
    "Works with folding, lock forming and flange-forming equipment",
  ],
  comparison: [
    {
      label: "Primary role",
      reelShear: "Flexible thin-sheet cutting, slitting-profile work and reinforcement beading",
      multiLine: "Continuous multi-line reinforcement beading for duct panels",
    },
    {
      label: "Cutting ability",
      reelShear: "Included for suitable thin-sheet preparation",
      multiLine: "Not normally the primary function",
    },
    {
      label: "Beading pattern",
      reelShear: "Selected bead or groove profile through matched tooling",
      multiLine: "Several longitudinal reinforcement lines in one pass",
    },
    {
      label: "Workshop fit",
      reelShear: "Job sites and compact or mixed-production workshops",
      multiLine: "Duct workshops with repeat panel-reinforcement work",
    },
    {
      label: "Selection priority",
      reelShear: "Operational flexibility across the confirmed combined functions",
      multiLine: "Repeatable multi-line beading output",
    },
  ] satisfies ReelShearComparisonRow[],
  selectionQuestions: [
    "Sheet material and grade",
    "Minimum and maximum thickness",
    "Sheet size and required working area",
    "Cutting or slitting requirement",
    "Bead or groove profile",
    "Daily quantity and batch pattern",
    "Available workshop space",
    "Local voltage and frequency",
    "Destination and shipping requirements",
  ],
  manufacturer: {
    heading: "Reel Shear Beading Machine Manufacturer",
    intro:
      "ZYRON supports machine selection from workpiece review through assembly, inspection and delivery preparation. Buyers comparing a reel shear beading machine supplier or reel shear beading machine factory should confirm the same technical scope before placing an order.",
    sourcingNote:
      "Whether an inquiry uses reel shearing beading machine manufacturer, sheet metal reel shear beading machine manufacturer or HVAC duct reel shear beading machine manufacturer, selection should begin with material, thickness, required profile, voltage and downstream duct process.",
    points: [
      {
        title: "Requirement and Tooling Review",
        text: "Review material, thickness, cut, slit and bead-profile requirements before confirming the LQ-15 configuration.",
      },
      {
        title: "Assembly and Functional Inspection",
        text: "Check the configured machine movements, controls, rollers, tooling and operating functions before packing.",
      },
      {
        title: "Voltage Configuration",
        text: "Confirm destination voltage and frequency as part of the electrical configuration review.",
      },
      {
        title: "Export Packing and Support",
        text: "Prepare the confirmed accessories, documentation and packing method for the destination and shipping route.",
      },
    ] satisfies ReelShearCard[],
    buyingGuide:
      "A reel shear beading machine for sale should be compared by verified function and configuration, not product name alone. Some catalogs use the term reel bead cutting machine, so confirm whether the required operation is shearing, slitting or profile forming. Reel shear beading machine price depends on machine configuration, tooling, voltage, material requirement, destination and shipping requirement; request a written quotation for the final scope.",
  },
  faqs: [
    {
      question: "What is a reel shear beading machine?",
      answer:
        "It is a compact shearing and beading machine that combines suitable thin-sheet cutting, slitting-profile work and reinforcement beading in one workstation.",
    },
    {
      question: "What is a reel shearing beading machine used for?",
      answer:
        "It prepares suitable sheet-metal blanks and reinforcement profiles before downstream duct folding, lock forming, flanging and assembly.",
    },
    {
      question: "Can a reel shear beading machine cut galvanized sheet?",
      answer:
        "Galvanized sheet is a typical application, but the base-metal grade, thickness, coating and selected tooling must be confirmed before the machine configuration is approved.",
    },
    {
      question: "Is a reel shear beading machine suitable for HVAC duct fabrication?",
      answer:
        "Yes, it can support thin-sheet cutting, slitting-profile work and reinforcement beading in an HVAC duct workflow. Folding, lock forming, flanging and assembly remain separate operations.",
    },
    {
      question:
        "What is the difference between a reel shear beading machine and a duct beading machine?",
      answer:
        "The reel shear combines flexible cutting and beading functions, while a multi-line duct beading machine focuses on forming several continuous reinforcement lines across duct panels.",
    },
    {
      question: "What sheet thickness can the LQ-15 process?",
      answer:
        "The published LQ-15 sheet-thickness range is 0.5–1.2 mm. Actual suitability must be checked against the material grade, strength and required tooling; the maximum is not guaranteed for every material.",
    },
    {
      question: "What is the difference between shearing, slitting and beading?",
      answer:
        "Shearing separates sheet across a cut, slitting produces a narrower cut or profile path, and beading forms a raised or recessed reinforcement profile without treating all three operations as interchangeable.",
    },
    {
      question: "How much does a reel shear beading machine cost?",
      answer:
        "Price depends on machine configuration, tooling, voltage, material requirement, destination and shipping requirement. Send these details to request a quote; no fixed price is published without a confirmed scope.",
    },
    {
      question: "How do I choose a reel shear beading machine?",
      answer:
        "Provide the material and grade, thickness range, sheet size, required cut or slit, bead profile, daily quantity, voltage, workshop space and destination for configuration review.",
    },
    {
      question: "Can the beading roller or tooling be customized?",
      answer:
        "Tooling options can be reviewed against the required bead or groove profile. Availability and final dimensions must be technically confirmed before order approval.",
    },
  ] satisfies ReelShearFaq[],
  relatedLinks: [
    {
      label: "multi-line duct beading machine",
      href: "/products/five-line-beading-machine",
    },
    {
      label: "HVAC lock forming machine",
      href: "/products/multi-function-lock-forming-machine",
    },
    {
      label: "sheet metal folding machine",
      href: "/products/manual-sheet-metal-folding-machine",
    },
    {
      label: "TDF flange forming machine",
      href: "/products/tdf-flange-forming-machine",
    },
    {
      label: "electric shearing machine",
      href: "/products/compact-electric-shearing-machine",
    },
    {
      label: "HVAC duct production line",
      href: "/products/u-shaped-auto-duct-production-line-5",
    },
  ] satisfies ReelShearRelatedLink[],
  finalCta: {
    title: "Request an LQ-15 Reel Shear Beading Machine Quote",
    text: "Send your sheet material and grade, thickness range, sheet size, cut or slit requirement, bead profile, voltage, destination and shipping needs. We will review the configuration before preparing a quotation.",
  },
};
