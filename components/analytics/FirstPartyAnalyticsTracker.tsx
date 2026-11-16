"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import {
  enqueueFirstPartyEvent,
  flushFirstPartyAnalyticsEvents,
} from "@/lib/analytics/first-party/client";
import { createSafePagePath } from "@/lib/analytics/client-events";

const HEARTBEAT_MS = 30_000;
const RECENT_ACTIVITY_MS = 5 * 60_000;
const ACTIVITY_CHANNEL = "zyron-analytics-activity";

function clientId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const values = new Uint8Array(16);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("");
}

function productSlug(pathname: string) {
  const match = pathname.match(/^\/products\/([^/?#]+)/);
  return match?.[1] ? decodeURIComponent(match[1]).slice(0, 200) : undefined;
}

export function FirstPartyAnalyticsTracker({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();

  useEffect(() => {
    if (!enabled) return;

    const path = createSafePagePath(pathname, search);
    const pageViewId = clientId();
    const slug = productSlug(pathname);
    let activeSeconds = 0;
    let lastActivityAt = Date.now();
    let ended = false;
    const channel = typeof BroadcastChannel === "function" ? new BroadcastChannel(ACTIVITY_CHANNEL) : null;

    const markActive = () => {
      lastActivityAt = Date.now();
      channel?.postMessage({ type: "activity", at: lastActivityAt });
    };
    if (channel) {
      channel.onmessage = (event: MessageEvent) => {
        const data = event.data as { type?: unknown; at?: unknown };
        if (data.type === "activity" && typeof data.at === "number") {
          lastActivityAt = Math.max(lastActivityAt, data.at);
        }
      };
    }

    enqueueFirstPartyEvent({
      kind: "page_view",
      pageViewId,
      path,
      title: document.title || undefined,
      referrer: document.referrer || undefined,
      productSlug: slug,
    });
    void flushFirstPartyAnalyticsEvents();

    const heartbeat = () => {
      if (document.visibilityState !== "visible" || Date.now() - lastActivityAt > RECENT_ACTIVITY_MS) return;
      activeSeconds += HEARTBEAT_MS / 1_000;
      enqueueFirstPartyEvent({ kind: "heartbeat", pageViewId, path, activeSeconds });
      void flushFirstPartyAnalyticsEvents();
    };
    const finish = () => {
      if (ended) return;
      ended = true;
      enqueueFirstPartyEvent({ kind: "page_exit", pageViewId, path, activeSeconds });
      flushFirstPartyAnalyticsEvents({ beacon: true });
    };
    const interval = window.setInterval(heartbeat, HEARTBEAT_MS);
    const activityEvents = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    for (const eventName of activityEvents) window.addEventListener(eventName, markActive, { passive: true });
    window.addEventListener("pagehide", finish);

    return () => {
      window.clearInterval(interval);
      for (const eventName of activityEvents) window.removeEventListener(eventName, markActive);
      window.removeEventListener("pagehide", finish);
      channel?.close();
      finish();
    };
  }, [enabled, pathname, search]);

  return null;
}
