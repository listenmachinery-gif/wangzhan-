import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Applications & Cases | ZYRON Heavy Industry",
  description: "Application examples for sheet metal fabrication, HVAC duct manufacturing, recycling, and industrial production.",
  alternates: {
    canonical: "/cases",
  },
};

const cases = [
  {
    industry: "Sheet Metal Fabrication",
    machine: "Hydraulic Guillotine Shearing Machine + CNC Press Brake",
    challenge: "The buyer needed cleaner cutting edges and more consistent bending for cabinet panels.",
    result: "Matched cutting and bending capacity reduced rework and improved batch consistency.",
    image: "/products/detail-front.jpg",
  },
  {
    industry: "HVAC Duct Manufacturing",
    machine: "TDF Flange Forming Machine + Spiral Duct Production Line",
    challenge: "The workshop wanted to expand from manual duct forming to repeatable production.",
    result: "A combined duct equipment plan improved forming speed and reduced manual operations.",
    image: "/products/detail-feeding-balls.jpg",
  },
  {
    industry: "Metal Recycling",
    machine: "Double Shaft Shredder",
    challenge: "The plant needed stable size reduction for mixed production waste.",
    result: "High-torque shredding prepared material for downstream sorting and recovery.",
    image: "/products/detail-welded-body.jpg",
  },
];

export default function CasesPage() {
  return (
    <main className="bg-[#f4f6f8] text-[#101214]">
      <section className="px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ignition">Applications & Cases</p>
          <h1 className="mt-3 max-w-5xl text-5xl font-semibold leading-tight sm:text-7xl">
            Machine solutions for production problems buyers actually face.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-600">
            These examples show how different product series can be matched for cutting, bending, duct forming,
            rolling, pressing, and recycling workflows.
          </p>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-4">
          {cases.map((item) => (
            <article key={item.industry} className="grid overflow-hidden rounded-md bg-white shadow-sm lg:grid-cols-[0.95fr_1.05fr]">
              <div className="relative min-h-80">
                <Image src={item.image} alt={item.industry} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
              </div>
              <div className="p-7 lg:p-10">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ignition">{item.industry}</p>
                <h2 className="mt-3 text-3xl font-semibold text-neutral-950">{item.machine}</h2>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Challenge</p>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">{item.challenge}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Result</p>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">{item.result}</p>
                  </div>
                </div>
                <Link href="/contact" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-ignition">
                  Discuss a similar project
                  <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
