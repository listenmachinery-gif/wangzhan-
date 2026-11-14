export type EditorialData = {
  eyebrow: string;
  title: string;
  paragraphs: string[];
};

export type GalleryData = {
  eyebrow: string;
  title: string;
  paragraphs?: string[];
  items: Array<{ image: string; alt: string; title: string; text?: string; label?: string }>;
};

export type CardCollectionData = {
  eyebrow: string;
  title: string;
  paragraphs?: string[];
  items: Array<{ title: string; text: string; image?: string; alt?: string }>;
};

export type HeroData = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  intro?: string;
  images: { desktop: string; tablet?: string; mobile?: string; alt: string };
  badges?: string[];
  valuePoints?: string[];
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export type TableData = EditorialData & {
  columns: Array<{ key: string; label: string; unit?: string }>;
  rows: Array<Record<string, string>>;
};

export type ComparisonData = EditorialData & {
  columns: string[];
  rows: Array<{ label: string; values: string[] }>;
};
