"use client";

import { openAnalyticsPreferences } from "@/lib/analytics/consent";

export function CookiePreferencesButton() {
  return (
    <button type="button" onClick={openAnalyticsPreferences} className="transition hover:text-white">
      Cookie preferences
    </button>
  );
}
