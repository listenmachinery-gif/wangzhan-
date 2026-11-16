"use client";

import { useCallback, useRef } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics/client-events";

export function useInquiryTracking(formId: string, productSlug?: string) {
  const started = useRef(false);
  const submitted = useRef(false);

  const trackStart = useCallback(() => {
    if (started.current) return;
    if (trackAnalyticsEvent("inquiry_start", { form_id: formId, product_slug: productSlug })) {
      started.current = true;
    }
  }, [formId, productSlug]);

  const trackSuccessfulSubmit = useCallback((honeypot: string) => {
    if (submitted.current || honeypot.trim() !== "") return;
    if (trackAnalyticsEvent("inquiry_submit", { form_id: formId, product_slug: productSlug })) {
      submitted.current = true;
    }
  }, [formId, productSlug]);

  return { trackStart, trackSuccessfulSubmit };
}
