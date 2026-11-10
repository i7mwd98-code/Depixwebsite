import type { DeliveryZone, TimeSlot } from "../types";
import { aed } from "../money";

/**
 * SAMPLE delivery settings. These will move to the database and be edited
 * from the admin panel (spec section 6). Fees and areas are placeholders
 * for the owner to replace.
 */
export const zones: DeliveryZone[] = [
  {
    id: "dubai-central",
    emirate: { en: "Dubai", ar: "دبي" },
    name: { en: "Dubai (central areas)", ar: "دبي (المناطق الوسطى)" },
    active: true,
    fee: aed(25),
    freeOver: aed(300),
    sameDay: true,
    cutoff: "18:00",
  },
  {
    id: "dubai-outer",
    emirate: { en: "Dubai", ar: "دبي" },
    name: { en: "Dubai (outer areas)", ar: "دبي (المناطق الخارجية)" },
    active: true,
    fee: aed(40),
    freeOver: aed(400),
    sameDay: true,
    cutoff: "16:00",
  },
  {
    id: "sharjah",
    emirate: { en: "Sharjah", ar: "الشارقة" },
    name: { en: "Sharjah city", ar: "مدينة الشارقة" },
    active: true,
    fee: aed(35),
    freeOver: aed(400),
    sameDay: true,
    cutoff: "16:00",
  },
  {
    id: "ajman",
    emirate: { en: "Ajman", ar: "عجمان" },
    name: { en: "Ajman city", ar: "مدينة عجمان" },
    active: true,
    fee: aed(40),
    freeOver: aed(400),
    sameDay: true,
    cutoff: "15:00",
  },
  {
    id: "abu-dhabi",
    emirate: { en: "Abu Dhabi", ar: "أبوظبي" },
    name: { en: "Abu Dhabi city", ar: "مدينة أبوظبي" },
    active: true,
    fee: aed(60),
    freeOver: aed(500),
    sameDay: false,
    cutoff: "00:00",
  },
  {
    id: "al-ain",
    emirate: { en: "Abu Dhabi", ar: "أبوظبي" },
    name: { en: "Al Ain", ar: "العين" },
    active: false,
    fee: aed(75),
    freeOver: null,
    sameDay: false,
    cutoff: "00:00",
  },
];

export const slots: TimeSlot[] = [
  { id: "morning", label: { en: "Morning", ar: "الصباح" }, start: "09:00", end: "13:00" },
  { id: "afternoon", label: { en: "Afternoon", ar: "بعد الظهر" }, start: "13:00", end: "17:00" },
  { id: "evening", label: { en: "Evening", ar: "المساء" }, start: "17:00", end: "22:00" },
];

export const pickup = {
  enabled: true,
  /** Minutes the shop needs to prepare a pickup order. */
  prepMinutes: 60,
  open: "09:00",
  close: "22:00",
};

/** How many days ahead a customer can schedule. */
export const BOOKING_WINDOW_DAYS = 21;

/** SAMPLE discount codes; will be managed in admin. */
export const discountCodes: Record<string, { percent: number }> = {
  WELCOME10: { percent: 10 },
};
