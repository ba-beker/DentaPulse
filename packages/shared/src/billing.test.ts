import { describe, expect, it } from "vitest";
import {
  addCalendarDays,
  allocateByWeights,
  installmentDueDates,
  patientBalance,
  splitInstallments,
} from "./billing.js";

describe("installment rounding", () => {
  it("gives every share the floor and lets the last share absorb the remainder", () => {
    expect(splitInstallments(100, 3)).toEqual([33, 33, 34]);
    expect(splitInstallments(10, 3)).toEqual([3, 3, 4]);
    expect(splitInstallments(12_500, 3)).toEqual([4166, 4166, 4168]);
    expect(splitInstallments(9_000, 3)).toEqual([3000, 3000, 3000]);
    expect(splitInstallments(2, 3)).toEqual([0, 0, 2]);
    expect(splitInstallments(100, 1)).toEqual([100]);
  });

  it("steps due dates by whole days from the first due date", () => {
    expect(installmentDueDates("2026-01-31", 3, 30)).toEqual([
      "2026-01-31",
      "2026-03-02",
      "2026-04-01",
    ]);
    expect(addCalendarDays("2026-01-31", 1)).toBe("2026-02-01");
  });
});

describe("balance math", () => {
  it("sums billed and net paid, and lists only past installments that are still open", () => {
    const balance = patientBalance({
      today: "2026-03-15",
      plans: [
        {
          id: "plan-a",
          total: 10_000,
          installments: [
            { number: 1, amount: 3333, dueDate: "2026-03-01" },
            { number: 2, amount: 3333, dueDate: "2026-04-01" },
            { number: 3, amount: 3334, dueDate: "2026-05-01" },
          ],
        },
        { id: "plan-b", total: 2_000, installments: [] },
      ],
      payments: [
        { treatmentPlanId: "plan-a", installmentNo: 1, amount: 1000 },
        { treatmentPlanId: "plan-a", installmentNo: 1, amount: -200 },
        { treatmentPlanId: "plan-b", installmentNo: 1, amount: 500 },
      ],
    });

    expect(balance).toEqual({
      billed: 12_000,
      paid: 1_300,
      outstanding: 10_700,
      overdueInstallments: [
        {
          treatmentPlanId: "plan-a",
          number: 1,
          dueDate: "2026-03-01",
          amount: 3333,
          paid: 800,
          outstanding: 2533,
        },
      ],
    });
  });

  it("drops an installment once it is paid, including when it is paid on the due date", () => {
    const balance = patientBalance({
      today: "2026-03-01",
      plans: [
        {
          id: "plan-a",
          total: 100,
          installments: [{ number: 1, amount: 100, dueDate: "2026-03-01" }],
        },
      ],
      payments: [{ treatmentPlanId: "plan-a", installmentNo: 1, amount: 100 }],
    });
    expect(balance.outstanding).toBe(0);
    expect(balance.overdueInstallments).toEqual([]);
  });
});

describe("revenue allocation", () => {
  it("splits a payment by procedure weight and keeps the remainder on the last line", () => {
    expect(allocateByWeights(1000, [6000, 4000])).toEqual([600, 400]);
    expect(allocateByWeights(10, [1, 1, 1])).toEqual([3, 3, 4]);
    expect(allocateByWeights(-10, [1, 1, 1])).toEqual([-3, -3, -4]);
    expect(allocateByWeights(100, [0, 5])).toEqual([0, 100]);
  });
});
