import { z } from "zod";
import { toothMeta, type ToothType } from "./teeth.js";

export const surfaceSchema = z.enum(["O", "I", "M", "D", "B", "L"]);

export type Surface = z.infer<typeof surfaceSchema>;

const INCISAL: ReadonlySet<ToothType> = new Set(["incisor", "canine"]);

/** Five chartable surfaces. Incisors and canines use I; premolars and molars use O. */
export function surfacesFor(fdi: number): readonly Surface[] {
  const first: Surface = INCISAL.has(toothMeta(fdi).type) ? "I" : "O";
  return [first, "M", "D", "B", "L"];
}
