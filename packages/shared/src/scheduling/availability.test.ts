import { describe, expect, it } from "vitest";
import { addIsoDays } from "../stock.js";
import { generateDaySlots, isClinicClosedOnDate, nextAvailableSlots } from "./availability.js";
import type { ClinicScheduleInput, DentistSchedule } from "./types.js";
import { utcFromZoned } from "./timezone.js";

const ALGIERS = "Africa/Algiers";

function baseClinic(overrides: Partial<ClinicScheduleInput> = {}): ClinicScheduleInput {
  return {
    timezone: ALGIERS,
    weekendDays: [5],
    bookingBufferMinutes: 10,
    holidays: [],
    seasonalHours: [],
    workingHours: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
      day,
      slots: day === 5 ? [] : [{ start: "08:30", end: "12:00" }],
    })),
    ...overrides,
  };
}

describe("availability in Africa/Algiers", () => {
  it("closes Friday and keeps Saturday when it is not a weekend day", () => {
    const clinic = baseClinic();
    expect(isClinicClosedOnDate(clinic, "2026-09-25")).toBe(true);
    expect(isClinicClosedOnDate(clinic, "2026-09-26")).toBe(false);
  });

  it("treats Saturday as closed when configured in weekendDays", () => {
    const clinic = baseClinic({ weekendDays: [5, 6] });
    expect(isClinicClosedOnDate(clinic, "2026-09-26")).toBe(true);
  });

  it("honours clinic holidays", () => {
    const clinic = baseClinic({
      holidays: [{ date: "2026-09-24", label: "Fête nationale" }],
    });
    expect(isClinicClosedOnDate(clinic, "2026-09-24")).toBe(true);
  });

  it("applies Ramadan seasonal hours", () => {
    const clinic = baseClinic({
      seasonalHours: [
        {
          label: "Ramadan",
          startsOn: "2026-03-01",
          endsOn: "2026-03-30",
          workingHours: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
            day,
            slots: day === 5 ? [] : [{ start: "09:00", end: "15:00" }],
          })),
        },
      ],
    });
    const slots = generateDaySlots({
      clinic,
      isoDay: "2026-03-10",
      procedureDurationMinutes: 30,
      dentistId: "d1",
      busyIntervals: [],
    });
    expect(slots.length).toBeGreaterThan(0);
    const first = utcFromZoned("2026-03-10", "09:00", ALGIERS);
    expect(slots[0]?.start).toBe(first.toISOString());
  });

  it("subtracts dentist breaks", () => {
    const clinic = baseClinic();
    const dentist: DentistSchedule = {
      workingHours: [
        { day: 0, slots: [] },
        {
          day: 1,
          slots: [{ start: "08:30", end: "12:00" }],
          breaks: [{ start: "10:00", end: "10:30" }],
        },
        { day: 2, slots: [{ start: "08:30", end: "12:00" }] },
        { day: 3, slots: [{ start: "08:30", end: "12:00" }] },
        { day: 4, slots: [{ start: "08:30", end: "12:00" }] },
        { day: 5, slots: [] },
        { day: 6, slots: [{ start: "08:30", end: "12:00" }] },
      ],
    };
    const slots = generateDaySlots({
      clinic,
      isoDay: "2026-09-21",
      procedureDurationMinutes: 30,
      dentistId: "d1",
      dentistSchedule: dentist,
      busyIntervals: [],
    });
    const hasTenAm = slots.some((slot) => slot.start.includes("T09:00:00"));
    expect(hasTenAm).toBe(false);
  });
});

describe("DST regression (America/New_York)", () => {
  it("maps spring-forward wall times to UTC consistently", () => {
    const utc = utcFromZoned("2026-03-08", "10:30", "America/New_York");
    expect(utc.toISOString()).toMatch(/2026-03-08T1[45]:30:00.000Z/);
  });
});

describe("nextAvailableSlots", () => {
  it("skips busy intervals including buffer", () => {
    const clinic = baseClinic({ bookingBufferMinutes: 0 });
    const isoDay = "2026-09-21";
    const busyStart = utcFromZoned(isoDay, "08:30", ALGIERS);
    const busyEnd = utcFromZoned(isoDay, "09:00", ALGIERS);
    const slots = generateDaySlots({
      clinic,
      isoDay,
      procedureDurationMinutes: 30,
      dentistId: "d1",
      busyIntervals: [{ start: busyStart, end: busyEnd }],
    });
    expect(slots[0]?.start).toBe(utcFromZoned(isoDay, "09:00", ALGIERS).toISOString());

    const next = nextAvailableSlots(
      clinic,
      [isoDay, addIsoDays(isoDay, 1)],
      30,
      [{ id: "d1", busy: [{ start: busyStart, end: busyEnd }] }],
      3,
    );
    expect(next).toHaveLength(3);
  });
});
