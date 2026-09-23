import { z } from "zod";

const timeOfDaySchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Heure invalide.");

export const timeSlotSchema = z
  .object({
    start: timeOfDaySchema,
    end: timeOfDaySchema,
  })
  .strict()
  .refine((value) => value.end > value.start, {
    message: "L'heure de fin doit être postérieure à l'heure de début.",
    path: ["end"],
  });

export const dayHoursSchema = z
  .object({
    day: z.number().int().min(0).max(6),
    slots: z.array(timeSlotSchema),
  })
  .strict();

export const dentistBreakSchema = z
  .object({
    start: timeOfDaySchema,
    end: timeOfDaySchema,
  })
  .strict()
  .refine((value) => value.end > value.start, {
    message: "L'heure de fin doit être postérieure à l'heure de début.",
    path: ["end"],
  });

export const dentistDayHoursSchema = dayHoursSchema.extend({
  breaks: z.array(dentistBreakSchema).optional(),
});

export const scheduleHolidaySchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide."),
    label: z.string().trim().min(1),
  })
  .strict();

export const dentistScheduleSchema = z
  .object({
    workingHours: z.array(dentistDayHoursSchema).length(7).optional(),
    holidays: z.array(scheduleHolidaySchema).optional(),
  })
  .strict();

export const seasonalHoursSchema = z
  .object({
    label: z.string().trim().min(1),
    startsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide."),
    endsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide."),
    workingHours: z.array(dayHoursSchema).length(7),
  })
  .strict()
  .refine((value) => value.endsOn >= value.startsOn, {
    message: "La fin de la période doit être postérieure au début.",
    path: ["endsOn"],
  });
