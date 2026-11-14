import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Insights | ZYRON Heavy Industry",
  description: "Buying guides and machinery selection insights for sheet metal, duct production, and recycling equipment.",
  alternates: {
    canonical: "/news",
  },
};

const articles = [
  {
    title: "How to choose a shearing machine for sheet thickness and working length",
    tag: "Buying Guide",
    text: "A practical overview of drive mode, blade clearance, back gauge, cutting capacity, and workshop output.",
  },
  {
    title: "NC press brake or CNC press brake: which configuration fits your factory?",
    tag: "Bending",
    text: "Compare control accuracy, budget, tooling flexibility, operator workflow, and batch production requirements.",
  },
  {
    title: "Building an HVAC duct production line from single machines",
    tag: "Duct Production",
    text: "Understand how beading, lock forming, flange forming, seam closing, and spiral duct machines fit together.",
  },
];

export default function NewsPage() {
  return (
    <main className="bg-[#f4f6f8] text-[#101214]">
      <section className="bg-graphite-950 px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ignition">Insights</p>
          <h1 className="mt-3 max-w-5xl text-5xl font-semibold leading-tight sm:text-7xl">
            Machinery selection notes for international buyers.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
            Clear, practical guidance for comparing machine types, planning production capacity, and preparing inquiry details.
          </p>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          {articles.map((article) => (
            <article key={article.title} className="rounded-md bg-white p-7 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ignition">{article.tag}</p>
              <h2 className="mt-4 text-2xl font-semibold leading-tight text-neutral-950">{article.title}</h2>
              <p className="mt-4 text-sm leading-6 text-neutral-600">{article.text}</p>
              <Link href="/contact" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-ignition">
                Ask an engineer
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
