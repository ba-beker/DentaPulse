import { z } from "zod";
import { dzPhoneSchema, isoCalendarDateSchema, objectIdSchema } from "./fields.js";

export const clinicSlugParamsSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(3)
      .max(63)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  })
  .strict();

export const publicAvailabilityQuerySchema = z
  .object({
    procedureId: objectIdSchema,
    date: isoCalendarDateSchema,
    dentistId: objectIdSchema.optional(),
  })
  .strict();

export const createPublicAppointmentBodySchema = z
  .object({
    procedureId: objectIdSchema,
    dentistId: objectIdSchema,
    start: z.string().datetime(),
    guest: z
      .object({
        fullName: z.string().trim().min(1).max(120),
        phone: dzPhoneSchema,
      })
      .strict(),
    /** Honeypot — must stay empty. */
    website: z
      .string()
      .optional()
      .refine((value) => value === undefined || value.length === 0, {
        message: "Requête refusée.",
      }),
    captchaToken: z.string().trim().min(1).optional(),
  })
  .strict();

export type CreatePublicAppointmentBody = z.infer<typeof createPublicAppointmentBodySchema>;

export const publicBookingSchemas = {
  slugParams: clinicSlugParamsSchema,
  availabilityQuery: publicAvailabilityQuerySchema,
  createAppointment: createPublicAppointmentBodySchema,
};
