import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  CircleGauge,
  ClipboardCheck,
  Factory,
  Gauge,
  Settings2,
  Wind,
} from "lucide-react";
import {
  pneumaticFoldingMachinePageContent,
  technicalHeadings,
} from "@/data/pneumatic-folding-machine-page";
import type { Product } from "@/data/products";

type PneumaticFoldingMachineSolutionPageProps = {
  product: Product;
};

type SectionIntroProps = {
  label: string;
  title: string;
  text: string;
  light?: boolean;
};

const sectionLabelClass =
  "text-xs font-semibold uppercase tracking-[0.2em] text-[#76B900]";

const jsonLd = (value: object) =>
  JSON.stringify(value).replace(/</g, "\\u003c");

function SectionIntro({ label, title, text, light = false }: SectionIntroProps) {
  return (
    <div className="max-w-4xl">
      <p className={sectionLabelClass}>{label}</p>
      <h2
        className={`mt-4 text-3xl font-semibold leading-tight sm:text-5xl ${
          light ? "text-white" : "text-neutral-950"
        }`}
      >
        {title}
      </h2>
      <p
        className={`mt-6 max-w-3xl text-base leading-8 ${
          light ? "text-zinc-400" : "text-neutral-600"
        }`}
      >
        {text}
      </p>
    </div>
  );
}

export default function PneumaticFoldingMachineSolutionPage({
  product,
}: PneumaticFoldingMachineSolutionPageProps) {
  const content = pneumaticFoldingMachinePageContent;
  const technicalParameters = product.technicalParameters;

  if (!technicalParameters) {
    throw new Error("Pneumatic Folding Machine technical parameters are required");
  }

  const sourceHeadings = technicalParameters.columns.join("|");
  const presentationHeadings = technicalHeadings
    .map((heading) => heading.source)
    .join("|");

  if (sourceHeadings !== presentationHeadings) {
    throw new Error("Pneumatic Folding Machine technical headings do not match the source data");
  }

  const productUrl =
    "https://www.zyroncnc.com/products/pneumatic-sheet-metal-folding-machine";
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "ProductModel",
    name: content.hero.title,
    description: content.hero.description,
    image: `https://www.zyroncnc.com${product.image}`,
    url: productUrl,
    category: product.categoryName,
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
        value: row[index],
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
      data-product-solution-page="pneumatic-sheet-metal-folding-machine"
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
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_78%_34%,rgba(118,185,0,0.13),transparent_30%),linear-gradient(135deg,#0B0D10_0%,#15191D_62%,#08090A_100%)]" />
        <div className="industrial-grid absolute inset-0 -z-10 opacity-25" />
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
                  className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#76B900] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#8ddb00] sm:w-auto"
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
                  <div
                    key={point}
                    className="flex items-start gap-3 text-sm leading-6 text-zinc-300"
                  >
                    <Check
                      className="mt-1 shrink-0 text-[#76B900]"
                      size={15}
                      aria-hidden="true"
                    />
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
                    alt="Pneumatic folding machine for HVAC duct sheet metal folding"
                    fill
                    loading="lazy"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-contain drop-shadow-[0_28px_24px_rgba(0,0,0,0.34)]"
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
              <p className={sectionLabelClass}>Customer Challenges</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-neutral-950 sm:text-5xl">
                What Problems Can It Solve?
              </h2>
              <p className="mt-6 text-base leading-8 text-neutral-600">
                Match the drive method to the sheet, production rhythm and compressed-air conditions.
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
                  <p className="text-sm font-semibold text-[#76B900]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold leading-snug text-neutral-950">
                    {problem.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-neutral-600">
                    {problem.text}
                  </p>
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
            title="Pneumatic Sheet Metal Folding Solution"
            text="Three practical production profiles show where an air-driven folder adds the most value."
            light
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {content.solutions.map((solution, index) => (
              <article
                key={solution.title}
                className="group border border-white/10 bg-white/[0.035] p-7 transition duration-200 hover:-translate-y-1 hover:border-[#76B900]/60 sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#76B900]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Factory
                    size={21}
                    className="text-zinc-600 transition group-hover:text-[#76B900]"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-8 text-2xl font-semibold leading-tight text-white">
                  {solution.title}
                </h3>
                <dl className="mt-7 grid gap-6 text-sm leading-7">
                  <div>
                    <dt className="font-semibold text-zinc-100">Suitable for</dt>
                    <dd className="mt-1 text-zinc-400">{solution.suitableFor}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-zinc-100">Recommended use</dt>
                    <dd className="mt-1 text-zinc-400">{solution.recommendedUse}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-zinc-100">Production value</dt>
                    <dd className="mt-1 text-zinc-400">{solution.productionValue}</dd>
                  </div>
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
            label="Real Environments"
            title="Applications"
            text="Real industry photography shows the materials, workshops and finished environments where pneumatic thin-sheet folding can support production."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {content.applications.map((application) => (
              <article
                key={application.title}
                className="group overflow-hidden border border-neutral-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-1"
              >
                <div className="relative aspect-video overflow-hidden bg-neutral-200">
                  <Image
                    src={application.image}
                    alt={application.alt}
                    fill
                    loading="lazy"
                    sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold leading-snug text-neutral-950">
                    {application.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-neutral-600">
                    {application.text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="materials" className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Material Review"
            title="Materials"
            text="Material strength, sheet thickness, bending length and pneumatic configuration must be reviewed together."
          />
          <div className="mt-12 grid border-l border-t border-neutral-200 sm:grid-cols-2 lg:grid-cols-3">
            {content.materials.map((material) => (
              <article
                key={material.title}
                className="border-b border-r border-neutral-200 p-7 transition hover:bg-neutral-50 sm:p-8"
              >
                <h3 className="text-lg font-semibold text-neutral-950">
                  {material.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-neutral-600">
                  {material.text}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-7 max-w-5xl border-l-2 border-[#76B900] pl-5 text-sm leading-7 text-neutral-600">
            {content.materialNote}
          </p>
        </div>
      </section>

      <section
        data-section="air"
        className="relative isolate overflow-hidden bg-[#15191D] px-5 py-16 text-white sm:px-8 lg:py-24"
      >
        <div className="industrial-grid absolute inset-0 -z-10 opacity-20" />
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-20">
          <div>
            <div className="flex h-14 w-14 items-center justify-center border border-[#76B900]/40 bg-[#76B900]/10 text-[#8DDA17]">
              <Wind size={27} aria-hidden="true" />
            </div>
            <p className={`${sectionLabelClass} mt-8`}>Utility Planning</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-5xl">
              Compressed Air Requirement
            </h2>
            <p className="mt-6 text-base leading-8 text-zinc-400">
              Confirm the available compressor before selecting the machine. Stable air supply is part of the production system, not an optional accessory.
            </p>
          </div>
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              {content.airRequirement.facts.map((fact, index) => (
                <div
                  key={fact}
                  className="border border-white/10 bg-white/[0.035] p-6"
                >
                  <p className="text-sm font-semibold text-[#76B900]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-zinc-300">{fact}</p>
                </div>
              ))}
            </div>
            <dl className="mt-5 grid border border-white/10 bg-black/20 sm:grid-cols-2">
              <div className="p-6 sm:border-r sm:border-white/10">
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Selection value
                </dt>
                <dd className="mt-3 text-sm font-medium leading-7 text-white">
                  {content.airRequirement.airPressure}
                </dd>
              </div>
              <div className="border-t border-white/10 p-6 sm:border-t-0">
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Production value
                </dt>
                <dd className="mt-3 text-sm font-medium leading-7 text-white">
                  {content.airRequirement.airConsumption}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section
        data-section="process"
        className="bg-white px-5 py-16 sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Process Flow"
            title="From Flat Sheet to Folded Duct Panel"
            text="Place pneumatic folding in the correct sequence so each upstream and downstream operation supports the finished rectangular duct."
          />
          <div className="mt-12 grid gap-0 border-l border-t border-neutral-200 md:grid-cols-3 xl:grid-cols-6">
            {content.process.map((step, index) => (
              <article
                key={step.title}
                className="relative border-b border-r border-neutral-200 p-6 sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#76B900]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {index < content.process.length - 1 ? (
                    <ChevronRight
                      size={17}
                      className="hidden text-neutral-300 xl:block"
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
                <h3 className="mt-7 text-lg font-semibold leading-snug text-neutral-950">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-neutral-600">
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        data-section="advantages"
        className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:gap-20">
          <div className="lg:sticky lg:top-28">
            <p className={sectionLabelClass}>Verified Structure</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-5xl">
              Why Choose This Pneumatic Folding Machine?
            </h2>
            <div className="relative mt-9 aspect-[1.25] overflow-hidden border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.07),rgba(255,255,255,0.01))] p-5">
              <Image
                src={product.image}
                alt="Pneumatic folding machine with four-cylinder air-driven structure"
                fill
                loading="lazy"
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-contain p-5 drop-shadow-[0_22px_24px_rgba(0,0,0,0.34)]"
              />
            </div>
          </div>
          <div className="border-t border-white/15">
            {content.advantages.map((advantage, index) => (
              <article
                key={advantage.title}
                className="grid grid-cols-[3rem_1fr] gap-4 border-b border-white/15 py-6 sm:grid-cols-[4rem_1fr] sm:gap-6"
              >
                <p className="text-xl font-semibold text-[#76B900]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <div>
                  <h3 className="text-lg font-semibold leading-snug text-white">
                    {advantage.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    {advantage.text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        data-section="comparison"
        className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Objective Selection"
            title="Pneumatic vs Manual vs Electric vs Hydraulic Folding Machine"
            text="The right drive method depends on sheet strength, batch size, operator effort, available utilities and required forming load."
          />
          <div className="mt-12 max-w-full overflow-x-auto border border-neutral-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
            <table className="min-w-[1160px] w-full border-collapse text-left text-sm">
              <thead className="bg-[#15191D] text-white">
                <tr>
                  {[
                    "Comparison item",
                    "Manual Folding Machine",
                    "Pneumatic Folding Machine",
                    "Electric Folding Machine",
                    "Hydraulic Folding Machine",
                  ].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="border-r border-white/10 px-5 py-5 font-semibold last:border-r-0"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {content.comparison.map((row) => (
                  <tr
                    key={row.item}
                    className="border-t border-neutral-200 align-top even:bg-neutral-50"
                  >
                    <th
                      scope="row"
                      className="min-w-44 border-r border-neutral-200 px-5 py-5 font-semibold text-neutral-950"
                    >
                      {row.item}
                    </th>
                    <td className="border-r border-neutral-200 px-5 py-5 leading-7 text-neutral-600">
                      {row.manual}
                    </td>
                    <td className="border-r border-neutral-200 bg-[#76B900]/[0.06] px-5 py-5 leading-7 text-neutral-800">
                      {row.pneumatic}
                    </td>
                    <td className="border-r border-neutral-200 px-5 py-5 leading-7 text-neutral-600">
                      {row.electric}
                    </td>
                    <td className="px-5 py-5 leading-7 text-neutral-600">
                      {row.hydraulic}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section
        data-section="equipment"
        className="bg-[#15191D] px-5 py-16 text-white sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Connected Production"
            title="Build a Complete HVAC Duct Fabrication Workflow"
            text={content.equipmentSummary}
            light
          />
          <div className="mt-12 grid border-l border-t border-white/10 md:grid-cols-2 xl:grid-cols-4">
            {content.equipment.map((machine, index) => (
              <Link
                key={machine.title}
                href={machine.href}
                className="group border-b border-r border-white/10 p-7 transition hover:bg-white/[0.045]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#76B900]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <ArrowRight
                    size={17}
                    className="text-zinc-600 transition group-hover:translate-x-1 group-hover:text-[#76B900]"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-7 text-lg font-semibold leading-snug text-white">
                  {machine.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  {machine.role}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section data-section="selection" className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.16fr_0.84fr] lg:gap-20">
          <div>
            <p className={sectionLabelClass}>Configuration Input</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-neutral-950 sm:text-5xl">
              How to Choose the Right Pneumatic Folding Machine?
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-neutral-600">
              Prepare these production details so the machine length, capacity and compressed-air requirement can be reviewed together.
            </p>
            <div className="mt-10 grid border-l border-t border-neutral-200 sm:grid-cols-2">
              {content.selectionQuestions.map((question) => (
                <div
                  key={question}
                  className="flex gap-3 border-b border-r border-neutral-200 p-5 text-sm font-medium leading-6 text-neutral-800"
                >
                  <ClipboardCheck
                    size={17}
                    className="mt-0.5 shrink-0 text-[#76B900]"
                    aria-hidden="true"
                  />
                  {question}
                </div>
              ))}
            </div>
          </div>
          <aside className="self-start border-t-2 border-[#76B900] bg-[#0B0D10] p-8 text-white shadow-[0_22px_65px_rgba(15,23,42,0.16)] sm:p-10 lg:sticky lg:top-28">
            <Settings2 size={28} className="text-[#76B900]" aria-hidden="true" />
            <h3 className="mt-8 text-2xl font-semibold leading-tight">
              Send Your Pneumatic Folding Requirement
            </h3>
            <p className="mt-5 text-sm leading-7 text-zinc-400">
              Share the sheet, folding length, angle, daily quantity and available compressor information. An engineer can then compare the QS models against the application.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#76B900] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#8ddb00]"
            >
              Request Recommendation
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <div className="mt-8 grid gap-4 border-t border-white/15 pt-7 text-sm text-zinc-300">
              <p className="flex items-center gap-3">
                <Gauge size={17} className="text-[#76B900]" aria-hidden="true" />
                Air pressure and compressor capacity
              </p>
              <p className="flex items-center gap-3">
                <CircleGauge
                  size={17}
                  className="text-[#76B900]"
                  aria-hidden="true"
                />
                Material, thickness and bending length
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section
        data-section="technical"
        className="bg-[#F4F6F8] px-5 py-16 sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            label="Verified Data"
            title="Technical Specifications"
            text="The original QS model parameters are shown without changing their stored values."
          />
          <div className="mt-12 max-w-full overflow-x-auto border border-neutral-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
            <table className="min-w-[980px] w-full border-collapse text-center text-sm">
              <thead className="bg-[#15191D] text-white">
                <tr>
                  {technicalHeadings.map((heading) => (
                    <th
                      key={heading.source}
                      scope="col"
                      className="whitespace-nowrap border-r border-white/10 px-5 py-5 text-center font-semibold last:border-r-0"
                    >
                      {heading.label}
                      {heading.unit ? (
                        <span className="mt-1 block text-center text-[0.72rem] font-medium text-[#8DDA17]">
                          {heading.unit}
                        </span>
                      ) : null}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {technicalParameters.rows.map((row) => (
                  <tr
                    key={row.join("-")}
                    className="border-t border-neutral-200 even:bg-neutral-50"
                  >
                    {row.map((value, index) => (
                      <td
                        key={`${row[0]}-${technicalParameters.columns[index]}`}
                        className={`whitespace-nowrap border-r border-neutral-200 px-5 py-5 last:border-r-0 ${
                          index === 0
                            ? "font-semibold text-neutral-950"
                            : "text-neutral-700"
                        }`}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 text-sm leading-7 text-neutral-600">
            Final specifications depend on sheet material, thickness, bending length, air pressure and selected machine configuration.
          </p>
        </div>
      </section>

      <section
        data-section="faq"
        className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <p className={sectionLabelClass}>FAQ</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-5xl">
              Pneumatic Folding Machine Questions
            </h2>
            <p className="mt-6 text-base leading-8 text-zinc-400">
              Practical answers for air supply, capacity review and HVAC workflow planning.
            </p>
          </div>
          <div className="border-t border-white/15">
            {content.faqs.map((faq, index) => (
              <details key={faq.question} className="group border-b border-white/15">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-left font-semibold leading-7 text-white marker:content-none">
                  <span className="flex gap-4">
                    <span className="text-[#76B900]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {faq.question}
                  </span>
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center border border-white/20 text-[#76B900] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="pb-7 pl-10 pr-8 text-sm leading-7 text-zinc-400">
                  {faq.answer}
                </p>
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
            <p className={sectionLabelClass}>Next Step</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-5xl">
              {content.finalCta.title}
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300">
              {content.finalCta.text}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#76B900] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#8ddb00] sm:w-auto"
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
