import {
  companyFaqs,
  companyIdentity,
} from "@/data/company";
import { CompanyHero } from "./CompanyHero";
import { CompanyOverview } from "./CompanyOverview";
import { CompanySupportSections } from "./CompanySupportSections";
import { EngineeringQualitySections } from "./EngineeringQualitySections";
import { ProductSystem } from "./ProductSystem";

const organizationSchema = {
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
  ...(companyIdentity.sameAs.length > 0
    ? { sameAs: companyIdentity.sameAs }
    : {}),
};

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "About ZYRON Heavy Industry",
  description:
    "Explore ZYRON Heavy Industry’s factory, product range, engineering support, quality control, export packing, and global machinery support.",
  url: `${companyIdentity.url}/factory`,
  inLanguage: "en",
  isPartOf: {
    "@type": "WebSite",
    name: companyIdentity.name,
    url: companyIdentity.url,
  },
  about: {
    "@type": "Organization",
    name: companyIdentity.name,
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: companyIdentity.url,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "About ZYRON",
      item: `${companyIdentity.url}/factory`,
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: companyFaqs.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const schemas = [
  organizationSchema,
  webPageSchema,
  breadcrumbSchema,
  faqSchema,
];

function safeJsonLd(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function CompanyPage() {
  return (
    <main
      data-about-zyron-page
      className="overflow-x-hidden bg-white text-[#101214]"
    >
      {schemas.map((schema) => (
        <script
          key={schema["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
        />
      ))}
      <CompanyHero />
      <CompanyOverview />
      <ProductSystem />
      <EngineeringQualitySections />
      <CompanySupportSections />
    </main>
  );
}
