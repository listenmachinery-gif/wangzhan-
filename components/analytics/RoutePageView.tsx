"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { createSafePagePath, trackAnalyticsEvent } from "@/lib/analytics/client-events";
import { ANALYTICS_TAG_READY_EVENT } from "@/lib/analytics/consent";

export function RoutePageView() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const previousUrl = useRef<string | null>(null);

  useEffect(() => {
    const currentUrl = createSafePagePath(pathname, search);
    const sendPageView = () => {
      if (previousUrl.current === currentUrl) return;
      const sent = trackAnalyticsEvent("page_view", {
        page_path: currentUrl,
        page_location: `${window.location.origin}${currentUrl}`,
      });
      if (sent) previousUrl.current = currentUrl;
    };

    sendPageView();
    window.addEventListener(ANALYTICS_TAG_READY_EVENT, sendPageView);
    return () => window.removeEventListener(ANALYTICS_TAG_READY_EVENT, sendPageView);
  }, [pathname, search]);

  return null;
}
