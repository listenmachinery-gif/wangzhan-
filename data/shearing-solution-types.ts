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
  processEyebrow: string;
  processTitle: string;
  processSteps: readonly ShearingSolutionItem[];
  applicationsEyebrow: string;
  applicationsTitle: string;
  applications: readonly ShearingSolutionItem[];
  advantagesEyebrow: string;
  advantagesTitle: string;
  advantagesIntro: string;
  advantages: readonly ShearingSolutionItem[];
  structureEyebrow: string;
  structureTitle: string;
  structureParts: readonly (string | ShearingStructurePart)[];
  technicalEyebrow: string;
  technicalTitle: string;
  technicalNote: string;
  splitTableHeaderUnits: boolean;
  comparisonEyebrow: string;
  comparisonTitle: string;
  comparisonIntro: string;
  comparisonHighlight: "foot" | "electric" | "hydraulic";
  comparisonRows: readonly ShearingComparisonRow[];
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
