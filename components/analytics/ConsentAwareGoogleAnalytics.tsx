"use client";

import Script from "next/script";
import { useEffect } from "react";

import { ANALYTICS_TAG_READY_EVENT } from "@/lib/analytics/consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function ConsentAwareGoogleAnalytics({ measurementId }: { measurementId: string }) {
  useEffect(() => {
    const disableKey = `ga-disable-${measurementId}`;
    (window as unknown as Record<string, unknown>)[disableKey] = false;
    window.dataLayer = window.dataLayer ?? [];
    window.gtag = window.gtag ?? function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", measurementId, { send_page_view: false });
    window.dispatchEvent(new Event(ANALYTICS_TAG_READY_EVENT));
  }, [measurementId]);

  return (
    <Script
      id="zyron-ga4"
      src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      strategy="afterInteractive"
    />
  );
}
