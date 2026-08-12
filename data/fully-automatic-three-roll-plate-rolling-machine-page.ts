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
    title: "Pressure vessel shells",
    text: "Large cylindrical vessels illustrate repeat shell work where material traceability, pre-bending, diameter checks and downstream welding must be planned together.",
    image: "/products/fully-automatic-three-roll-plate-rolling-machine-applications/pressure-vessel-shells.webp",
    alt: "Real large cylindrical pressure vessel and storage shells",
  },
  {
    title: "Storage tank shells",
    text: "Tank farms represent multi-course cylindrical fabrication that benefits from a repeatable rolling program and an organized joining workflow.",
    image: "/products/fully-automatic-three-roll-plate-rolling-machine-applications/storage-tank-shells.webp",
    alt: "Real industrial metal storage tank shells",
  },
  {
    title: "Boiler shells",
    text: "Industrial process vessels show the shell geometry used before qualified seam preparation, welding, inspection and assembly.",
    image: "/products/fully-automatic-three-roll-plate-rolling-machine-applications/boiler-shells.webp",
    alt: "Real industrial boiler and process plant shells",
  },
  {
    title: "Wind tower sections",
    text: "Wind-tower production uses large tapered or cylindrical sections whose plate handling and rolling sequence require project-specific engineering.",
    image: "/products/fully-automatic-three-roll-plate-rolling-machine-applications/wind-tower-sections.webp",
    alt: "Real wind tower in an industrial harbor",
  },
  {
    title: "Pipe sections",
    text: "Process pipework represents repeat round sections that move from rolling to longitudinal welding, calibration and connection preparation.",
    image: "/products/fully-automatic-three-roll-plate-rolling-machine-applications/pipe-sections.webp",
    alt: "Real industrial steel pipe sections and pipework",
  },
  {
    title: "Heavy cylinders",
    text: "Large cylindrical structures highlight the need to confirm workpiece weight, lifting paths, discharge support and workshop clearance.",
    image: "/products/fully-automatic-three-roll-plate-rolling-machine-applications/heavy-cylinders.webp",
    alt: "Real heavy cylindrical industrial tank structure",
  },
  {
    title: "Cone parts",
    text: "Tapered industrial structures illustrate cone work that depends on compatible blanks, controlled feeding, a confirmed attachment and the selected CNC process.",
    image: "/products/fully-automatic-three-roll-plate-rolling-machine-applications/cone-parts.webp",
    alt: "Real tapered metal silos and cone structures",
  },
  {
    title: "Arc plates",
    text: "Curved metal façades demonstrate open-arc forming where radius, surface protection, springback and segment matching matter.",
    image: "/products/fully-automatic-three-roll-plate-rolling-machine-applications/arc-plates.webp",
    alt: "Real curved metal architectural panels and arc plates",
  },
  {
    title: "Steel structure components",
    text: "Heavy steel stock and fabricated components represent drawing-led forming for structural and industrial assemblies.",
    image: "/products/fully-automatic-three-roll-plate-rolling-machine-applications/steel-structure-components.webp",
    alt: "Real steel components in an industrial factory",
  },
  {
    title: "Shipbuilding parts",
    text: "Shipyard work shows how curved plate sections continue into fitting, welding, inspection and large-assembly processes.",
    image: "/products/fully-automatic-three-roll-plate-rolling-machine-applications/shipbuilding-parts.webp",
    alt: "Real shipbuilding hull fabrication and welding",
  },
  {
    title: "Construction machinery shells",
    text: "Heavy manufacturing environments represent formed housings and large curved components that require material-specific capacity review.",
    image: "/products/fully-automatic-three-roll-plate-rolling-machine-applications/construction-machinery-shells.webp",
    alt: "Real heavy industrial metal fabrication environment",
  },
  {
    title: "Heavy fabrication workshop",
    text: "Overhead handling and organized material flow are essential when plate, rolled shells and downstream stations share one production cell.",
    image: "/products/fully-automatic-three-roll-plate-rolling-machine-applications/heavy-fabrication-workshop.webp",
    alt: "Real heavy fabrication workshop with overhead crane",
  },
] as const;

export const fullyAutomaticThreeRollPlateRollingMachinePage = {
  hero: {
    title: "Fully Automatic Three-Roll Plate Rolling Machine",
    subtitle:
      "CNC automatic plate rolling solution for cylinders, cones, tank shells and heavy fabrication workshops.",
    description:
      "A fully automatic three-roll plate rolling machine designed for programmed pre-bending, CNC rolling cycles, cylinder forming, compatible cone rolling and repeat shell production. Share your material, thickness, width, target diameter and automation needs so the configuration can be confirmed for the real workpiece.",
    primaryCta: "Get Automatic Plate Rolling Solution",
    secondaryCta: "Request Machine Configuration",
    values: [
      "CNC Automatic Rolling Cycle",
      "Automatic Pre-bending",
      "Cylinder / Cone / Arc Forming",
      "Suitable for Batch Shell Production",
    ],
  },
  painPoints: [
    { title: "Manual adjustment depends on operator experience", text: "CNC control and programmed rolling steps can reduce repeated manual roll adjustment when the selected configuration supports them." },
    { title: "Batch cylinders need repeated consistency", text: "Stored, controlled rolling sequences help organize repeat tank, pressure-vessel, pipe and shell work while inspection remains part of the process." },
    { title: "Plate-edge pre-bending affects closing", text: "A confirmed automatic pre-bending method helps prepare both edges before cylinder closing, seam work and calibration." },
    { title: "Cone and arc parts need process control", text: "Compatible cone attachments and multi-step control can support selected tapered, arc and variable-radius workpieces after drawing review." },
    { title: "Heavy workshops need efficient material flow", text: "Optional feeding, centering and unloading support can connect rolling with lifting, welding and inspection around the actual plate size and weight." },
  ] satisfies readonly ContentCard[],
  solutions: [
    { title: "Tank & pressure-vessel shells", suitableFor: "Tank, pressure-vessel, boiler and cylindrical-shell fabricators.", recommendedUse: "Repeat shell courses with defined materials, diameters and downstream joining standards.", text: "Coordinate edge preparation, programmed pre-bending, rolling, checking and welding preparation as one controlled route." },
    { title: "Wind tower, pipe & heavy cylinders", suitableFor: "Wind-tower, pipe-section, structural-cylinder and heavy-machinery workshops.", recommendedUse: "Large or higher-strength plates requiring engineered handling and repeat forming sequences.", text: "Build a project-specific automatic rolling cell around plate width, strength, weight, lifting equipment and production quantity." },
    { title: "Cone, arc & custom forming", suitableFor: "Custom metalwork, construction equipment, curved panels and tapered components.", recommendedUse: "Multi-step arcs and compatible cones confirmed from drawings and material data.", text: "Match the CNC sequence, cone arrangement, blank geometry and support method to the requested part." },
  ] satisfies readonly SolutionCard[],
  materials: [
    { title: "Mild steel plate", text: "Confirm grade, yield strength, thickness, width and target diameter." },
    { title: "Stainless steel plate", text: "Confirm grade, surface protection, springback and joining requirements." },
    { title: "Carbon steel plate", text: "Confirm strength, plate condition, forming direction and pre-bending demand." },
    { title: "Alloy steel plate", text: "Provide the material specification for an engineering capacity check." },
    { title: "Aluminum plate", text: "Confirm alloy, temper, surface sensitivity and expected springback." },
    { title: "Galvanized plate", text: "Confirm coating condition, target radius and downstream seam process." },
    { title: "Heavy metal plate", text: "Confirm weight, lifting method, support, foundation and discharge route." },
  ] satisfies readonly ContentCard[],
  shapes: [
    { title: "Cylinders", text: "Complete round shells prepared for welding, calibration or assembly." },
    { title: "Tank shells", text: "Repeat shell courses matched to tank diameter and joining requirements." },
    { title: "Pressure-vessel shells", text: "Engineering-led cylindrical sections for qualified downstream fabrication." },
    { title: "Wind-tower sections", text: "Large cylindrical or tapered courses subject to machine and handling review." },
    { title: "Pipe sections", text: "Rolled sections prepared for longitudinal joining and dimensional checks." },
    { title: "Compatible cone sections", text: "Tapered blanks rolled with a confirmed attachment and process program." },
    { title: "Arc plates", text: "Open-radius segments for structures, guards and industrial assemblies." },
    { title: "Curved panels", text: "Drawing-defined panels where finish and radius must be considered together." },
    { title: "Heavy metal housings", text: "Curved covers and shells for machinery and equipment fabrication." },
    { title: "Variable-radius parts", text: "Multi-step profiles evaluated from drawings, samples and process trials." },
  ] satisfies readonly ContentCard[],
  rollingProcess: [
    { title: "Plate cutting", text: "Prepare the blank by a compatible shearing, laser, plasma or other cutting process." },
    { title: "Feeding / positioning", text: "Load, align and position the plate with manual, assisted or optional automatic equipment." },
    { title: "CNC pre-bending", text: "Run the confirmed roll movement sequence to pre-bend compatible plate edges." },
    { title: "Automatic rolling cycle", text: "Execute the programmed passes for the selected cylinder, arc or compatible cone process." },
    { title: "Diameter checking", text: "Measure diameter, roundness or radius and correct the program when required." },
    { title: "Assisted unloading", text: "Use the configured discharge and suitable lifting method for the formed workpiece." },
    { title: "Welding / next process", text: "Continue to seam welding, re-rolling, calibration, flanging, trimming or assembly." },
  ] satisfies readonly ContentCard[],
  cncControl: [
    { title: "Roll-position control", text: "CNC control can coordinate roll movement and position according to the selected machine structure." },
    { title: "Multi-step rolling", text: "Programmed passes support repeat cylinder and shell work when compatible with the controller and workpiece." },
    { title: "Program memory", text: "Storage and recall of production programs are available only when supported by the confirmed controller." },
    { title: "Automatic cycle control", text: "A configured sequence can reduce repeated adjustment while operators continue loading, checking and supervision." },
    { title: "Digital position display", text: "Position feedback and touchscreen functions depend on the controller and feedback hardware selected." },
    { title: "Optional connected functions", text: "Remote diagnosis or production-data functions require separate confirmation before quotation." },
  ] satisfies readonly ContentCard[],
  preBending: {
    title: "Automatic pre-bending supports better shell-closing preparation",
    text: "Pre-bending helps reduce the unformed straight section at both plate ends before final rolling. It supports closing, welding preparation and roundness control, but the result still depends on material, thickness, roll diameter, machine structure, CNC settings and the approved pass sequence.",
    checks: [
      "Confirm the required edge condition from the drawing",
      "Match the sequence to material strength and springback",
      "Check both leading and trailing plate edges",
      "Validate critical vessel work against engineering standards",
    ],
  },
  structure: [
    { title: "Three working rolls", text: "Three rolls apply controlled bending force; their movement and drive arrangement depend on the selected design." },
    { title: "CNC roll positioning", text: "Configured position control coordinates pre-bending, rolling and calibration steps for repeat work." },
    { title: "Hydraulic movement option", text: "Hydraulic roll movement, variable geometry and all-roll drive require confirmation for the proposed machine." },
    { title: "Discharge and cone options", text: "Drop-end discharge, ejector, lifting support and cone attachments remain configuration-dependent." },
  ] satisfies readonly ContentCard[],
  feedingUnloading: [
    { title: "Optional feeding table", text: "A motorized or automatic feeding table can reduce handling for repeat production when matched to plate size and weight." },
    { title: "Optional centering support", text: "A compatible centering system can help establish plate alignment before the rolling cycle." },
    { title: "Configured unloading method", text: "Automatic ejector, drop-end, assisted discharge or lifting support must match the completed shell." },
    { title: "Workshop lifting plan", text: "Heavy shells may still require an overhead crane, lifting fixture, rotator or special handling route." },
  ] satisfies readonly ContentCard[],
  advantages: [
    { title: "CNC rolling workflow", text: "Organizes repeat roll movement and process steps around the selected controller." },
    { title: "Automatic pre-bending option", text: "Supports repeat edge preparation when the confirmed build includes this function." },
    { title: "Multiple formed shapes", text: "Suitable for cylinders, arcs and compatible cones after application review." },
    { title: "Reduced repeat adjustment", text: "A stored process can reduce repeated manual setting between compatible batch parts." },
    { title: "Heavy-fabrication focus", text: "Applicable to tank, vessel, tower, pipe and industrial-shell workflows." },
    { title: "Material-flow options", text: "Feeding, centering, support and unloading can be engineered around the production cell." },
    { title: "Downstream integration", text: "Connects with cutting, welding, calibration, flanging and finishing processes." },
    { title: "Automation upgrade path", text: "A practical direction for workshops moving from assisted rolling to CNC-oriented batch work." },
  ] satisfies readonly ContentCard[],
  comparison: [
    { label: "Roller structure", semiAutomaticThreeRoll: "Three rolls", fullyAutomaticThreeRoll: "Three rolls", fourRoll: "Four rolls" },
    { label: "Operation mode", semiAutomaticThreeRoll: "Assisted operation with operator-led checks", fullyAutomaticThreeRoll: "Programmed CNC-oriented cycle, configuration dependent", fourRoll: "Controlled clamping and rolling, configuration dependent" },
    { label: "CNC automation", semiAutomaticThreeRoll: "Basic to optional", fullyAutomaticThreeRoll: "Core selection focus", fourRoll: "Optional to advanced" },
    { label: "Pre-bending ability", semiAutomaticThreeRoll: "Depends on structure and method", fullyAutomaticThreeRoll: "Automatic option subject to configuration", fourRoll: "Often integrated, subject to configuration" },
    { label: "Suitable production volume", semiAutomaticThreeRoll: "Flexible small and medium batches", fullyAutomaticThreeRoll: "Repeat and batch shell production", fourRoll: "Repeat, high-control or heavy configured work" },
    { label: "Rolling consistency", semiAutomaticThreeRoll: "Operator and process dependent", fullyAutomaticThreeRoll: "Supported by repeat programs and checking", fourRoll: "Supported by clamping and configured controls" },
    { label: "Investment level", semiAutomaticThreeRoll: "Balanced", fullyAutomaticThreeRoll: "Higher automation investment", fourRoll: "Higher structure and control investment" },
    { label: "Recommended use", semiAutomaticThreeRoll: "General cylinder, arc and varied workshop work", fullyAutomaticThreeRoll: "CNC batch cylinders, cones and demanding shell work", fourRoll: "Efficient positioning, clamping and selected heavy work" },
  ] satisfies readonly ComparisonRow[],
  workflow: [
    { title: "Shearing machine", text: "Straight-cut compatible plate blanks.", href: "/products/hydraulic-guillotine-shear" },
    { title: "Fiber laser cutting", text: "Prepare complex outlines, holes and shaped blanks.", href: "/products/exchange-table-fiber-laser-cutting-machine" },
    { title: "Plasma cutting", text: "Prepare selected large or thick plate blanks.", href: "/products/cnc-plasma-cutting-machine" },
    { title: "Automatic three-roll rolling", text: "Pre-bend and roll the approved shell program." },
    { title: "Seam welding", text: "Join the longitudinal seam to the required procedure." },
    { title: "Welding rotator", text: "Support circumferential welding and assembly where appropriate." },
    { title: "Flanging", text: "Form compatible shell edges for the next assembly stage." },
    { title: "Calibration / re-rolling", text: "Check and correct geometry after joining when required." },
    { title: "Surface treatment", text: "Continue to grinding, blasting, coating or polishing." },
  ] satisfies readonly WorkflowItem[],
  selectionGuide: [
    { title: "Plate material", text: "Grade, yield strength, temper, coating and surface condition." },
    { title: "Thickness and width", text: "Nominal thickness, working width and planned production range." },
    { title: "Blank length", text: "Cut length, seam allowance and blank geometry." },
    { title: "Target diameter", text: "Required cylinder diameter and minimum rolling diameter." },
    { title: "Part and drawing", text: "Cylinder, cone, arc, vessel shell or custom drawing." },
    { title: "Pre-bending", text: "Required edge condition and automatic pre-bending preference." },
    { title: "Production quantity", text: "Daily volume, batch size and changeover frequency." },
    { title: "CNC requirements", text: "Automation level, program memory and cycle complexity." },
    { title: "Feeding and centering", text: "Plate weight, table requirement and alignment method." },
    { title: "Unloading support", text: "Ejector, drop-end, lifting support and crane interface needs." },
    { title: "Power and workshop", text: "Voltage, floor, space, access and lifting equipment." },
    { title: "Connected processes", text: "Cutting, welding, flanging, calibration and automation interfaces." },
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
    { heading: "Side Roll Diameter", unit: "mm", source: "confirmed" },
    { heading: "CNC Control System", source: "confirmed" },
    { heading: "Automatic Pre-bending", source: "confirmed" },
    { heading: "Feeding Method", source: "confirmed" },
    { heading: "Unloading Method", source: "confirmed" },
    { heading: "Motor Power", unit: "kW", source: "confirmed" },
    { heading: "Hydraulic System", source: "confirmed" },
    { heading: "Rolling Speed", unit: "m/min", source: "confirmed" },
    { heading: "Voltage", unit: "V", source: "confirmed" },
    { heading: "Machine Size", unit: "mm", source: "confirmed" },
    { heading: "Machine Weight", unit: "kg", source: "confirmed" },
    { heading: "Application", source: "confirmed" },
  ] satisfies readonly SpecificationField[],
  workshopNotes: [
    { title: "Power and foundation", text: "Prepare stable power, floor capacity, anchoring and service access for the confirmed configuration." },
    { title: "Blank and sequence", text: "Verify blank size, rolling direction, seam allowance and pre-bending sequence before production." },
    { title: "Loading and unloading", text: "Plan plate approach, feeding, discharge, crane access and safe handling before installation." },
    { title: "Material capacity", text: "Reconfirm stainless, high-strength or heavy plate before running the production job." },
    { title: "Shell support", text: "Large shells may require overhead lifting, side support, a rotator or a dedicated fixture." },
    { title: "Operating discipline", text: "Use trained operators, delivered guarding and instructions, and applicable local workshop rules." },
    { title: "Batch workflow", text: "Coordinate cutting, rolling, checking, welding, calibration and unloading as one production route." },
  ] satisfies readonly ContentCard[],
  relatedMachines: [
    { title: "Semi-automatic three-roll machine", text: "For flexible assisted rolling and varied workshop production.", href: "/products/semi-automatic-three-roll-plate-rolling-machine" },
    { title: "Hydraulic four-roll machine", text: "For configured four-roll clamping, positioning and heavy rolling.", href: "/products/hydraulic-four-roll-plate-rolling-machine" },
    { title: "Electric two-roll machine", text: "For compatible thin-sheet cylinder forming.", href: "/products/electric-two-roll-plate-rolling-machine" },
    { title: "Hydraulic guillotine shear", text: "For straight plate blank preparation.", href: "/products/hydraulic-guillotine-shear" },
    { title: "Exchange-table fiber laser", text: "For productive sheet cutting and shaped blanks.", href: "/products/exchange-table-fiber-laser-cutting-machine" },
    { title: "CNC plasma cutting", text: "For compatible large-format plate preparation.", href: "/products/cnc-plasma-cutting-machine" },
  ] satisfies readonly WorkflowItem[],
  faq: [
    { question: "What is a fully automatic three-roll plate rolling machine?", answer: "It is a three-working-roll plate forming machine configured around CNC or automatic control for programmed pre-bending, rolling cycles and repeat cylinder, arc or compatible cone production." },
    { question: "How is it different from a semi-automatic three-roll machine?", answer: "A semi-automatic machine emphasizes assisted operation and operator-led settings. A fully automatic configuration emphasizes CNC roll positioning, programmed cycles, optional automatic pre-bending and repeat production. Exact functions depend on the selected build." },
    { question: "How is a three-roll machine different from a four-roll machine?", answer: "Three-roll machines provide a versatile forming principle for cylinders, arcs and compatible cones. Four-roll machines add another roll and often emphasize plate clamping and positioning efficiency. Selection should follow the workpiece, production rate, control needs and budget." },
    { question: "What materials can it roll?", answer: "Common candidates include compatible carbon steel, stainless steel, galvanized plate, aluminum and selected alloy steel. Capacity depends on material strength, thickness, width, target diameter and the machine configuration." },
    { question: "Can it make cylinders automatically?", answer: "A configuration with a CNC automatic rolling program can execute repeat cylinder-forming steps. Loading, checking and unloading automation still depend on the selected equipment and workpiece." },
    { question: "Can it roll cone shapes?", answer: "Compatible cones may be rolled when the cone dimensions, tapered blank, attachment, roll arrangement and program are confirmed together." },
    { question: "Does it support automatic feeding and unloading?", answer: "Feeding tables, centering, ejectors, drop-end discharge and unloading support are configuration options. Plate size, weight, volume, workshop layout and budget must be confirmed." },
    { question: "Can it roll stainless steel?", answer: "Compatible stainless steel can be rolled after its grade, strength, thickness, width, finish requirements and target diameter are reviewed." },
    { question: "How do I choose the right model?", answer: "Provide material, thickness, width, blank length, target and minimum diameter, part drawing, pre-bending and cone needs, automation level, output, voltage and lifting plan." },
    { question: "Is it suitable for pressure-vessel and tank-shell production?", answer: "It can form compatible vessel and tank shells, but the machine, process, welding preparation and inspection route must match the plate data, diameter, applicable standards and production plan." },
    { question: "What should I provide before quotation?", answer: "Send the drawing, material, thickness, width, blank length, target diameter, application, daily quantity, voltage, CNC needs, feeding and unloading needs, connected equipment and destination country or port." },
    { question: "Can the machine be customized?", answer: "Configuration may be confirmed around rolling length, capacity, roll structure, CNC control, pre-bending, cone work, feeding, discharge, hydraulic system, voltage and workshop layout." },
  ] satisfies readonly FaqItem[],
  finalCta: {
    title: "Need an Automatic Plate Rolling Solution?",
    text: "Send your plate material, thickness, width, target diameter, drawing and automation requirement. We will recommend a suitable fully automatic three-roll plate rolling machine configuration for your workshop.",
    primaryCta: "Request a Quote",
    secondaryCta: "Contact Engineer",
  },
} as const;
