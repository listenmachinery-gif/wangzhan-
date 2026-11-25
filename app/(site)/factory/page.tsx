import type { Metadata } from "next";
import { CompanyStructuredData } from "@/components/company/CompanyStructuredData";
import { PageRenderer } from "@/components/page-builder/PageRenderer";
import { aboutZyronDocument } from "@/lib/page-builder/about-zyron-content";
import { getPublishedPageBySlug } from "@/lib/repositories/page-repository";
import { overlayPublishedSeo } from "@/lib/repositories/seo-repository";

export const dynamic = "force-dynamic";

const title =
  "About ZYRON | Sheet Metal Machinery Manufacturer";
const description =
  "Learn how ZYRON develops sheet metal machinery through engineering review, manufacturing coordination, inspection, delivery preparation, and support.";
const image = "/images/about/zyron-factory-exterior.webp";

const fallbackMetadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/factory" },
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    url: "/factory",
    siteName: "ZYRON Heavy Industry",
    type: "website",
    images: [
      {
        url: image,
        width: 1942,
        height: 809,
        alt: "ZYRON Heavy Industry factory exterior and main entrance",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image],
  },
};

export function generateMetadata() {
  return overlayPublishedSeo("/factory", fallbackMetadata);
}

export default async function FactoryPage() {
  const managed = await getPublishedPageBySlug("company");
  const document = managed?.nodes.some((node) => node.type === "ABOUT_HERO")
    ? managed
    : aboutZyronDocument;
  return (
    <main data-about-zyron-page className="overflow-x-hidden bg-white text-[#101214]">
      <CompanyStructuredData />
      <PageRenderer document={document} />
    </main>
  );
}
