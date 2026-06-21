import Image from "next/image";
import Link from "next/link";
import { ProductCatalog } from "@/components/ProductCatalog";
import { productCategories, products } from "@/data/products";

export const metadata = {
  title: "Products | ZYRON Heavy Industry",
  description:
    "Explore shearing machines, bending machines, laser cutting machines, rolling machines, press machines, duct production equipment, and shredders from ZYRON Heavy Industry.",
  alternates: {
    canonical: "/products",
  },
};

export default function ProductsPage() {
  return (
    <main className="bg-[#f4f6f8] text-[#101214]">
      <section className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24">
        <Image
          src="/products/product-center-hero.png"
          alt="Precision sheet metal parts produced by ZYRON machinery"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/96 via-black/72 to-black/16" />
        <div className="absolute inset-y-0 left-0 -z-10 w-[58%] bg-[radial-gradient(ellipse_at_left,rgba(0,0,0,0.96)_0%,rgba(0,0,0,0.78)_48%,rgba(0,0,0,0)_76%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-52 bg-gradient-to-t from-black/78 to-transparent" />

        <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-[1440px] items-center">
          <div className="relative isolate max-w-3xl">
            <div className="pointer-events-none absolute -inset-x-7 -inset-y-9 -z-10 bg-[radial-gradient(ellipse_at_left,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.55)_54%,rgba(0,0,0,0)_78%)] sm:-inset-x-10 sm:-inset-y-12" />
            <div className="mb-6 flex items-center gap-4">
              <span className="h-px w-16 bg-ignition shadow-[0_0_18px_rgba(118,185,0,0.75)]" />
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ignition drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                Product Center
              </p>
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-normal drop-shadow-[0_4px_22px_rgba(0,0,0,0.95)] sm:text-7xl">
              Machinery solutions for cutting, forming, duct production, and recycling.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-200 drop-shadow-[0_3px_16px_rgba(0,0,0,0.95)]">
              Compare machine categories, review product types, and choose the right equipment for your material,
              working length, production volume, and automation requirements.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="#shearing-machines"
                className="inline-flex h-12 items-center justify-center rounded-sm bg-ignition px-6 text-sm font-semibold text-white transition hover:bg-neon"
              >
                View Product Series
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center rounded-sm border border-white/35 px-6 text-sm font-semibold text-white transition hover:border-ignition hover:text-ignition"
              >
                Contact an Engineer
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ProductCatalog products={products} categories={productCategories} />

      <section className="px-5 pb-16 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-md bg-graphite-950 px-6 py-14 text-center text-white sm:px-10 lg:grid-cols-[1fr_auto] lg:items-center lg:text-left">
          <div>
            <h2 className="text-3xl font-semibold sm:text-5xl">Not sure which machine fits your production line?</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300">
              Share your material, thickness, working length, daily output, and destination country. Our engineers
              will help you choose a practical machine configuration.
            </p>
          </div>
          <a
            href="/contact"
            className="inline-flex h-11 items-center justify-center rounded-sm bg-ignition px-6 text-sm font-semibold text-white transition hover:bg-neon"
          >
            Contact an Engineer
          </a>
        </div>
      </section>
    </main>
  );
}
