"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { ConsentAwareGoogleAnalytics } from "@/components/analytics/ConsentAwareGoogleAnalytics";
import { RoutePageView } from "@/components/analytics/RoutePageView";
import { ContactClickTracker } from "@/components/analytics/ContactClickTracker";
import {
  ANALYTICS_CONSENT_CHANGE_EVENT,
  ANALYTICS_PREFERENCES_EVENT,
  readAnalyticsConsent,
  writeAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/analytics/consent";

export function AnalyticsConsentProvider({ children }: { children?: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [consent, setConsent] = useState<AnalyticsConsent | null>(null);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const acceptButton = useRef<HTMLButtonElement>(null);
  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim();

  useEffect(() => {
    const persisted = readAnalyticsConsent();
    setConsent(persisted);
    setPreferencesOpen(persisted === null);
    setHydrated(true);

    const onChange = (event: Event) => {
      const value = (event as CustomEvent<AnalyticsConsent>).detail;
      if (value === "accepted" || value === "rejected") setConsent(value);
    };
    const onPreferences = () => setPreferencesOpen(true);
    window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, onChange);
    window.addEventListener(ANALYTICS_PREFERENCES_EVENT, onPreferences);
    return () => {
      window.removeEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, onChange);
      window.removeEventListener(ANALYTICS_PREFERENCES_EVENT, onPreferences);
    };
  }, []);

  useEffect(() => {
    if (preferencesOpen) acceptButton.current?.focus();
  }, [preferencesOpen]);

  useEffect(() => {
    if (!measurementId || !consent) return;
    const disableKey = `ga-disable-${measurementId}`;
    (window as unknown as Record<string, unknown>)[disableKey] = consent !== "accepted";
    if (consent === "rejected") clearGoogleAnalyticsCookies();
  }, [consent, measurementId]);

  function choose(value: AnalyticsConsent) {
    writeAnalyticsConsent(value);
    setConsent(value);
    setPreferencesOpen(false);
    setAnnouncement(value === "accepted" ? "Analytics cookies accepted" : "Analytics cookies rejected");
  }

  return (
    <>
      {children}
      <ContactClickTracker />
      {hydrated && preferencesOpen ? (
        <section
          role="dialog"
          aria-label="Analytics cookie preferences"
          aria-describedby="analytics-consent-description"
          className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-3xl rounded border border-white/15 bg-black p-5 text-white shadow-2xl sm:p-6"
        >
          <h2 className="text-lg font-semibold">Your privacy choices</h2>
          <p id="analytics-consent-description" className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
            We use optional Google Analytics cookies to understand site usage and improve our machinery information. Rejecting them does not affect website functions.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button ref={acceptButton} type="button" onClick={() => choose("accepted")} className="rounded-sm bg-[#76B900] px-5 py-2.5 text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-white">
              Accept analytics
            </button>
            <button type="button" onClick={() => choose("rejected")} className="rounded-sm border border-white/30 px-5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white">
              Reject analytics
            </button>
          </div>
        </section>
      ) : null}
      <p role="status" aria-live="polite" className="sr-only">{announcement}</p>
      {consent === "accepted" && measurementId ? (
        <>
          <ConsentAwareGoogleAnalytics measurementId={measurementId} />
          <RoutePageView />
        </>
      ) : null}
    </>
  );
}

function clearGoogleAnalyticsCookies() {
  const cookieNames = document.cookie
    .split(";")
    .map((part) => part.trim().split("=", 1)[0])
    .filter((name) => /^_(?:ga(?:_|$)|gid$|gat(?:_|$)|gac_|gcl_au$)/i.test(name));
  const hostname = window.location.hostname;
  const labels = hostname.split(".");
  const rootDomain = labels.length > 1 ? `.${labels.slice(-2).join(".")}` : null;
  const domains = [null, hostname, `.${hostname}`, rootDomain];

  for (const name of cookieNames) {
    for (const domain of new Set(domains)) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain ? `; Domain=${domain}` : ""}`;
    }
  }
}
