import type { MetadataRoute } from "next";
import { getCategoryHref } from "@/data/products";
import { listPublishedCategories } from "@/lib/repositories/category-repository";

export const dynamic = "force-dynamic";

const siteUrl = "https://www.zyroncnc.com";

const staticRoutes = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/products", changeFrequency: "weekly", priority: 0.9 },
  { path: "/factory", changeFrequency: "monthly", priority: 0.7 },
  { path: "/cases", changeFrequency: "monthly", priority: 0.7 },
  { path: "/news", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const categories = await listPublishedCategories();

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...categories.map((category) => ({
      url: `${siteUrl}${getCategoryHref(category.slug)}`,
      lastModified: category.publishedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...categories.flatMap((category) => category.products.map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: product.publishedAt ?? now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }))),
  ];
}
