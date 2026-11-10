import { BOOKING_WINDOW_DAYS, pickup, slots, zones } from "./data/delivery";
import type { TimeSlot } from "./types";

const DUBAI_OFFSET_MS = 4 * 60 * 60 * 1000; // UTC+4, no daylight saving
const HOUR_MS = 60 * 60 * 1000;

/** Milliseconds since epoch for a Dubai wall-clock date and time. */
export function dubaiInstant(date: string, time: string): number {
  return Date.parse(`${date}T${time}:00Z`) - DUBAI_OFFSET_MS;
}

/** Today's date in Dubai as YYYY-MM-DD. */
export function dubaiDate(now: Date, addDays = 0): string {
  const shifted = new Date(now.getTime() + DUBAI_OFFSET_MS + addDays * 24 * HOUR_MS);
  return shifted.toISOString().slice(0, 10);
}

export type DayAvailability = { date: string; slots: TimeSlot[] };

/**
 * Slots a customer can choose on a given date.
 * - zoneId null means store pickup.
 * - prepHours is the longest preparation time of anything in the cart.
 */
export function availableSlots(
  date: string,
  zoneId: string | null,
  prepHours: number,
  now: Date,
): TimeSlot[] {
  const today = dubaiDate(now);
  const lastDay = dubaiDate(now, BOOKING_WINDOW_DAYS);
  if (date < today || date > lastDay) return [];
  const readyAt = now.getTime() + prepHours * HOUR_MS;

  if (zoneId === null) {
    if (!pickup.enabled) return [];
    const earliest = Math.max(readyAt, now.getTime() + pickup.prepMinutes * 60 * 1000);
    return slots.filter((s) => dubaiInstant(date, s.end) - HOUR_MS >= earliest);
  }

  const zone = zones.find((z) => z.id === zoneId && z.active);
  if (!zone) return [];
  if (date === today) {
    if (!zone.sameDay) return [];
    if (now.getTime() > dubaiInstant(date, zone.cutoff)) return [];
  }
  // The order must be ready at least an hour before the slot ends.
  return slots.filter((s) => dubaiInstant(date, s.end) - HOUR_MS >= readyAt);
}

/** Every bookable day in the window, with its slots. */
export function availableDays(
  zoneId: string | null,
  prepHours: number,
  now: Date,
): DayAvailability[] {
  const days: DayAvailability[] = [];
  for (let i = 0; i <= BOOKING_WINDOW_DAYS; i++) {
    const date = dubaiDate(now, i);
    const daySlots = availableSlots(date, zoneId, prepHours, now);
    if (daySlots.length > 0) days.push({ date, slots: daySlots });
  }
  return days;
}
