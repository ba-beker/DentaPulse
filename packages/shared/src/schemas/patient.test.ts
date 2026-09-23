import { describe, expect, it } from "vitest";
import {
  createPatientBodySchema,
  listPatientsQuerySchema,
  updatePatientBodySchema,
} from "./patient.js";

describe("patient schemas", () => {
  it("stores every national and international mobile form as E.164", () => {
    for (const phone of [
      "0555 12 34 56",
      "05 55 12 34 56",
      "+213 555 12 34 56",
      "00213555123456",
    ]) {
      const parsed = createPatientBodySchema.parse({ fullName: "Hélène Saïd", phone });
      expect(parsed.phone).toBe("+213555123456");
    }
  });

  it("accepts a list query with search, risk tags, sort and cursor", () => {
    const parsed = listPatientsQuerySchema.parse({
      search: " helene ",
      riskTags: "diabetes,hypertension",
      sort: "-createdAt",
      limit: "20",
      cursor: "Y2xpcmlj",
    });
    expect(parsed.search).toBe("helene");
    expect(parsed.riskTags).toEqual(["diabetes", "hypertension"]);
    expect(parsed.sort).toBe("-createdAt");
    expect(parsed.limit).toBe(20);
  });

  it("rejects an empty patch", () => {
    const result = updatePatientBodySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
