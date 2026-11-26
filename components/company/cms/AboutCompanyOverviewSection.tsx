import Image from "next/image";

import { IndustrialCta } from "./IndustrialCta";
import styles from "./about-sections.module.css";

export type AboutCompanyOverviewContent = {
  enabled: boolean;
  eyebrow: string;
  title: string;
  highlight: string;
  paragraphs: string[];
  values: Array<{ title: string }>;
  ctaLabel: string;
  ctaHref: string;
  showCta: boolean;
  showGeometry: boolean;
  showMetalDecoration: boolean;
  images: Array<{ src: string; alt: string; focus: string }>;
};

function Highlight({ text, highlight }: { text: string; highlight: string }) {
  const index = highlight ? text.indexOf(highlight) : -1;
  if (index < 0) return <>{text}</>;
  return <>{text.slice(0, index)}<span data-page-text="highlight">{highlight}</span>{text.slice(index + highlight.length)}</>;
}

export function AboutCompanyOverviewSection({ content }: { content: AboutCompanyOverviewContent }) {
  if (!content.enabled) return null;
  return (
    <section id="company-overview" className={styles.overview} data-company-section="about-cms-overview" data-company-layout="gallery-left-copy-right">
      {content.showGeometry ? <div aria-hidden="true" data-about-decoration className={styles.overviewGeometry} /> : null}
      <div className={styles.overviewInner}>
        <div className={styles.overviewGallery} aria-label="ZYRON manufacturing workshop photography">
          {content.images.map((image, index) => (
            <div className={styles.overviewImage} key={`${image.src}-${index}`}>
              <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 28vw, 50vw" style={{ objectPosition: image.focus || "center" }} />
            </div>
          ))}
        </div>
        <div className={styles.overviewCopy}>
          <p className={styles.darkEyebrow} data-page-text="eyebrow"><span>{content.eyebrow}</span><i aria-hidden="true" /></p>
          <h2 data-page-text="title" className={styles.overviewTitle}><Highlight text={content.title} highlight={content.highlight} /></h2>
          <div className={styles.overviewBody}>
            {content.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <ul className={styles.overviewValues} aria-label="Company strengths">
            {content.values.map((value) => <li key={value.title}>{value.title}</li>)}
          </ul>
          {content.showCta && content.ctaLabel ? <IndustrialCta href={content.ctaHref} label={content.ctaLabel} /> : null}
        </div>
      </div>
      {content.showMetalDecoration ? <div aria-hidden="true" data-about-decoration className={styles.overviewMetal} /> : null}
    </section>
  );
}
