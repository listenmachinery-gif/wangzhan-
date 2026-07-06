export type ShearingSolutionItem = {
  title: string;
  text: string;
};

export type ShearingStructurePart = {
  title: string;
  text?: string;
};

export type ShearingComparisonRow = {
  label: string;
  foot: string;
  electric: string;
  hydraulic: string;
};

export type ShearingFaq = {
  question: string;
  answer: string;
};

export type ShearingWorkflow = {
  eyebrow: string;
  title: string;
  intro: string;
  steps: readonly string[];
};

export type ShearingEnergyUse = {
  eyebrow: string;
  title: string;
  intro: string;
  states: readonly ShearingSolutionItem[];
};

export type ShearingMaterials = {
  eyebrow: string;
  title: string;
  note: string;
  items: readonly ShearingSolutionItem[];
};

export type ShearingBinaryComparison = {
  leftLabel: string;
  rightLabel: string;
  rows: readonly {
    label: string;
    left: string;
    right: string;
  }[];
};

export type ShearingImageCallout = {
  label: string;
  left: string;
  top: string;
};

export type ShearingSolutionContent = {
  schemaName: string;
  schemaCategory: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  intro: string;
  valuePoints: readonly string[];
  heroBadges?: readonly string[];
  heroModelSeries?: string;
  primaryCta: string;
  secondaryCta: string;
  painEyebrow: string;
  painTitle: string;
  painPoints: readonly ShearingSolutionItem[];
  solutionEyebrow: string;
  solutionTitle: string;
  solutionParagraphs: readonly string[];
  solutionFitEyebrow: string;
  solutionFitTitle: string;
  solutionFit: readonly string[];
  energyUse?: ShearingEnergyUse;
  processEyebrow: string;
  processTitle: string;
  processSteps: readonly ShearingSolutionItem[];
  applicationsEyebrow: string;
  applicationsTitle: string;
  applications: readonly ShearingSolutionItem[];
  materials?: ShearingMaterials;
  advantagesEyebrow: string;
  advantagesTitle: string;
  advantagesIntro: string;
  advantages: readonly ShearingSolutionItem[];
  structureEyebrow: string;
  structureTitle: string;
  structureParts: readonly (string | ShearingStructurePart)[];
  structureCallouts?: readonly ShearingImageCallout[];
  technicalEyebrow: string;
  technicalTitle: string;
  technicalNote: string;
  splitTableHeaderUnits: boolean;
  comparisonEyebrow: string;
  comparisonTitle: string;
  comparisonIntro: string;
  comparisonElectricLabel?: string;
  comparisonHighlight: "foot" | "electric" | "hydraulic";
  comparisonRows: readonly ShearingComparisonRow[];
  binaryComparison?: ShearingBinaryComparison;
  workflow?: ShearingWorkflow;
  supportEyebrow: string;
  supportTitle: string;
  supportItems: readonly ShearingSolutionItem[];
  faqEyebrow: string;
  faqTitle: string;
  faqs: readonly ShearingFaq[];
  ctaEyebrow: string;
  ctaTitle: string;
  ctaIntro: string;
  requiredInfo?: readonly string[];
};
