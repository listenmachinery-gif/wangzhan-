"use client";

import { useEffect } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics/client-events";

export function ContactClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      const placement = anchor.dataset.analyticsPlacement;

      if (href.toLowerCase().startsWith("mailto:")) {
        trackAnalyticsEvent("email_click", { link_path: "mailto", placement });
        return;
      }
      if (/^https:\/\/wa\.me\//i.test(href)) {
        trackAnalyticsEvent("whatsapp_click", { link_path: "whatsapp", placement });
        return;
      }
      const assetName = anchor.dataset.analyticsDownload;
      if (!assetName) return;
      const assetPath = href.split(/[?#]/, 1)[0];
      trackAnalyticsEvent("catalog_download", { asset_name: assetName, asset_path: assetPath });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
