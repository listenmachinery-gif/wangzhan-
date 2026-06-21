import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Factory & Solutions | ZYRON Heavy Industry",
  description: "Learn about ZYRON Heavy Industry manufacturing strength, quality control, engineering support, and export services.",
  alternates: {
    canonical: "/factory",
  },
};

const strengths = [
  "Sheet metal machinery and duct production equipment under one product system",
  "Machine selection support based on material, thickness, length, and production flow",
  "Frame, transmission, safety, and control checks before delivery",
  "OEM, ODM, line matching, and spare parts support for international buyers",
];

const process = ["Requirement review", "Machine selection", "Configuration proposal", "Production and testing", "Packing and delivery", "After-sales support"];

export default function FactoryPage() {
  return (
    <main className="bg-[#f4f6f8] text-[#101214]">
      <section className="bg-graphite-950 px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ignition">Factory & Solutions</p>
            <h1 className="mt-3 text-5xl font-semibold leading-tight sm:text-7xl">Manufacturing support for practical production lines.</h1>
            <p className="mt-6 text-lg leading-8 text-zinc-300">
              ZYRON Heavy Industry supports buyers from machine selection to installation guidance, helping factories build
              dependable sheet metal, duct, forming, pressing, and recycling workflows.
            </p>
          </div>
          <div className="relative aspect-[1.24] overflow-hidden rounded-md border border-white/10">
            <Image src="/products/detail-welded-body.jpg" alt="Industrial machinery manufacturing" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-md bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ignition">Why Buyers Work With Us</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight text-neutral-950">A factory partner for mixed machinery requirements.</h2>
          </div>
          <div className="grid gap-3">
            {strengths.map((item) => (
              <div key={item} className="flex gap-3 rounded-md bg-white p-5 text-sm leading-6 text-neutral-700 shadow-sm">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-ignition" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ignition">Project Workflow</p>
          <h2 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight text-neutral-950">From first inquiry to production startup.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {process.map((step, index) => (
              <div key={step} className="rounded-md border border-neutral-200 p-6">
                <span className="text-sm font-semibold text-ignition">0{index + 1}</span>
                <h3 className="mt-3 text-xl font-semibold text-neutral-950">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
