import { z } from "zod";
import { objectIdSchema } from "./fields.js";
import { realtimeEventTypeSchema } from "../realtime/events.js";

export const listEventsQuerySchema = z
  .object({
    after: objectIdSchema.optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
  })
  .strict();

export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;

export const realtimeEventDtoSchema = z
  .object({
    id: objectIdSchema,
    type: realtimeEventTypeSchema,
    payload: z.unknown(),
    createdAt: z.string().datetime(),
  })
  .strict();

export const listEventsResponseSchema = z
  .object({
    cursor: objectIdSchema.nullable(),
    events: z.array(realtimeEventDtoSchema),
  })
  .strict();

export type ListEventsResponse = z.infer<typeof listEventsResponseSchema>;
