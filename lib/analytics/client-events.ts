import {
  enqueueFirstPartyEvent,
  flushFirstPartyAnalyticsEvents,
  type FirstPartyEventInput,
} from "@/lib/analytics/first-party/client";
import {
  ANALYTICS_CONSENT_CHANGE_EVENT,
  readAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/analytics/consent";

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
const pendingFirstPartyEvents = new Set<string>();

if (typeof window !== "undefined") {
  window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, (event) => {
    if ((event as CustomEvent<AnalyticsConsent>).detail === "rejected") pendingFirstPartyEvents.clear();
  });
}

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
  if (typeof window === "undefined" || readAnalyticsConsent() !== "accepted") {
    return false;
  }
  const sanitized = safeParams(name, params);
  if (!sanitized) return false;
  const pendingKey = bridgeFirstPartyEvent(name, sanitized);
  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim();
  if (measurementId && (window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] === true) {
    return false;
  }
  if (typeof window.gtag !== "function") return false;
  window.gtag("event", name, sanitized);
  if (pendingKey) pendingFirstPartyEvents.delete(pendingKey);
  return true;
}

function bridgeFirstPartyEvent(
  name: AnalyticsEventName,
  params: Record<string, string | number | boolean>,
) {
  if (name === "page_view") return null;
  const pendingKey = `${name}:${window.location.pathname}:${JSON.stringify(params)}`;
  if (pendingFirstPartyEvents.has(pendingKey)) return pendingKey;
  const input = firstPartyEvent(name, params);
  if (!input || !enqueueFirstPartyEvent(input)) return null;
  pendingFirstPartyEvents.add(pendingKey);
  void flushFirstPartyAnalyticsEvents();
  return pendingKey;
}

function firstPartyEvent(
  name: Exclude<AnalyticsEventName, "page_view">,
  params: Record<string, string | number | boolean>,
): FirstPartyEventInput | null;
function firstPartyEvent(
  name: AnalyticsEventName,
  params: Record<string, string | number | boolean>,
): FirstPartyEventInput | null {
  if (name === "page_view") return null;
  const eventTypes = {
    product_view: "PRODUCT_VIEW",
    inquiry_start: "INQUIRY_START",
    inquiry_submit: "INQUIRY_SUBMIT",
    whatsapp_click: "WHATSAPP_CLICK",
    email_click: "EMAIL_CLICK",
    catalog_download: "CATALOG_DOWNLOAD",
  } as const;
  const productSlug = typeof params.product_slug === "string" ? params.product_slug : undefined;
  const properties: Record<string, string | number | boolean> = {};
  if (typeof params.form_id === "string") properties.form_kind = params.form_id;
  for (const key of ["placement", "link_path", "asset_name", "asset_path", "product_name", "product_category"] as const) {
    if (params[key] !== undefined) properties[key] = params[key];
  }
  return {
    kind: "event",
    eventType: eventTypes[name],
    path: createSafePagePath(window.location.pathname, window.location.search),
    productSlug,
    properties: Object.keys(properties).length ? properties : undefined,
  };
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
