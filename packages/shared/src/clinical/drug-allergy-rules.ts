import type { RiskTag } from "../enums.js";

/**
 * Cross-check rules, matched on DCI (and on the brand once it has been resolved
 * to a DCI). Edit this list to add a family. Warnings are French and name the drug.
 */
export interface DrugAllergyRule {
  id: string;
  /** DCI fragments. A line matches when its resolved name contains one of these. */
  dci: readonly string[];
  riskTags: readonly RiskTag[];
  /** Free-text allergy fragments, compared after accent folding. */
  allergyTerms: readonly string[];
  /** `{drug}` is replaced with the line the dentist typed. */
  warning: string;
}

export const drugAllergyRules = [
  {
    id: "penicillin",
    dci: [
      "amoxicilline",
      "ampicilline",
      "pénicilline",
      "cloxacilline",
      "oxacilline",
      "flucloxacilline",
    ],
    riskTags: ["penicillin_allergy"],
    allergyTerms: ["pénicilline", "amoxicilline", "ampicilline", "bêta-lactamine", "betalactamine"],
    warning: "Allergie à la pénicilline : {drug} appartient aux bêta-lactamines (pénicillines).",
  },
  {
    id: "nsaid_pregnancy",
    dci: ["ibuprofène", "kétoprofène", "diclofénac", "acide méfénamique", "naproxène", "aspirine"],
    riskTags: ["pregnancy"],
    allergyTerms: [],
    warning:
      "Grossesse : {drug} est un anti-inflammatoire. Confirmez l'indication avant de prescrire.",
  },
  {
    id: "nsaid_coagulation",
    dci: ["ibuprofène", "kétoprofène", "diclofénac", "acide méfénamique", "naproxène", "aspirine"],
    riskTags: ["coagulation_risk"],
    allergyTerms: [],
    warning: "Trouble de la coagulation : {drug} peut augmenter le risque de saignement.",
  },
  {
    id: "nsaid_allergy",
    dci: ["ibuprofène", "kétoprofène", "diclofénac", "acide méfénamique", "naproxène", "aspirine"],
    riskTags: [],
    allergyTerms: [
      "ibuprofène",
      "anti-inflammatoire",
      "ains",
      "aspirine",
      "diclofénac",
      "acide méfénamique",
    ],
    warning: "Antécédent d'allergie aux anti-inflammatoires : {drug} appartient à cette famille.",
  },
  {
    id: "corticosteroid_diabetes",
    dci: ["prednisolone", "prednisone", "dexaméthasone"],
    riskTags: ["diabetes"],
    allergyTerms: [],
    warning: "Diabète : {drug} est un corticoïde et peut déséquilibrer la glycémie.",
  },
] as const satisfies readonly DrugAllergyRule[];
