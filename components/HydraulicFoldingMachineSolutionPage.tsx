import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  ClipboardCheck,
  Droplets,
  Layers3,
  MoveUpRight,
} from "lucide-react";
import { hydraulicFoldingMachinePageContent } from "@/data/hydraulic-folding-machine-page";
import type { Product } from "@/data/products";

type HydraulicFoldingMachineSolutionPageProps = {
  product: Product;
};

const lightSectionLabelClass =
  "text-xs font-semibold uppercase tracking-[0.2em] text-[#4E7A00]";
const darkSectionLabelClass =
  "text-xs font-semibold uppercase tracking-[0.2em] text-[#76B900]";

const unitByColumn: Record<string, string> = {
  "Processing Plate Thickness": "mm",
  "Maximum Folding Width": "mm",
  "Motor Power": "kW",
  "Machine Weight": "kg",
};

const inferColumnUnit = (column: string) => unitByColumn[column] ?? "";
const stripDisplayUnit = (value: string, unit: string) =>
  unit ? value.replace(new RegExp(`\\s*${unit}$`, "i"), "") : value;
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

export default function HydraulicFoldingMachineSolutionPage({
  product,
}: HydraulicFoldingMachineSolutionPageProps) {
  const content = hydraulicFoldingMachinePageContent;
  const technicalParameters = product.technicalParameters;
  const productUrl =
    "https://www.zyroncnc.com/products/hydraulic-sheet-metal-folding-machine";
  const productImage = `https://www.zyroncnc.com${product.image}`;

  if (!technicalParameters) {
    throw new Error("Hydraulic Folding Machine technical parameters are required");
  }

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "ProductModel",
    name: content.hero.title,
    description: content.hero.description,
    image: productImage,
    url: productUrl,
    category: "Hydraulic Sheet Metal Folding Machine",
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
      data-product-solution-page="hydraulic-sheet-metal-folding-machine"
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
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_32%,rgba(118,185,0,0.14),transparent_31%),linear-gradient(135deg,#0B0D10_0%,#15191D_62%,#08090A_100%)]" />
        <div className="industrial-grid absolute inset-0 -z-10 opacity-25" />
        <div className="mx-auto max-w-[1440px]">
          <Link
            href="/products/series/bending-machines"
            className="inline-flex items-center gap-2 text-sm text-zinc-300 transition hover:text-white"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Bending Machines
          </Link>

          <div className="mt-10 grid min-w-0 gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center xl:gap-20">
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
            </div>

            <div className="relative min-h-[360px] sm:min-h-[480px] lg:min-h-[610px]">
              <div className="absolute inset-x-[8%] bottom-[8%] top-[15%] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.015))] shadow-[0_40px_100px_rgba(0,0,0,0.4)]" />
              <div className="absolute inset-x-[14%] bottom-[9%] h-16 rounded-[50%] bg-black/65 blur-2xl" />
              <Image
                src={product.image}
                alt="Hydraulic folding machine for sheet metal and HVAC duct panel folding"
                fill
                priority
                sizes="(min-width: 1024px) 52vw, 100vw"
                className="object-contain drop-shadow-[0_26px_30px_rgba(0,0,0,0.38)]"
              />
            </div>
          </div>

          <div className="mt-10 grid border-y border-white/15 sm:grid-cols-2 xl:grid-cols-4">
            {content.hero.proofPoints.map((point, index) => (
              <div
                key={point}
                className={`py-5 sm:px-5 ${index > 0 ? "xl:border-l xl:border-white/15" : ""}`}
              >
                <p className="text-sm font-medium leading-6 text-zinc-200">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-section="problems" className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Customer Challenges"
            title="What Problems Can It Solve?"
            text="Start with sheet length, material, load and production frequency before choosing the drive system."
          />
          <div className="mt-12 grid border-t border-neutral-200 md:grid-cols-2 xl:grid-cols-5">
            {content.problems.map((problem, index) => (
              <article
                key={problem.title}
                className="border-b border-neutral-200 py-7 transition hover:-translate-y-1 md:px-6 xl:border-l xl:first:border-l-0"
              >
                <span className="text-sm font-semibold text-[#4E7A00]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 text-lg font-semibold leading-snug text-neutral-950">
                  {problem.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-neutral-600">{problem.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="solutions" className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Solution Fit"
            title="Hydraulic Sheet Metal Folding Solution"
            text="Three practical production settings where hydraulic clamping and folding can provide the right level of support."
          />
          <div className="mt-12 grid gap-px bg-neutral-200 lg:grid-cols-3">
            {content.solutions.map((solution, index) => (
              <article key={solution.title} className="bg-white p-7 transition hover:-translate-y-1 sm:p-9">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-3xl font-semibold text-[#76B900]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <MoveUpRight size={22} className="text-neutral-400" aria-hidden="true" />
                </div>
                <h3 className="mt-8 text-2xl font-semibold leading-tight text-neutral-950">
                  {solution.title}
                </h3>
                <dl className="mt-7 grid gap-5 text-sm leading-7">
                  <div>
                    <dt className="font-semibold text-neutral-950">Suitable for</dt>
                    <dd className="mt-1 text-neutral-600">{solution.suitableFor}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-neutral-950">Recommended use</dt>
                    <dd className="mt-1 text-neutral-600">{solution.recommendedUse}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-neutral-950">Production value</dt>
                    <dd className="mt-1 text-neutral-600">{solution.productionValue}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="applications" className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <SectionIntro
            label="Real Industry Context"
            title="Applications"
            text="Real photographs show the industries, materials and downstream products supported by a suitable folding configuration."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {content.applications.map((application) => (
              <article
                key={application.title}
                className="group overflow-hidden border border-neutral-200 bg-white transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.11)]"
              >
                <div className="relative aspect-video overflow-hidden bg-neutral-200">
                  <Image
                    src={application.image}
                    alt={application.alt}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-neutral-950">{application.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-neutral-600">{application.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="materials" className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Material Matching"
            title="Materials"
            text="Material strength matters as much as nominal thickness when the machine is selected."
          />
          <div className="mt-12 grid border-l border-t border-neutral-200 sm:grid-cols-2 lg:grid-cols-3">
            {content.materials.map((material, index) => (
              <article key={material.title} className="border-b border-r border-neutral-200 bg-white p-7 sm:p-8">
                <span className="text-sm font-semibold text-[#4E7A00]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 text-xl font-semibold text-neutral-950">{material.title}</h3>
                <p className="mt-3 text-sm leading-7 text-neutral-600">{material.text}</p>
              </article>
            ))}
          </div>
          <p className="mt-7 max-w-5xl border-l-2 border-[#76B900] pl-5 text-sm leading-7 text-neutral-600">
            {content.materialNote}
          </p>
        </div>
      </section>

      <section
        data-section="hydraulic-system"
        className="relative isolate overflow-hidden bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24"
      >
        <div className="industrial-grid absolute inset-0 -z-10 opacity-20" />
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
          <div>
            <Droplets size={42} className="text-[#76B900]" aria-hidden="true" />
            <p className={`${darkSectionLabelClass} mt-8`}>Power System</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">
              {content.hydraulicSystemTitle}
            </h2>
            <p className="mt-6 text-base leading-8 text-zinc-400">
              Hydraulic drive is selected when the work calls for stronger clamping, longer supported parts or a more demanding production rhythm than lighter drive systems.
            </p>
          </div>
          <div className="border-t border-white/15">
            {content.hydraulicSystem.map((item, index) => (
              <article key={item.title} className="grid gap-4 border-b border-white/15 py-6 sm:grid-cols-[3rem_1fr]">
                <span className="text-sm font-semibold text-[#76B900]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-zinc-400">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="process" className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <SectionIntro
            label="Production Flow"
            title={content.processTitle}
            text="A clear six-step sequence helps the folder fit into the surrounding fabrication process."
          />
          <div className="mt-12 grid gap-px bg-neutral-200 md:grid-cols-2 xl:grid-cols-6">
            {content.process.map((step, index) => (
              <article key={step.title} className="relative min-h-60 bg-[#F8F9FA] p-6">
                <span className="text-4xl font-semibold text-[#76B900]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-7 text-lg font-semibold text-neutral-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-neutral-600">{step.text}</p>
                {index < content.process.length - 1 ? (
                  <ArrowRight
                    size={18}
                    className="absolute bottom-6 right-6 hidden text-neutral-400 xl:block"
                    aria-hidden="true"
                  />
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="advantages" className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
          <div className="relative min-h-[420px] border border-neutral-200 bg-white shadow-[0_24px_65px_rgba(15,23,42,0.08)] sm:min-h-[560px]">
            <Image
              src={product.image}
              alt="Hydraulic folding machine with supported long-edge folding structure"
              fill
              loading="lazy"
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-contain p-5 sm:p-10"
            />
          </div>
          <div>
            <p className={lightSectionLabelClass}>Machine Advantages</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-neutral-950 sm:text-5xl">
              Why Choose This Hydraulic Folding Machine?
            </h2>
            <div className="mt-9 border-t border-neutral-200">
              {content.advantages.map((advantage, index) => (
                <article key={advantage.title} className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-neutral-200 py-5">
                  <span className="font-semibold text-[#4E7A00]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-semibold leading-7 text-neutral-950">{advantage.title}</h3>
                    <p className="mt-1 text-sm leading-7 text-neutral-600">{advantage.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section data-section="comparison" className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <SectionIntro
            label="Objective Selection"
            title="Hydraulic vs Manual vs Electric vs Pneumatic Folding Machine vs Press Brake"
            text="Each machine type has a suitable production range. Compare the process first instead of treating one drive system as universally better."
          />
          <div className="mt-12 max-w-full overflow-x-auto border border-neutral-200">
            <table className="w-full min-w-[1320px] border-collapse text-left text-sm">
              <thead className="bg-[#111417] text-white">
                <tr>
                  {[
                    "Comparison item",
                    "Manual Folding Machine",
                    "Electric Folding Machine",
                    "Pneumatic Folding Machine",
                    "Hydraulic Folding Machine",
                    "Press Brake",
                  ].map((heading) => (
                    <th key={heading} className="px-5 py-5 font-semibold">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {content.comparison.map((row) => (
                  <tr key={row.item} className="border-t border-neutral-200 even:bg-neutral-50">
                    <th scope="row" className="whitespace-nowrap px-5 py-5 font-semibold text-neutral-950">{row.item}</th>
                    <td className="px-5 py-5 leading-6 text-neutral-600">{row.manual}</td>
                    <td className="px-5 py-5 leading-6 text-neutral-600">{row.electric}</td>
                    <td className="px-5 py-5 leading-6 text-neutral-600">{row.pneumatic}</td>
                    <td className="bg-[#76B900]/10 px-5 py-5 font-medium leading-6 text-neutral-950">{row.hydraulic}</td>
                    <td className="px-5 py-5 leading-6 text-neutral-600">{row.pressBrake}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section data-section="equipment" className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <SectionIntro
            label="Matched Workflow"
            title="Build a Complete Sheet Metal / HVAC Duct Fabrication Workflow"
            text={content.equipmentSummary}
            light
          />
          <div className="mt-12 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {content.equipment.map((equipment, index) => (
              <Link
                key={equipment.title}
                href={equipment.href}
                className="group relative min-h-64 bg-[#111417] p-6 transition hover:bg-[#171B1F]"
              >
                <span className="text-3xl font-semibold text-[#76B900]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-7 text-lg font-semibold text-white">{equipment.title}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">{equipment.role}</p>
                <ChevronRight
                  size={18}
                  className="absolute bottom-6 right-6 text-zinc-600 transition group-hover:translate-x-1 group-hover:text-[#76B900]"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {content.relatedLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="border border-white/15 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:border-[#76B900] hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section data-section="selection" className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div>
            <SectionIntro
              label="Configuration Guide"
              title="How to Choose the Right Hydraulic Folding Machine?"
              text="A reliable quotation starts with the workpiece and production load, not only a machine model name."
            />
            <div className="mt-10 grid gap-x-8 gap-y-1 border-t border-neutral-200 sm:grid-cols-2">
              {content.selectionQuestions.map((question, index) => (
                <div key={question} className="flex gap-4 border-b border-neutral-200 py-4">
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
            <h3 className="mt-7 text-2xl font-semibold leading-tight">{content.selectionCta.title}</h3>
            <p className="mt-5 text-sm leading-7 text-zinc-400">
              Include material, maximum thickness, bending length, flange size, required angle, production frequency and workshop voltage.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#76B900] px-5 py-3.5 text-sm font-semibold text-[#111417] transition hover:bg-[#8ddb00]"
            >
              {content.selectionCta.cta}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <div className="mt-7 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 text-xs leading-5 text-zinc-300">
              <span>Verified HWS model range</span>
              <span>Single machine or matched workflow</span>
            </div>
          </aside>
        </div>
      </section>

      <section data-section="technical" className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <SectionIntro
            label="Verified Data"
            title={content.technical.title}
            text="The original confirmed HWS model values are preserved below. Units are separated visually to keep every heading connected and readable."
          />
          <div className="mt-12 max-w-full overflow-x-auto border border-neutral-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
            <table className="w-full min-w-[1080px] border-collapse text-center text-sm">
              <caption className="sr-only">Hydraulic folding machine technical parameters by HWS model</caption>
              <thead className="bg-[#111417] text-white">
                <tr>
                  {technicalParameters.columns.map((column) => {
                    const unit = inferColumnUnit(column);
                    return (
                      <th
                        key={column}
                        scope="col"
                        className="whitespace-nowrap px-5 py-5 text-center font-semibold"
                      >
                        {column}
                        {unit ? (
                          <span className="mt-1 block text-center text-xs font-medium text-zinc-300">
                            {unit}
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
                    {row.map((value, index) => {
                      const column = technicalParameters.columns[index];
                      const unit = inferColumnUnit(column);
                      const displayValue = stripDisplayUnit(value, unit);

                      return index === 0 ? (
                        <th
                          key={`${row[0]}-${column}`}
                          scope="row"
                          className="whitespace-nowrap border-r border-neutral-200 px-5 py-5 font-semibold text-neutral-950 last:border-r-0"
                        >
                          {displayValue}
                        </th>
                      ) : (
                        <td
                          key={`${row[0]}-${column}`}
                          className="whitespace-nowrap border-r border-neutral-200 px-5 py-5 text-neutral-700 last:border-r-0"
                        >
                          {displayValue}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 text-sm leading-7 text-neutral-600">{content.technical.note}</p>
        </div>
      </section>

      <section data-section="faq" className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <p className={darkSectionLabelClass}>FAQ</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-5xl">
              Hydraulic Folding Machine Questions
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

      <section data-section="cta" className="bg-[#76B900] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Layers3 size={40} className="text-[#111417]" aria-hidden="true" />
            <h2 className="mt-7 max-w-4xl text-3xl font-semibold leading-tight text-[#111417] sm:text-5xl">
              {content.finalCta.title}
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[#1D2908]">{content.finalCta.text}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#111417] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-black sm:w-auto"
            >
              {content.finalCta.primaryCta}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center rounded-sm border border-[#111417]/40 px-6 py-3.5 text-sm font-semibold text-[#111417] transition hover:border-[#111417] sm:w-auto"
            >
              {content.finalCta.secondaryCta}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
