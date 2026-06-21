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
    text: "Match model, working length, material thickness, control system, and optional configuration.",
    href: "/contact",
  },
  {
    icon: Wrench,
    title: "Service & Support",
    text: "Installation guidance, operator training, spare parts, remote support, and maintenance advice.",
    href: "/contact",
  },
  {
    icon: BookOpen,
    title: "Buying Guides",
    text: "Read practical guides for comparing shears, press brakes, duct machines, laser cutters, and shredders.",
    href: "/news",
  },
];

export default function Home() {
  return (
    <main className="bg-[#f4f6f8] text-[#101214]">
      <section className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden bg-graphite-950 px-5 py-16 text-white sm:px-8 lg:py-24">
        <video
          className="absolute inset-0 z-0 h-full w-full object-cover object-center"
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
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-black via-black/78 to-black/18 lg:via-black/62" />
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[54%] bg-black/34" />

        <div className="relative z-20 mx-auto flex min-h-[calc(100vh-12rem)] max-w-[1440px] flex-col items-start justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ignition">ZYRON Forming Series</p>
          <h1 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.04] tracking-normal sm:text-6xl lg:text-7xl">
            Hydraulic Press Brake
          </h1>
          <p className="mt-5 max-w-xl text-2xl font-semibold leading-tight text-white sm:text-3xl lg:text-4xl">
            Precision bending. Powerful performance. Built to last.
          </p>
          <p className="mt-6 max-w-xl text-base leading-8 text-zinc-200 sm:text-lg">
            A rigid steel body, smooth hydraulic drive, and intelligent control system come together to deliver
            accurate bends, clean edges, and dependable production — day after day.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/products/electro-hydraulic-servo-cnc-press-brake"
              className="inline-flex h-12 items-center justify-center rounded-sm bg-ignition px-6 text-sm font-semibold text-white transition hover:bg-neon"
            >
              Learn More
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-sm border border-white/35 px-6 text-sm font-semibold text-white transition hover:border-ignition hover:text-ignition"
            >
              Get a Quote
            </Link>
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
        <div className="absolute inset-0 bg-gradient-to-r from-black/94 via-black/64 to-black/18" />
        <div className="absolute inset-y-0 left-0 w-[64%] bg-[radial-gradient(circle_at_18%_50%,rgba(118,185,0,0.16),rgba(0,0,0,0)_46%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[45vh] bg-gradient-to-t from-black/94 via-black/56 to-transparent" />

        <div className="relative z-10 mx-auto grid min-h-screen max-w-[1440px] gap-10 py-16 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:py-24">
          <div className="relative isolate max-w-2xl self-center lg:self-end">
            <div className="pointer-events-none absolute -inset-x-7 -inset-y-9 -z-10 bg-[radial-gradient(ellipse_at_left,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.78)_48%,rgba(0,0,0,0)_76%)] sm:-inset-x-10 sm:-inset-y-12" />
            <div className="pointer-events-none absolute -left-8 -top-10 -bottom-10 -z-10 w-[118%] bg-gradient-to-r from-black/78 via-black/48 to-transparent blur-sm" />
            <div className="mb-6 flex items-center gap-4">
              <span className="h-px w-16 bg-ignition shadow-[0_0_18px_rgba(118,185,0,0.75)]" />
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ignition drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                Factory Showcase
              </p>
            </div>
            <h2 className="text-4xl font-semibold leading-tight text-white drop-shadow-[0_4px_22px_rgba(0,0,0,0.95)] sm:text-5xl">
              Built with scale. Proven by production.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-zinc-100 drop-shadow-[0_3px_16px_rgba(0,0,0,0.95)]">
              From precision fabrication to final assembly, ZYRON Heavy Industry brings manufacturing capacity,
              experienced teams, and global service support together under one roof.
            </p>
            <Link href="/factory" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-ignition transition hover:text-neon">
              Explore Our Factory
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="relative isolate grid gap-6 self-end sm:grid-cols-2 lg:gap-x-10">
            <div className="pointer-events-none absolute -inset-x-6 -inset-y-7 -z-10 bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.76)_0%,rgba(0,0,0,0.48)_46%,rgba(0,0,0,0)_76%)]" />
            {factoryStats.map((stat) => (
              <div
                key={stat.label}
                className="border-t border-white/25 pt-4 drop-shadow-[0_3px_16px_rgba(0,0,0,0.95)]"
              >
                <p className="text-4xl font-semibold tracking-normal text-white">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-medium uppercase tracking-[0.14em] text-zinc-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ignition">Product Categories</p>
            <h2 className="mx-auto mt-3 max-w-4xl text-4xl font-semibold leading-tight tracking-normal sm:text-6xl">
              Explore machinery by product family.
            </h2>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {productCategories.map((category) => (
              <Link key={category.id} href={`/products#${category.id}`} className="group overflow-hidden rounded-md bg-white shadow-sm">
                <div className="relative aspect-[1.25] overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ignition">{category.capability}</p>
                  <h3 className="mt-3 text-2xl font-semibold text-neutral-950">{category.navLabel}</h3>
                  <p className="mt-3 min-h-20 text-sm leading-6 text-neutral-600">{category.summary}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-ignition">
                    View Series
                    <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="certificates" className="relative min-h-screen overflow-hidden bg-graphite-950 px-5 text-white sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_44%,rgba(118,185,0,0.12),rgba(11,13,16,0)_34%)]" />
        <div className="absolute inset-y-0 left-0 w-[46%] bg-gradient-to-r from-black/55 to-transparent" />

        <div className="relative mx-auto grid min-h-screen max-w-[1440px] gap-10 py-16 sm:py-20 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:py-24">
          <div className="max-w-2xl self-center">
            <div className="mb-6 flex items-center gap-4">
              <span className="h-px w-16 bg-ignition shadow-[0_0_18px_rgba(118,185,0,0.75)]" />
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ignition drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                Certificates
              </p>
            </div>
            <h2 className="text-4xl font-semibold leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.88)] sm:text-6xl">
              Certified quality. Verified manufacturing.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300 drop-shadow-[0_3px_14px_rgba(0,0,0,0.85)]">
              Quality management, machinery compliance, business qualification, and brand registrations help every
              ZYRON machine move from factory floor to global production line with greater confidence.
            </p>

            <div className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {certificateHighlights.map((item) => (
                <div key={item} className="border-l border-ignition/75 pl-4 text-sm font-semibold leading-6 text-zinc-100 drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                  {item}
                </div>
              ))}
            </div>

            <Link href="/contact" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-ignition transition hover:text-neon">
              Request Certificate Details
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="relative min-h-[42vh] overflow-hidden rounded-md border border-white/10 bg-black shadow-[0_28px_90px_rgba(0,0,0,0.42)] sm:min-h-[50vh] lg:min-h-[72vh]">
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

      <section className="bg-graphite-950 px-5 py-14 text-white sm:px-8 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ignition">Service & Support</p>
            <h2 className="mx-auto mt-3 max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">
              Support for selection, delivery, and long-term operation.
            </h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {supportTiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <Link key={tile.title} href={tile.href} className="rounded-md border border-white/10 bg-white/[0.04] p-7 transition hover:border-ignition">
                  <Icon size={26} className="text-ignition" />
                  <h3 className="mt-5 text-2xl font-semibold">{tile.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-300">{tile.text}</p>
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

      <section className="px-5 py-14 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-[1440px] gap-4 lg:grid-cols-2">
          <div className="rounded-md bg-white p-8 shadow-sm lg:p-10">
            <PackageCheck size={28} className="text-ignition" />
            <h2 className="mt-5 text-4xl font-semibold leading-tight text-neutral-950">Where to Buy</h2>
            <p className="mt-4 text-base leading-8 text-neutral-600">
              Send your production requirements and destination country. We will recommend a model, configuration,
              optional systems, and quotation plan.
            </p>
            <Link href="/contact" className="mt-7 inline-flex items-center gap-2 rounded-sm bg-ignition px-5 py-3 text-sm font-semibold text-white transition hover:bg-neon">
              Request a Quote
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="rounded-md bg-white p-8 shadow-sm lg:p-10">
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
        <div className="mx-auto grid max-w-[1440px] gap-8 rounded-md bg-white px-6 py-12 shadow-sm sm:px-10 lg:grid-cols-[1fr_auto] lg:items-center">
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
