import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.zyroncnc.com"),
  title: "ZYRON Heavy Industry | Industrial Sheet Metal & Duct Machinery Manufacturer",
  description:
    "ZYRON Heavy Industry manufactures shearing machines, bending machines, laser cutting machines, rolling machines, press machines, duct production equipment, and shredders for global B2B buyers.",
  applicationName: "ZYRON Heavy Industry",
  openGraph: {
    type: "website",
    siteName: "ZYRON Heavy Industry",
    url: "https://www.zyroncnc.com",
    title: "ZYRON Heavy Industry | Industrial Sheet Metal & Duct Machinery Manufacturer",
    description:
      "ZYRON Heavy Industry manufactures shearing machines, bending machines, laser cutting machines, rolling machines, press machines, duct production equipment, and shredders for global B2B buyers.",
    images: [
      {
        url: "/products/hydraulic-press-brake-hero.png",
        width: 1600,
        height: 900,
        alt: "ZYRON hydraulic press brake",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZYRON Heavy Industry | Industrial Sheet Metal & Duct Machinery Manufacturer",
    description:
      "ZYRON Heavy Industry manufactures shearing machines, bending machines, laser cutting machines, rolling machines, press machines, duct production equipment, and shredders for global B2B buyers.",
    images: ["/products/hydraulic-press-brake-hero.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
