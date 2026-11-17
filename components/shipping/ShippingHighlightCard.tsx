import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

import type { PublishedShippingHighlight } from "@/lib/repositories/shipping-highlight-repository";
import { getCountryName } from "@/lib/shipping/countries";

export function ShippingHighlightCard({ highlight }: { highlight: PublishedShippingHighlight }) {
  const { document } = highlight;
  return (
    <article className="group overflow-hidden rounded-sm border border-neutral-200 bg-white shadow-sm transition hover:border-ignition hover:shadow-[0_22px_65px_rgba(15,23,42,0.1)]">
      <Link href={`/shipping-highlights/${highlight.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
          <Image src={`/api/media/${document.coverMediaId}`} alt={document.media.find((item) => item.mediaAssetId === document.coverMediaId)?.altText ?? document.title} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
            <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5 text-ignition" />{getCountryName(document.countryCode, "en")}</span>
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5 text-ignition" />{formatDate(document.shipmentDate)}</span>
          </div>
          <h2 className="mt-4 text-2xl font-semibold leading-tight text-neutral-950">{document.title}</h2>
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-neutral-600">{document.summary}</p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-950 transition group-hover:text-ignition">View shipment<ArrowRight className="size-4" /></span>
        </div>
      </Link>
    </article>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00.000Z`));
}
