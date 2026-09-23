import type { RiskTag } from "../enums.js";
import { COMMON_DRUGS, type CatalogDrug } from "./common-drugs.js";
import { drugAllergyRules, type DrugAllergyRule } from "./drug-allergy-rules.js";

export interface WarningPatient {
  riskTags: readonly RiskTag[];
  allergies: readonly string[];
}

export interface WarningDrugItem {
  drug: string;
  dci?: string;
  brand?: string;
}

export interface DrugWarning {
  ruleId: string;
  itemIndex: number;
  drug: string;
  message: string;
}

/** Accent-insensitive fold used to match a DCI or an allergy note. */
export function foldClinicalText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function includesTerm(haystack: string, needle: string, allergy: boolean): boolean {
  const foldedNeedle = foldClinicalText(needle);
  if (foldedNeedle.length < 4 || haystack.length === 0) return false;
  if (!allergy || foldedNeedle.length >= 8) return haystack.includes(foldedNeedle);
  return ` ${haystack} `.includes(` ${foldedNeedle} `);
}

function bestCatalogHit(
  text: string | undefined,
  catalog: readonly CatalogDrug[],
): CatalogDrug | undefined {
  if (!text) return undefined;
  const folded = foldClinicalText(text);
  if (folded.length < 4) return undefined;

  let best: { drug: CatalogDrug; length: number } | undefined;
  for (const drug of catalog) {
    const names = [drug.dci, drug.brand, ...drug.aliases];
    for (const name of names) {
      if (!name) continue;
      const needle = foldClinicalText(name);
      if (needle.length < 4) continue;
      if (folded === needle || folded.includes(needle)) {
        if (!best || needle.length > best.length) best = { drug, length: needle.length };
      }
    }
  }
  return best?.drug;
}

function candidateNames(item: WarningDrugItem, catalog: readonly CatalogDrug[]): string[] {
  const names: string[] = [];
  const push = (value: string | undefined): void => {
    if (value && value.trim().length > 0) names.push(value);
  };
  push(item.drug);
  push(item.dci);
  push(item.brand);
  for (const source of [item.drug, item.dci, item.brand]) {
    const hit = bestCatalogHit(source, catalog);
    if (!hit) continue;
    push(hit.dci);
    push(hit.brand);
  }
  return names;
}

function drugHitsRule(names: readonly string[], rule: DrugAllergyRule): boolean {
  return names.some((name) => {
    const folded = foldClinicalText(name);
    return rule.dci.some((token) => includesTerm(folded, token, false));
  });
}

function patientHitsRule(patient: WarningPatient, rule: DrugAllergyRule): boolean {
  if (rule.riskTags.some((tag) => patient.riskTags.includes(tag))) return true;
  if (rule.allergyTerms.length === 0) return false;
  return patient.allergies.some((allergy) => {
    const folded = foldClinicalText(allergy);
    return rule.allergyTerms.some((term) => includesTerm(folded, term, true));
  });
}

/** DCI stored on the line: the one the dentist sent, otherwise the catalog match, otherwise the typed name. */
export function resolvedDrugDci(item: WarningDrugItem, catalog: readonly CatalogDrug[]): string {
  const explicit = item.dci?.trim();
  if (explicit) return explicit;
  return bestCatalogHit(item.drug, catalog)?.dci ?? item.drug.trim();
}

/**
 * French warnings for drug lines that collide with the patient's allergies or risk tags.
 * Does not decide whether to save. The caller must require an explicit acknowledgment.
 */
export function matchPrescriptionWarnings(
  patient: WarningPatient,
  items: readonly WarningDrugItem[],
  catalog: readonly CatalogDrug[] = COMMON_DRUGS,
): DrugWarning[] {
  const warnings: DrugWarning[] = [];
  items.forEach((item, itemIndex) => {
    const names = candidateNames(item, catalog);
    const label = item.drug.trim();
    if (label.length === 0) return;
    for (const rule of drugAllergyRules) {
      if (!patientHitsRule(patient, rule) || !drugHitsRule(names, rule)) continue;
      warnings.push({
        ruleId: rule.id,
        itemIndex,
        drug: label,
        message: rule.warning.replaceAll("{drug}", label),
      });
    }
  });
  return warnings;
}
