"use client";

import Script from "next/script";

export function ConsentAwareGoogleAnalytics({ measurementId }: { measurementId: string }) {
  return (
    <Script
      id="zyron-ga4"
      src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      strategy="afterInteractive"
    />
  );
}
