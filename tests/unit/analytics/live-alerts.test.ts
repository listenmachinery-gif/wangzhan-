// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import type { LiveVisitorArrival } from "@/lib/analytics/first-party/types";
import {
  buildLiveOverviewUrl,
  enqueueLiveAlerts,
  getLatestLiveOverview,
  LIVE_OVERVIEW_EVENT,
  publishLiveOverview,
  reconcileLiveArrivals,
} from "@/lib/analytics/first-party/live-alerts";
import type { FirstPartyOverview } from "@/lib/analytics/first-party/types";

function arrival(id: string): LiveVisitorArrival {
  return { id, label: `访客-${id}`, firstSeenAt: "2026-11-16T12:00:00.000Z", countryCode: null, city: null, deviceType: null, path: "/" };
}

describe("live visitor alert state", () => {
  it("builds a silent baseline URL and an encoded cursor URL", () => {
    expect(buildLiveOverviewUrl()).toBe("/api/admin/analytics/first-party/overview");
    expect(buildLiveOverviewUrl("2026-11-16T12:00:00.000Z")).toBe(
      "/api/admin/analytics/first-party/overview?since=2026-11-16T12%3A00%3A00.000Z",
    );
  });

  it("returns each new arrival once and bounds remembered visitor ids", () => {
    const first = reconcileLiveArrivals(["known"], [arrival("known"), arrival("new-a"), arrival("new-b")], 3);
    const second = reconcileLiveArrivals(first.seenIds, [arrival("new-a"), arrival("new-c")], 3);

    expect(first.newArrivals.map(({ id }) => id)).toEqual(["new-a", "new-b"]);
    expect(second.newArrivals.map(({ id }) => id)).toEqual(["new-c"]);
    expect(second.seenIds).toEqual(["new-a", "new-b", "new-c"]);
  });

  it("bounds burst alerts while keeping the displayed visitor and newest arrivals", () => {
    const queued = [arrival("showing"), arrival("old-a"), arrival("old-b")];
    const incoming = [arrival("new-a"), arrival("new-b"), arrival("new-c")];

    expect(enqueueLiveAlerts(queued, incoming, 4).map(({ id }) => id)).toEqual([
      "showing",
      "new-a",
      "new-b",
      "new-c",
    ]);
  });

  it("caches and broadcasts the latest overview so newly mounted dashboards render immediately", () => {
    const snapshot: FirstPartyOverview = {
      generatedAt: "2026-11-16T12:00:00.000Z",
      environment: "TEST",
      summary: { onlineVisitors: 2, activeVisitors: 3, visitorsToday: 4, sessionsToday: 5, pageViewsToday: 6 },
      arrivals: [],
    };
    let broadcast: FirstPartyOverview | null = null;
    window.addEventListener(LIVE_OVERVIEW_EVENT, (event) => {
      broadcast = (event as CustomEvent<FirstPartyOverview>).detail;
    }, { once: true });

    publishLiveOverview(snapshot);

    expect(getLatestLiveOverview()).toEqual(snapshot);
    expect(broadcast).toEqual(snapshot);
  });
});
