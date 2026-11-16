"use client";

import { ANALYTICS_CONSENT_CHANGE_EVENT, readAnalyticsConsent, type AnalyticsConsent } from "@/lib/analytics/consent";

type BaseInput = {
  eventId?: string;
  occurredAt?: string;
};

export type FirstPartyEventInput = BaseInput & (
  | {
    kind: "page_view";
    pageViewId: string;
    path: string;
    title?: string;
    referrer?: string;
    productSlug?: string;
  }
  | {
    kind: "heartbeat" | "page_exit";
    pageViewId: string;
    path: string;
    activeSeconds: number;
  }
  | {
    kind: "event";
    pageViewId?: string;
    eventType: "PRODUCT_VIEW" | "INQUIRY_START" | "INQUIRY_SUBMIT" | "WHATSAPP_CLICK" | "EMAIL_CLICK" | "CATALOG_DOWNLOAD" | "CHAT_STARTED" | "CHAT_MESSAGE_SENT";
    path?: string;
    productSlug?: string;
    properties?: Record<string, string | number | boolean>;
  }
);

type QueuedEvent = FirstPartyEventInput & {
  eventId: string;
  occurredAt: string;
};

const MAX_QUEUE_SIZE = 100;
const BATCH_SIZE = 20;
let queue: QueuedEvent[] = [];
let inFlight: Promise<boolean> | null = null;
let consentListenerInstalled = false;

function eventId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

function ensureConsentListener() {
  if (consentListenerInstalled || typeof window === "undefined") return;
  window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, (event) => {
    if ((event as CustomEvent<AnalyticsConsent>).detail === "rejected") clearPendingFirstPartyAnalytics();
  });
  consentListenerInstalled = true;
}

export function clearPendingFirstPartyAnalytics() {
  queue = [];
}

export function enqueueFirstPartyEvent(input: FirstPartyEventInput) {
  if (typeof window === "undefined" || readAnalyticsConsent() !== "accepted") return false;
  ensureConsentListener();
  const queued = {
    ...input,
    eventId: input.eventId ?? eventId(),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
  } as QueuedEvent;
  queue.push(queued);
  if (queue.length > MAX_QUEUE_SIZE) queue = queue.slice(-MAX_QUEUE_SIZE);
  return true;
}

function beaconFlush() {
  if (typeof navigator.sendBeacon !== "function" || readAnalyticsConsent() !== "accepted" || queue.length === 0) {
    return false;
  }
  const batch = queue.slice(0, BATCH_SIZE);
  const sent = navigator.sendBeacon(
    "/api/analytics/collect",
    new Blob([JSON.stringify({ events: batch })], { type: "application/json" }),
  );
  if (sent) {
    const sentIds = new Set(batch.map(({ eventId: id }) => id));
    queue = queue.filter(({ eventId: id }) => !sentIds.has(id));
  }
  return sent;
}

async function httpFlush() {
  if (readAnalyticsConsent() !== "accepted" || queue.length === 0) return false;
  if (inFlight) return inFlight;
  const batch = queue.slice(0, BATCH_SIZE);
  inFlight = (async () => {
    try {
      const response = await fetch("/api/analytics/collect", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ events: batch }),
        keepalive: true,
      });
      if (!response.ok) return false;
      const sentIds = new Set(batch.map(({ eventId: id }) => id));
      queue = queue.filter(({ eventId: id }) => !sentIds.has(id));
      return true;
    } catch {
      return false;
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}

export function flushFirstPartyAnalyticsEvents(options: { beacon: true }): boolean;
export function flushFirstPartyAnalyticsEvents(options?: { beacon?: false }): Promise<boolean>;
export function flushFirstPartyAnalyticsEvents(options: { beacon?: boolean } = {}) {
  ensureConsentListener();
  return options.beacon ? beaconFlush() : httpFlush();
}
