import Image from "next/image";

import { IndustrialCta } from "./IndustrialCta";
import styles from "./about-sections.module.css";

export type AboutManufacturingContent = {
  enabled: boolean;
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  processes: Array<{ number: string; title: string; body: string; src: string; alt: string }>;
  ctaLabel: string;
  ctaHref: string;
  showCta: boolean;
  showGeometry: boolean;
  showMetalDecoration: boolean;
  galleryAngle: number;
  galleryGap: number;
};

function Highlight({ text, highlight }: { text: string; highlight: string }) {
  const index = highlight ? text.indexOf(highlight) : -1;
  if (index < 0) return <>{text}</>;
  return <>{text.slice(0, index)}<span data-page-text="highlight">{highlight}</span>{text.slice(index + highlight.length)}</>;
}

export function AboutManufacturingSection({ content }: { content: AboutManufacturingContent }) {
  if (!content.enabled) return null;
  const galleryStyle = {
    "--gallery-angle": `${content.galleryAngle}deg`,
    "--gallery-gap": `${content.galleryGap}px`,
  } as React.CSSProperties;
  return (
    <section className={styles.manufacturing} data-company-section="about-cms-manufacturing">
      {content.showGeometry ? <div aria-hidden="true" data-about-decoration className={styles.manufacturingGeometry} /> : null}
      <div className={styles.manufacturingInner}>
        <div className={styles.manufacturingCopy}>
          <p className={styles.lightEyebrow} data-page-text="eyebrow"><i aria-hidden="true" /><span>{content.eyebrow}</span></p>
          <h2 data-page-text="title" className={styles.manufacturingTitle}><Highlight text={content.title} highlight={content.highlight} /></h2>
          <p data-page-text="description" className={styles.manufacturingDescription}>{content.description}</p>
          <ol className={styles.processGrid}>
            {content.processes.map((process) => (
              <li key={`${process.number}-${process.title}`}>
                <div className={styles.processNumber}>{process.number}</div>
                <div><h3>{process.title}</h3><p>{process.body}</p></div>
              </li>
            ))}
          </ol>
          {content.showCta && content.ctaLabel && content.ctaHref ? <IndustrialCta href={content.ctaHref} label={content.ctaLabel} /> : null}
        </div>
        <div className={styles.manufacturingGallery} style={galleryStyle} aria-label="ZYRON manufacturing capabilities photography">
          {content.processes.map((process, index) => (
            <div className={styles.manufacturingTile} key={`${process.src}-${index}`}>
              <div className={styles.manufacturingMedia}>
                <Image src={process.src} alt={process.alt} fill sizes="(min-width: 1024px) 28vw, 50vw" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {content.showMetalDecoration ? <div aria-hidden="true" data-about-decoration className={styles.manufacturingMetal} /> : null}
    </section>
  );
}
