import type { UnmappedLegacyContent } from "@/lib/migration/product-mapper";

export type ImportReport = {
  dryRun: boolean;
  imported: { categories: number; products: number; sections: number; mediaReferences: number };
  skipped: Array<{ type: string; slug: string; reason: string }>;
  ambiguous: Array<{ productSlug: string; path: string; candidates: string[] }>;
  unmapped: Array<UnmappedLegacyContent & { productSlug: string }>;
};

export function stableImportReport(report: ImportReport): ImportReport {
  return {
    ...report,
    skipped: [...report.skipped].sort((a, b) => `${a.type}:${a.slug}`.localeCompare(`${b.type}:${b.slug}`)),
    ambiguous: [...report.ambiguous].sort((a, b) => `${a.productSlug}:${a.path}`.localeCompare(`${b.productSlug}:${b.path}`)),
    unmapped: [...report.unmapped].sort((a, b) => `${a.productSlug}:${a.path}`.localeCompare(`${b.productSlug}:${b.path}`)),
  };
}
