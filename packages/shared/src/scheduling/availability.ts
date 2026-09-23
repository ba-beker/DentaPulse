import type {
  AvailabilitySlot,
  BusyInterval,
  ClinicScheduleInput,
  DayHours,
  DentistBreak,
  DentistSchedule,
  SeasonalHours,
  TimeSlot,
} from "./types.js";
import { utcFromZoned, weekdayInTimezone } from "./timezone.js";

const TIME_OF_DAY = /^([01]\d|2[0-3]):([0-5]\d)$/;

function parseMinutes(time: string): number {
  const match = TIME_OF_DAY.exec(time);
  if (!match) throw new RangeError(`Invalid time of day: ${time}`);
  return Number(match[1]) * 60 + Number(match[2]);
}

function minutesToTime(total: number): string {
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function dayHoursForWeekday(hours: DayHours[], weekday: number): TimeSlot[] {
  return hours.find((entry) => entry.day === weekday)?.slots ?? [];
}

function seasonalHoursForDate(seasonal: SeasonalHours[], isoDay: string): DayHours[] | undefined {
  for (const season of seasonal) {
    if (isoDay >= season.startsOn && isoDay <= season.endsOn) {
      return season.workingHours;
    }
  }
  return undefined;
}

function subtractBreaks(slots: TimeSlot[], breaks: DentistBreak[]): TimeSlot[] {
  if (breaks.length === 0) return slots;
  const windows = slots.flatMap((slot) => {
    let segments: Array<{ start: number; end: number }> = [
      { start: parseMinutes(slot.start), end: parseMinutes(slot.end) },
    ];
    for (const brk of breaks) {
      const bStart = parseMinutes(brk.start);
      const bEnd = parseMinutes(brk.end);
      const next: Array<{ start: number; end: number }> = [];
      for (const segment of segments) {
        if (bEnd <= segment.start || bStart >= segment.end) {
          next.push(segment);
          continue;
        }
        if (bStart > segment.start) {
          next.push({ start: segment.start, end: Math.min(bStart, segment.end) });
        }
        if (bEnd < segment.end) {
          next.push({ start: Math.max(bEnd, segment.start), end: segment.end });
        }
      }
      segments = next.filter((segment) => segment.end > segment.start);
    }
    return segments.map((segment) => ({
      start: minutesToTime(segment.start) as TimeSlot["start"],
      end: minutesToTime(segment.end) as TimeSlot["end"],
    }));
  });
  return windows.filter((slot) => parseMinutes(slot.end) > parseMinutes(slot.start));
}

export function isClinicClosedOnDate(
  clinic: ClinicScheduleInput,
  isoDay: string,
  dentist?: DentistSchedule,
): boolean {
  if (clinic.holidays.some((holiday) => holiday.date === isoDay)) return true;
  if (dentist?.holidays?.some((holiday) => holiday.date === isoDay)) return true;

  const weekday = weekdayFromIsoDay(isoDay, clinic.timezone);
  if (clinic.weekendDays.includes(weekday)) return true;

  const seasonal = seasonalHoursForDate(clinic.seasonalHours, isoDay);
  const baseHours = seasonal ?? clinic.workingHours;
  const clinicSlots = dayHoursForWeekday(baseHours, weekday);
  if (clinicSlots.length === 0) return true;

  if (dentist?.workingHours) {
    const dentistSlots = dayHoursForWeekday(dentist.workingHours, weekday);
    if (dentistSlots.length === 0) return true;
  }

  return false;
}

function weekdayFromIsoDay(isoDay: string, timeZone: string): number {
  const noonUtc = utcFromZoned(isoDay, "12:00", timeZone);
  return weekdayInTimezone(noonUtc, timeZone);
}

function effectiveDaySlots(
  clinic: ClinicScheduleInput,
  isoDay: string,
  dentist?: DentistSchedule,
): TimeSlot[] {
  if (isClinicClosedOnDate(clinic, isoDay, dentist)) return [];

  const weekday = weekdayFromIsoDay(isoDay, clinic.timezone);
  const seasonal = seasonalHoursForDate(clinic.seasonalHours, isoDay);
  const baseHours = seasonal ?? clinic.workingHours;
  let slots = dayHoursForWeekday(baseHours, weekday);

  if (dentist?.workingHours) {
    const dentistDay = dentist.workingHours.find((entry) => entry.day === weekday);
    if (dentistDay) {
      slots = dentistDay.slots;
      const breaks = dentistDay.breaks ?? [];
      slots = subtractBreaks(slots, breaks);
    }
  }

  return slots.filter((slot) => parseMinutes(slot.end) > parseMinutes(slot.start));
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart.getTime() < bEnd.getTime() && bStart.getTime() < aEnd.getTime();
}

function slotFits(
  slotStart: Date,
  slotEnd: Date,
  busy: BusyInterval[],
  bufferMinutes: number,
): boolean {
  const paddedEnd = new Date(slotEnd.getTime() + bufferMinutes * 60_000);
  for (const interval of busy) {
    const busyEnd = new Date(interval.end.getTime() + bufferMinutes * 60_000);
    if (overlaps(slotStart, paddedEnd, interval.start, busyEnd)) {
      return false;
    }
  }
  return true;
}

export interface GenerateSlotsInput {
  clinic: ClinicScheduleInput;
  isoDay: string;
  procedureDurationMinutes: number;
  dentistId: string;
  dentistSchedule?: DentistSchedule;
  busyIntervals: BusyInterval[];
  /** If set, only slots starting at or after this instant are returned. */
  notBefore?: Date;
}

export function generateDaySlots(input: GenerateSlotsInput): AvailabilitySlot[] {
  const slotLength = input.procedureDurationMinutes + input.clinic.bookingBufferMinutes;
  if (slotLength <= 0) return [];

  const windows = effectiveDaySlots(input.clinic, input.isoDay, input.dentistSchedule);
  const results: AvailabilitySlot[] = [];

  for (const window of windows) {
    let cursor = parseMinutes(window.start);
    const windowEnd = parseMinutes(window.end);
    while (cursor + slotLength <= windowEnd) {
      const startTime = minutesToTime(cursor);
      const endTime = minutesToTime(cursor + input.procedureDurationMinutes);
      const startUtc = utcFromZoned(input.isoDay, startTime, input.clinic.timezone);
      const endUtc = utcFromZoned(input.isoDay, endTime, input.clinic.timezone);

      if (input.notBefore && startUtc.getTime() < input.notBefore.getTime()) {
        cursor += slotLength;
        continue;
      }

      if (slotFits(startUtc, endUtc, input.busyIntervals, input.clinic.bookingBufferMinutes)) {
        results.push({
          dentistId: input.dentistId,
          start: startUtc.toISOString(),
          end: endUtc.toISOString(),
        });
      }
      cursor += slotLength;
    }
  }

  return results;
}

export function nextAvailableSlots(
  clinic: ClinicScheduleInput,
  isoDays: string[],
  procedureDurationMinutes: number,
  dentists: Array<{ id: string; schedule?: DentistSchedule; busy: BusyInterval[] }>,
  count: number,
  notBefore?: Date,
): AvailabilitySlot[] {
  const collected: AvailabilitySlot[] = [];
  for (const isoDay of isoDays) {
    for (const dentist of dentists) {
      if (isClinicClosedOnDate(clinic, isoDay, dentist.schedule)) continue;
      const daySlots = generateDaySlots({
        clinic,
        isoDay,
        procedureDurationMinutes,
        dentistId: dentist.id,
        dentistSchedule: dentist.schedule,
        busyIntervals: dentist.busy,
        notBefore,
      });
      for (const slot of daySlots) {
        collected.push(slot);
        if (collected.length >= count) {
          return collected.sort((a, b) => a.start.localeCompare(b.start)).slice(0, count);
        }
      }
    }
  }
  return collected.sort((a, b) => a.start.localeCompare(b.start)).slice(0, count);
}
