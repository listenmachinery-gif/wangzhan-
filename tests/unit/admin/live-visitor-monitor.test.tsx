// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LiveVisitorMonitor } from "@/components/admin/analytics/LiveVisitorMonitor";
import { LIVE_OVERVIEW_EVENT } from "@/lib/analytics/first-party/live-alerts";
import type { FirstPartyOverview } from "@/lib/analytics/first-party/types";

const summary = { onlineVisitors: 1, activeVisitors: 1, visitorsToday: 1, sessionsToday: 1, pageViewsToday: 1 };

function overview(generatedAt: string, arrivals: Array<Record<string, unknown>> = [], onlineVisitors = 1) {
  return {
    generatedAt,
    environment: "TEST",
    summary: { ...summary, onlineVisitors },
    arrivals,
  };
}

function response(body: unknown, ok = true) {
  return Promise.resolve({ ok, json: async () => body } as Response);
}

class AudioContextStub {
  static starts = 0;
  currentTime = 0;
  destination = {};
  state = "running";
  resume = vi.fn().mockResolvedValue(undefined);
  close = vi.fn().mockResolvedValue(undefined);
  createOscillator() {
    return {
      type: "sine",
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: () => { AudioContextStub.starts += 1; },
      stop: vi.fn(),
    };
  }
  createGain() {
    return {
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
  }
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  window.localStorage.clear();
  AudioContextStub.starts = 0;
  vi.stubGlobal("AudioContext", AudioContextStub);
  Object.defineProperty(document, "hidden", { configurable: true, value: false });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("global live visitor monitor", () => {
  it("does not fetch or render for users without analytics summary permission", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(<LiveVisitorMonitor enabled={false} />);

    expect(container).toBeEmptyDOMElement();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("establishes a silent baseline, updates online count, and alerts once for a new visitor", async () => {
    const newArrival = {
      id: "visitor-new",
      label: "访客-OR-NEW",
      firstSeenAt: "2026-11-16T12:00:05.000Z",
      countryCode: "US",
      city: "Chicago",
      deviceType: "desktop",
      path: "/products/small-electric-shear",
    };
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => response(overview("2026-11-16T12:00:00.000Z", [], 1)))
      .mockImplementationOnce(() => response(overview("2026-11-16T12:00:10.000Z", [newArrival], 2)))
      .mockImplementationOnce(() => response(overview("2026-11-16T12:00:20.000Z", [newArrival], 2)));
    vi.stubGlobal("fetch", fetchMock);

    render(<LiveVisitorMonitor enabled />);

    expect(await screen.findByText("1 人在线")).toBeVisible();
    expect(AudioContextStub.starts).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "开启访客提示音" }));
    expect(window.localStorage.getItem("zyron-visitor-sound-enabled")).toBe("true");

    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });

    expect(await screen.findByText("2 人在线")).toBeVisible();
    expect(screen.getByRole("status", { name: "新访客提醒" })).toHaveTextContent("Chicago");
    expect(screen.getByRole("status", { name: "新访客提醒" })).toHaveTextContent("/products/small-electric-shear");
    expect(AudioContextStub.starts).toBe(2);

    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    expect(AudioContextStub.starts).toBe(2);
  });

  it("pauses while hidden, refreshes on visibility, and recovers after a failed request", async () => {
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => response(overview("2026-11-16T12:00:00.000Z")))
      .mockRejectedValueOnce(new Error("offline"))
      .mockImplementationOnce(() => response(overview("2026-11-16T12:00:20.000Z", [], 3)));
    vi.stubGlobal("fetch", fetchMock);
    render(<LiveVisitorMonitor enabled />);
    await screen.findByText("1 人在线");

    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(await screen.findByText("正在重新连接")).toBeVisible();

    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    await waitFor(() => expect(screen.getByText("3 人在线")).toBeVisible());
  });

  it("establishes a silent baseline after returning to a visible tab", async () => {
    const hiddenArrival = {
      id: "visitor-hidden", label: "访客-HIDDEN", firstSeenAt: "2026-11-16T12:00:05.000Z",
      countryCode: "DE", city: "Berlin", deviceType: "desktop", path: "/products",
    };
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => response(overview("2026-11-16T12:00:00.000Z")))
      .mockImplementationOnce(() => response(overview("2026-11-16T12:00:20.000Z", [hiddenArrival], 2)));
    vi.stubGlobal("fetch", fetchMock);
    render(<LiveVisitorMonitor enabled />);
    await screen.findByText("1 人在线");

    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(String(fetchMock.mock.calls[1]?.[0])).not.toContain("since=");
    expect(await screen.findByText("2 人在线")).toBeVisible();
    expect(screen.queryByRole("status", { name: "新访客提醒" })).not.toBeInTheDocument();
  });

  it("ignores a request that finishes after the tab was hidden", async () => {
    let finishPending!: (value: Response) => void;
    const pending = new Promise<Response>((resolve) => { finishPending = resolve; });
    const hiddenArrival = {
      id: "visitor-pending", label: "访客-ENDING", firstSeenAt: "2026-11-16T12:00:05.000Z",
      countryCode: "US", city: null, deviceType: "mobile", path: "/contact",
    };
    const snapshots: FirstPartyOverview[] = [];
    const receiveSnapshot = (event: Event) => snapshots.push((event as CustomEvent<FirstPartyOverview>).detail);
    window.addEventListener(LIVE_OVERVIEW_EVENT, receiveSnapshot);
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => response(overview("2026-11-16T12:00:00.000Z")))
      .mockImplementationOnce(() => pending)
      .mockImplementationOnce(() => response(overview("2026-11-16T12:00:20.000Z", [], 3)));
    vi.stubGlobal("fetch", fetchMock);
    render(<LiveVisitorMonitor enabled />);
    await screen.findByText("1 人在线");
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });

    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));
    finishPending(await response(overview("2026-11-16T12:00:10.000Z", [hiddenArrival], 2)));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    await waitFor(() => expect(screen.getByText("3 人在线")).toBeVisible());
    expect(snapshots.some(({ arrivals }) => arrivals.some(({ id }) => id === hiddenArrival.id))).toBe(false);
    window.removeEventListener(LIVE_OVERVIEW_EVENT, receiveSnapshot);
  });

  it("keeps visual alerts working when browser audio cannot start", async () => {
    vi.stubGlobal("AudioContext", class { constructor() { throw new Error("blocked"); } });
    vi.stubGlobal("fetch", vi.fn()
      .mockImplementationOnce(() => response(overview("2026-11-16T12:00:00.000Z")))
      .mockImplementationOnce(() => response(overview("2026-11-16T12:00:10.000Z", [{
        id: "visitor-visual", label: "访客-VISUAL", firstSeenAt: "2026-11-16T12:00:05.000Z",
        countryCode: null, city: null, deviceType: "mobile", path: "/contact",
      }]))));
    render(<LiveVisitorMonitor enabled />);
    await screen.findByText("1 人在线");
    fireEvent.click(screen.getByRole("button", { name: "开启访客提示音" }));

    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });

    expect(await screen.findByRole("status", { name: "新访客提醒" })).toHaveTextContent("/contact");
    expect(screen.getByRole("button", { name: "开启访客提示音" })).toBeVisible();
  });
});
