import type { FirstPartyOverview, LiveVisitorArrival } from "@/lib/analytics/first-party/types";

export const LIVE_OVERVIEW_EVENT = "zyron-live-overview";
export const VISITOR_SOUND_STORAGE_KEY = "zyron-visitor-sound-enabled";
let latestOverview: FirstPartyOverview | null = null;

export function publishLiveOverview(overview: FirstPartyOverview) {
  latestOverview = overview;
  window.dispatchEvent(new CustomEvent<FirstPartyOverview>(LIVE_OVERVIEW_EVENT, { detail: overview }));
}

export function getLatestLiveOverview() {
  return latestOverview;
}

export function buildLiveOverviewUrl(cursor?: string) {
  if (!cursor) return "/api/admin/analytics/first-party/overview";
  return `/api/admin/analytics/first-party/overview?since=${encodeURIComponent(cursor)}`;
}

export function reconcileLiveArrivals(
  seenIds: readonly string[],
  arrivals: readonly LiveVisitorArrival[],
  limit = 200,
) {
  const remembered = [...seenIds];
  const seen = new Set(remembered);
  const newArrivals: LiveVisitorArrival[] = [];

  for (const arrival of arrivals) {
    if (seen.has(arrival.id)) continue;
    seen.add(arrival.id);
    remembered.push(arrival.id);
    newArrivals.push(arrival);
  }

  return { newArrivals, seenIds: remembered.slice(-Math.max(1, limit)) };
}

export function enqueueLiveAlerts(
  current: readonly LiveVisitorArrival[],
  incoming: readonly LiveVisitorArrival[],
  limit = 5,
) {
  const boundedLimit = Math.max(1, limit);
  const displayed = current[0] ? [current[0]] : [];
  const waiting = [...current.slice(1), ...incoming];
  return [...displayed, ...waiting.slice(-(boundedLimit - displayed.length))];
}

type BrowserAudioContext = AudioContext & { close(): Promise<void> };

function audioContextConstructor() {
  if (typeof window === "undefined") return null;
  return window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ?? null;
}

export async function prepareVisitorAudio(existing: BrowserAudioContext | null = null) {
  try {
    const AudioContextConstructor = audioContextConstructor();
    if (!AudioContextConstructor) return null;
    const context = existing ?? new AudioContextConstructor() as BrowserAudioContext;
    if (context.state === "suspended") await context.resume();
    return context;
  } catch {
    return null;
  }
}

export async function playVisitorChime(existing: BrowserAudioContext | null) {
  const context = await prepareVisitorAudio(existing);
  if (!context) return null;

  try {
    const startAt = context.currentTime + 0.01;
    for (const [offset, frequency] of [[0, 660], [0.14, 880]] as const) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, startAt + offset);
      gain.gain.setValueAtTime(0.0001, startAt + offset);
      gain.gain.exponentialRampToValueAtTime(0.12, startAt + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + offset + 0.11);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startAt + offset);
      oscillator.stop(startAt + offset + 0.12);
    }
    return context;
  } catch {
    return null;
  }
}
