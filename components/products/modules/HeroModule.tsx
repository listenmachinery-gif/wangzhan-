import Image from "next/image";
import Link from "next/link";

import type { HeroData } from "@/components/products/modules/types";

export function HeroModule({ data }: { data: HeroData }) {
  return (
    <section data-product-module="HERO" aria-labelledby="product-module-hero" className="relative isolate min-h-[720px] overflow-hidden bg-neutral-950 px-5 py-20 text-white sm:px-8">
      <picture className="absolute inset-0 -z-20">
        {data.images.mobile ? <source media="(max-width: 639px)" srcSet={data.images.mobile} /> : null}
        {data.images.tablet ? <source media="(max-width: 1023px)" srcSet={data.images.tablet} /> : null}
        <Image src={data.images.desktop} alt={data.images.alt} fill priority sizes="100vw" className="object-cover" />
      </picture>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/80 to-black/25" />
      <div className="mx-auto flex min-h-[560px] max-w-[1440px] items-center">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ignition">{data.eyebrow}</p>
          <h1 id="product-module-hero" className="mt-5 text-5xl font-semibold leading-tight sm:text-7xl">{data.title}</h1>
          {data.subtitle ? <p className="mt-6 text-xl leading-8 text-neutral-200">{data.subtitle}</p> : null}
          {data.intro ? <p className="mt-4 max-w-2xl text-base leading-8 text-neutral-300">{data.intro}</p> : null}
          {data.badges?.length ? <ul aria-label="Product highlights" className="mt-6 flex flex-wrap gap-2">{data.badges.map((item) => <li key={item} className="border border-white/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide">{item}</li>)}</ul> : null}
          {data.valuePoints?.length ? <ul className="mt-7 grid gap-2 sm:grid-cols-2">{data.valuePoints.map((item) => <li key={item} className="text-sm text-neutral-200">{item}</li>)}</ul> : null}
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href={data.primaryCta.href} className="inline-flex min-h-11 items-center bg-ignition px-6 text-sm font-semibold text-white">{data.primaryCta.label}</Link>
            {data.secondaryCta ? <Link href={data.secondaryCta.href} className="inline-flex min-h-11 items-center border border-white/40 px-6 text-sm font-semibold">{data.secondaryCta.label}</Link> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
