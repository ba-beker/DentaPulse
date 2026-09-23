import { ordonnanceCopy } from "../i18n/fr.js";
import { algiersIsoDay } from "../locale/algiers.js";

/** Completed years in Africa/Algiers. The birthday itself counts. */
export function completedAgeYears(dateOfBirth: Date, now: Date): number {
  const birth = algiersIsoDay(dateOfBirth);
  const today = algiersIsoDay(now);
  let years = Number(today.slice(0, 4)) - Number(birth.slice(0, 4));
  if (today.slice(5) < birth.slice(5)) years -= 1;
  return years < 0 ? 0 : years;
}

export function formatAgeFr(years: number): string {
  if (!Number.isInteger(years) || years <= 0) return ordonnanceCopy.ageUnderOne;
  if (years === 1) return ordonnanceCopy.ageOne;
  return ordonnanceCopy.ageMany.replace("{count}", String(years));
}
