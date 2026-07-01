import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Factory,
  Gauge,
  Layers3,
  PackageCheck,
  Ruler,
  ScanLine,
  Settings2,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Wrench,
  ZapOff,
} from "lucide-react";
import type { Product } from "@/data/products";
import { footShearPageContent as content } from "@/data/foot-shear-page";

type FootShearSolutionPageProps = {
  product: Product;
};

const painIcons = [ScanLine, TimerReset, ZapOff, Wrench];
const applicationIcons = [Layers3, Ruler, Sparkles, Factory, Settings2];
const advantageIcons = [Gauge, ShieldCheck, ScanLine, Ruler, Layers3, Wrench];
const supportIcons = [Settings2, Ruler, Sparkles, PackageCheck];

const sectionLabelClass =
  "text-xs font-semibold uppercase tracking-[0.2em] text-[#76B900]";

export default function FootShearSolutionPage({ product }: FootShearSolutionPageProps) {
  const technicalParameters = product.technicalParameters;
  const siteUrl = "https://www.zyroncnc.com";
  const productUrl = `${siteUrl}/products/${product.id}`;
  const productImageUrl = `${siteUrl}${product.image}`;
  const parameterRows = technicalParameters?.rows ?? [];
  const maxWidth = parameterRows.at(-1)?.[2] ?? "Model dependent";
  const thickness = parameterRows[0]?.[1] ?? "Model dependent";

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Foot Operated Shearing Machine",
    description: content.intro,
    image: [productImageUrl],
    brand: {
      "@type": "Brand",
      name: "ZYRON Heavy Industry",
    },
    category: "Sheet Metal Cutting Machine",
    url: productUrl,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: `${siteUrl}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Foot Operated Shearing Machine",
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
    <main className="overflow-x-hidden bg-[#f3f5f6] text-[#111315]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="relative isolate overflow-hidden bg-[#0B0D10] px-5 pb-16 pt-8 text-white sm:px-8 lg:pb-24 lg:pt-12">
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(118deg,#0B0D10_0%,#12171a_48%,#070809_100%)]" />
        <div className="absolute inset-y-0 right-0 -z-10 w-2/3 bg-[radial-gradient(circle_at_62%_48%,rgba(118,185,0,0.16),transparent_48%)]" />
        <div className="mx-auto max-w-[1440px]">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Products
          </Link>

          <div className="mt-10 grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center xl:gap-16">
            <div className="min-w-0">
              <p className={sectionLabelClass}>{content.eyebrow}</p>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.08] text-white sm:text-5xl lg:text-6xl">
                {content.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
                {content.intro}
              </p>

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
                {content.valuePoints.map((point) => (
                  <span key={point} className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-200">
                    <span className="h-2 w-2 bg-[#76B900]" />
                    {point}
                  </span>
                ))}
              </div>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-sm bg-[#76B900] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#8DDB00] hover:text-[#0B0D10]"
                >
                  Request a Quote
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-sm border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-[#76B900] hover:text-[#8DDB00]"
                >
                  Get Cutting Solution
                </Link>
              </div>
            </div>

            <div className="relative min-w-0 border border-white/10 bg-[#111519] p-4 sm:p-7 lg:p-8">
              <div className="absolute inset-x-[12%] bottom-[8%] h-[24%] bg-[#76B900]/15 blur-3xl" />
              <div className="relative aspect-[1.45] min-w-0">
                <Image
                  src={product.image}
                  alt="Foot operated shearing machine for sheet metal cutting"
                  fill
                  priority
                  sizes="(min-width: 1024px) 52vw, 100vw"
                  className="object-contain"
                />
              </div>
              <div className="relative mt-5 grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 pt-5">
                <div className="pr-3">
                  <p className="text-base font-semibold text-white">Q11 Series</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-zinc-500">Model range</p>
                </div>
                <div className="px-3">
                  <p className="text-base font-semibold text-white">{thickness} mm</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-zinc-500">Sheet thickness</p>
                </div>
                <div className="pl-3">
                  <p className="text-base font-semibold text-white">Up to {maxWidth} mm</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-zinc-500">Shearing width</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className={sectionLabelClass}>Common Thin Sheet Cutting Challenges</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-neutral-950 sm:text-5xl">
              What Cutting Problems Are You Trying to Solve?
            </h2>
          </div>
          <div className="mt-10 grid gap-px bg-neutral-200 md:grid-cols-2 xl:grid-cols-4">
            {content.painPoints.map((item, index) => {
              const Icon = painIcons[index];
              return (
                <article key={item.title} className="group min-h-64 bg-white p-7 transition-colors hover:bg-neutral-50">
                  <Icon size={24} strokeWidth={1.7} className="text-[#76B900]" aria-hidden="true" />
                  <h3 className="mt-8 text-xl font-semibold leading-snug text-neutral-950">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-neutral-600">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div>
            <p className={sectionLabelClass}>Practical Workshop Positioning</p>
            <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight text-neutral-950 sm:text-5xl">
              A Practical Cutting Solution for Light-Gauge Sheet Metal
            </h2>
            <div className="mt-7 max-w-4xl space-y-5 text-base leading-8 text-neutral-600">
              {content.solutionParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <aside className="border-l-4 border-[#76B900] bg-[#101316] p-7 text-white sm:p-9">
            <p className={sectionLabelClass}>Solution Fit</p>
            <h3 className="mt-4 text-2xl font-semibold">Designed for practical daily cutting.</h3>
            <div className="mt-7 divide-y divide-white/10">
              {content.solutionFit.map((item) => (
                <div key={item} className="flex items-center gap-3 py-4 text-sm font-semibold text-zinc-200">
                  <Check size={17} className="text-[#76B900]" aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-[#101316] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className={sectionLabelClass}>From Sheet Positioning to Clean Cutting</p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-5xl">A Simple Five-Step Cutting Process</h2>
          <div className="mt-12 grid gap-px bg-white/10 lg:grid-cols-5">
            {content.processSteps.map((step, index) => (
              <article key={step.title} className="relative min-h-60 bg-[#101316] p-6 transition-colors hover:bg-[#15191d]">
                <p className="text-4xl font-semibold text-[#76B900]">0{index + 1}</p>
                <h3 className="mt-7 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">{step.text}</p>
                {index < content.processSteps.length - 1 ? (
                  <ArrowRight
                    size={18}
                    className="absolute bottom-6 right-6 hidden text-zinc-600 lg:block"
                    aria-hidden="true"
                  />
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className={sectionLabelClass}>Application Scenarios</p>
          <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight text-neutral-950 sm:text-5xl">
            Built for Everyday Sheet Metal Applications
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {content.applications.map((item, index) => {
              const Icon = applicationIcons[index];
              return (
                <article key={item.title} className="border border-neutral-200 p-6 transition hover:border-[#76B900] hover:shadow-lg">
                  <Icon size={23} strokeWidth={1.7} className="text-[#76B900]" aria-hidden="true" />
                  <h3 className="mt-7 text-lg font-semibold leading-snug text-neutral-950">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-neutral-600">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className={sectionLabelClass}>Core Advantages</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-neutral-950 sm:text-5xl">
                Why This Foot Shear Works for Your Production
              </h2>
              <p className="mt-5 text-base leading-8 text-neutral-600">
                The machine focuses on the functions small workshops use every day: stable support, repeatable positioning and direct manual control.
              </p>
            </div>
            <div className="grid gap-px bg-neutral-200 sm:grid-cols-2">
              {content.advantages.map((item, index) => {
                const Icon = advantageIcons[index];
                return (
                  <article key={item.title} className="bg-white p-7 transition-colors hover:bg-neutral-50">
                    <Icon size={22} strokeWidth={1.7} className="text-[#76B900]" aria-hidden="true" />
                    <h3 className="mt-6 text-xl font-semibold text-neutral-950">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-neutral-600">{item.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className={sectionLabelClass}>Machine Structure Overview</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">
                Understand the working structure at a glance.
              </h2>
              <div className="relative mt-9 aspect-[1.5] border border-white/10 bg-[#111519] p-5 sm:p-8">
                <Image
                  src={product.image}
                  alt="Foot operated shearing machine for sheet metal cutting"
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-contain p-4 sm:p-8"
                />
              </div>
            </div>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {content.structureParts.map((part, index) => (
                <div key={part} className="grid grid-cols-[3.5rem_1fr] items-center py-5">
                  <span className="text-2xl font-semibold text-[#76B900]">0{index + 1}</span>
                  <span className="text-base font-semibold text-zinc-200">{part}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className={sectionLabelClass}>Technical Specifications</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-neutral-950 sm:text-5xl">
                Original Q11 model parameters.
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-neutral-600 lg:justify-self-end">
              Model selection should be confirmed according to material grade, sheet condition, cutting length and production requirements.
            </p>
          </div>

          <div className="mt-10 max-w-full overflow-x-auto border border-neutral-200">
            {technicalParameters ? (
              <table className="min-w-[820px] w-full border-collapse text-left text-sm">
                <thead>
                  <tr>
                    {technicalParameters.columns.map((column) => (
                      <th key={column} className="whitespace-nowrap bg-[#111315] px-5 py-4 font-semibold text-white">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {technicalParameters.rows.map((row, rowIndex) => (
                    <tr key={`${row[0]}-${rowIndex}`} className="border-b border-neutral-200 last:border-0">
                      {row.map((cell, cellIndex) => (
                        <td
                          key={`${row[0]}-${cellIndex}`}
                          className={`whitespace-nowrap px-5 py-5 ${
                            cellIndex === 0 ? "font-semibold text-neutral-950" : "text-neutral-600"
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-6 text-sm text-neutral-600">Please contact ZYRON for confirmed model specifications.</p>
            )}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className={sectionLabelClass}>Machine Selection Comparison</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight text-neutral-950 sm:text-5xl">
            Choose the Right Shearing Solution
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-neutral-600">
            Select the machine around your material, production volume and maintenance capability instead of choosing by price or size alone.
          </p>

          <div className="mt-10 max-w-full overflow-x-auto border border-neutral-200 bg-white">
            <table className="min-w-[940px] w-full border-collapse text-left text-sm">
              <thead>
                <tr>
                  <th className="bg-[#111315] px-5 py-5 font-semibold text-white">Selection factor</th>
                  <th className="bg-[#76B900] px-5 py-5 font-semibold text-white">Foot Operated Shear</th>
                  <th className="bg-[#111315] px-5 py-5 font-semibold text-white">Electric Shearing Machine</th>
                  <th className="bg-[#111315] px-5 py-5 font-semibold text-white">Hydraulic Shearing Machine</th>
                </tr>
              </thead>
              <tbody>
                {content.comparisonRows.map((row) => (
                  <tr key={row.label} className="border-b border-neutral-200 last:border-0">
                    <th className="whitespace-nowrap bg-neutral-50 px-5 py-5 font-semibold text-neutral-950">{row.label}</th>
                    <td className="px-5 py-5 font-medium text-neutral-900">{row.foot}</td>
                    <td className="px-5 py-5 text-neutral-600">{row.electric}</td>
                    <td className="px-5 py-5 text-neutral-600">{row.hydraulic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className={sectionLabelClass}>Project Support</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-neutral-950 sm:text-5xl">
                More Than a Machine, A Cutting Solution
              </h2>
            </div>
            <div className="grid gap-px bg-neutral-200 sm:grid-cols-2">
              {content.supportItems.map((item, index) => {
                const Icon = supportIcons[index];
                return (
                  <article key={item.title} className="bg-white p-7">
                    <Icon size={22} strokeWidth={1.7} className="text-[#76B900]" aria-hidden="true" />
                    <h3 className="mt-6 text-xl font-semibold text-neutral-950">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-neutral-600">{item.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section data-foot-shear-faq className="px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <p className={`${sectionLabelClass} text-center`}>Buyer Questions</p>
          <h2 className="mt-4 text-center text-3xl font-semibold leading-tight text-neutral-950 sm:text-5xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-10 divide-y divide-neutral-200 border-y border-neutral-200 bg-white px-5 sm:px-8">
            {content.faqs.map((faq) => (
              <details key={faq.question} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-left text-base font-semibold text-neutral-950 sm:text-lg">
                  {faq.question}
                  <ChevronDown
                    size={20}
                    className="shrink-0 text-[#76B900] transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="max-w-4xl pt-4 text-sm leading-7 text-neutral-600 sm:text-base sm:leading-8">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className={sectionLabelClass}>Talk to a Shearing Specialist</p>
            <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
              Need a Practical Sheet Metal Cutting Solution?
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-300">
              Tell us your material, thickness, cutting length and daily production needs. Our team will help recommend the right shearing machine for your workshop.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-sm bg-[#76B900] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#8DDB00] hover:text-[#0B0D10]"
            >
              Request a Quote
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-sm border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-[#76B900] hover:text-[#8DDB00]"
            >
              Contact Our Engineer
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
