import type { NextConfig } from "next";
import { legacyProductRedirects } from "./data/products";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      ...legacyProductRedirects,
      {
        source: "/products/round-duct-seam-closing-machine",
        destination: "/products/series/round-duct-production",
        permanent: true,
      },
      {
        source: "/products/hydraulic-punch-press",
        destination: "/products/series/press-machines",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
