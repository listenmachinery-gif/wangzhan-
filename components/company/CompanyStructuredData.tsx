import { companyIdentity } from "@/data/company";

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: companyIdentity.name,
    alternateName: companyIdentity.alternateName,
    url: companyIdentity.url,
    logo: companyIdentity.logo,
    email: companyIdentity.email,
    telephone: companyIdentity.telephone,
    address: {
      "@type": "PostalAddress",
      streetAddress: companyIdentity.addressParts.streetAddress,
      addressLocality: companyIdentity.addressParts.addressLocality,
      addressRegion: companyIdentity.addressParts.addressRegion,
      addressCountry: companyIdentity.addressParts.addressCountry,
    },
    ...(companyIdentity.sameAs.length > 0 ? { sameAs: companyIdentity.sameAs } : {}),
  },
  {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About ZYRON Heavy Industry",
    description: "Learn about ZYRON sheet metal machinery, engineering review, manufacturing coordination, inspection, delivery preparation, and technical support.",
    url: `${companyIdentity.url}/factory`,
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: companyIdentity.name,
      url: companyIdentity.url,
    },
    about: { "@type": "Organization", name: companyIdentity.name },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: companyIdentity.url },
      { "@type": "ListItem", position: 2, name: "About ZYRON", item: `${companyIdentity.url}/factory` },
    ],
  },
];

function safeJsonLd(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function CompanyStructuredData() {
  return schemas.map((schema) => (
    <script
      key={schema["@type"]}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  ));
}
