import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import { companyStats } from "@/data/company";

export function CompanyHero() {
  return (
    <>
      <section
        data-company-section="hero"
        className="relative overflow-hidden bg-[#0B0D10] text-white"
      >
        <div className="mx-auto grid min-h-[690px] max-w-[1440px] lg:grid-cols-[1fr_1.06fr]">
          <div className="flex px-5 py-8 sm:px-8 lg:items-center lg:px-12 lg:py-12 xl:px-16">
            <div className="max-w-[650px]">
              <nav
                aria-label="Breadcrumb"
                className="mb-5 hidden text-xs text-zinc-500 sm:block lg:mb-7"
              >
                <ol className="flex items-center gap-2">
                  <li>
                    <Link href="/" className="transition hover:text-[#8DDB00]">
                      Home
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li className="text-zinc-300">About ZYRON</li>
                </ol>
              </nav>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#76B900]">
                ABOUT ZYRON HEAVY INDUSTRY
              </p>
              <h1 className="mt-3 text-[2.2rem] font-semibold leading-[0.99] tracking-[-0.035em] sm:text-5xl lg:mt-4 lg:text-[clamp(3.4rem,4.55vw,4.55rem)]">
                Manufacturing Strength Behind Complete Sheet Metal Solutions
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base lg:mt-5">
                ZYRON Heavy Industry provides sheet metal machinery, HVAC duct
                production equipment, fiber laser cutting systems, plate rolling
                machines, press machines, and industrial shredding solutions for
                customers worldwide. From requirement analysis and machine
                configuration to manufacturing, testing, delivery, and technical
                support, our team helps customers build practical production
                capacity around real materials, processes, output targets, and
                factory conditions.
              </p>
              <p className="mt-3 border-l-2 border-[#76B900] pl-4 text-sm leading-6 text-zinc-400 lg:mt-4">
                More than a machine supplier, ZYRON works as a long-term
                manufacturing and engineering partner.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-7">
                <Link
                  href="#product-system"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[2px] bg-[#76B900] px-6 py-3 text-sm font-semibold text-[#0B0D10] transition hover:bg-[#8DDB00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#76B900]"
                >
                  Explore Product System
                  <ArrowDownRight size={17} aria-hidden="true" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[2px] border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#76B900] hover:text-[#8DDB00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#76B900]"
                >
                  Talk to an Engineer
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
          <div className="relative min-h-[380px] overflow-hidden border-l border-white/10 lg:min-h-full">
            <Image
              src="/brand/factory-showcase.png"
              alt="ZYRON industrial machinery factory exterior in Ma’anshan China"
              fill
              priority
              sizes="(min-width: 1024px) 54vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section
        data-company-section="stats"
        aria-label="Company strength"
        className="border-y border-white/10 bg-[#111417] px-5 py-10 text-white sm:px-8"
      >
        <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 lg:grid-cols-4">
          {companyStats.map((stat) => (
            <dl key={stat.label} className="bg-[#111417] px-5 py-7 sm:px-7">
              <dt className="text-sm leading-6 text-zinc-400">{stat.label}</dt>
              <dd className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#76B900] sm:text-5xl">
                {stat.value}
              </dd>
            </dl>
          ))}
        </div>
      </section>
    </>
  );
}
