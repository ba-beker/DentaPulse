import { describe, expect, it } from "vitest";
import { ordonnanceCopy } from "../i18n/fr.js";
import { completedAgeYears, formatAgeFr } from "./age.js";

describe("patient age", () => {
  it("counts completed years in Algiers and waits for the birthday", () => {
    const birth = new Date("2000-09-23T00:00:00.000Z");
    expect(completedAgeYears(birth, new Date("2026-09-22T12:00:00.000Z"))).toBe(25);
    expect(completedAgeYears(birth, new Date("2026-09-23T12:00:00.000Z"))).toBe(26);
  });

  it("formats the age in French", () => {
    expect(formatAgeFr(0)).toBe(ordonnanceCopy.ageUnderOne);
    expect(formatAgeFr(1)).toBe("1 an");
    expect(formatAgeFr(36)).toBe("36 ans");
  });
});
