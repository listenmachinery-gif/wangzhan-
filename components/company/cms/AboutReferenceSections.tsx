import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Crosshair, Settings2, ShieldCheck } from "lucide-react";

import { InquiryForm } from "@/components/InquiryForm";
import { productCategories } from "@/data/products";

import { IndustrialCta } from "./IndustrialCta";
import styles from "./about-reference-sections.module.css";

type Stat = { value: string; label: string };
type Point = { title: string; body: string };
type MediaCard = { number: string; title: string; body: string; src: string; alt: string; focus: string };
type DeliveryCard = { number: string; title: string; description: string; src: string; alt: string; href: string; focus: string };

export type AboutNumbersContent = {
  enabled: boolean; eyebrow: string; title: string; highlight: string; description: string;
  stats: Stat[]; image: string; imageAlt: string; imageFocus: string; showMetalDecoration: boolean;
};

export type AboutQualityContent = {
  enabled: boolean; eyebrow: string; title: string; highlight: string; description: string;
  points: Point[]; image: string; imageAlt: string; imageFocus: string; certifications: string[];
  ctaLabel: string; ctaHref: string; showCta: boolean;
};

export type AboutEngineeringContent = {
  enabled: boolean; eyebrow: string; title: string; highlight: string; paragraphs: string[];
  statement: string; featureImage: string; featureImageAlt: string; featureImageFocus: string;
  cards: MediaCard[];
};

export type AboutGlobalDeliveryContent = {
  enabled: boolean; eyebrow: string; titleLineOne: string; titleLineTwo: string; paragraphs: string[];
  ctaLabel: string; ctaHref: string; showCta: boolean; mapAriaLabel: string; proofPoints: Stat[];
  deliveryEyebrow: string; deliveryTitle: string; deliveryDescription: string; itemLabel: string; items: DeliveryCard[];
  viewAllLabel: string; viewAllHref: string; showViewAll: boolean;
};

export type AboutQuoteContent = {
  enabled: boolean; eyebrow: string; title: string; paragraphs: string[]; services: string[];
  image: string; imageAlt: string; imageFocus: string; formEyebrow: string; formTitle: string;
  formDescription: string; privacyText: string; submitLabel: string;
};

function Highlight({ text, highlight }: { text: string; highlight: string }) {
  const index = highlight ? text.indexOf(highlight) : -1;
  if (index < 0) return <>{text}</>;
  return <>{text.slice(0, index)}<span>{highlight}</span>{text.slice(index + highlight.length)}</>;
}

function DarkEyebrow({ children, centered = false }: { children: React.ReactNode; centered?: boolean }) {
  return <p className={`${styles.eyebrow} ${centered ? styles.eyebrowCentered : ""}`}><i aria-hidden="true" />{children}<i aria-hidden="true" /></p>;
}

function WorldSupportGraphic({ label }: { label: string }) {
  return (
    <div className={styles.worldGraphic} role="img" aria-label={label}>
      <svg viewBox="0 0 900 430" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="map-glow"><stop stopColor="#80c900" stopOpacity=".24" /><stop offset="1" stopColor="#80c900" stopOpacity="0" /></radialGradient>
          <linearGradient id="land" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#5c6670" /><stop offset="1" stopColor="#252c33" /></linearGradient>
        </defs>
        <ellipse cx="640" cy="212" rx="240" ry="200" fill="url(#map-glow)" />
        <g fill="url(#land)" stroke="#77818a" strokeWidth="1.3" opacity=".9">
          <path d="M76 116l50-38 79 7 46 36 6 48-46 21-27 63-54 12-34-55-37-38z" />
          <path d="M230 247l42 24 20 78-27 55-32-28-19-78z" />
          <path d="M374 115l52-40 74 9 31 28 57-13 88 31 62-4 70 45-36 42-71 5-42 41-60-3-29-35-50 25-52-19-22-51-52-25z" />
          <path d="M493 241l58 9 36 58-29 87-56-8-31-75z" />
          <path d="M738 315l62-22 61 33-17 49-78 9-43-35z" />
        </g>
        <g fill="none" stroke="#80c900" strokeWidth="2" opacity=".62">
          <path d="M649 191Q516 63 191 145" />
          <path d="M649 191Q540 202 274 302" />
          <path d="M649 191Q610 94 468 131" />
          <path d="M649 191Q744 224 790 337" />
        </g>
        <g fill="#80c900" stroke="#d8ff8c" strokeWidth="2">
          <circle cx="649" cy="191" r="7" /><circle cx="191" cy="145" r="4" /><circle cx="274" cy="302" r="4" /><circle cx="468" cy="131" r="4" /><circle cx="790" cy="337" r="4" />
        </g>
      </svg>
    </div>
  );
}

export function AboutNumbersSection({ content }: { content: AboutNumbersContent }) {
  if (!content.enabled) return null;
  return (
    <section className={styles.numbers} data-company-section="about-cms-numbers">
      <div className={styles.numbersIntro}>
        <DarkEyebrow centered>{content.eyebrow}</DarkEyebrow>
        <h2><Highlight text={content.title} highlight={content.highlight} /></h2>
        <p>{content.description}</p>
        <dl className={styles.statsGrid}>
          {content.stats.map((stat) => <div key={`${stat.value}-${stat.label}`}><dt>{stat.value}</dt><dd>{stat.label}</dd></div>)}
        </dl>
      </div>
      <div className={styles.numbersImage}>
        <Image src={content.image} alt={content.imageAlt} fill sizes="100vw" style={{ objectPosition: content.imageFocus || "center" }} />
      </div>
      {content.showMetalDecoration ? <div className={styles.metalEdge} aria-hidden="true" /> : null}
    </section>
  );
}

export function AboutQualitySection({ content }: { content: AboutQualityContent }) {
  if (!content.enabled) return null;
  const icons = [ShieldCheck, Settings2, Crosshair, BadgeCheck];
  return (
    <section className={styles.quality} data-company-section="about-cms-quality">
      <div className={styles.qualityCopy}>
        <DarkEyebrow>{content.eyebrow}</DarkEyebrow>
        <h2><Highlight text={content.title} highlight={content.highlight} /></h2>
        <p className={styles.lead}>{content.description}</p>
        <div className={styles.qualityPoints}>
          {content.points.map((point, index) => { const Icon = icons[index % icons.length]; return <article key={`${point.title}-${index}`}><Icon aria-hidden="true" /><div><h3>{point.title}</h3><p>{point.body}</p></div></article>; })}
        </div>
        {content.showCta && content.ctaLabel ? <IndustrialCta href={content.ctaHref} label={content.ctaLabel} /> : null}
      </div>
      <div className={styles.qualityMedia}>
        <Image src={content.image} alt={content.imageAlt} fill sizes="(min-width: 1024px) 54vw, 100vw" style={{ objectPosition: content.imageFocus || "center" }} />
        {content.certifications.length ? <ul className={styles.certifications} aria-label="Verified certifications">{content.certifications.map((item) => <li key={item}>{item}</li>)}</ul> : null}
      </div>
    </section>
  );
}

export function AboutEngineeringSection({ content }: { content: AboutEngineeringContent }) {
  if (!content.enabled) return null;
  return (
    <section className={styles.engineering} data-company-section="about-cms-engineering">
      <div className={styles.engineeringTop}>
        <div className={styles.engineeringCopy}>
          <DarkEyebrow>{content.eyebrow}</DarkEyebrow>
          <h2><Highlight text={content.title} highlight={content.highlight} /></h2>
          <div className={styles.bodyStack}>{content.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          <p className={styles.statement}><i aria-hidden="true" />{content.statement}</p>
        </div>
        <div className={styles.engineeringHero}>
          <Image src={content.featureImage} alt={content.featureImageAlt} fill sizes="(min-width: 1024px) 52vw, 100vw" style={{ objectPosition: content.featureImageFocus || "center" }} />
        </div>
      </div>
      <div className={styles.engineeringCards}>
        {content.cards.map((card) => <article key={`${card.number}-${card.title}`}><span>{card.number}</span><div className={styles.engineeringCardImage}><Image src={card.src} alt={card.alt} fill loading="eager" sizes="(min-width: 1280px) 24vw, (min-width: 640px) 50vw, 100vw" style={{ objectPosition: card.focus || "center" }} /></div><h3>{card.title}</h3><p>{card.body}</p></article>)}
      </div>
    </section>
  );
}

export function AboutGlobalDeliverySection({ content }: { content: AboutGlobalDeliveryContent }) {
  if (!content.enabled) return null;
  return (
    <section id="global-presence" className={styles.global} data-company-section="about-cms-global-delivery">
      <div className={styles.globalTop}>
        <div className={styles.globalCopy}>
          <DarkEyebrow>{content.eyebrow}</DarkEyebrow>
          <h2><span>{content.titleLineOne}</span><span>{content.titleLineTwo}</span></h2>
          <div className={styles.bodyStack}>{content.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          {content.showCta && content.ctaLabel ? <IndustrialCta href={content.ctaHref} label={content.ctaLabel} /> : null}
        </div>
        <WorldSupportGraphic label={content.mapAriaLabel} />
      </div>
      <dl className={styles.proofGrid}>{content.proofPoints.map((item) => <div key={`${item.value}-${item.label}`}><dt>{item.value}</dt><dd>{item.label}</dd></div>)}</dl>
      <div className={styles.deliveryHeader}><p>{content.deliveryEyebrow}</p><h3>{content.deliveryTitle}</h3><span>{content.deliveryDescription}</span></div>
      <div className={styles.deliveryCards}>
        {content.items.map((item) => <article key={`${item.number}-${item.title}`}><Link href={item.href} className={styles.deliveryImage}><Image src={item.src} alt={item.alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" style={{ objectPosition: item.focus || "center" }} /></Link><p>{item.number}{content.itemLabel ? ` / ${content.itemLabel}` : ""}</p><h4><Link href={item.href}>{item.title}</Link></h4><span>{item.description}</span></article>)}
      </div>
      {content.showViewAll && content.viewAllLabel ? <Link className={styles.outlineLink} href={content.viewAllHref}>{content.viewAllLabel}<span aria-hidden="true">→</span></Link> : null}
    </section>
  );
}

export function AboutQuoteSection({ content }: { content: AboutQuoteContent }) {
  if (!content.enabled) return null;
  return (
    <section className={styles.quote} data-company-section="about-cms-quote">
      <div className={styles.quoteCopy}>
        <DarkEyebrow>{content.eyebrow}</DarkEyebrow>
        <h2>{content.title}</h2>
        <div className={styles.bodyStack}>{content.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        <ol>{content.services.map((service, index) => <li key={service}><span>{String(index + 1).padStart(2, "0")}</span>{service}</li>)}</ol>
        <div className={styles.quoteImage}><Image src={content.image} alt={content.imageAlt} fill loading="eager" sizes="(min-width: 1024px) 46vw, 100vw" style={{ objectPosition: content.imageFocus || "center" }} /></div>
      </div>
      <div className={styles.quoteForm}>
        <InquiryForm productCategories={productCategories} eyebrow={content.formEyebrow} heading={content.formTitle} description={content.formDescription} privacyText={content.privacyText} headingLevel="h3" submitLabel={content.submitLabel} />
      </div>
    </section>
  );
}
