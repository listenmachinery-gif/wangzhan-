import Image from "next/image";
import { manufacturingCapabilities } from "@/data/company";

export function ManufacturingCapabilities() {
  return (
    <section
      id="manufacturing-capability"
      data-company-section="manufacturing"
      className="scroll-mt-24 bg-[#0B0D10] px-5 py-20 text-white sm:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-[1320px]">
        <div className="grid gap-6 border-b border-white/15 pb-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#76B900]">
              MANUFACTURING CAPABILITY
            </p>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-6xl">
              From Machine Structure to Final Assembly
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-zinc-400 lg:justify-self-end">
            Reliable machinery depends on more than final appearance. Structural
            design, material preparation, welding quality, machining accuracy,
            component selection, assembly discipline, electrical integration,
            adjustment, and final testing all affect long-term performance.
          </p>
        </div>

        <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
          {manufacturingCapabilities.map((capability, index) => (
            <article
              key={capability.title}
              className="grid gap-8 py-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-14"
            >
              <div
                className={`relative aspect-[4/3] overflow-hidden bg-[#12161A] ${
                  index % 2 === 1 ? "lg:order-2" : ""
                }`}
              >
                <Image
                  src={capability.media.src}
                  alt={capability.media.alt}
                  fill
                  loading="lazy"
                  sizes="(min-width: 1024px) 44vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                <span className="font-mono text-sm font-semibold text-[#76B900]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
                  {capability.title}
                </h3>
                <p className="mt-5 text-base leading-8 text-zinc-400">
                  {capability.description}
                </p>
                <p className="mt-6 border-l border-[#76B900] pl-4 text-sm leading-7 text-zinc-500">
                  {capability.media.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
