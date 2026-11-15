import type { Metadata } from "next";
import { CompanyPage } from "@/components/company/CompanyPage";

const title =
  "About ZYRON Heavy Industry | Sheet Metal Machinery Manufacturer";
const description =
  "Explore ZYRON Heavy Industry’s factory, product range, engineering support, quality control, export packing, and global machinery support.";
const image = "/brand/factory-showcase.png";

export const metadata: Metadata = {
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

export default function FactoryPage() {
  return <CompanyPage />;
}
