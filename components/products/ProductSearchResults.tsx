"use client";

import Image from "next/image";
import Link from "next/link";

import { trackAnalyticsEvent } from "@/lib/analytics/client-events";
import type { ProductSearchIndexItem } from "@/lib/product-search/config";

export function ProductSearchResults({ query, results }: { query: string; results: ProductSearchIndexItem[] }) {
  return (
    <main className="min-h-screen bg-[#0b0d10] px-5 py-20 text-white sm:px-8">
      <div className="mx-auto max-w-[1440px]">
        <p className="text-sm font-semibold tracking-[0.24em] text-[#80c900]">PRODUCT SEARCH</p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-6xl">Search ZYRON Machines</h1>
        <form action="/products/search" method="get" className="mt-10 flex max-w-4xl flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="products-search-results-query">Machine name, model or series</label>
          <input id="products-search-results-query" name="q" defaultValue={query} minLength={2} required className="min-h-14 flex-1 border border-white/25 bg-white/10 px-5 text-base outline-none focus:border-[#80c900]" placeholder="Enter a machine name, model or series..." />
          <button className="min-h-14 bg-[#80c900] px-8 font-semibold text-[#0b0d10]">Find Machine</button>
        </form>
        <div className="mt-12 flex items-end justify-between gap-6 border-b border-white/15 pb-5">
          <h2 className="text-2xl font-semibold">{query ? `Results for “${query}”` : "All Machines"}</h2>
          <span className="text-sm text-white/55">{results.length} products</span>
        </div>
        {results.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((product, index) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                onClick={() => trackAnalyticsEvent("product_search_result_click", { product_slug: product.slug, result_position: index + 1 })}
                className="group overflow-hidden border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-[#80c900]/70"
              >
                <div className="relative aspect-[4/3] bg-white">
                  <Image src={product.image} alt={product.imageAlt} fill sizes="(min-width:1280px) 33vw, (min-width:640px) 50vw, 100vw" className="object-contain p-5" />
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#80c900]">{product.categoryName}</p>
                  <h3 className="mt-3 text-xl font-semibold">{product.name}</h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/60">{product.summary}</p>
                  {product.models.length ? <p className="mt-4 text-xs text-white/45">Models: {product.models.slice(0, 4).join(" · ")}</p> : null}
                </div>
              </Link>
            ))}
          </div>
        ) : <p className="mt-12 border border-white/10 bg-white/[0.04] p-8 text-white/70">No matching machines found. Try a product category, machine name or model number.</p>}
      </div>
    </main>
  );
}
