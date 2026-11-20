import type { Metadata } from "next";
import { PageRenderer } from "@/components/page-builder/PageRenderer";
import { getPublishedPageBySlug } from "@/lib/repositories/page-repository";
import { INDUSTRIAL_PAGE_TEMPLATES } from "@/lib/page-builder/industrial-templates";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Support | ZYRON Heavy Industry",
  description: "Find machinery operation guidance, technical support and after-sales resources.",
  alternates: { canonical: "/support" },
};

export default async function SupportPage() {
  const document = await getPublishedPageBySlug("support") ?? INDUSTRIAL_PAGE_TEMPLATES.support.document;
  return <main className="bg-[#f4f6f8] text-[#101214]"><PageRenderer document={document} /></main>;
}
