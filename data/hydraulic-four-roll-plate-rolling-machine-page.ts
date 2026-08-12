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
  semiAutomaticThreeRoll: string;
  fullyAutomaticThreeRoll: string;
  hydraulicFourRoll: string;
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
    title: "Pressure vessel shells",
    text: "Real process-vessel installations represent cylindrical shell work that requires material review, edge preparation, controlled rolling and qualified downstream joining.",
    image: "/products/hydraulic-four-roll-plate-rolling-machine-applications/pressure-vessel-shells.jpg",
    alt: "Real industrial pressure vessel shells and steel tank equipment",
  },
  {
    title: "Storage tank shells",
    text: "Tank farms illustrate multi-course shell production where stable plate clamping, diameter checks and an organized welding route support repeat fabrication.",
    image: "/products/hydraulic-four-roll-plate-rolling-machine-applications/storage-tank-shells.jpg",
    alt: "Real red industrial storage tank shells",
  },
  {
    title: "Boiler shells",
    text: "Industrial process plants show the cylindrical vessels, pipework and structural context surrounding rolled boiler and process-equipment shells.",
    image: "/products/hydraulic-four-roll-plate-rolling-machine-applications/boiler-shells.jpg",
    alt: "Real boiler and industrial process plant shells",
  },
  {
    title: "Wind tower sections",
    text: "Wind-energy structures use large cylindrical or tapered sections whose plate strength, weight, rolling route and material handling must be engineered together.",
    image: "/products/hydraulic-four-roll-plate-rolling-machine-applications/wind-tower-sections.jpg",
    alt: "Real wind tower section in service",
  },
  {
    title: "Pipe sections",
    text: "Large pipe sections move from plate forming to longitudinal welding, calibration and connection preparation in a controlled fabrication sequence.",
    image: "/products/hydraulic-four-roll-plate-rolling-machine-applications/pipe-sections.jpg",
    alt: "Real large steel pipe sections in an industrial yard",
  },
  {
    title: "Heavy cylinders",
    text: "Heavy cylindrical workpieces make plate weight, support, overhead handling, discharge clearance and foundation planning part of machine selection.",
    image: "/products/hydraulic-four-roll-plate-rolling-machine-applications/heavy-cylinders.jpg",
    alt: "Real heavy steel cylindrical pipe components",
  },
  {
    title: "Cone parts",
    text: "Tapered industrial structures illustrate compatible cone work that depends on blank geometry, roll movement, cone arrangement and the approved forming sequence.",
    image: "/products/hydraulic-four-roll-plate-rolling-machine-applications/cone-parts.jpg",
    alt: "Real tapered industrial silos and cone parts",
  },
  {
    title: "Arc plates",
    text: "Curved metal panels represent open-arc forming where radius, springback, surface protection and segment matching need drawing-led control.",
    image: "/products/hydraulic-four-roll-plate-rolling-machine-applications/arc-plates.jpg",
    alt: "Real curved metallic panels and arc plate application",
  },
  {
    title: "Steel structure components",
    text: "Curved structural steel components require the forming capacity, profile geometry and connection details to be checked against fabrication drawings.",
    image: "/products/hydraulic-four-roll-plate-rolling-machine-applications/steel-structure-components.jpg",
    alt: "Real curved steel structure components",
  },
  {
    title: "Shipbuilding components",
    text: "Shipyard fabrication connects curved plate forming with fitting, welding, inspection and large-assembly handling around the hull production plan.",
    image: "/products/hydraulic-four-roll-plate-rolling-machine-applications/shipbuilding-components.jpg",
    alt: "Real shipbuilding hull component fabrication",
  },
  {
    title: "Construction machinery shells",
    text: "Heavy-equipment environments represent formed housings, covers and curved components that require material-specific capacity confirmation.",
    image: "/products/hydraulic-four-roll-plate-rolling-machine-applications/construction-machinery-shells.jpg",
    alt: "Real construction machinery and heavy steel fabrication environment",
  },
  {
    title: "Heavy fabrication workshop",
    text: "A real factory floor shows why loading access, trained operators and coordinated movement between forming and downstream stations matter.",
    image: "/products/hydraulic-four-roll-plate-rolling-machine-applications/heavy-fabrication-workshop.jpg",
    alt: "Real heavy fabrication workshop with industrial workers",
  },
] as const;

export const hydraulicFourRollPlateRollingMachinePage = {
  hero: {
    title: "Hydraulic Four-Roll Plate Rolling Machine",
    subtitle:
      "Four-roll hydraulic plate forming for tank shells, cylinders, pressure vessels and heavy fabrication.",
    description:
      "A hydraulic four-roll plate rolling machine designed to clamp the plate between the top and bottom rolls while the side rolls support pre-bending and forming. Share your material, thickness, width, target diameter and workpiece drawing so the actual capacity, control and handling configuration can be confirmed.",
    primaryCta: "Get Four-Roll Rolling Solution",
    secondaryCta: "Request Machine Configuration",
    values: [
      "Four-roll Hydraulic Forming",
      "Stable Plate Clamping",
      "Pre-bending & Rolling in One Setup",
      "Suitable for Tank Shells and Cylinders",
    ],
  },
  painPoints: [
    { title: "Plate positioning can slow the first pass", text: "Clamping the plate between the top and bottom rolls supports alignment before the side rolls begin the approved forming sequence." },
    { title: "Straight edges complicate shell closing", text: "An engineered four-roll pre-bending sequence can reduce the unformed portion at compatible plate ends before closing and welding." },
    { title: "Heavy plate needs controlled force", text: "Hydraulic movement supports controlled roll positioning, but capacity must be selected from material strength, width, thickness and diameter together." },
    { title: "Repeat shells need a stable process", text: "Configured position feedback and NC or CNC functions can organize repeated passes while measurement and inspection remain essential." },
    { title: "Large cylinders need planned handling", text: "Side support, overhead lifting, feeding and discharge options should follow the real blank and completed shell weight." },
  ] satisfies readonly ContentCard[],
  solutions: [
    { title: "Tank & pressure-vessel shells", suitableFor: "Tank, vessel, boiler and cylindrical-shell fabricators.", recommendedUse: "Repeat shell courses with defined materials, diameters and joining standards.", text: "Combine clamping, edge pre-bending, rolling, checking and seam preparation in one controlled fabrication route." },
    { title: "Pipe, tower & heavy cylinders", suitableFor: "Pipe-section, wind-tower and heavy structural-cylinder workshops.", recommendedUse: "Large or higher-strength plate requiring engineered support and handling.", text: "Configure the rolls, hydraulic system, support devices and workshop flow around the actual plate and workpiece." },
    { title: "Cone, arc & custom components", suitableFor: "Industrial shells, curved panels and drawing-defined tapered parts.", recommendedUse: "Compatible cones and multi-pass arcs reviewed from drawings.", text: "Match the blank, control sequence, cone arrangement and inspection method to the requested geometry." },
  ] satisfies readonly SolutionCard[],
  materials: [
    { title: "Mild steel plate", text: "Confirm grade, yield strength, thickness, width and target diameter." },
    { title: "Carbon steel plate", text: "Confirm strength, plate condition, forming direction and pre-bending demand." },
    { title: "Stainless steel plate", text: "Confirm grade, finish protection, strength and springback." },
    { title: "Alloy steel plate", text: "Provide the complete material specification for an engineering capacity review." },
    { title: "Aluminum plate", text: "Confirm alloy, temper, surface sensitivity and expected springback." },
    { title: "Galvanized plate", text: "Confirm coating condition, target radius and downstream seam process." },
    { title: "Heavy metal plate", text: "Confirm workpiece weight, support, lifting, foundation and discharge route." },
  ] satisfies readonly ContentCard[],
  shapes: [
    { title: "Cylinders", text: "Complete round shells prepared for joining, calibration or assembly." },
    { title: "Tank shells", text: "Shell courses matched to tank diameter and seam requirements." },
    { title: "Pressure-vessel shells", text: "Engineering-led cylindrical sections for qualified downstream fabrication." },
    { title: "Pipe sections", text: "Rolled sections prepared for longitudinal joining and inspection." },
    { title: "Compatible cone sections", text: "Tapered blanks formed with a confirmed machine arrangement and sequence." },
    { title: "Arc plates", text: "Open-radius segments for structures, guards and industrial assemblies." },
    { title: "Curved panels", text: "Drawing-defined panels where surface and radius are considered together." },
    { title: "Heavy metal housings", text: "Curved covers and shells for machinery and industrial equipment." },
  ] satisfies readonly ContentCard[],
  rollingProcess: [
    { title: "Plate preparation", text: "Cut the blank, prepare edges and confirm rolling direction and seam allowance." },
    { title: "Feeding & alignment", text: "Load the plate and align it with compatible feeding or workshop lifting equipment." },
    { title: "Hydraulic clamping", text: "Clamp the plate between the top and bottom rolls according to the selected configuration." },
    { title: "First-edge pre-bending", text: "Move the relevant side roll through the approved first-edge sequence." },
    { title: "Cylinder rolling", text: "Coordinate the working rolls through the required passes to form the shell." },
    { title: "Second-edge pre-bending", text: "Complete the opposite edge sequence without changing the overall setup when compatible." },
    { title: "Checking & correction", text: "Measure diameter, roundness or radius and correct the process when required." },
    { title: "Discharge & next process", text: "Unload safely, then continue to welding, calibration or assembly." },
  ] satisfies readonly ContentCard[],
  fourRollDesign: [
    { title: "Top roll", text: "Works with the bottom roll to establish plate contact and contributes to the forming geometry." },
    { title: "Bottom roll", text: "Supports hydraulic clamping and controlled plate feeding in the selected machine design." },
    { title: "Two side rolls", text: "Move to support pre-bending, rolling passes and geometry correction according to the approved sequence." },
    { title: "Hydraulic roll movement", text: "Provides controlled roll positioning; drive layout and movement axes depend on the confirmed model." },
    { title: "Rigid frame", text: "Supports rolling force and alignment for the specified plate range and workshop duty." },
    { title: "Drop-end arrangement", text: "A configured opening or support arrangement assists discharge of compatible completed shells." },
  ] satisfies readonly ContentCard[],
  hydraulicSystem: [
    { title: "Controlled movement", text: "Hydraulic actuators position the configured rolls through clamping, pre-bending and rolling steps." },
    { title: "Pressure supervision", text: "Pressure indication and protective functions depend on the selected hydraulic and control package." },
    { title: "Synchronized positioning", text: "Position feedback can coordinate both sides of a moving roll when included in the configuration." },
    { title: "Service access", text: "Reservoir, filtration, hoses, seals and cooling requirements are confirmed for the proposed duty cycle." },
  ] satisfies readonly ContentCard[],
  preBendingClamping: {
    title: "Clamping and pre-bending in one four-roll setup",
    text: "The plate is held between the top and bottom rolls while the side rolls are positioned for the leading edge, main rolling passes and trailing edge. This can streamline plate handling and shell-closing preparation, but the achievable result depends on material strength, thickness, width, roll geometry, target diameter and the approved pass sequence.",
    checks: [
      "Confirm the required edge condition from the drawing",
      "Match roll positions to material strength and springback",
      "Measure both leading and trailing edge results",
      "Validate critical vessel work against applicable standards",
    ],
  },
  controlOptions: [
    { title: "Manual hydraulic control", text: "Operator-led roll movement and checking for flexible, lower-volume workshop production." },
    { title: "NC position control", text: "Digital position feedback and stored settings depend on the confirmed controller and sensors." },
    { title: "CNC rolling sequence", text: "Programmed multi-step roll positioning may support compatible repeat shell work." },
    { title: "Program memory", text: "Recipe storage and recall are available only when included with the selected control system." },
    { title: "Optional connected functions", text: "Remote support or production-data interfaces require separate confirmation before quotation." },
  ] satisfies readonly ContentCard[],
  feedingUnloading: [
    { title: "Feeding table", text: "An optional powered table can support repeat blanks when matched to plate dimensions and weight." },
    { title: "Side supports", text: "Configured supports help manage large-diameter shells and reduce uncontrolled movement." },
    { title: "Overhead support", text: "Tall or large shells may require an overhead support system or workshop crane plan." },
    { title: "Drop-end discharge", text: "The opening and support arrangement must match the finished shell diameter and weight." },
    { title: "Ejector or lifting route", text: "A compatible ejector, crane or fixture can move the workpiece to its next station." },
  ] satisfies readonly ContentCard[],
  advantages: [
    { title: "Stable plate clamping", text: "Top-and-bottom roll contact supports controlled positioning before and during forming." },
    { title: "Integrated edge preparation", text: "Compatible leading and trailing edge pre-bending can be completed in the same overall setup." },
    { title: "Hydraulic forming force", text: "Controlled roll movement supports heavy-duty plate applications after engineering selection." },
    { title: "Cylinders, arcs & cones", text: "Multiple geometries can be evaluated from the material and workpiece drawing." },
    { title: "Control-system choice", text: "Manual hydraulic, NC and CNC-oriented configurations serve different production needs." },
    { title: "Handling options", text: "Feeding, side support, overhead support and discharge can be planned as one cell." },
    { title: "Repeat-work potential", text: "Position feedback and stored steps can support repeat production when included." },
    { title: "Fabrication integration", text: "Connects with cutting, welding, calibration, flanging and finishing processes." },
  ] satisfies readonly ContentCard[],
  comparison: [
    { label: "Roller structure", semiAutomaticThreeRoll: "Three working rolls", fullyAutomaticThreeRoll: "Three working rolls", hydraulicFourRoll: "Top, bottom and two side rolls" },
    { label: "Plate clamping", semiAutomaticThreeRoll: "Depends on structure and setup", fullyAutomaticThreeRoll: "Depends on confirmed structure", hydraulicFourRoll: "Between top and bottom rolls" },
    { label: "Pre-bending route", semiAutomaticThreeRoll: "Operator and structure dependent", fullyAutomaticThreeRoll: "Programmed option by configuration", hydraulicFourRoll: "Integrated side-roll sequence by configuration" },
    { label: "Control focus", semiAutomaticThreeRoll: "Assisted operation", fullyAutomaticThreeRoll: "Automatic three-roll cycle", hydraulicFourRoll: "Hydraulic clamping and coordinated roll positioning" },
    { label: "Repeat production", semiAutomaticThreeRoll: "Flexible small and medium batches", fullyAutomaticThreeRoll: "CNC-oriented batch work", hydraulicFourRoll: "Repeat shell work with selected NC or CNC control" },
    { label: "Material handling", semiAutomaticThreeRoll: "Operator-led and optional support", fullyAutomaticThreeRoll: "Optional automation package", hydraulicFourRoll: "Stable clamping plus configured support options" },
    { label: "Configuration investment", semiAutomaticThreeRoll: "Balanced", fullyAutomaticThreeRoll: "Higher automation level", hydraulicFourRoll: "Higher structural and hydraulic integration" },
    { label: "Recommended use", semiAutomaticThreeRoll: "General cylinder, arc and varied work", fullyAutomaticThreeRoll: "Automatic batch cylinders and compatible cones", hydraulicFourRoll: "Tank shells, cylinders and selected heavy plate work" },
  ] satisfies readonly ComparisonRow[],
  workflow: [
    { title: "Shearing machine", text: "Prepare compatible straight-cut plate blanks.", href: "/products/hydraulic-guillotine-shear" },
    { title: "Fiber laser cutting", text: "Prepare shaped blanks, holes and reference features.", href: "/products/exchange-table-fiber-laser-cutting-machine" },
    { title: "Plasma cutting", text: "Prepare selected large-format or thick plate blanks.", href: "/products/cnc-plasma-cutting-machine" },
    { title: "Four-roll plate rolling", text: "Clamp, pre-bend and roll the approved shell sequence." },
    { title: "Seam welding", text: "Join the longitudinal seam to the specified procedure." },
    { title: "Welding rotator", text: "Support compatible circumferential welding and assembly." },
    { title: "Flanging", text: "Form compatible shell edges for the next assembly stage." },
    { title: "Calibration / re-rolling", text: "Check and correct geometry after joining when required." },
    { title: "Surface treatment", text: "Continue to grinding, blasting, coating or polishing." },
  ] satisfies readonly WorkflowItem[],
  selectionGuide: [
    { title: "Plate material", text: "Grade, yield strength, temper, coating and surface condition." },
    { title: "Thickness and width", text: "Nominal thickness, working width and expected range." },
    { title: "Blank length", text: "Cut length, seam allowance and blank geometry." },
    { title: "Target diameter", text: "Required cylinder diameter and minimum rolling diameter." },
    { title: "Part drawing", text: "Cylinder, cone, arc, tank shell or custom geometry." },
    { title: "Pre-bending need", text: "Required edge condition and acceptable straight portion." },
    { title: "Production quantity", text: "Daily volume, batch size and changeover frequency." },
    { title: "Control level", text: "Manual hydraulic, NC or CNC-oriented operation." },
    { title: "Feeding and support", text: "Plate weight, table, side support and overhead support." },
    { title: "Unloading method", text: "Drop end, ejector, lifting fixture and crane interface." },
    { title: "Workshop utilities", text: "Voltage, floor, space, access and lifting equipment." },
    { title: "Connected processes", text: "Cutting, welding, flanging, calibration and finishing route." },
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
    { heading: "Control System", source: "confirmed" },
    { heading: "Hydraulic System", source: "confirmed" },
    { heading: "Roll Drive", source: "confirmed" },
    { heading: "Feeding Method", source: "confirmed" },
    { heading: "Unloading Method", source: "confirmed" },
    { heading: "Motor Power", unit: "kW", source: "confirmed" },
    { heading: "Rolling Speed", unit: "m/min", source: "confirmed" },
    { heading: "Voltage", unit: "V", source: "confirmed" },
    { heading: "Machine Size", unit: "mm", source: "confirmed" },
    { heading: "Machine Weight", unit: "kg", source: "confirmed" },
    { heading: "Application", source: "confirmed" },
  ] satisfies readonly SpecificationField[],
  workshopNotes: [
    { title: "Power and foundation", text: "Prepare stable power, floor capacity, anchoring and service access for the confirmed machine." },
    { title: "Blank preparation", text: "Verify blank size, rolling direction, edge condition and seam allowance before production." },
    { title: "Loading route", text: "Plan plate approach, feeding, crane access and controlled placement before installation." },
    { title: "Material capacity", text: "Reconfirm stainless, high-strength or heavy plate for every production range." },
    { title: "Shell support", text: "Large shells may require side support, overhead lifting, a rotator or a dedicated fixture." },
    { title: "Hydraulic maintenance", text: "Follow the delivered requirements for oil, filtration, seals, hoses, cooling and inspection." },
    { title: "Operating discipline", text: "Use trained personnel, delivered guards and instructions, and applicable local workshop rules." },
  ] satisfies readonly ContentCard[],
  relatedMachines: [
    { title: "Fully automatic three-roll machine", text: "For CNC-oriented repeat cylinder and compatible cone work.", href: "/products/fully-automatic-three-roll-plate-rolling-machine" },
    { title: "Semi-automatic three-roll machine", text: "For flexible assisted rolling and varied workshop production.", href: "/products/semi-automatic-three-roll-plate-rolling-machine" },
    { title: "Electric two-roll machine", text: "For compatible thin-sheet cylinder forming.", href: "/products/electric-two-roll-plate-rolling-machine" },
    { title: "Hydraulic guillotine shear", text: "For straight plate blank preparation.", href: "/products/hydraulic-guillotine-shear" },
    { title: "Exchange-table fiber laser", text: "For productive sheet cutting and shaped blanks.", href: "/products/exchange-table-fiber-laser-cutting-machine" },
    { title: "CNC plasma cutting", text: "For compatible large-format plate preparation.", href: "/products/cnc-plasma-cutting-machine" },
  ] satisfies readonly WorkflowItem[],
  faq: [
    { question: "What is a hydraulic four-roll plate rolling machine?", answer: "It is a plate forming machine with top, bottom and two side rolls. A selected hydraulic system moves the configured rolls for plate clamping, edge pre-bending, cylinder rolling and correction." },
    { question: "How does four-roll plate rolling work?", answer: "The plate is generally clamped between the top and bottom rolls, then the side rolls are positioned through leading-edge pre-bending, main rolling passes and trailing-edge pre-bending. The exact sequence depends on the design and workpiece." },
    { question: "How is it different from a three-roll machine?", answer: "A four-roll design adds a second side roll and emphasizes clamping and controlled positioning in one setup. Three-roll machines remain versatile for many cylinder, arc and compatible cone jobs. Selection should follow the workpiece and production plan." },
    { question: "What materials can it roll?", answer: "Common candidates include compatible carbon steel, stainless steel, galvanized plate, aluminum and selected alloy steel. Capacity depends on material strength, thickness, width, target diameter and configuration." },
    { question: "Can it make cylinders and tank shells?", answer: "It can form compatible cylinders and tank shells after the material, width, thickness, diameter, edge condition and downstream joining route are confirmed." },
    { question: "Can it roll cone shapes?", answer: "Compatible cone sections may be formed when the tapered blank, cone dimensions, roll arrangement, attachment and process sequence are reviewed together." },
    { question: "Does it support NC or CNC control?", answer: "Manual hydraulic, NC and CNC-oriented controls may be configured. Position feedback, program memory and automatic sequences depend on the selected controller and machine build." },
    { question: "Can it roll stainless steel?", answer: "Compatible stainless steel can be rolled after its grade, strength, thickness, width, finish requirements, springback and target diameter are reviewed." },
    { question: "Can feeding and unloading be automated?", answer: "Feeding tables, supports, drop-end discharge, ejectors and lifting integration are configuration options selected from plate size, shell weight, production quantity and workshop layout." },
    { question: "How do I choose the right model?", answer: "Provide material, strength, thickness, width, blank length, target and minimum diameter, workpiece drawing, pre-bending need, output, control level, voltage and handling plan." },
    { question: "Is it suitable for pressure-vessel production?", answer: "It can form compatible vessel shells, but the machine, plate preparation, rolling, welding and inspection route must satisfy the applicable project and regulatory requirements." },
    { question: "What should I provide before quotation?", answer: "Send the workpiece drawing, material, thickness, width, blank length, target diameter, daily quantity, voltage, control preference, feeding and unloading needs, connected equipment and destination." },
  ] satisfies readonly FaqItem[],
  finalCta: {
    title: "Need a Hydraulic Four-Roll Rolling Solution?",
    text: "Send your plate material, thickness, width, target diameter, drawing and handling requirements. We will recommend a suitable hydraulic four-roll plate rolling machine configuration for your workshop.",
    primaryCta: "Request a Quote",
    secondaryCta: "Contact Engineer",
  },
} as const;
