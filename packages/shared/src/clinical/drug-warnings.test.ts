import { describe, expect, it } from "vitest";
import { COMMON_DRUGS } from "./common-drugs.js";
import { drugAllergyRules } from "./drug-allergy-rules.js";
import { foldClinicalText, matchPrescriptionWarnings } from "./drug-warnings.js";

describe("prescription allergy warnings", () => {
  it("folds accents so pénicilline and penicilline are the same DCI", () => {
    expect(foldClinicalText("Allergie à la pénicilline")).toBe("allergie a la penicilline");
    expect(foldClinicalText("Amoxicilline")).toBe("amoxicilline");
  });

  it("warns when a penicillin allergy meets amoxicilline, including via the brand", () => {
    const byTag = matchPrescriptionWarnings({ riskTags: ["penicillin_allergy"], allergies: [] }, [
      { drug: "Amoxicilline" },
    ]);
    expect(byTag).toHaveLength(1);
    expect(byTag[0]?.ruleId).toBe("penicillin");
    expect(byTag[0]?.message).toContain("pénicilline");
    expect(byTag[0]?.message).toContain("Amoxicilline");

    const byNote = matchPrescriptionWarnings({ riskTags: [], allergies: ["Pénicilline"] }, [
      { drug: "Augmentin" },
    ]);
    expect(byNote.map((warning) => warning.ruleId)).toEqual(["penicillin"]);
    expect(byNote[0]?.message).toContain("Augmentin");

    const unaccented = matchPrescriptionWarnings({ riskTags: [], allergies: ["PENICILLINE"] }, [
      { drug: "AMOXICILLINE" },
    ]);
    expect(unaccented).toHaveLength(1);
  });

  it("does not warn for paracétamol and does not treat a short fragment as a word", () => {
    expect(
      matchPrescriptionWarnings({ riskTags: ["penicillin_allergy"], allergies: ["Pénicilline"] }, [
        { drug: "Doliprane" },
      ]),
    ).toEqual([]);

    expect(
      matchPrescriptionWarnings({ riskTags: [], allergies: ["douleur aux mains"] }, [
        { drug: "Ibuprofène" },
      ]),
    ).toEqual([]);
  });

  it("warns for an NSAID in pregnancy and for a cabinet-added brand of amoxicilline", () => {
    const pregnancy = matchPrescriptionWarnings({ riskTags: ["pregnancy"], allergies: [] }, [
      { drug: "Advil" },
    ]);
    expect(pregnancy.map((warning) => warning.ruleId)).toEqual(["nsaid_pregnancy"]);
    expect(pregnancy[0]?.message.toLowerCase()).toContain("grossesse");

    const custom = matchPrescriptionWarnings(
      { riskTags: ["penicillin_allergy"], allergies: [] },
      [{ drug: "Testacil" }],
      [...COMMON_DRUGS, { id: "testacil", dci: "Amoxicilline", brand: "Testacil", aliases: [] }],
    );
    expect(custom).toHaveLength(1);
    expect(custom[0]?.message).toContain("Testacil");
  });

  it("keeps the rules file and the drug catalog free of duplicate ids", () => {
    expect(new Set(drugAllergyRules.map((rule) => rule.id)).size).toBe(drugAllergyRules.length);
    expect(new Set(COMMON_DRUGS.map((drug) => drug.id)).size).toBe(COMMON_DRUGS.length);
    for (const rule of drugAllergyRules) {
      expect(rule.warning).toContain("{drug}");
    }
  });
});
