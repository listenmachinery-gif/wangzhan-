// @vitest-environment jsdom

import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const route = vi.hoisted(() => ({ pathname: "/products", search: "utm_source=google&email=private%40example.com" }));
const client = vi.hoisted(() => ({
  enqueue: vi.fn((...args: [{ kind: string; [key: string]: unknown }]) => {
    void args;
    return true;
  }),
  flush: vi.fn((...args: [{ beacon?: boolean }?]) => {
    void args;
    return Promise.resolve(true);
  }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
  useSearchParams: () => new URLSearchParams(route.search),
}));

vi.mock("@/lib/analytics/first-party/client", () => ({
  enqueueFirstPartyEvent: client.enqueue,
  flushFirstPartyAnalyticsEvents: client.flush,
}));

import { FirstPartyAnalyticsTracker } from "@/components/analytics/FirstPartyAnalyticsTracker";

class RecordingBroadcastChannel {
  static channels: RecordingBroadcastChannel[] = [];
  onmessage: ((event: MessageEvent) => void) | null = null;
  postMessage = vi.fn();
  close = vi.fn();

  constructor(readonly name: string) {
    RecordingBroadcastChannel.channels.push(this);
  }
}

describe("FirstPartyAnalyticsTracker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    route.pathname = "/products";
    route.search = "utm_source=google&email=private%40example.com";
    client.enqueue.mockClear();
    client.flush.mockClear();
    RecordingBroadcastChannel.channels = [];
    vi.stubGlobal("BroadcastChannel", RecordingBroadcastChannel);
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("records one sanitized page view and one view for each later route", () => {
    const view = render(<FirstPartyAnalyticsTracker enabled />);

    expect(client.enqueue).toHaveBeenCalledTimes(1);
    expect(client.enqueue).toHaveBeenLastCalledWith(expect.objectContaining({
      kind: "page_view",
      path: "/products?utm_source=google",
    }));
    expect(JSON.stringify(client.enqueue.mock.calls)).not.toContain("private@example.com");

    route.pathname = "/contact";
    route.search = "utm_medium=cpc";
    view.rerender(<FirstPartyAnalyticsTracker enabled />);

    expect(client.enqueue.mock.calls.filter(([event]) => event.kind === "page_view")).toHaveLength(2);
  });

  it("sends 30-second cumulative heartbeats only while visible and recently active", () => {
    render(<FirstPartyAnalyticsTracker enabled />);
    act(() => window.dispatchEvent(new Event("pointerdown")));
    act(() => vi.advanceTimersByTime(30_000));

    expect(client.enqueue).toHaveBeenCalledWith(expect.objectContaining({
      kind: "heartbeat",
      activeSeconds: 30,
    }));

    const beforeHidden = client.enqueue.mock.calls.length;
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    act(() => vi.advanceTimersByTime(60_000));
    expect(client.enqueue).toHaveBeenCalledTimes(beforeHidden);
  });

  it("coordinates activity across tabs and stops after tracking is disabled", () => {
    const view = render(<FirstPartyAnalyticsTracker enabled />);
    expect(RecordingBroadcastChannel.channels).toHaveLength(1);
    act(() => window.dispatchEvent(new Event("keydown")));
    expect(RecordingBroadcastChannel.channels[0].postMessage).toHaveBeenCalledWith(expect.objectContaining({ type: "activity" }));

    view.rerender(<FirstPartyAnalyticsTracker enabled={false} />);
    const callCount = client.enqueue.mock.calls.length;
    act(() => vi.advanceTimersByTime(90_000));

    expect(client.enqueue).toHaveBeenCalledTimes(callCount);
    expect(RecordingBroadcastChannel.channels[0].close).toHaveBeenCalled();
  });
});
