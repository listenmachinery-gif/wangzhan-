import { readAnalyticsConsent } from "@/lib/analytics/consent";

export type AnalyticsEventParams = {
  page_view: { page_path: string };
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
  page_view: new Set(["page_path"]),
  product_view: new Set(["product_slug", "product_id", "product_name", "product_category"]),
  inquiry_start: new Set(["form_id", "product_slug"]),
  inquiry_submit: new Set(["form_id", "product_slug"]),
  whatsapp_click: new Set(["link_path", "placement"]),
  email_click: new Set(["link_path", "placement"]),
  catalog_download: new Set(["asset_name", "asset_path"]),
};

const unsafeKey = /(?:^|_)(?:email|phone|message|lead|session|token|password)(?:_|$)/i;
const unsafeQueryKey = /(?:email|phone|message|lead|session|token|password|name)/i;

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
  const sanitized = safeParams(name, params);
  if (!sanitized) return false;
  window.gtag("event", name, sanitized);
  return true;
}

export function createSafePagePath(pathname: string, rawSearch: string) {
  const search = new URLSearchParams(rawSearch);
  for (const key of Array.from(search.keys())) {
    if (unsafeQueryKey.test(key)) search.delete(key);
  }
  const query = search.toString();
  return `${pathname}${query ? `?${query}` : ""}`;
}
