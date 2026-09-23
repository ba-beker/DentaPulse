import { algiersIsoDay } from "./locale/algiers.js";

export const ADULT_TEETH = [
  11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25, 26, 27, 28, 31, 32, 33, 34, 35, 36, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48,
] as const;

export const PEDIATRIC_TEETH = [
  51, 52, 53, 54, 55, 61, 62, 63, 64, 65, 71, 72, 73, 74, 75, 81, 82, 83, 84, 85,
] as const;

export const ADULT_QUADRANTS = [1, 2, 3, 4] as const;
export const PEDIATRIC_QUADRANTS = [5, 6, 7, 8] as const;

/** Primary chart before 6, mixed from 6 until 12, permanent from the 12th birthday. */
export const MIXED_DENTITION_FROM_YEARS = 6;
export const PERMANENT_DENTITION_FROM_YEARS = 12;

export const DENTITIONS = ["adult", "pediatric", "mixed"] as const;

export type Quadrant = (typeof ADULT_QUADRANTS)[number] | (typeof PEDIATRIC_QUADRANTS)[number];
export type Dentition = (typeof DENTITIONS)[number];
/** A single tooth is either permanent or primary. Mixed applies only to a chart. */
export type ToothDentition = Exclude<Dentition, "mixed">;
export type Arch = "upper" | "lower";
export type Side = "right" | "left";
export type ToothType = "incisor" | "canine" | "premolar" | "molar";

export type ToothMeta = {
  quadrant: Quadrant;
  arch: Arch;
  side: Side;
  type: ToothType;
  dentition: ToothDentition;
};

const ADULT_TOOTH_SET = new Set<number>(ADULT_TEETH);
const PEDIATRIC_TOOTH_SET = new Set<number>(PEDIATRIC_TEETH);
const RIGHT_QUADRANTS = new Set<number>([1, 4, 5, 8]);

export function isValidFdi(fdi: number, dentition: Dentition): boolean {
  if (!Number.isInteger(fdi)) return false;
  if (dentition === "adult") return ADULT_TOOTH_SET.has(fdi);
  if (dentition === "pediatric") return PEDIATRIC_TOOTH_SET.has(fdi);
  if (dentition === "mixed") return ADULT_TOOTH_SET.has(fdi) || PEDIATRIC_TOOTH_SET.has(fdi);
  return false;
}

export function toothMeta(fdi: number): ToothMeta {
  const dentition = dentitionOf(fdi);
  if (dentition === null) {
    throw new RangeError(`Invalid FDI tooth number: ${fdi}`);
  }

  const quadrant = Math.floor(fdi / 10) as Quadrant;
  const position = fdi % 10;

  return {
    quadrant,
    arch: archOf(quadrant),
    side: sideOf(quadrant),
    type: toothType(position, dentition),
    dentition,
  };
}

/** Quadrant numbers for a dentition, in chart order (patient right, then patient left). */
export function quadrantsFor(dentition: Dentition): readonly Quadrant[] {
  if (dentition === "adult") return ADULT_QUADRANTS;
  if (dentition === "pediatric") return PEDIATRIC_QUADRANTS;
  if (dentition === "mixed") return [...ADULT_QUADRANTS, ...PEDIATRIC_QUADRANTS];
  throw new RangeError(`Invalid dentition: ${String(dentition)}`);
}

/**
 * Teeth of one quadrant, left to right as drawn on a chart facing the patient.
 * Right quadrants run from distal to mesial (18 → 11). Left quadrants run from mesial to distal (21 → 28).
 */
export function teethInQuadrant(quadrant: Quadrant): readonly number[] {
  if (!Number.isInteger(quadrant) || quadrant < 1 || quadrant > 8) {
    throw new RangeError(`Invalid quadrant: ${quadrant}`);
  }

  const count = quadrant <= 4 ? 8 : 5;
  const mesialToDistal = Array.from({ length: count }, (_, index) => quadrant * 10 + index + 1);
  if (RIGHT_QUADRANTS.has(quadrant)) {
    return mesialToDistal.reverse();
  }
  return mesialToDistal;
}

/** Both arches in chart order: viewer left is the patient's right. */
export function chartRows(dentition: Dentition): {
  upper: readonly number[];
  lower: readonly number[];
} {
  if (dentition === "adult" || dentition === "pediatric") return rowsOf(dentition);
  if (dentition === "mixed") {
    const adult = rowsOf("adult");
    const pediatric = rowsOf("pediatric");
    return {
      upper: [...adult.upper, ...pediatric.upper],
      lower: [...adult.lower, ...pediatric.lower],
    };
  }
  throw new RangeError(`Invalid dentition: ${String(dentition)}`);
}

/**
 * Chart opened on first access. Unknown birth date uses the permanent chart;
 * the dentist can switch to mixed when both dentitions are present.
 */
export function defaultDentition(dateOfBirth: Date | undefined, now: Date = new Date()): Dentition {
  if (dateOfBirth === undefined) return "adult";
  const age = completedYears(algiersIsoDay(dateOfBirth), algiersIsoDay(now));
  if (age < MIXED_DENTITION_FROM_YEARS) return "pediatric";
  if (age < PERMANENT_DENTITION_FROM_YEARS) return "mixed";
  return "adult";
}

function rowsOf(dentition: ToothDentition): { upper: readonly number[]; lower: readonly number[] } {
  if (dentition === "adult") {
    return {
      upper: [...teethInQuadrant(1), ...teethInQuadrant(2)],
      lower: [...teethInQuadrant(4), ...teethInQuadrant(3)],
    };
  }
  return {
    upper: [...teethInQuadrant(5), ...teethInQuadrant(6)],
    lower: [...teethInQuadrant(8), ...teethInQuadrant(7)],
  };
}

function completedYears(birthIso: string, todayIso: string): number {
  let age = Number(todayIso.slice(0, 4)) - Number(birthIso.slice(0, 4));
  if (todayIso.slice(5) < birthIso.slice(5)) age -= 1;
  return age;
}

function dentitionOf(fdi: number): ToothDentition | null {
  if (!Number.isInteger(fdi)) return null;
  if (ADULT_TOOTH_SET.has(fdi)) return "adult";
  if (PEDIATRIC_TOOTH_SET.has(fdi)) return "pediatric";
  return null;
}

function archOf(quadrant: Quadrant): Arch {
  return quadrant === 1 || quadrant === 2 || quadrant === 5 || quadrant === 6 ? "upper" : "lower";
}

function sideOf(quadrant: Quadrant): Side {
  return quadrant === 1 || quadrant === 4 || quadrant === 5 || quadrant === 8 ? "right" : "left";
}

function toothType(position: number, dentition: ToothDentition): ToothType {
  if (position <= 2) return "incisor";
  if (position === 3) return "canine";
  if (dentition === "pediatric" || position >= 6) return "molar";
  return "premolar";
}
