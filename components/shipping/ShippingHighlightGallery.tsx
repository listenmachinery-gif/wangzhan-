import Image from "next/image";

import type { ShippingHighlightDocument } from "@/lib/shipping/schema";

type StructuredDataInput = { slug: string; publishedAt: Date; document: ShippingHighlightDocument };

export function ShippingHighlightGallery({ document }: { document: ShippingHighlightDocument }) {
  const media = [...document.media].sort((left, right) => left.position - right.position);
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {media.map((item) => item.role === "VIDEO" ? (
        <figure key={item.id} className="overflow-hidden rounded-sm border border-neutral-200 bg-black lg:col-span-2">
          <video src={`/api/media/${item.mediaAssetId}`} poster={`/api/media/${document.coverMediaId}`} controls playsInline preload="metadata" className="aspect-video w-full object-contain" aria-label={item.altText} />
          {item.caption ? <figcaption className="bg-white px-4 py-3 text-sm text-neutral-600">{item.caption}</figcaption> : null}
        </figure>
      ) : (
        <figure key={item.id} className="overflow-hidden rounded-sm border border-neutral-200 bg-neutral-100">
          <div className="relative aspect-[4/3]"><Image src={`/api/media/${item.mediaAssetId}`} alt={item.altText} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" /></div>
          {item.caption ? <figcaption className="bg-white px-4 py-3 text-sm text-neutral-600">{item.caption}</figcaption> : null}
        </figure>
      ))}
    </div>
  );
}

export function buildShippingStructuredData({ slug, publishedAt, document }: StructuredDataInput): Array<Record<string, unknown>> {
  const url = `https://www.zyroncnc.com/shipping-highlights/${slug}`;
  const image = `https://www.zyroncnc.com/api/media/${document.coverMediaId}`;
  return [
    {
      "@context": "https://schema.org", "@type": "Product", name: document.equipmentName,
      model: document.modelName, description: document.summary, image: [image], url,
      brand: { "@type": "Brand", name: "ZYRON" },
      category: document.categorySlug,
      additionalProperty: [
        { "@type": "PropertyValue", name: "Shipment quantity", value: document.quantity },
        { "@type": "PropertyValue", name: "Destination", value: document.countryCode },
      ],
    },
    {
      "@context": "https://schema.org", "@type": "Article", headline: document.title,
      description: document.summary, image: [image], datePublished: publishedAt.toISOString(),
      mainEntityOfPage: url, author: { "@type": "Organization", name: "ZYRON Heavy Industry" },
      publisher: { "@type": "Organization", name: "ZYRON Heavy Industry" },
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.zyroncnc.com/" },
        { "@type": "ListItem", position: 2, name: "Shipping Highlights", item: "https://www.zyroncnc.com/shipping-highlights" },
        { "@type": "ListItem", position: 3, name: document.title, item: url },
      ],
    },
  ];
}
