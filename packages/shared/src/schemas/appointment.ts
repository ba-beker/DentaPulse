import { z } from "zod";
import { appointmentStatusSchema } from "../enums.js";
import { isoCalendarDateSchema, objectIdSchema } from "./fields.js";

export const createAppointmentBodySchema = z
  .object({
    patientId: objectIdSchema,
    dentistId: objectIdSchema,
    procedureId: objectIdSchema,
    start: z.string().datetime(),
    end: z.string().datetime(),
  })
  .strict()
  .refine((value) => new Date(value.end).getTime() > new Date(value.start).getTime(), {
    message: "L'heure de fin doit être postérieure à l'heure de début.",
    path: ["end"],
  });

export const updateAppointmentBodySchema = z
  .object({
    status: appointmentStatusSchema.optional(),
    dentistId: objectIdSchema.optional(),
    procedureId: objectIdSchema.optional(),
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.status !== undefined ||
      value.dentistId !== undefined ||
      value.procedureId !== undefined ||
      value.start !== undefined ||
      value.end !== undefined,
    { message: "Aucune modification demandée." },
  )
  .refine(
    (value) => {
      if (value.start === undefined || value.end === undefined) return true;
      return new Date(value.end).getTime() > new Date(value.start).getTime();
    },
    {
      message: "L'heure de fin doit être postérieure à l'heure de début.",
      path: ["end"],
    },
  );

export const rescheduleAppointmentBodySchema = z
  .object({
    start: z.string().datetime(),
    end: z.string().datetime(),
    dentistId: objectIdSchema.optional(),
  })
  .strict()
  .refine((value) => new Date(value.end).getTime() > new Date(value.start).getTime(), {
    message: "L'heure de fin doit être postérieure à l'heure de début.",
    path: ["end"],
  });

export const listAppointmentsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).optional(),
    dentistId: objectIdSchema.optional(),
    from: isoCalendarDateSchema.optional(),
    to: isoCalendarDateSchema.optional(),
  })
  .strict()
  .refine(
    (value) => {
      if (value.from === undefined || value.to === undefined) return true;
      return value.to >= value.from;
    },
    { message: "La date de fin doit être postérieure ou égale à la date de début.", path: ["to"] },
  );

export const appointmentParamsSchema = z
  .object({
    appointmentId: objectIdSchema,
  })
  .strict();

export type CreateAppointmentBody = z.infer<typeof createAppointmentBodySchema>;
export type UpdateAppointmentBody = z.infer<typeof updateAppointmentBodySchema>;
export type RescheduleAppointmentBody = z.infer<typeof rescheduleAppointmentBodySchema>;
export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;

export const appointmentSchemas = {
  create: createAppointmentBodySchema,
  update: updateAppointmentBodySchema,
  reschedule: rescheduleAppointmentBodySchema,
  listQuery: listAppointmentsQuerySchema,
  params: appointmentParamsSchema,
};
