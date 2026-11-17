import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShippingHighlightCard } from "@/components/shipping/ShippingHighlightCard";
import { listPublishedCategories } from "@/lib/repositories/category-repository";
import { listPublishedShippingHighlights } from "@/lib/repositories/shipping-highlight-repository";
import { countryOptionsZh, getCountryName, isIsoCountryCode } from "@/lib/shipping/countries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Shipping Highlights | ZYRON Heavy Industry",
  description: "Explore real ZYRON machinery shipments, export packing, container loading, equipment details, and global delivery destinations.",
  alternates: { canonical: "/shipping-highlights" },
};

type Props = { searchParams: Promise<{ country?: string; category?: string; sort?: string; cursor?: string }> };

export default async function ShippingHighlightsPage({ searchParams }: Props) {
  const query = await searchParams;
  const categories = await listPublishedCategories();
  const country = query.country?.trim().toUpperCase();
  const category = query.category?.trim();
  const sort = query.sort ?? "newest";
  if ((country && !isIsoCountryCode(country)) || (category && !categories.some((item) => item.slug === category)) || !["newest", "oldest"].includes(sort)) notFound();
  const result = await listPublishedShippingHighlights({ countryCode: country, categorySlug: category, sort: sort as "newest" | "oldest", cursor: query.cursor });

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-neutral-950">
      <section className="bg-[#0B0D10] px-5 py-20 text-white sm:px-8 lg:py-28"><div className="mx-auto max-w-[1440px]"><p className="text-sm font-semibold uppercase tracking-[0.25em] text-ignition">Global Deliveries</p><h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight sm:text-7xl">Shipping Highlights</h1><p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300">Follow real machinery deliveries from final inspection and export packing through container loading and global dispatch.</p></div></section>
      <section className="px-5 py-12 sm:px-8 lg:py-16"><div className="mx-auto max-w-[1440px]">
        <form className="grid gap-3 rounded-sm border border-neutral-200 bg-white p-4 md:grid-cols-[1fr_1fr_180px_auto]">
          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">Destination<select name="country" defaultValue={country ?? ""} className="h-11 rounded-sm border border-neutral-200 px-3 text-sm font-medium normal-case tracking-normal text-neutral-950"><option value="">All destinations</option>{countryOptionsZh.map((option) => <option key={option.value} value={option.value}>{option.label} / {getCountryName(option.value, "en")}</option>)}</select></label>
          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">Equipment category<select name="category" defaultValue={category ?? ""} className="h-11 rounded-sm border border-neutral-200 px-3 text-sm font-medium normal-case tracking-normal text-neutral-950"><option value="">All categories</option>{categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-neutral-500">Sort<select name="sort" defaultValue={sort} className="h-11 rounded-sm border border-neutral-200 px-3 text-sm font-medium normal-case tracking-normal text-neutral-950"><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label>
          <button className="h-11 self-end rounded-sm bg-ignition px-6 text-sm font-semibold text-white">Apply filters</button>
        </form>
        {country ? <p className="mt-5 text-sm text-neutral-600">Destination: <strong>{getCountryName(country, "en")} / {getCountryName(country, "zh-CN")}</strong></p> : null}
        {result.items.length ? <div className="mt-10 grid gap-6 lg:grid-cols-3">{result.items.map((highlight) => <ShippingHighlightCard key={highlight.id} highlight={highlight} />)}</div> : <div className="mt-10 rounded-sm border border-dashed border-neutral-300 bg-white px-6 py-20 text-center"><h2 className="text-2xl font-semibold">No shipping highlights match these filters.</h2><p className="mt-3 text-sm text-neutral-600">Try another destination, equipment category, or sorting option.</p></div>}
        {result.nextCursor ? <a href={`?${new URLSearchParams({ ...(country ? { country } : {}), ...(category ? { category } : {}), sort, cursor: result.nextCursor }).toString()}`} className="mx-auto mt-10 flex h-11 w-fit items-center rounded-sm border border-neutral-300 px-6 text-sm font-semibold">Load more shipments</a> : null}
      </div></section>
    </main>
  );
}
