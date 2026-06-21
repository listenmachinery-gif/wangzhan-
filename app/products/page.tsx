import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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

const heroStats = [
  { value: "8", label: "Machine Series" },
  { value: "40+", label: "Product Types" },
  { value: "60+", label: "Countries Served" },
];

const selectionSteps = [
  "Confirm material, thickness, and finished part.",
  "Choose cutting, bending, rolling, duct, pressing, or recycling process.",
  "Match machine model, control system, tooling, and optional automation.",
  "Receive quotation, delivery plan, installation guidance, and service support.",
];

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
        <div className="absolute inset-0 -z-10 bg-black/68" />
        <div className="absolute inset-x-0 top-0 -z-10 h-44 bg-gradient-to-b from-black/92 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-[46vh] bg-gradient-to-t from-black/94 via-black/62 to-transparent" />

        <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-[1440px] flex-col items-center justify-center text-center">
          <div className="max-w-5xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ignition drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
              Product Center
            </p>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.04] tracking-normal drop-shadow-[0_4px_22px_rgba(0,0,0,0.95)] sm:text-7xl lg:text-8xl">
              Machine Solutions for Modern Fabrication
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-zinc-200 drop-shadow-[0_3px_16px_rgba(0,0,0,0.95)] sm:text-lg">
              Start from the customer requirement: material, process, output, precision, labor level, and service plan.
              Then select the matching ZYRON machine family and configuration.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                href="#shearing-machines"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-ignition px-7 text-sm font-semibold text-white transition hover:bg-neon"
              >
                View Product Series
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center rounded-sm border border-white/35 px-7 text-sm font-semibold text-white transition hover:border-ignition hover:text-ignition"
              >
                Contact an Engineer
              </Link>
            </div>
          </div>

          <div className="mt-14 grid w-full max-w-4xl gap-5 border-y border-white/15 py-7 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <p className="text-5xl font-semibold tracking-normal text-white">{stat.value}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ignition">How to Select</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-neutral-950 sm:text-6xl">
              Build the solution before choosing the machine.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-neutral-600">
              The product center is organized around production workflows, so buyers can compare complete equipment
              options instead of evaluating isolated machines.
            </p>
          </div>
          <div className="grid gap-x-12 md:grid-cols-2">
            {selectionSteps.map((step, index) => (
              <div key={step} className="border-b border-neutral-200 py-7">
                <div className="flex items-start gap-5">
                  <span className="mt-2 h-4 w-4 shrink-0 bg-[#76B900]" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ignition">Step 0{index + 1}</p>
                    <p className="mt-2 text-lg font-semibold leading-7 text-neutral-950">{step}</p>
                  </div>
                </div>
              </div>
            ))}
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
