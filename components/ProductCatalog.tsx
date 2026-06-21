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

export function ProductCatalog({ products, categories }: ProductCatalogProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const visibleCategories = useMemo(
    () => categories.filter((category) => activeCategory === "all" || category.id === activeCategory),
    [activeCategory, categories],
  );

  return (
    <section className="px-5 pb-16 sm:px-8">
      <div className="mx-auto max-w-7xl overflow-x-auto">
        <div className="flex min-w-max gap-3 py-1">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`h-10 rounded-sm px-5 text-sm font-semibold transition ${
              activeCategory === "all"
                ? "bg-ignition text-white"
                : "bg-white text-neutral-700 shadow-sm hover:bg-neutral-100"
            }`}
          >
            All Products
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={`h-10 rounded-sm px-5 text-sm font-semibold transition ${
                activeCategory === category.id
                  ? "bg-ignition text-white"
                  : "bg-white text-neutral-700 shadow-sm hover:bg-neutral-100"
              }`}
            >
              {category.navLabel}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-8 grid max-w-7xl gap-10">
        {visibleCategories.map((category) => {
          const categoryProducts = products.filter((product) => product.categoryId === category.id);

          return (
            <section key={category.id} id={category.id} className="scroll-mt-24">
              <div className="mb-5 flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 lg:flex-row lg:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ignition">{category.capability}</p>
                  <h2 className="mt-2 text-3xl font-semibold text-neutral-950 sm:text-4xl">{category.name}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">{category.description}</p>
                </div>
                <span className="text-sm font-semibold text-neutral-500">{categoryProducts.length} machine types</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {categoryProducts.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`} className="group overflow-hidden rounded-md bg-white shadow-sm">
                    <div className="relative aspect-[1.32] overflow-hidden bg-neutral-100">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className={`${product.image.includes("/products/shearing/") || product.image.includes("/products/bending/") ? "object-contain p-4" : "object-cover"} transition duration-700 group-hover:scale-105`}
                      />
                    </div>
                    <div className="p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ignition">{product.categoryName}</p>
                      <h3 className="mt-3 min-h-16 text-2xl font-semibold leading-tight text-neutral-950">{product.name}</h3>
                      <p className="mt-3 min-h-20 text-sm leading-6 text-neutral-600">{product.tagline}</p>
                      <div className="mt-5 grid gap-2">
                        {product.highlights.slice(0, 2).map((item) => (
                          <span key={item} className="flex items-center gap-2 text-sm text-neutral-600">
                            <CheckCircle2 size={15} className="shrink-0 text-ignition" />
                            {item}
                          </span>
                        ))}
                      </div>
                      <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-ignition">
                        Learn More
                        <ArrowRight size={15} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
