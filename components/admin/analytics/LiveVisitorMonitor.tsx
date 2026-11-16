"use client";

import { useEffect, useRef, useState } from "react";
import { Radio, Volume2, VolumeX, WifiOff } from "lucide-react";

import {
  buildLiveOverviewUrl,
  playVisitorChime,
  prepareVisitorAudio,
  publishLiveOverview,
  reconcileLiveArrivals,
  VISITOR_SOUND_STORAGE_KEY,
} from "@/lib/analytics/first-party/live-alerts";
import type { FirstPartyOverview, LiveVisitorArrival } from "@/lib/analytics/first-party/types";

const POLL_MS = 10_000;
const ALERT_MS = 5_000;

type ConnectionState = "connecting" | "live" | "retrying";

function laterCursor(current: string | undefined, candidate: string) {
  if (!current) return candidate;
  return Date.parse(candidate) > Date.parse(current) ? candidate : current;
}

function visitorContext(visitor: LiveVisitorArrival) {
  const location = [visitor.city, visitor.countryCode].filter(Boolean).join(" · ");
  return [location, visitor.path].filter(Boolean).join("  ·  ") || "正在浏览网站";
}

export function LiveVisitorMonitor({ enabled }: { enabled: boolean }) {
  const [overview, setOverview] = useState<FirstPartyOverview | null>(null);
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [alerts, setAlerts] = useState<LiveVisitorArrival[]>([]);
  const seenIds = useRef<string[]>([]);
  const soundEnabledRef = useRef(false);
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const stored = window.localStorage.getItem(VISITOR_SOUND_STORAGE_KEY) === "true";
    setSoundEnabled(stored);
    soundEnabledRef.current = stored;
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let inFlight = false;
    let cursor: string | undefined;
    let timer: number | undefined;
    let controller: AbortController | null = null;

    const schedule = () => {
      if (!cancelled) timer = window.setTimeout(() => { void poll(); }, POLL_MS);
    };

    const poll = async () => {
      if (cancelled || inFlight) return;
      if (document.hidden) {
        schedule();
        return;
      }
      inFlight = true;
      controller = new AbortController();
      try {
        const response = await fetch(buildLiveOverviewUrl(cursor), {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Live visitor request failed");
        const next = await response.json() as FirstPartyOverview;
        if (cancelled) return;

        const reconciled = reconcileLiveArrivals(seenIds.current, next.arrivals);
        seenIds.current = reconciled.seenIds;
        if (cursor && reconciled.newArrivals.length > 0) {
          setAlerts((current) => [...current, ...reconciled.newArrivals]);
        }
        cursor = laterCursor(cursor, next.generatedAt);
        setOverview(next);
        setConnection("live");
        publishLiveOverview(next);
      } catch (error) {
        if (!cancelled && !(error instanceof DOMException && error.name === "AbortError")) {
          setConnection("retrying");
        }
      } finally {
        inFlight = false;
        controller = null;
        schedule();
      }
    };

    const refreshWhenVisible = () => {
      if (document.hidden || inFlight) return;
      if (timer !== undefined) window.clearTimeout(timer);
      void poll();
    };

    document.addEventListener("visibilitychange", refreshWhenVisible);
    void poll();
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
      controller?.abort();
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [enabled]);

  const currentAlert = alerts[0] ?? null;
  useEffect(() => {
    if (!currentAlert) return;
    if (soundEnabledRef.current) {
      void playVisitorChime(audioContext.current).then((context) => {
        audioContext.current = context;
        if (!context) {
          soundEnabledRef.current = false;
          setSoundEnabled(false);
          window.localStorage.setItem(VISITOR_SOUND_STORAGE_KEY, "false");
        }
      });
    }
    const timer = window.setTimeout(() => setAlerts((current) => current.slice(1)), ALERT_MS);
    return () => window.clearTimeout(timer);
  }, [currentAlert]);

  useEffect(() => () => {
    void audioContext.current?.close();
  }, []);

  if (!enabled) return null;

  async function toggleSound() {
    if (soundEnabled) {
      soundEnabledRef.current = false;
      setSoundEnabled(false);
      window.localStorage.setItem(VISITOR_SOUND_STORAGE_KEY, "false");
      return;
    }
    soundEnabledRef.current = true;
    setSoundEnabled(true);
    window.localStorage.setItem(VISITOR_SOUND_STORAGE_KEY, "true");
    const prepared = await prepareVisitorAudio(audioContext.current);
    audioContext.current = prepared;
    const nextEnabled = Boolean(prepared);
    soundEnabledRef.current = nextEnabled;
    setSoundEnabled(nextEnabled);
    window.localStorage.setItem(VISITOR_SOUND_STORAGE_KEY, String(nextEnabled));
  }

  const online = overview?.summary.onlineVisitors ?? 0;

  return (
    <>
      <div className="flex items-center gap-1 rounded-full border border-admin-border bg-neutral-50 p-1 text-admin-muted shadow-sm">
        <span className="flex items-center gap-1.5 px-2 text-[11px] font-semibold tabular-nums text-admin-ink" aria-label="网站实时在线访客">
          {connection === "retrying" ? <WifiOff aria-hidden className="size-3.5 text-amber-600" /> : <span aria-hidden className={`size-2 rounded-full ${connection === "live" ? "bg-neon shadow-[0_0_0_3px_rgba(141,219,0,0.14)]" : "animate-pulse bg-neutral-400"}`} />}
          <span>{connection === "retrying" ? "正在重新连接" : `${online} 人在线`}</span>
        </span>
        <button
          type="button"
          aria-label={soundEnabled ? "关闭访客提示音" : "开启访客提示音"}
          aria-pressed={soundEnabled}
          onClick={() => { void toggleSound(); }}
          className={`grid size-8 place-items-center rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-ignition ${soundEnabled ? "bg-graphite-950 text-white" : "bg-white text-admin-muted hover:text-admin-ink"}`}
        >
          {soundEnabled ? <Volume2 aria-hidden className="size-3.5" /> : <VolumeX aria-hidden className="size-3.5" />}
        </button>
      </div>

      {currentAlert ? (
        <div
          role="status"
          aria-label="新访客提醒"
          className="fixed right-4 top-20 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-admin border border-white/10 bg-graphite-950 text-white shadow-2xl sm:right-6"
        >
          <div className="h-1 bg-neon" />
          <div className="flex gap-3 p-4">
            <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-neon/15 text-neon"><Radio className="size-5" /></span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neon">New visitor</p>
              <p className="mt-1 text-sm font-semibold">新访客正在浏览 · {currentAlert.label}</p>
              <p className="mt-1 truncate text-xs text-zinc-400">{visitorContext(currentAlert)}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
