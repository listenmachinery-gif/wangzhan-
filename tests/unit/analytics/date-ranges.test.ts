import { describe, expect, it } from "vitest";

import { getCompletedDateWindows } from "@/lib/analytics/date-ranges";

describe("getCompletedDateWindows", () => {
  it.each([
    ["7d", { startDate: "2026-11-09", endDate: "2026-11-15" }, { startDate: "2026-11-02", endDate: "2026-11-08" }],
    ["28d", { startDate: "2026-10-19", endDate: "2026-11-15" }, { startDate: "2026-09-21", endDate: "2026-10-18" }],
    ["90d", { startDate: "2026-08-18", endDate: "2026-11-15" }, { startDate: "2026-05-20", endDate: "2026-08-17" }],
  ] as const)("returns exact completed Asia/Shanghai windows for %s", (range, current, previous) => {
    expect(getCompletedDateWindows(range, new Date("2026-11-16T02:00:00.000Z"), "Asia/Shanghai"))
      .toEqual({ current, previous });
  });

  it("uses Pacific calendar dates across the daylight-saving boundary", () => {
    expect(getCompletedDateWindows(
      "7d",
      new Date("2026-03-09T08:30:00.000Z"),
      "America/Los_Angeles",
    )).toEqual({
      current: { startDate: "2026-03-02", endDate: "2026-03-08" },
      previous: { startDate: "2026-02-23", endDate: "2026-03-01" },
    });
  });
});
