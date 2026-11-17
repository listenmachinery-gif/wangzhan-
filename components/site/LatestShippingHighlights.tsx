import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { PublishedShippingHighlight } from "@/lib/repositories/shipping-highlight-repository";
import { ShippingHighlightCard } from "@/components/shipping/ShippingHighlightCard";

export function LatestShippingHighlights({ highlights }: { highlights: PublishedShippingHighlight[] }) {
  if (highlights.length === 0) return null;
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div><p className="text-sm font-semibold uppercase tracking-[0.22em] text-ignition">Global Deliveries</p><h2 className="mt-4 text-4xl font-semibold leading-tight text-neutral-950 sm:text-6xl">Latest shipping highlights.</h2><p className="mt-4 max-w-2xl text-base leading-8 text-neutral-600">Real machines, export preparation, loading details, and destinations from recent ZYRON deliveries.</p></div>
          <Link href="/shipping-highlights" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-950 transition hover:text-ignition">View all shipments<ArrowRight className="size-4" /></Link>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">{highlights.map((highlight) => <ShippingHighlightCard key={highlight.id} highlight={highlight} />)}</div>
      </div>
    </section>
  );
}
