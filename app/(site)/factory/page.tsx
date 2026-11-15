import type { Metadata } from "next";
import { CompanyPage } from "@/components/company/CompanyPage";
import { overlayPublishedSeo } from "@/lib/repositories/seo-repository";

export const dynamic = "force-dynamic";

const title =
  "About ZYRON Heavy Industry | Sheet Metal Machinery Manufacturer";
const description =
  "Explore ZYRON Heavy Industry’s factory, product range, engineering support, quality control, export packing, and global machinery support.";
const image = "/brand/factory-showcase.png";

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
        width: 1672,
        height: 941,
        alt: "ZYRON industrial machinery factory exterior in Ma’anshan China",
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

export default function FactoryPage() {
  return <CompanyPage />;
}
