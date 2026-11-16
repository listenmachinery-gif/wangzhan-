import { readAnalyticsConsent } from "@/lib/analytics/consent";

export type AnalyticsEventParams = {
  page_view: { page_path: string; page_location: string };
  product_view: { product_slug: string; product_id?: string; product_name?: string; product_category?: string };
  inquiry_start: { form_id: string; product_slug?: string };
  inquiry_submit: { form_id: string; product_slug?: string };
  whatsapp_click: { link_path: string; placement?: string };
  email_click: { link_path: string; placement?: string };
  catalog_download: { asset_name: string; asset_path: string };
};

export type AnalyticsEventName = keyof AnalyticsEventParams;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const allowedKeys: { [K in AnalyticsEventName]: ReadonlySet<keyof AnalyticsEventParams[K]> } = {
  page_view: new Set(["page_path", "page_location"]),
  product_view: new Set(["product_slug", "product_id", "product_name", "product_category"]),
  inquiry_start: new Set(["form_id", "product_slug"]),
  inquiry_submit: new Set(["form_id", "product_slug"]),
  whatsapp_click: new Set(["link_path", "placement"]),
  email_click: new Set(["link_path", "placement"]),
  catalog_download: new Set(["asset_name", "asset_path"]),
};

const unsafeKey = /(?:^|_)(?:email|phone|message|lead|session|token|password)(?:_|$)/i;
const allowedQueryKeys = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
]);
const piiValue = /(?:[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\+?\d[\d\s().-]{6,}\d))/i;

function safeParams<K extends AnalyticsEventName>(name: K, params: AnalyticsEventParams[K]) {
  if (!params || typeof params !== "object" || Array.isArray(params)) return null;
  const permitted = allowedKeys[name] as ReadonlySet<string> | undefined;
  if (!permitted) return null;
  const entries = Object.entries(params as Record<string, unknown>);
  const output: Record<string, string | number | boolean> = {};
  for (const [key, value] of entries) {
    if (unsafeKey.test(key) || !permitted.has(key)) return null;
    if (value === undefined) continue;
    if (!["string", "number", "boolean"].includes(typeof value)) return null;
    if (typeof value === "string" && value.length > 300) return null;
    if (typeof value === "number" && !Number.isFinite(value)) return null;
    output[key] = value as string | number | boolean;
  }
  return output;
}

export function trackAnalyticsEvent<K extends AnalyticsEventName>(
  name: K,
  params: AnalyticsEventParams[K],
): boolean {
  if (typeof window === "undefined" || readAnalyticsConsent() !== "accepted" || typeof window.gtag !== "function") {
    return false;
  }
  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim();
  if (measurementId && (window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] === true) {
    return false;
  }
  const sanitized = safeParams(name, params);
  if (!sanitized) return false;
  window.gtag("event", name, sanitized);
  return true;
}

export function createSafePagePath(pathname: string, rawSearch: string) {
  const search = new URLSearchParams(rawSearch);
  for (const [key, value] of Array.from(search.entries())) {
    if (!allowedQueryKeys.has(key.toLowerCase()) || value.length > 128 || piiValue.test(value)) {
      search.delete(key);
    }
  }
  const query = search.toString();
  return `${pathname}${query ? `?${query}` : ""}`;
}
