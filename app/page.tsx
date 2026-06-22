import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Factory, Headphones, PackageCheck, SlidersHorizontal, Wrench } from "lucide-react";
import ExhibitionCarousel from "@/components/ExhibitionCarousel";
import { productCategories } from "@/data/products";

export const metadata: Metadata = {
  title: "ZYRON Heavy Industry | Industrial Sheet Metal & Duct Machinery Manufacturer",
  description:
    "ZYRON Heavy Industry manufactures shearing machines, bending machines, laser cutting machines, rolling machines, press machines, duct production equipment, and shredders for global B2B buyers.",
  alternates: {
    canonical: "/",
  },
};

const factoryStats = [
  { value: "15+", label: "Years of Experience" },
  { value: "60+", label: "Countries Served" },
  { value: "200+", label: "Team Members" },
  { value: "10,000m²+", label: "Factory Area" },
];

const certificateHighlights = [
  "CE Machinery Directive",
  "ISO 9001 Quality Management",
  "Business Registration",
  "Trademark Protection",
];

const supportTiles = [
  {
    icon: SlidersHorizontal,
    title: "Machine Selection",
    text: "Match model, working length, material thickness, control system, tooling, and optional automation.",
    href: "/contact",
  },
  {
    icon: Wrench,
    title: "Engineering Support",
    text: "Get configuration guidance for cutting, bending, duct production, pressing, rolling, and shredding workflows.",
    href: "/contact",
  },
  {
    icon: BookOpen,
    title: "Buying Guides",
    text: "Read practical guides for comparing shears, press brakes, duct machines, laser cutters, and shredders.",
    href: "/news",
  },
];

const solutionSteps = [
  "Material and thickness",
  "Process and output",
  "Machine and automation",
  "Delivery and support",
];

function usesProductCutout(image: string) {
  return image.includes("/products/shearing/") || image.includes("/products/bending/");
}

export default function Home() {
  return (
    <main className="bg-[#f4f6f8] text-[#101214]">
      <section className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden bg-graphite-950 px-5 py-16 text-white sm:px-8 lg:py-24">
        <video
          className="absolute inset-0 z-0 h-full w-full object-cover object-center brightness-[0.48] contrast-[1.06]"
          src="/brand/zyron-hero-video.mp4"
          poster="/products/hydraulic-press-brake-hero.png"
          autoPlay
          muted
          loop
          playsInline
          controls
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

      <section className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ignition">Solutions</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-6xl">Choose by production process.</h2>
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
                href={`/products#${category.id}`}
                className="group relative min-h-[520px] overflow-hidden rounded-sm border border-white/10 bg-white/[0.03] transition hover:border-ignition"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(118,185,0,0.14),transparent_34%)] opacity-0 transition group-hover:opacity-100" />
                <div className="relative h-72 border-b border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                    className={`${usesProductCutout(category.image) ? "object-contain p-8" : "object-cover"} transition duration-700 group-hover:scale-105`}
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

      <section className="relative min-h-screen overflow-hidden bg-graphite-950 px-5 text-white sm:px-8">
        <Image
          src="/brand/factory-showcase.png"
          alt="ZYRON Heavy Industry factory exterior"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/94 via-black/62 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-[44vh] bg-gradient-to-t from-black/96 via-black/58 to-transparent" />

        <div className="relative z-10 mx-auto grid min-h-screen max-w-[1440px] gap-10 py-16 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:items-end lg:py-24">
          <div className="max-w-2xl self-center lg:self-end">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ignition">Company Strength</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight drop-shadow-[0_4px_22px_rgba(0,0,0,0.95)] sm:text-6xl">
              Manufacturing capacity behind every solution.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-zinc-100 drop-shadow-[0_3px_16px_rgba(0,0,0,0.95)]">
              From precision fabrication to final assembly, ZYRON Heavy Industry brings production scale, experienced
              teams, and global support together under one roof.
            </p>
            <Link href="/factory" className="mt-8 inline-flex items-center gap-2 rounded-sm border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:border-ignition hover:text-ignition">
              Explore Company
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-6 self-end sm:grid-cols-2 lg:gap-x-10">
            {factoryStats.map((stat) => (
              <div key={stat.label} className="border-t border-white/25 pt-5">
                <p className="text-5xl font-semibold tracking-normal text-white">{stat.value}</p>
                <p className="mt-2 text-sm font-medium uppercase tracking-[0.14em] text-zinc-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      <section className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ignition">Support</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-6xl">From selection to operation.</h2>
            </div>
            <p className="max-w-3xl text-base leading-8 text-zinc-400">
              The right machine is a complete operating plan. ZYRON supports model selection, optional configuration,
              delivery preparation, installation guidance, and long-term spare parts planning.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {supportTiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <Link key={tile.title} href={tile.href} className="rounded-sm border border-white/10 bg-white/[0.04] p-7 transition hover:border-ignition">
                  <Icon size={28} className="text-ignition" />
                  <h3 className="mt-5 text-2xl font-semibold">{tile.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{tile.text}</p>
                  <span className="mt-7 inline-flex items-center gap-1 text-sm font-semibold text-white">
                    Learn More
                    <ArrowRight size={15} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

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
              Subscribe for product releases, machine selection guides, and practical equipment configuration notes.
            </p>
          </div>
          <div className="flex w-full max-w-md gap-2 lg:w-[420px]">
            <input className="h-12 min-w-0 flex-1 rounded-sm border border-neutral-200 px-3 text-sm outline-none focus:border-ignition" placeholder="Email address" />
            <button className="rounded-sm bg-ignition px-5 text-sm font-semibold text-white transition hover:bg-neon">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
