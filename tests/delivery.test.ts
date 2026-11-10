import { describe, expect, it } from "vitest";
import { availableDays, availableSlots, dubaiDate } from "../src/lib/delivery";

// 10:00 in Dubai on 10 Nov 2026 is 06:00 UTC.
const morning = new Date("2026-11-10T06:00:00Z");
const ids = (s: { id: string }[]) => s.map((x) => x.id);

describe("delivery availability", () => {
  it("knows the Dubai date", () => {
    expect(dubaiDate(new Date("2026-11-10T21:30:00Z"))).toBe("2026-11-11");
  });

  it("offers remaining same-day slots before the cutoff", () => {
    expect(ids(availableSlots("2026-11-10", "dubai-central", 2, morning))).toEqual([
      "morning",
      "afternoon",
      "evening",
    ]);
  });

  it("drops slots that preparation time cannot meet", () => {
    expect(ids(availableSlots("2026-11-10", "dubai-central", 5, morning))).toEqual([
      "afternoon",
      "evening",
    ]);
  });

  it("closes same-day after the zone cutoff", () => {
    const late = new Date("2026-11-10T14:30:00Z"); // 18:30 Dubai
    expect(availableSlots("2026-11-10", "dubai-central", 2, late)).toEqual([]);
    expect(availableSlots("2026-11-11", "dubai-central", 2, late)).toHaveLength(3);
  });

  it("never offers same-day in a next-day zone", () => {
    expect(availableSlots("2026-11-10", "abu-dhabi", 2, morning)).toEqual([]);
    expect(availableDays("abu-dhabi", 2, morning)[0].date).toBe("2026-11-11");
  });

  it("offers nothing for inactive zones or past dates", () => {
    expect(availableSlots("2026-11-11", "al-ain", 2, morning)).toEqual([]);
    expect(availableSlots("2026-11-09", "dubai-central", 2, morning)).toEqual([]);
  });

  it("respects a 24 hour preparation time", () => {
    expect(availableSlots("2026-11-10", "dubai-central", 24, morning)).toEqual([]);
    expect(availableSlots("2026-11-11", "dubai-central", 24, morning)).toHaveLength(3);
  });

  it("offers pickup slots", () => {
    expect(ids(availableSlots("2026-11-10", null, 2, morning))).toEqual([
      "morning",
      "afternoon",
      "evening",
    ]);
    expect(ids(availableSlots("2026-11-10", null, 5, morning))).toEqual([
      "afternoon",
      "evening",
    ]);
  });
});
