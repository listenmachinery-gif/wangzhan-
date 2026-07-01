"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { Product, ProductCategory } from "@/data/products";

type ProductCatalogProps = {
  products: Product[];
  categories: ProductCategory[];
};

function usesProductCutout(image: string) {
  return (
    image.includes("/products/catalog/") ||
    image.includes("/products/shearing/") ||
    image.includes("/products/bending/") ||
    image.includes("/products/home-categories/")
  );
}

function getDirectory(categoryProducts: Product[]) {
  const directory = new Map<string, { name: string; products: Product[]; isDirectProduct: boolean }>();

  categoryProducts.forEach((product) => {
    const key = product.parentName ?? product.id;
    const current = directory.get(key);

    if (current) {
      current.products.push(product);
    } else {
      directory.set(key, {
        name: product.parentName ?? product.name,
        products: [product],
        isDirectProduct: !product.parentName,
      });
    }
  });

  return Array.from(directory.values());
}

function getCategoryHref(categoryId: string) {
  return `/products/series/${categoryId}`;
}

export function ProductCatalog({ products, categories }: ProductCatalogProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const visibleCategories = useMemo(
    () => categories.filter((category) => activeCategory === "all" || category.id === activeCategory),
    [activeCategory, categories],
  );

  return (
    <section className="bg-[#0B0D10] px-5 py-14 text-white sm:px-8 lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-8 lg:grid-cols-[0.76fr_1.24fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ignition">Product Solutions</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-6xl">Select machines by production workflow.</h2>
          </div>
          <div className="lg:justify-self-end">
            <p className="max-w-3xl text-base leading-8 text-zinc-400">
              Browse every ZYRON product family as a complete solution group. Each section links the manufacturing
              process, suitable machine types, and quotation path.
            </p>
          </div>
        </div>

        <div className="mt-10 overflow-x-auto border-y border-white/10 py-4">
          <div className="flex min-w-max gap-3">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`h-10 rounded-sm px-5 text-xs font-semibold uppercase tracking-[0.08em] transition ${
                activeCategory === "all"
                  ? "bg-ignition text-white"
                  : "border border-white/15 text-zinc-300 hover:border-ignition hover:text-white"
              }`}
            >
              All Solutions
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`h-10 rounded-sm px-5 text-xs font-semibold uppercase tracking-[0.08em] transition ${
                  activeCategory === category.id
                    ? "bg-ignition text-white"
                    : "border border-white/15 text-zinc-300 hover:border-ignition hover:text-white"
                }`}
              >
                {category.navLabel}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-8">
          {visibleCategories.map((category, index) => {
            const categoryProducts = products.filter((product) => product.categoryId === category.id);
            const directory = getDirectory(categoryProducts);
            return (
              <section
                key={category.id}
                id={category.id}
                className="scroll-mt-24 overflow-hidden rounded-sm border border-white/10 bg-white/[0.035]"
              >
                <div className="grid gap-0 lg:grid-cols-2">
                  <div className={`relative min-h-[380px] bg-gradient-to-b from-white/[0.07] to-transparent ${index % 2 ? "lg:order-2" : ""}`}>
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className={`${usesProductCutout(category.image) ? "object-contain p-8 sm:p-12" : "object-cover"} transition duration-700`}
                    />
                  </div>

                  <div className={`flex min-h-[380px] flex-col justify-center p-7 sm:p-10 lg:p-12 ${index % 2 ? "lg:order-1" : ""}`}>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ignition">{category.capability}</p>
                    <h3 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">{category.name}</h3>
                    <p className="mt-5 text-base leading-8 text-zinc-400">{category.description}</p>
                    <div className="mt-7 grid max-h-60 gap-3 overflow-y-auto pr-2 sm:grid-cols-2">
                      {directory.map((group) =>
                        group.isDirectProduct ? (
                          <Link
                            key={group.name}
                            href={`/products/${group.products[0].id}`}
                            className="flex items-start gap-3 border-t border-white/10 pt-3 text-sm font-semibold leading-6 text-zinc-200 transition hover:text-ignition"
                          >
                            <CheckCircle2 size={16} className="mt-1 shrink-0 text-ignition" />
                            {group.name}
                          </Link>
                        ) : (
                          <div key={group.name} className="border-t border-white/10 pt-3">
                            <p className="text-sm font-semibold leading-6 text-zinc-200">{group.name}</p>
                            <div className="mt-2 grid gap-1 border-l border-white/10 pl-3">
                              {group.products.map((product) => (
                                <Link key={product.id} href={`/products/${product.id}`} className="text-xs leading-5 text-zinc-500 transition hover:text-ignition">
                                  {product.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <Link
                        href={getCategoryHref(category.id)}
                        className="inline-flex h-11 items-center justify-center rounded-sm bg-ignition px-5 text-sm font-semibold text-white transition hover:bg-neon"
                      >
                        View Series
                      </Link>
                      <Link
                        href="/contact"
                        className="inline-flex h-11 items-center justify-center rounded-sm border border-white/25 px-5 text-sm font-semibold text-white transition hover:border-ignition hover:text-ignition"
                      >
                        Get Solution Advice
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 border-t border-white/10 bg-black/20 p-4 sm:p-6">
                  {categoryProducts.map((product) => (
                    <article
                      key={product.id}
                      data-catalog-product-card
                      className="group grid overflow-hidden rounded-sm border border-white/10 bg-white/[0.035] transition hover:border-ignition hover:bg-white/[0.055] md:grid-cols-[minmax(260px,0.72fr)_minmax(0,1.28fr)]"
                    >
                      <div className="relative min-h-[280px] overflow-hidden bg-white/[0.045] sm:min-h-[340px] md:min-h-[360px]">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(min-width: 768px) 38vw, 100vw"
                          className={`${usesProductCutout(product.image) ? "object-contain p-5 sm:p-7" : "object-cover"} transition duration-700 group-hover:scale-[1.025]`}
                        />
                      </div>
                      <div className="flex min-w-0 flex-col justify-center p-6 sm:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ignition">
                          {product.parentName ?? product.categoryName}
                        </p>
                        <h4 className="mt-3 text-2xl font-semibold leading-tight text-white sm:text-3xl">{product.name}</h4>
                        <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">{product.tagline}</p>
                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                          {product.highlights.slice(0, 3).map((item) => (
                            <span key={item} className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                              <CheckCircle2 size={15} className="shrink-0 text-ignition" />
                              {item}
                            </span>
                          ))}
                        </div>
                        <div className="mt-7 flex flex-wrap gap-3">
                          <Link
                            href={`/products/${product.id}`}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-ignition px-5 text-sm font-semibold text-white transition hover:bg-neon"
                          >
                            View Details
                            <ArrowRight size={15} />
                          </Link>
                          <Link
                            href="/contact"
                            className="inline-flex h-11 items-center justify-center rounded-sm border border-white/25 px-5 text-sm font-semibold text-white transition hover:border-ignition hover:text-ignition"
                          >
                            Consult an Engineer
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
