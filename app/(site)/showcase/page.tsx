import type { Metadata } from "next";
import { PageRenderer } from "@/components/page-builder/PageRenderer";
import { getPublishedPageBySlug } from "@/lib/repositories/page-repository";
import { INDUSTRIAL_PAGE_TEMPLATES } from "@/lib/page-builder/industrial-templates";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Showcase | ZYRON Heavy Industry",
  description: "Explore machinery projects, equipment applications and shipping highlights.",
  alternates: { canonical: "/showcase" },
};

export default async function ShowcasePage() {
  const document = await getPublishedPageBySlug("showcase") ?? INDUSTRIAL_PAGE_TEMPLATES.showcase.document;
  return <main className="bg-[#f4f6f8] text-[#101214]"><PageRenderer document={document} /></main>;
}
