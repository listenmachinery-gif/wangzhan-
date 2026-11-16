export const ANALYTICS_CONSENT_COOKIE = "zyron_analytics_consent";
export const ANALYTICS_CONSENT_CHANGE_EVENT = "zyron:analytics-consent-change";
export const ANALYTICS_PREFERENCES_EVENT = "zyron:analytics-consent-preferences";
export const ANALYTICS_TAG_READY_EVENT = "zyron:analytics-tag-ready";

export type AnalyticsConsent = "accepted" | "rejected";

const MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

export function readAnalyticsConsent(): AnalyticsConsent | null {
  if (typeof document === "undefined") return null;
  const value = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ANALYTICS_CONSENT_COOKIE}=`))
    ?.slice(ANALYTICS_CONSENT_COOKIE.length + 1);
  return value === "accepted" || value === "rejected" ? value : null;
}

export function writeAnalyticsConsent(value: AnalyticsConsent) {
  if (typeof document === "undefined") return;
  const secure = (
    process.env.NODE_ENV === "production"
    || (typeof window !== "undefined" && window.location.protocol === "https:")
  ) ? "; Secure" : "";
  document.cookie = `${ANALYTICS_CONSENT_COOKIE}=${value}; Max-Age=${MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_CHANGE_EVENT, { detail: value }));
}

export function openAnalyticsPreferences() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(ANALYTICS_PREFERENCES_EVENT));
}
