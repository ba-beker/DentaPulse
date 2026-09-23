import { z } from "zod";
import { appointmentStatusSchema, stockStatusSchema } from "../enums.js";
import { objectIdSchema } from "../schemas/fields.js";

export const realtimeEventTypes = [
  "stock.low",
  "stock.updated",
  "appointment.created",
  "appointment.updated",
] as const;

export const realtimeEventTypeSchema = z.enum(realtimeEventTypes);

export type RealtimeEventType = z.infer<typeof realtimeEventTypeSchema>;

export const stockLowPayloadSchema = z
  .object({
    consumableId: objectIdSchema,
    name: z.string().trim().min(1),
    currentStock: z.number().int(),
    minStockAlert: z.number().int().nonnegative(),
  })
  .strict();

export const stockUpdatedPayloadSchema = z
  .object({
    consumableId: objectIdSchema,
    currentStock: z.number().int(),
    stockStatus: stockStatusSchema,
  })
  .strict();

export const appointmentRealtimePayloadSchema = z
  .object({
    id: objectIdSchema,
    patientId: objectIdSchema.optional(),
    dentistId: objectIdSchema,
    procedureId: objectIdSchema,
    start: z.string().datetime(),
    end: z.string().datetime(),
    status: appointmentStatusSchema,
  })
  .strict();

export const realtimeEventPayloadSchemas = {
  "stock.low": stockLowPayloadSchema,
  "stock.updated": stockUpdatedPayloadSchema,
  "appointment.created": appointmentRealtimePayloadSchema,
  "appointment.updated": appointmentRealtimePayloadSchema,
} as const satisfies Record<RealtimeEventType, z.ZodType>;

export type RealtimeEventMap = {
  [K in RealtimeEventType]: z.infer<(typeof realtimeEventPayloadSchemas)[K]>;
};

export type RealtimeEventInput<T extends RealtimeEventType = RealtimeEventType> = {
  type: T;
  payload: RealtimeEventMap[T];
};

export function parseRealtimeEventPayload<T extends RealtimeEventType>(
  type: T,
  payload: unknown,
): RealtimeEventMap[T] {
  return realtimeEventPayloadSchemas[type].parse(payload) as RealtimeEventMap[T];
}
