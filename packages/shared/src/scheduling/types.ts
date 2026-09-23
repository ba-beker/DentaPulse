/** HH:mm in 24-hour form. */
export type TimeOfDay = `${string}:${string}`;

export interface TimeSlot {
  start: TimeOfDay;
  end: TimeOfDay;
}

export interface DayHours {
  day: number;
  slots: TimeSlot[];
}

export interface SeasonalHours {
  label: string;
  startsOn: string;
  endsOn: string;
  workingHours: DayHours[];
}

export interface ScheduleHoliday {
  date: string;
  label: string;
}

export interface DentistBreak {
  start: TimeOfDay;
  end: TimeOfDay;
}

export interface DentistDayHours extends DayHours {
  breaks?: DentistBreak[];
}

export interface DentistSchedule {
  workingHours?: DentistDayHours[];
  holidays?: ScheduleHoliday[];
}

export interface ClinicScheduleInput {
  timezone: string;
  weekendDays: number[];
  workingHours: DayHours[];
  seasonalHours: SeasonalHours[];
  holidays: ScheduleHoliday[];
  bookingBufferMinutes: number;
}

export interface BusyInterval {
  start: Date;
  end: Date;
}

export interface AvailabilitySlot {
  start: string;
  end: string;
  dentistId: string;
}
