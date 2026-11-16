import type { AnalyticsRange, DateWindow } from "@/lib/analytics/types";

const RANGE_DAYS: Record<AnalyticsRange, number> = {
  "7d": 7,
  "28d": 28,
  "90d": 90,
};

type CalendarDate = { year: number; month: number; day: number };

function dateInTimeZone(now: Date, timeZone: string): CalendarDate {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return { year: value("year"), month: value("month"), day: value("day") };
}

function shiftDate(date: CalendarDate, days: number): CalendarDate {
  const shifted = new Date(Date.UTC(date.year, date.month - 1, date.day + days));
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

function isoDate(date: CalendarDate) {
  return [date.year, String(date.month).padStart(2, "0"), String(date.day).padStart(2, "0")].join("-");
}

export function getCompletedDateWindows(
  range: AnalyticsRange,
  now: Date,
  timeZone: string,
): { current: DateWindow; previous: DateWindow } {
  const days = RANGE_DAYS[range];
  const today = dateInTimeZone(now, timeZone);
  const currentEnd = shiftDate(today, -1);
  const currentStart = shiftDate(currentEnd, -(days - 1));
  const previousEnd = shiftDate(currentStart, -1);
  const previousStart = shiftDate(previousEnd, -(days - 1));
  return {
    current: { startDate: isoDate(currentStart), endDate: isoDate(currentEnd) },
    previous: { startDate: isoDate(previousStart), endDate: isoDate(previousEnd) },
  };
}
