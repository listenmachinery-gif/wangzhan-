import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  ClipboardCheck,
  Layers3,
  MoveUpRight,
} from "lucide-react";
import { electricFoldingMachinePageContent } from "@/data/electric-folding-machine-page";
import type { Product } from "@/data/products";

type ElectricFoldingMachineSolutionPageProps = {
  product: Product;
};

const lightSectionLabelClass =
  "text-xs font-semibold uppercase tracking-[0.2em] text-[#4E7A00]";
const darkSectionLabelClass =
  "text-xs font-semibold uppercase tracking-[0.2em] text-[#76B900]";

const splitColumnHeading = (column: string) => {
  const normalized = column.replace(/\s+/g, " ").trim();
  const match = normalized.match(/^(.*?)(\([^()]+\))$/);

  return match
    ? { label: match[1].trim(), unit: match[2] }
    : { label: normalized, unit: "" };
};

const jsonLd = (value: object) =>
  JSON.stringify(value).replace(/</g, "\\u003c");

function SectionIntro({
  label,
  title,
  text,
  light = false,
}: {
  label: string;
  title: string;
  text?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-4xl">
      <p className={light ? darkSectionLabelClass : lightSectionLabelClass}>{label}</p>
      <h2
        className={`mt-4 text-3xl font-semibold leading-tight sm:text-5xl ${
          light ? "text-white" : "text-neutral-950"
        }`}
      >
        {title}
      </h2>
      {text ? (
        <p
          className={`mt-6 max-w-3xl text-base leading-8 ${
            light ? "text-zinc-400" : "text-neutral-600"
          }`}
        >
          {text}
        </p>
      ) : null}
    </div>
  );
}

function FoldingDiagram() {
  return (
    <div className="relative overflow-hidden border border-white/10 bg-[#111417] p-6 sm:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(118,185,0,0.12),transparent_34%)]" />
      <svg
        viewBox="0 0 640 430"
        role="img"
        aria-label="Electric drive, sheet clamping and edge folding process diagram"
        className="relative h-auto w-full"
      >
        <defs>
          <linearGradient id="folding-sheet" x1="0" x2="1">
            <stop offset="0" stopColor="#A8B0B7" />
            <stop offset="1" stopColor="#59636C" />
          </linearGradient>
        </defs>
        <path d="M84 284H556V344H84Z" fill="#20262B" stroke="#4D565E" strokeWidth="3" />
        <path d="M116 251H528V284H116Z" fill="#2D343A" stroke="#77818A" strokeWidth="3" />
        <path d="M139 230H501V251H139Z" fill="url(#folding-sheet)" stroke="#D5DADE" strokeWidth="2" />
        <path d="M139 230H342L435 137H501V251H139Z" fill="url(#folding-sheet)" opacity="0.28" />
        <path d="M342 230L435 137" fill="none" stroke="#76B900" strokeWidth="6" strokeLinecap="round" />
        <path d="M308 218A88 88 0 0 1 391 153" fill="none" stroke="#76B900" strokeWidth="3" strokeDasharray="8 8" />
        <path d="M382,142L405,147,390,166" fill="none" stroke="#76B900" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M166 172H306" fill="none" stroke="#8C969E" strokeWidth="8" strokeLinecap="round" />
        <path d="M184 172V224M288 172V224" fill="none" stroke="#59636C" strokeWidth="6" />
        <rect x="92" y="140" width="74" height="64" rx="4" fill="#20262B" stroke="#76B900" strokeWidth="4" />
        <circle cx="129" cy="172" r="17" fill="#111417" stroke="#A8B0B7" strokeWidth="3" />
        <path d="M118 172H140M129 161V183M166 172H184" fill="none" stroke="#76B900" strokeWidth="4" strokeLinecap="round" />
        <text x="84" y="392" fill="#A1A1AA" fontSize="18" fontFamily="Arial, sans-serif">
          DRIVE
        </text>
        <text x="286" y="392" fill="#FFFFFF" fontSize="18" fontFamily="Arial, sans-serif">
          FOLD
        </text>
        <text x="483" y="392" fill="#A1A1AA" fontSize="18" fontFamily="Arial, sans-serif">
          CHECK
        </text>
      </svg>
    </div>
  );
}

export default function ElectricFoldingMachineSolutionPage({
  product,
}: ElectricFoldingMachineSolutionPageProps) {
  const content = electricFoldingMachinePageContent;
  const technicalParameters = product.technicalParameters;
  const productUrl =
    "https://www.zyroncnc.com/products/electric-sheet-metal-folding-machine";
  const productImage = `https://www.zyroncnc.com${product.image}`;

  if (!technicalParameters) {
    throw new Error("Electric Folding Machine technical parameters are required");
  }

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "ProductModel",
    name: content.hero.title,
    description: content.hero.description,
    image: productImage,
    url: productUrl,
    category: "Electric Sheet Metal Folding Machine",
    brand: {
      "@type": "Brand",
      name: "ZYRON",
    },
    manufacturer: {
      "@type": "Organization",
      name: "ZYRON Heavy Industry",
      url: "https://www.zyroncnc.com",
    },
    additionalProperty: technicalParameters.rows.flatMap((row) =>
      technicalParameters.columns.map((column, index) => ({
        "@type": "PropertyValue",
        name: `${row[0]} — ${column}`,
        value: row[index] ?? "",
      })),
    ),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Products",
        item: "https://www.zyroncnc.com/products",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Bending Machines",
        item: "https://www.zyroncnc.com/products/series/bending-machines",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: content.hero.title,
        item: productUrl,
      },
    ],
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <main
      data-product-solution-page="electric-sheet-metal-folding-machine"
      className="overflow-x-hidden bg-white text-[#101214]"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }}
      />

      <section
        data-section="hero"
        className="relative isolate overflow-hidden bg-[#0B0D10] px-5 py-12 text-white sm:px-8 lg:py-20"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_34%,rgba(118,185,0,0.12),transparent_30%),linear-gradient(135deg,#0B0D10_0%,#15191D_62%,#08090A_100%)]" />
        <div className="industrial-grid absolute inset-0 -z-10 opacity-30" />
        <div className="mx-auto max-w-[1440px]">
          <Link
            href="/products/series/bending-machines"
            className="inline-flex items-center gap-2 text-sm text-zinc-300 transition hover:text-white"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Bending Machines
          </Link>

          <div className="mt-10 grid min-w-0 gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center xl:gap-20">
            <div className="min-w-0">
              <h1 className="max-w-3xl text-4xl font-semibold leading-[1.04] text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                {content.hero.title}
              </h1>
              <p className="mt-6 max-w-2xl text-xl font-medium leading-8 text-zinc-100 sm:text-2xl sm:leading-9">
                {content.hero.subtitle}
              </p>
              <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400">
                {content.hero.description}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/contact"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#76B900] px-6 py-3.5 text-sm font-semibold text-[#111417] transition hover:bg-[#8ddb00] sm:w-auto"
                >
                  {content.hero.primaryCta}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex w-full items-center justify-center rounded-sm border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-[#76B900] hover:text-[#8ddb00] sm:w-auto"
                >
                  {content.hero.secondaryCta}
                </Link>
              </div>

              <div className="mt-10 grid gap-x-7 gap-y-4 border-t border-white/15 pt-7 sm:grid-cols-2">
                {content.hero.proofPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3 text-sm leading-6 text-zinc-300">
                    <Check className="mt-1 shrink-0 text-[#76B900]" size={15} aria-hidden="true" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-w-0 lg:pl-4">
              <div className="absolute -inset-4 bg-[radial-gradient(circle_at_center,rgba(118,185,0,0.16),transparent_62%)] blur-2xl" />
              <div className="relative overflow-hidden border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.015))] px-4 pb-7 pt-4 shadow-[0_35px_90px_rgba(0,0,0,0.42)] sm:px-8 sm:pb-10 sm:pt-7">
                <div className="relative aspect-[1.3] min-w-0">
                  <Image
                    src={product.image}
                    alt="Electric folding machine for sheet metal edge bending"
                    fill
                    loading="lazy"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-contain"
                  />
                </div>
                <div className="mx-auto h-px w-4/5 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-section="problems" className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
            <div>
              <p className={lightSectionLabelClass}>Customer Challenges</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-neutral-950 sm:text-5xl">
                What Problems Can It Solve?
              </h2>
              <p className="mt-6 text-base leading-8 text-neutral-600">
                Start with the sheet, batch size, work location and finished edge—not only the machine name.
              </p>
            </div>
            <div className="grid border-t border-neutral-200 md:grid-cols-2">
              {content.problems.map((problem, index) => (
                <article
                  key={problem.title}
                  className={`border-b border-neutral-200 py-7 transition duration-200 hover:-translate-y-0.5 md:px-7 ${
                    index % 2 === 1 ? "md:border-l" : "md:pl-0"
                  }`}
                >
                  <p className="text-sm font-semibold text-[#4E7A00]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold leading-snug text-neutral-950">
                    {problem.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-neutral-600">{problem.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        data-section="solutions"
        className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Solution Fit"
            title="Electric Sheet Metal Folding Solutions"
            text="Three practical use profiles help match electric folding to the production rhythm, material and finished-part requirement."
            light
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {content.solutions.map((solution, index) => (
              <article
                key={solution.title}
                className="group border border-white/10 bg-[#111417] p-7 transition duration-200 hover:-translate-y-1 hover:border-[#76B900]/60 sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#76B900]">
                    0{index + 1}
                  </span>
                  <MoveUpRight
                    size={20}
                    className="text-zinc-600 transition group-hover:text-[#76B900]"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-8 text-2xl font-semibold text-white">{solution.title}</h3>
                <dl className="mt-7 space-y-6">
                  {[
                    ["Suitable for", solution.suitableFor],
                    ["Recommended use", solution.recommendedUse],
                    ["Production value", solution.productionValue],
                  ].map(([label, value]) => (
                    <div key={label} className="border-t border-white/10 pt-4">
                      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300">
                        {label}
                      </dt>
                      <dd className="mt-2 text-sm leading-7 text-zinc-300">{value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        data-section="applications"
        className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Applications"
            title="Where Electric Folding Fits"
            text="Powered edge folding supports duct fabrication, roofing, enclosures and mixed thin-sheet workshop requirements."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {content.applications.map((application) => (
              <article
                key={application.title}
                className="group border border-neutral-200 bg-white p-4 shadow-[0_15px_40px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-1 hover:border-[#76B900]/50"
              >
                <div className="relative aspect-video overflow-hidden bg-neutral-900">
                  <Image
                    src={application.image}
                    alt={application.alt}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>
                <div className="px-2 pb-3 pt-5">
                  <h3 className="text-lg font-semibold leading-snug text-neutral-950">
                    {application.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-neutral-600">{application.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        data-section="materials"
        className="bg-[#111417] px-5 py-16 text-white sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
            <SectionIntro
              label="Materials"
              title="Confirm Strength, Thickness and Folding Length Together"
              text={content.materialNote}
              light
            />
            <div className="grid border-t border-white/15 sm:grid-cols-2">
              {content.materials.map((material, index) => (
                <article
                  key={material.title}
                  className={`border-b border-white/15 py-6 sm:px-6 ${
                    index % 2 === 1 ? "sm:border-l" : "sm:pl-0"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Layers3 size={18} className="text-[#76B900]" aria-hidden="true" />
                    <h3 className="font-semibold text-white">{material.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">{material.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section data-section="process" className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Process Flow"
            title="From Flat Sheet to Folded Part"
            text="A clear powered sequence keeps cutting, positioning, clamping, folding and angle checking connected to the next process."
          />
          <div className="relative mt-14 grid gap-4 lg:grid-cols-6 lg:gap-0">
            <div className="absolute left-16 right-16 top-6 hidden h-px bg-neutral-300 lg:block" />
            {content.process.map((step, index) => (
              <article key={step.title} className="relative border border-neutral-200 bg-white p-6 lg:border-0 lg:bg-transparent lg:px-4 lg:py-0">
                <div className="relative z-10 flex h-12 w-12 items-center justify-center border border-neutral-300 bg-white text-sm font-semibold text-[#4E7A00] lg:mx-auto">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-neutral-950 lg:text-center">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-neutral-600 lg:text-center">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        data-section="advantages"
        className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
          <FoldingDiagram />
          <div>
            <p className={darkSectionLabelClass}>Verified Machine Value</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-5xl">
              Why Choose This Electric Folding Machine?
            </h2>
            <div className="mt-8 grid gap-x-8 sm:grid-cols-2">
              {content.advantages.map((advantage) => (
                <article key={advantage.title} className="border-t border-white/15 py-5">
                  <h3 className="flex items-start gap-3 font-semibold leading-6 text-white">
                    <Check className="mt-1 shrink-0 text-[#76B900]" size={16} aria-hidden="true" />
                    {advantage.title}
                  </h3>
                  <p className="mt-3 pl-7 text-sm leading-7 text-zinc-400">{advantage.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        data-section="comparison"
        className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Selection Comparison"
            title="Manual vs Electric vs Hydraulic Folding Machines"
            text="Each drive method fits a different production rhythm, load and workshop setup. Compare the requirements before selecting a machine."
          />
          <div className="mt-12 max-w-full overflow-x-auto border border-neutral-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
            <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
              <caption className="sr-only">
                Comparison of manual, electric and hydraulic folding machines
              </caption>
              <thead className="bg-[#111417] text-white">
                <tr>
                  <th className="whitespace-nowrap px-5 py-5 font-semibold">Comparison Item</th>
                  <th className="whitespace-nowrap px-5 py-5 font-semibold">Manual Folding Machine</th>
                  <th className="whitespace-nowrap px-5 py-5 font-semibold">Electric Folding Machine</th>
                  <th className="whitespace-nowrap px-5 py-5 font-semibold">Hydraulic Folding Machine</th>
                </tr>
              </thead>
              <tbody>
                {content.comparison.map((row) => (
                  <tr key={row.item} className="border-t border-neutral-200 align-top">
                    <th scope="row" className="whitespace-nowrap px-5 py-5 font-semibold text-neutral-950">{row.item}</th>
                    <td className="px-5 py-5 leading-7 text-neutral-600">{row.manual}</td>
                    <td className="px-5 py-5 leading-7 text-neutral-600">{row.electric}</td>
                    <td className="px-5 py-5 leading-7 text-neutral-600">{row.hydraulic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section
        data-section="equipment"
        className="bg-[#111417] px-5 py-16 text-white sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Supporting Equipment"
            title="Build a Simple Sheet Metal / Duct Fabrication Workflow"
            text={content.equipmentSummary}
            light
          />
          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-7">
            {content.equipment.map((machine, index) => (
              <Link
                key={machine.title}
                href={machine.href}
                className="group flex min-h-52 flex-col border border-white/10 bg-[#0B0D10] p-5 transition duration-200 hover:-translate-y-1 hover:border-[#76B900]/60"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#76B900]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <ChevronRight size={17} className="text-zinc-600 transition group-hover:text-[#76B900]" aria-hidden="true" />
                </div>
                <h3 className="mt-7 text-base font-semibold leading-6 text-white">{machine.title}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">{machine.role}</p>
              </Link>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3 border-t border-white/10 pt-8">
            {content.relatedLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="inline-flex items-center gap-2 border border-white/15 px-4 py-2.5 text-sm text-zinc-300 transition hover:border-[#76B900] hover:text-white"
              >
                {link.label}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section data-section="selection" className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div>
            <p className={lightSectionLabelClass}>Configuration Guide</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-neutral-950 sm:text-5xl">
              How to Choose the Right Electric Folding Machine?
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-neutral-600">
              A usable recommendation begins with the real sheet and finished edge requirement. Share these details before model confirmation.
            </p>
            <div className="mt-10 grid border-t border-neutral-200 sm:grid-cols-2">
              {content.selectionQuestions.map((question, index) => (
                <div
                  key={question}
                  className={`flex gap-4 border-b border-neutral-200 py-5 sm:px-5 ${
                    index % 2 === 1 ? "sm:border-l" : "sm:pl-0"
                  }`}
                >
                  <span className="font-semibold text-[#4E7A00]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm font-medium leading-6 text-neutral-800">{question}</p>
                </div>
              ))}
            </div>
          </div>
          <aside className="self-start border-t-2 border-[#76B900] bg-[#111417] p-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.15)] sm:p-9 lg:sticky lg:top-28">
            <ClipboardCheck size={32} className="text-[#76B900]" aria-hidden="true" />
            <h3 className="mt-7 text-2xl font-semibold leading-tight">
              {content.selectionCta.title}
            </h3>
            <p className="mt-5 text-sm leading-7 text-zinc-400">
              Include the material, maximum thickness, bending length, flange size, required angle and expected daily quantity.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#76B900] px-5 py-3.5 text-sm font-semibold text-[#111417] transition hover:bg-[#8ddb00]"
            >
              {content.selectionCta.cta}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <div className="mt-7 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 text-xs leading-5 text-zinc-300">
              <span>Workshop or job site</span>
              <span>Single machine or workflow</span>
            </div>
          </aside>
        </div>
      </section>

      <section
        data-section="technical"
        className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-[1440px]">
          <SectionIntro
            label="Verified Data"
            title={content.technical.title}
            text="The table below preserves the existing confirmed model data. Match the row to the material and folding requirement before quotation."
          />
          <div className="mt-12 max-w-full overflow-x-auto border border-neutral-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
            <table className="w-full min-w-[1120px] border-collapse text-center text-sm">
              <caption className="sr-only">
                Electric folding machine technical parameters by DWS model
              </caption>
              <thead className="bg-[#111417] text-white">
                <tr>
                  {technicalParameters.columns.map((column) => {
                    const heading = splitColumnHeading(column);

                    return (
                      <th
                        key={column}
                        scope="col"
                        className="whitespace-nowrap px-5 py-5 text-center font-semibold"
                      >
                        {heading.label}
                        {heading.unit ? (
                          <span className="mt-1 block text-center text-xs font-medium text-zinc-300">
                            {heading.unit}
                          </span>
                        ) : null}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {technicalParameters.rows.map((row) => (
                  <tr key={row.join("-")} className="border-t border-neutral-200 even:bg-neutral-50">
                    {row.map((value, index) =>
                      index === 0 ? (
                        <th
                          key={`${row[0]}-${technicalParameters.columns[index]}`}
                          scope="row"
                          className="whitespace-nowrap border-r border-neutral-200 px-5 py-5 font-semibold text-neutral-950 last:border-r-0"
                        >
                          {value}
                        </th>
                      ) : (
                        <td
                          key={`${row[0]}-${technicalParameters.columns[index]}`}
                          className="whitespace-nowrap border-r border-neutral-200 px-5 py-5 text-neutral-700 last:border-r-0"
                        >
                          {value}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 text-sm leading-7 text-neutral-600">
            {content.technical.note}
          </p>
        </div>
      </section>

      <section
        data-section="faq"
        className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <p className={darkSectionLabelClass}>FAQ</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-5xl">
              Electric Folding Machine Questions
            </h2>
            <p className="mt-6 text-base leading-8 text-zinc-400">
              Practical answers for capacity confirmation, material matching and workflow planning.
            </p>
          </div>
          <div className="border-t border-white/15">
            {content.faqs.map((faq, index) => (
              <details key={faq.question} className="group border-b border-white/15">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-left font-semibold leading-7 text-white marker:content-none">
                  <span className="flex gap-4">
                    <span className="text-[#76B900]">{String(index + 1).padStart(2, "0")}</span>
                    {faq.question}
                  </span>
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center border border-white/20 text-[#76B900] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="pb-7 pl-10 pr-8 text-sm leading-7 text-zinc-400">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section
        data-section="cta"
        className="relative isolate overflow-hidden bg-[#15191D] px-5 py-16 text-white sm:px-8 lg:py-24"
      >
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(105deg,rgba(118,185,0,0.17),transparent_44%),radial-gradient(circle_at_90%_10%,rgba(255,255,255,0.07),transparent_30%)]" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-4xl">
            <p className={darkSectionLabelClass}>Next Step</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-5xl">
              {content.finalCta.title}
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300">{content.finalCta.text}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#76B900] px-6 py-3.5 text-sm font-semibold text-[#111417] transition hover:bg-[#8ddb00] sm:w-auto"
            >
              {content.finalCta.primaryCta}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center rounded-sm border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-[#76B900] hover:text-[#8ddb00] sm:w-auto"
            >
              {content.finalCta.secondaryCta}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
