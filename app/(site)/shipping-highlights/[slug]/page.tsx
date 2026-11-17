import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, PackageCheck } from "lucide-react";

import { buildShippingStructuredData, ShippingHighlightGallery } from "@/components/shipping/ShippingHighlightGallery";
import { getPublishedShippingHighlightBySlug } from "@/lib/repositories/shipping-highlight-repository";
import { getCountryName } from "@/lib/shipping/countries";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const highlight = await getPublishedShippingHighlightBySlug(slug);
  if (!highlight) return {};
  const { document } = highlight;
  const canonical = `/shipping-highlights/${slug}`;
  return {
    title: document.seoTitle,
    description: document.seoDescription,
    alternates: { canonical },
    openGraph: { title: document.seoTitle, description: document.seoDescription, url: canonical, type: "article", images: [{ url: `/api/media/${document.coverMediaId}`, alt: document.media.find((item) => item.mediaAssetId === document.coverMediaId)?.altText ?? document.title }] },
  };
}

export default async function ShippingHighlightDetailPage({ params }: Props) {
  const { slug } = await params;
  const highlight = await getPublishedShippingHighlightBySlug(slug);
  if (!highlight) notFound();
  const { document } = highlight;
  const schemas = buildShippingStructuredData(highlight);

  return (
    <main className="bg-[#f4f6f8] text-neutral-950">
      {schemas.map((schema) => <script key={String(schema["@type"])} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />)}
      <section className="bg-[#0B0D10] px-5 py-16 text-white sm:px-8 lg:py-24"><div className="mx-auto max-w-[1200px]">
        <Link href="/shipping-highlights" className="inline-flex items-center gap-2 text-sm text-zinc-300 transition hover:text-white"><ArrowLeft className="size-4" />Back to Shipping Highlights</Link>
        <div className="mt-14 max-w-4xl"><p className="text-sm font-semibold uppercase tracking-[0.22em] text-ignition">Shipment Record</p><h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-6xl">{document.title}</h1><p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300">{document.summary}</p>
          <div className="mt-8 flex flex-wrap gap-5 text-sm font-semibold text-zinc-200"><span className="inline-flex items-center gap-2"><MapPin className="size-4 text-ignition" />{[document.city, getCountryName(document.countryCode, "en")].filter(Boolean).join(", ")}</span><span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-ignition" />{new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(highlight.shipmentDate)}</span><span className="inline-flex items-center gap-2"><PackageCheck className="size-4 text-ignition" />{document.quantity} unit{document.quantity === 1 ? "" : "s"}</span></div>
        </div>
      </div></section>

      <section className="px-5 py-14 sm:px-8 lg:py-20"><div className="mx-auto max-w-[1200px]">
        <div className="grid gap-4 rounded-sm border border-neutral-200 bg-white p-6 sm:grid-cols-2 lg:grid-cols-4">
          <Fact label="Equipment" value={document.equipmentName} /><Fact label="Model" value={document.modelName ?? "Configured to order"} /><Fact label="Transport" value={document.transportMode ?? "Export delivery"} /><Fact label="Packing" value={document.packagingMethod ?? document.containerMethod ?? "Export standard"} />
        </div>
        <div className="mt-10"><ShippingHighlightGallery document={document} /></div>
        {document.body.length ? <article className="mx-auto mt-14 max-w-3xl rounded-sm bg-white p-6 shadow-sm sm:p-10">{document.body.map((block, index) => block.type === "HEADING" ? <h2 key={index} className="mt-8 first:mt-0 text-2xl font-semibold">{block.text}</h2> : block.type === "LINK" ? <p key={index} className="mt-5"><Link href={block.href} className="font-semibold text-ignition underline underline-offset-4">{block.text}</Link></p> : <p key={index} className="mt-5 text-base leading-8 text-neutral-700">{block.text}</p>)}</article> : null}
        <div className="mt-14 rounded-sm bg-[#0B0D10] p-8 text-white sm:p-10"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-ignition">Plan your shipment</p><h2 className="mt-4 text-3xl font-semibold">Need the same machine configured for your factory?</h2><p className="mt-4 max-w-2xl leading-7 text-zinc-300">Tell us your material, thickness, output, voltage, and destination. ZYRON will prepare the machine configuration and export plan.</p><Link href="/contact" className="mt-7 inline-flex h-11 items-center rounded-sm bg-ignition px-5 text-sm font-semibold">Request a quotation</Link></div>
      </div></section>
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{label}</p><p className="mt-2 text-sm font-semibold text-neutral-950">{value}</p></div>;
}
