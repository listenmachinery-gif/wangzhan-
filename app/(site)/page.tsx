import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Factory, Headphones, PackageCheck } from "lucide-react";
import ExhibitionCarousel from "@/components/ExhibitionCarousel";
import { PageRenderer } from "@/components/page-builder/PageRenderer";
import { HomeBannerCarousel } from "@/components/site/HomeBannerCarousel";
import { ManagedCompanyStrength } from "@/components/site/ManagedCompanyStrength";
import { ManagedWhyChoose } from "@/components/site/ManagedWhyChoose";
import { LatestShippingHighlights } from "@/components/site/LatestShippingHighlights";
import { getCategoryHref, productCategories } from "@/data/products";
import { listActiveBanners } from "@/lib/repositories/banner-repository";
import { getPublishedPageBySlug } from "@/lib/repositories/page-repository";
import { listLatestPublishedShippingHighlights } from "@/lib/repositories/shipping-highlight-repository";
import { overlayPublishedSeo } from "@/lib/repositories/seo-repository";

export const dynamic = "force-dynamic";

const fallbackMetadata: Metadata = {
  title: "ZYRON Heavy Industry | Industrial Sheet Metal & Duct Machinery Manufacturer",
  description:
    "ZYRON Heavy Industry manufactures shearing machines, bending machines, laser cutting machines, rolling machines, press machines, duct production equipment, and shredders for global B2B buyers.",
  alternates: {
    canonical: "/",
  },
};

export function generateMetadata() {
  return overlayPublishedSeo("/", fallbackMetadata);
}

const certificateHighlights = [
  "CE Machinery Directive",
  "ISO 9001 Quality Management",
  "Business Registration",
  "Trademark Protection",
];

const solutionSteps = [
  "Material and thickness",
  "Process and output",
  "Machine and automation",
  "Delivery and support",
];

function usesProductCutout(image: string) {
  return (
    image.includes("/products/catalog/") ||
    image.includes("/products/shearing/") ||
    image.includes("/products/bending/") ||
    image.includes("/products/home-categories/")
  );
}

export default async function Home() {
  const [banners, publishedPage, shippingHighlights] = await Promise.all([
    listActiveBanners(),
    getPublishedPageBySlug("home"),
    listLatestPublishedShippingHighlights(3),
  ]);
  // A full CMS template is opt-in; legacy homepage remains intact until published with a HERO block.
  if (publishedPage?.nodes.some((node) => node.type === "HERO")) {
    return <main className="bg-[#f4f6f8] text-[#101214]"><PageRenderer document={publishedPage} /></main>;
  }
  const managedFactory = publishedPage?.nodes.find((node) => node.type === "FACTORY_STATS");
  const managedAdvantages = publishedPage?.nodes.find((node) => node.type === "ADVANTAGES");
  const additionalManagedNodes = publishedPage?.nodes.filter((node) => node.type !== "FACTORY_STATS" && node.type !== "ADVANTAGES") ?? [];
  return (
    <main className="bg-[#f4f6f8] text-[#101214]">
      {banners.length ? <HomeBannerCarousel banners={banners} /> : (
      <section className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden bg-graphite-950 px-5 py-16 text-white sm:px-8 lg:py-24">
        <video
          className="absolute inset-0 z-0 h-full w-full object-cover object-center brightness-[0.48] contrast-[1.06]"
          src="/brand/zyron-hero-video.mp4"
          poster="/products/hydraulic-press-brake-hero.png"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="ZYRON hydraulic press brake production video"
        />
        <div className="pointer-events-none absolute inset-0 z-10 bg-black/72" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-44 bg-gradient-to-b from-black/95 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[46vh] bg-gradient-to-t from-black/96 via-black/70 to-transparent" />

        <div className="relative z-20 mx-auto flex min-h-[calc(100vh-12rem)] max-w-[1440px] flex-col items-center justify-center text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-ignition">ZYRON Heavy Industry</p>
          <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl">
            Complete Sheet Metal Machinery Solutions
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-200 sm:text-lg">
            Cutting, bending, rolling, pressing, HVAC duct production, and recycling equipment configured around your
            material, output, factory layout, and long-term service needs.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center rounded-sm bg-ignition px-7 text-sm font-semibold text-white transition hover:bg-neon"
            >
              Explore Solutions
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-sm border border-white/45 px-7 text-sm font-semibold text-white transition hover:border-ignition hover:text-ignition"
            >
              Quote Now
            </Link>
          </div>

          <div className="mt-14 grid w-full max-w-4xl gap-5 border-y border-white/15 py-7 sm:grid-cols-4">
            {solutionSteps.map((step, index) => (
              <div key={step} className="text-left sm:text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ignition">0{index + 1}</p>
                <p className="mt-2 text-sm font-semibold text-white">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      <section className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ignition">Solutions</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-6xl">Choose by production process.</h2>
            </div>
            <p className="max-w-3xl text-base leading-8 text-zinc-400 lg:justify-self-end">
              Instead of starting from a single machine name, ZYRON helps buyers define the full workflow: process,
              material, accuracy, labor level, optional automation, and service plan.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {productCategories.map((category) => (
              <Link
                key={category.id}
                href={getCategoryHref(category.id)}
                className="group relative min-h-[540px] overflow-hidden rounded-sm border border-white/10 bg-white/[0.03] transition hover:border-ignition"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(118,185,0,0.14),transparent_34%)] opacity-0 transition group-hover:opacity-100" />
                <div className="relative h-80 border-b border-white/10 bg-gradient-to-b from-white/[0.08] to-transparent">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                    className={`${usesProductCutout(category.image) ? "object-contain p-2 sm:p-3" : "object-contain p-2 sm:p-3"} transition duration-700`}
                  />
                </div>
                <div className="relative p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ignition">{category.capability}</p>
                  <h3 className="mt-3 text-2xl font-semibold leading-tight text-white">{category.name}</h3>
                  <p className="mt-4 text-sm leading-6 text-zinc-400">{category.summary}</p>
                  <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white">
                    View Solution
                    <ArrowRight size={15} className="transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ManagedCompanyStrength node={managedFactory} />

      <section id="certificates" className="relative overflow-hidden bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_35%,rgba(118,185,0,0.14),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ignition">Certificates</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-6xl">Certified quality. Verified manufacturing.</h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-zinc-400">
              Quality management, machinery compliance, business qualification, and brand registrations support global
              procurement decisions.
            </p>
            <div className="mt-8 grid gap-4">
              {certificateHighlights.map((item) => (
                <div key={item} className="border-l-2 border-ignition pl-4 text-sm font-semibold leading-6 text-zinc-100">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[48vh] overflow-hidden rounded-sm border border-white/10 bg-black shadow-[0_28px_90px_rgba(0,0,0,0.42)] lg:min-h-[68vh]">
            <Image
              src="/brand/certificates-showcase.png"
              alt="ZYRON certificates and business registration documents"
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-contain"
            />
          </div>
        </div>
      </section>

      <ExhibitionCarousel />

      <ManagedWhyChoose node={managedAdvantages} />
      {additionalManagedNodes.length ? <PageRenderer document={{ schemaVersion: 1, nodes: additionalManagedNodes }} /> : null}
      <LatestShippingHighlights highlights={shippingHighlights} />

      <section className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-[1440px] gap-4 lg:grid-cols-2">
          <div className="rounded-sm bg-white p-8 shadow-sm lg:p-10">
            <PackageCheck size={28} className="text-ignition" />
            <h2 className="mt-5 text-4xl font-semibold leading-tight text-neutral-950">Where to Buy</h2>
            <p className="mt-4 text-base leading-8 text-neutral-600">
              Send material type, thickness, working length, target output, voltage, and destination country. Our team
              will return a practical machine configuration and quotation plan.
            </p>
            <Link href="/contact" className="mt-7 inline-flex items-center gap-2 rounded-sm bg-ignition px-5 py-3 text-sm font-semibold text-white transition hover:bg-neon">
              Request a Quote
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="rounded-sm bg-white p-8 shadow-sm lg:p-10">
            <Headphones size={28} className="text-ignition" />
            <h2 className="mt-5 text-4xl font-semibold leading-tight text-neutral-950">Contact Support</h2>
            <p className="mt-4 text-base leading-8 text-neutral-600">
              Need spare parts, technical guidance, machine matching, or after-sales support? Contact our engineering
              team with model photos and production details.
            </p>
            <Link href="/contact" className="mt-7 inline-flex items-center gap-2 rounded-sm border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:border-ignition hover:text-ignition">
              Contact an Engineer
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8">
        <div className="mx-auto grid max-w-[1440px] gap-8 rounded-sm bg-white px-6 py-12 shadow-sm sm:px-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-ignition">
              <Factory size={18} />
              Manufacturing updates
            </div>
            <h2 className="text-3xl font-semibold sm:text-5xl">Stay updated on new machines and production solutions.</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600">
              Read product releases, machine selection guides, and practical equipment configuration notes.
            </p>
          </div>
          <Link href="/news" className="inline-flex h-12 w-fit items-center gap-2 rounded-sm bg-ignition px-5 text-sm font-semibold text-white transition hover:bg-neon">
            Read Company News
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
