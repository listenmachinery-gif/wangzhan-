"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { createSafePagePath, trackAnalyticsEvent } from "@/lib/analytics/client-events";

export function RoutePageView() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const previousUrl = useRef<string | null>(null);

  useEffect(() => {
    const currentUrl = createSafePagePath(pathname, search);
    if (previousUrl.current === null) {
      previousUrl.current = currentUrl;
      return;
    }
    if (previousUrl.current === currentUrl) return;
    previousUrl.current = currentUrl;
    trackAnalyticsEvent("page_view", { page_path: currentUrl });
  }, [pathname, search]);

  return null;
}
