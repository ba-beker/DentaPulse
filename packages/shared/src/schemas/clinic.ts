import {
  dayHoursSchema,
  dentistBreakSchema,
  dentistDayHoursSchema,
  dentistScheduleSchema,
  scheduleHolidaySchema,
  seasonalHoursSchema,
  timeSlotSchema,
} from "./clinic-schedule.js";

export {
  dayHoursSchema,
  dentistBreakSchema,
  dentistDayHoursSchema,
  dentistScheduleSchema,
  scheduleHolidaySchema,
  seasonalHoursSchema,
  timeSlotSchema,
};

export const clinicSchemas = {
  dayHours: dayHoursSchema,
  dentistSchedule: dentistScheduleSchema,
  seasonalHours: seasonalHoursSchema,
  holiday: scheduleHolidaySchema,
  timeSlot: timeSlotSchema,
};
