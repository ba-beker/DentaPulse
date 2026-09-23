import type { ToothCondition } from "./enums.js";
import { surfacesFor, type Surface } from "./surfaces.js";
import { isValidFdi, type Dentition } from "./teeth.js";

const SURFACE_KEYS = ["O", "I", "M", "D", "B", "L"] as const satisfies readonly Surface[];

/** Conditions that describe the whole tooth. They are not charted on a face. */
const WHOLE_TOOTH_CONDITIONS = new Set<ToothCondition>(["crown", "implant", "missing"]);

export interface ChartToothState {
  fdi: number;
  wholeCondition: ToothCondition;
  surfaces: Partial<Record<Surface, ToothCondition>>;
  notes?: string;
}

export interface ToothPatch {
  wholeCondition?: ToothCondition;
  surfaces?: Partial<Record<Surface, ToothCondition>>;
  notes?: string;
}

export type ChartRuleError =
  | { code: "invalid_surface"; surface: Surface }
  | { code: "whole_tooth_surface"; surface: Surface }
  | { code: "surfaces_not_allowed" };

export type ToothUpdateResult =
  { ok: true; tooth: ChartToothState } | { ok: false; error: ChartRuleError };

export function toothInDentition(fdi: number, dentition: Dentition): boolean {
  return isValidFdi(fdi, dentition);
}

export function dentitionFitsTeeth(fdiList: readonly number[], dentition: Dentition): boolean {
  return fdiList.every((fdi) => isValidFdi(fdi, dentition));
}

/**
 * Applies a tooth patch.
 * Incisors and canines accept I; premolars and molars accept O.
 * Crown and implant are whole-tooth conditions. Missing, crown, and implant clear faces.
 */
export function applyToothUpdate(
  current: ChartToothState | undefined,
  fdi: number,
  patch: ToothPatch,
): ToothUpdateResult {
  const wholeCondition = patch.wholeCondition ?? current?.wholeCondition ?? "healthy";
  const clearsSurfaces = WHOLE_TOOTH_CONDITIONS.has(wholeCondition);
  const surfaces: Partial<Record<Surface, ToothCondition>> = {};
  if (!clearsSurfaces && current) {
    copySurfaces(current.surfaces, surfaces);
  }

  const listed = patch.surfaces ? listedSurfaces(patch.surfaces) : [];
  for (const surface of listed) {
    const value = patch.surfaces?.[surface];
    if (value === undefined) continue;
    if (!surfacesFor(fdi).includes(surface)) {
      return { ok: false, error: { code: "invalid_surface", surface } };
    }
    if (WHOLE_TOOTH_CONDITIONS.has(value)) {
      return { ok: false, error: { code: "whole_tooth_surface", surface } };
    }
  }

  if (clearsSurfaces) {
    if (listed.length > 0 && patch.wholeCondition === undefined) {
      return { ok: false, error: { code: "surfaces_not_allowed" } };
    }
  } else {
    for (const surface of listed) {
      const value = patch.surfaces?.[surface];
      if (value !== undefined) surfaces[surface] = value;
    }
  }

  const notes = patch.notes !== undefined ? nonempty(patch.notes) : current?.notes;

  return {
    ok: true,
    tooth: {
      fdi,
      wholeCondition,
      surfaces,
      ...(notes ? { notes } : {}),
    },
  };
}

function listedSurfaces(surfaces: Partial<Record<Surface, ToothCondition>>): Surface[] {
  const keys: Surface[] = [];
  for (const key of SURFACE_KEYS) {
    if (surfaces[key] !== undefined) keys.push(key);
  }
  return keys;
}

function copySurfaces(
  source: Partial<Record<Surface, ToothCondition>>,
  target: Partial<Record<Surface, ToothCondition>>,
): void {
  for (const key of SURFACE_KEYS) {
    const value = source[key];
    if (value !== undefined) target[key] = value;
  }
}

function nonempty(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
