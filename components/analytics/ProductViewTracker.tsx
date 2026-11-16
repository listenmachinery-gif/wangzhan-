"use client";

import { useEffect, useRef } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics/client-events";
import { ANALYTICS_CONSENT_CHANGE_EVENT, ANALYTICS_TAG_READY_EVENT } from "@/lib/analytics/consent";

export function ProductViewTracker({
  productId,
  productSlug,
  productName,
  productCategory,
}: {
  productId?: string;
  productSlug: string;
  productName: string;
  productCategory: string;
}) {
  const sentProduct = useRef<string | null>(null);

  useEffect(() => {
    const productKey = productId ?? productSlug;
    const send = () => {
      if (sentProduct.current === productKey) return;
      if (trackAnalyticsEvent("product_view", {
        product_id: productId,
        product_slug: productSlug,
        product_name: productName,
        product_category: productCategory,
      })) sentProduct.current = productKey;
    };
    send();
    window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, send);
    window.addEventListener(ANALYTICS_TAG_READY_EVENT, send);
    return () => {
      window.removeEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, send);
      window.removeEventListener(ANALYTICS_TAG_READY_EVENT, send);
    };
  }, [productCategory, productId, productName, productSlug]);

  return null;
}
