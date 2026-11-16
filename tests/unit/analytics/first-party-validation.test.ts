import { describe, expect, it } from "vitest";

import { parseAnalyticsBatch } from "@/lib/validation/first-party-analytics";

const pageView = {
  kind: "page_view",
  eventId: "event_001",
  pageViewId: "page_001",
  path: "/products/small-electric-shear?utm_source=google&utm_medium=cpc",
  title: "Small Electric Shearing Machine",
  productSlug: "small-electric-shearing-machine",
  occurredAt: "2026-11-16T08:00:00.000Z",
};

describe("first-party analytics validation", () => {
  it("accepts a bounded batch containing page, heartbeat, exit, and allowlisted business events", () => {
    const parsed = parseAnalyticsBatch({
      events: [
        pageView,
        {
          kind: "heartbeat",
          eventId: "event_002",
          pageViewId: "page_001",
          path: "/products/small-electric-shear",
          activeSeconds: 30,
          occurredAt: "2026-11-16T08:00:30.000Z",
        },
        {
          kind: "page_exit",
          eventId: "event_003",
          pageViewId: "page_001",
          path: "/products/small-electric-shear",
          activeSeconds: 42,
          occurredAt: "2026-11-16T08:00:45.000Z",
        },
        {
          kind: "event",
          eventId: "event_004",
          pageViewId: "page_001",
          eventType: "PRODUCT_VIEW",
          path: "/products/small-electric-shear",
          productSlug: "small-electric-shearing-machine",
          properties: { placement: "product_hero", product_category: "Shearing Machines" },
          occurredAt: "2026-11-16T08:00:01.000Z",
        },
      ],
    });

    expect(parsed.events).toHaveLength(4);
    expect(parsed.events[0]).toMatchObject({ kind: "page_view", occurredAt: new Date("2026-11-16T08:00:00Z") });
  });

  it("rejects PII and unknown event-property keys", () => {
    expect(() => parseAnalyticsBatch({
      events: [{
        kind: "event",
        eventId: "event_pii",
        eventType: "INQUIRY_SUBMIT",
        path: "/contact",
        properties: { email: "buyer@example.com" },
        occurredAt: "2026-11-16T08:00:00.000Z",
      }],
    })).toThrow();
    expect(() => parseAnalyticsBatch({
      events: [{
        kind: "event",
        eventId: "event_unknown",
        eventType: "WHATSAPP_CLICK",
        properties: { arbitrary: "value" },
        occurredAt: "2026-11-16T08:00:00.000Z",
      }],
    })).toThrow();
  });

  it("rejects batches larger than 20 events", () => {
    expect(() => parseAnalyticsBatch({
      events: Array.from({ length: 21 }, (_, index) => ({
        ...pageView,
        eventId: `event_${index}`,
        pageViewId: `page_${index}`,
      })),
    })).toThrow();
  });

  it("rejects unknown fields and invalid public paths", () => {
    expect(() => parseAnalyticsBatch({ events: [{ ...pageView, email: "buyer@example.com" }] })).toThrow();
    expect(() => parseAnalyticsBatch({ events: [{ ...pageView, path: "https://evil.example/path" }] })).toThrow();
  });
});
