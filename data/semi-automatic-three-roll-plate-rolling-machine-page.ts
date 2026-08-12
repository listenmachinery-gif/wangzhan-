export type ContentCard = {
  title: string;
  text: string;
};

export type SolutionCard = ContentCard & {
  suitableFor: string;
  recommendedUse: string;
};

export type ApplicationPhoto = ContentCard & {
  image: string;
  alt: string;
};

export type ComparisonRow = {
  label: string;
  manualThreeRoll: string;
  semiAutomaticThreeRoll: string;
  fourRoll: string;
};

export type WorkflowItem = ContentCard & {
  href?: string;
};

export type SpecificationField = {
  heading: string;
  unit?: string;
  source: "name" | "spec" | "confirmed";
  sourceIndex?: number;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const confirmationValue =
  "Customizable / Please confirm with our sales engineer";

export const applicationPhotos: readonly ApplicationPhoto[] = [
  {
    title: "Cylinder and tank shells",
    text: "Real stainless process vessels illustrate cylindrical shells assembled after rolling, seam joining and finishing.",
    image: "/products/semi-automatic-three-roll-plate-rolling-machine-applications/tank-shell.webp",
    alt: "Real stainless steel cylindrical industrial tank shells",
  },
  {
    title: "Stainless products",
    text: "Stainless vessels represent round products where material finish, seam allowance and target diameter need early confirmation.",
    image: "/products/semi-automatic-three-roll-plate-rolling-machine-applications/stainless-products.webp",
    alt: "Real stainless steel cylindrical vessel in a processing facility",
  },
  {
    title: "HVAC duct parts",
    text: "Installed ductwork shows how rolled sections continue into elbows, connectors, insulation and final air-handling systems.",
    image: "/products/semi-automatic-three-roll-plate-rolling-machine-applications/hvac-ductwork.webp",
    alt: "Real industrial HVAC metal ductwork installation",
  },
  {
    title: "Pipe sections",
    text: "Round sheet-metal pipes and segmented elbows represent repeatable cylindrical fabrication for ventilation and industrial routing.",
    image: "/products/semi-automatic-three-roll-plate-rolling-machine-applications/pipe-sections.webp",
    alt: "Real round metal pipe sections and elbows",
  },
  {
    title: "Rolled cylindrical stock",
    text: "A real warehouse of large circular sections demonstrates the geometry needed for pipe, sleeve and shell production.",
    image: "/products/semi-automatic-three-roll-plate-rolling-machine-applications/cylindrical-sections.webp",
    alt: "Real stacked cylindrical steel sections in an industrial warehouse",
  },
  {
    title: "Small rolled components",
    text: "Short round and rectangular metal pieces show the variety handled by general fabrication workflows after cutting and forming.",
    image: "/products/semi-automatic-three-roll-plate-rolling-machine-applications/rolled-components.webp",
    alt: "Real small rolled and formed metal components",
  },
  {
    title: "Machinery housings",
    text: "Industrial stainless housings show how formed shell panels can be joined into durable processing equipment enclosures.",
    image: "/products/semi-automatic-three-roll-plate-rolling-machine-applications/metal-housings.webp",
    alt: "Real formed stainless steel industrial machinery housings",
  },
  {
    title: "Silo and storage shells",
    text: "Large segmented storage bodies illustrate how rolled plates are joined into longer cylindrical structures in downstream fabrication.",
    image: "/products/semi-automatic-three-roll-plate-rolling-machine-applications/silo-shells.webp",
    alt: "Real segmented cylindrical metal silo shell",
  },
  {
    title: "Curved architectural panels",
    text: "A real curved metal facade demonstrates arc-forming applications beyond complete cylinders and circular shells.",
    image: "/products/semi-automatic-three-roll-plate-rolling-machine-applications/curved-panels.webp",
    alt: "Real curved metal architectural facade panels",
  },
  {
    title: "General metal workshop",
    text: "Rolling belongs to a wider workflow that includes blank preparation, welding, grinding, inspection and assembly.",
    image: "/products/semi-automatic-three-roll-plate-rolling-machine-applications/fabrication-workshop.webp",
    alt: "Real metal fabrication workshop with an operator",
  },
] as const;

export const semiAutomaticThreeRollPlateRollingMachinePage = {
  hero: {
    title: "Semi-Automatic Three-Roll Plate Rolling Machine",
    subtitle:
      "Practical cylinder, arc and cone rolling for small and medium metal fabrication workshops.",
    description:
      "A compact three-roll platform for forming compatible plate and sheet into cylinders, arcs, cones and curved components. Share your material, thickness, working width and target diameter so our team can recommend the right configuration.",
    primaryCta: "Get a Rolling Solution",
    secondaryCta: "Confirm Machine Configuration",
    values: [
      "Cylinder & Arc Forming",
      "Compatible Cone Rolling",
      "Semi-Automatic Workflow",
      "Application-Matched Configuration",
    ],
  },
  painPoints: [
    {
      title: "Straight ends increase correction work",
      text: "The leading and trailing edges may need pre-bending or a planned secondary pass before seam joining.",
    },
    {
      title: "Diameter changes with the whole setup",
      text: "Material strength, thickness, roll position, springback and blank preparation all affect the final curve.",
    },
    {
      title: "Cone rolling needs controlled feeding",
      text: "Tapered blanks require a compatible machine setup, suitable attachment and an experienced operating method.",
    },
    {
      title: "Long parts need proper support",
      text: "Unsupported plate and finished cylinders can deflect or shift while entering, rolling or leaving the machine.",
    },
    {
      title: "Workshop requirements vary",
      text: "A general machine name cannot confirm capacity; the real workpiece envelope must drive selection.",
    },
  ] satisfies readonly ContentCard[],
  solutions: [
    {
      title: "Cylinder rolling solution",
      suitableFor: "Tank shells, pipe sections, sleeves, ducts and machinery covers.",
      recommendedUse:
        "Repeat parts where blank size, material and target diameter are known.",
      text: "Build a repeatable pass sequence around the actual material and downstream seam process.",
    },
    {
      title: "Arc bending solution",
      suitableFor: "Curved panels, guards, covers and partial-radius components.",
      recommendedUse:
        "Parts that need a controlled arc without closing into a complete cylinder.",
      text: "Match the roll setting and support method to arc length, radius and surface requirements.",
    },
    {
      title: "Compatible cone rolling solution",
      suitableFor: "Conical shells, reducers, hoppers and tapered transition parts.",
      recommendedUse:
        "Tapered blanks confirmed as compatible with the selected cone-rolling arrangement.",
      text: "Confirm small-end diameter, large-end diameter, cone angle and any required attachment.",
    },
  ] satisfies readonly SolutionCard[],
  materials: [
    { title: "Mild steel", text: "Confirm grade, thickness, width, target radius and surface condition." },
    { title: "Stainless steel", text: "Confirm grade, finish-protection needs and expected springback." },
    { title: "Aluminum", text: "Confirm alloy, temper, surface sensitivity and target geometry." },
    { title: "Galvanized sheet", text: "Confirm coating condition, forming radius and downstream seam method." },
    { title: "Other compatible metals", text: "Send a material specification before capacity and tooling selection." },
  ] satisfies readonly ContentCard[],
  shapes: [
    { title: "Closed cylinders", text: "Round shells prepared for seaming, welding or assembly." },
    { title: "Open arcs", text: "Partial curves for panels, guards, covers and structural segments." },
    { title: "Compatible cones", text: "Tapered parts formed with a confirmed setup and operating method." },
    { title: "Curved transitions", text: "Application-specific profiles evaluated from drawings and samples." },
  ] satisfies readonly ContentCard[],
  rollingProcess: [
    { title: "Prepare the blank", text: "Cut to size, remove burrs and verify grain, surface and seam allowance." },
    { title: "Set the rolls", text: "Establish an initial position from material, thickness and target curve." },
    { title: "Pre-bend where required", text: "Reduce the straight end before the main rolling passes." },
    { title: "Roll progressively", text: "Use controlled passes and measure the curve between adjustments." },
    { title: "Check and correct", text: "Compare diameter, arc or taper with the drawing before discharge." },
    { title: "Join downstream", text: "Move the formed part to seaming, welding, grinding and final inspection." },
  ] satisfies readonly ContentCard[],
  preBending: {
    title: "Pre-bending reduces the unformed edge",
    text: "Because the plate needs support between rolls, the leading and trailing edges can retain a straight section. A suitable pre-bending method, blank allowance and pass sequence help reduce correction work. The achievable result depends on material, thickness, diameter and the configured roll arrangement.",
    checks: [
      "Confirm whether pre-bending is required for the drawing",
      "Leave suitable seam and trimming allowance",
      "Check both leading and trailing edges",
      "Avoid promising a zero-straight-edge result without trials",
    ],
  },
  structure: [
    { title: "Upper roll", text: "Provides the main forming reference and works with the lower rolls to establish curvature." },
    { title: "Lower rolls", text: "Support and feed the blank while their relative position helps control the forming path." },
    { title: "Rigid side frames", text: "Hold the roll assembly and transmission components in a compact workshop footprint." },
    { title: "Drive and adjustment", text: "The shown machine includes external gearing and mechanical adjustment points; final drive and adjustment details follow the selected configuration." },
  ] satisfies readonly ContentCard[],
  operation: [
    { title: "Set", text: "Adjust the machine for the actual blank and target geometry." },
    { title: "Feed", text: "Keep the plate aligned and supported as it enters the rolls." },
    { title: "Form", text: "Run controlled forward or reverse passes as the chosen configuration allows." },
    { title: "Measure", text: "Use a template or dimensional check before making the next correction." },
    { title: "Unload", text: "Support the completed part and follow the configured discharge method." },
  ] satisfies readonly ContentCard[],
  advantages: [
    { title: "Practical three-roll layout", text: "A familiar forming principle for cylinders, arcs and compatible cones." },
    { title: "Controlled workshop workflow", text: "Combines powered or assisted movement with operator-led setup and inspection as configured." },
    { title: "Broad part flexibility", text: "Useful for changing jobs when each workpiece is evaluated before setup." },
    { title: "Compact production cell", text: "Fits between blank preparation and welding without creating an oversized automated line." },
    { title: "Configuration-led selection", text: "Machine details are matched to material, thickness, width and minimum diameter." },
    { title: "Clear downstream integration", text: "Supports a complete cutting, rolling, welding and finishing workflow." },
  ] satisfies readonly ContentCard[],
  comparison: [
    { label: "Best fit", manualThreeRoll: "Occasional light work", semiAutomaticThreeRoll: "Flexible small- and medium-batch work", fourRoll: "Higher-throughput configured lines" },
    { label: "Operator involvement", manualThreeRoll: "High", semiAutomaticThreeRoll: "Moderate and process-led", fourRoll: "Lower when automation is configured" },
    { label: "Setup flexibility", manualThreeRoll: "Simple manual adjustments", semiAutomaticThreeRoll: "Balanced flexibility and assisted operation", fourRoll: "Application-specific control options" },
    { label: "Pre-bending", manualThreeRoll: "Depends on design and operator method", semiAutomaticThreeRoll: "Available by confirmed arrangement and process", fourRoll: "Often integrated, configuration dependent" },
    { label: "Investment level", manualThreeRoll: "Lower", semiAutomaticThreeRoll: "Balanced", fourRoll: "Higher" },
  ] satisfies readonly ComparisonRow[],
  workflow: [
    { title: "Cut the blank", text: "Prepare consistent plate geometry with shearing or laser cutting.", href: "/products" },
    { title: "Deburr and mark", text: "Remove sharp edges and identify orientation, centerlines and seam allowance." },
    { title: "Roll the part", text: "Use the approved pass sequence and support method." },
    { title: "Check geometry", text: "Verify diameter, radius, taper and edge condition." },
    { title: "Join and finish", text: "Weld or seam, then grind, treat and inspect the completed assembly." },
  ] satisfies readonly WorkflowItem[],
  selectionGuide: [
    { title: "Material", text: "Grade, yield strength, temper, coating and surface finish." },
    { title: "Thickness", text: "Nominal thickness plus any range of planned jobs." },
    { title: "Working width", text: "Maximum blank width along the roll axis." },
    { title: "Target diameter", text: "Minimum and typical finished inside or outside diameter." },
    { title: "Part shape", text: "Cylinder, arc, cone or drawing-defined transition." },
    { title: "Production pattern", text: "Batch size, changeover frequency and desired operator assistance." },
  ] satisfies readonly ContentCard[],
  specificationFields: [
    { heading: "Model", source: "name" },
    { heading: "Rolling Capacity", source: "spec", sourceIndex: 0 },
    { heading: "Roll Structure", source: "spec", sourceIndex: 1 },
    { heading: "Operation Mode", source: "spec", sourceIndex: 2 },
    { heading: "Workpiece", source: "spec", sourceIndex: 3 },
    { heading: "Rolling Length", unit: "mm", source: "confirmed" },
    { heading: "Plate Thickness", unit: "mm", source: "confirmed" },
    { heading: "Pre-bending Thickness", unit: "mm", source: "confirmed" },
    { heading: "Minimum Rolling Diameter", unit: "mm", source: "confirmed" },
    { heading: "Top Roll Diameter", unit: "mm", source: "confirmed" },
    { heading: "Bottom Roll Diameter", unit: "mm", source: "confirmed" },
    { heading: "Side Roll Diameter", unit: "mm", source: "confirmed" },
    { heading: "Motor Power", unit: "kW", source: "confirmed" },
    { heading: "Rolling Speed", unit: "m/min", source: "confirmed" },
    { heading: "Voltage", unit: "V", source: "confirmed" },
    { heading: "Machine Size", unit: "mm", source: "confirmed" },
    { heading: "Machine Weight", unit: "kg", source: "confirmed" },
    { heading: "Application", source: "confirmed" },
  ] satisfies readonly SpecificationField[],
  workshopNotes: [
    { title: "Foundation and access", text: "Confirm floor loading, service access, lifting path and operating clearance." },
    { title: "Part support", text: "Plan suitable side or overhead support for long plates and large finished shells." },
    { title: "Electrical supply", text: "Confirm local voltage, frequency, phase and protection before manufacturing." },
    { title: "Operator method", text: "Use trained personnel, an approved pass plan and suitable measuring templates." },
    { title: "Trial material", text: "Provide representative blanks when surface finish, springback or cone forming is critical." },
    { title: "Routine care", text: "Follow the delivered lubrication, inspection and guarding instructions for the selected build." },
  ] satisfies readonly ContentCard[],
  faq: [
    {
      question: "What information is needed to select a three-roll machine?",
      answer: "Please provide material grade, thickness, working width, minimum and typical diameter, part shape, drawings, batch size and local power supply.",
    },
    {
      question: "Can this machine roll cones?",
      answer: "Compatible cones may be rolled when the tapered blank, cone dimensions, machine configuration, attachment and operating method are confirmed together.",
    },
    {
      question: "Does the machine eliminate every straight edge?",
      answer: "No universal result should be promised. Straight-end reduction depends on the pre-bending method, roll layout, material, thickness, target diameter and pass sequence.",
    },
    {
      question: "Which materials can be rolled?",
      answer: "Common applications include compatible mild steel, stainless steel, aluminum and galvanized sheet. Capacity must be confirmed for the exact grade and geometry.",
    },
    {
      question: "Is it suitable for small workshops?",
      answer: "The compact semi-automatic format can suit small and medium workshops that need flexible cylinder, arc and compatible cone forming without a large automated line.",
    },
    {
      question: "Are the listed additional parameters fixed?",
      answer: "No. The four original project values are preserved; all added specification fields must be confirmed with our sales engineer for the selected configuration.",
    },
  ] satisfies readonly FaqItem[],
  finalCta: {
    title: "Match the machine to your real workpiece",
    text: "Send a drawing or share material, thickness, working width and target diameter. We will help define a practical three-roll plate rolling configuration.",
    primaryCta: "Request a Rolling Solution",
    secondaryCta: "Browse Related Machines",
  },
} as const;
