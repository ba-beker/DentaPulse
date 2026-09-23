export interface BalancePlanInput {
  id: string;
  total: number;
  installments: readonly {
    number: number;
    amount: number;
    dueDate: string;
  }[];
}

export interface BalancePaymentInput {
  treatmentPlanId: string;
  installmentNo: number;
  amount: number;
}

export interface OverdueInstallment {
  treatmentPlanId: string;
  number: number;
  dueDate: string;
  amount: number;
  paid: number;
  outstanding: number;
}

export interface PatientBalance {
  billed: number;
  paid: number;
  outstanding: number;
  overdueInstallments: OverdueInstallment[];
}

/** Equal shares. The last share absorbs `total - base * count`. */
export function splitInstallments(total: number, count: number): number[] {
  if (!Number.isInteger(total) || total < 0) {
    throw new RangeError("total must be a whole number of dinars");
  }
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError("count must be a positive integer");
  }
  const base = Math.floor(total / count);
  const remainder = total - base * count;
  return Array.from({ length: count }, (_, index) =>
    index === count - 1 ? base + remainder : base,
  );
}

/** Adds whole days to an ISO calendar date, without a timezone shift. */
export function addCalendarDays(isoDate: string, days: number): string {
  if (!Number.isInteger(days)) throw new RangeError("days must be a whole number");
  const [year, month, day] = isoDate.split("-").map(Number);
  if (year === undefined || month === undefined || day === undefined) {
    throw new RangeError("date must be yyyy-MM-dd");
  }
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  const y = utc.getUTCFullYear();
  const m = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const d = String(utc.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function installmentDueDates(
  firstDueDate: string,
  count: number,
  intervalDays: number,
): string[] {
  if (!Number.isInteger(intervalDays) || intervalDays < 1) {
    throw new RangeError("interval must be a positive number of days");
  }
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError("count must be a positive integer");
  }
  return Array.from({ length: count }, (_, index) =>
    addCalendarDays(firstDueDate, index * intervalDays),
  );
}

/**
 * Splits a signed dinar amount across non-negative weights.
 * The last non-zero weight absorbs the rounding remainder.
 */
export function allocateByWeights(amount: number, weights: readonly number[]): number[] {
  if (!Number.isSafeInteger(amount)) {
    throw new RangeError("amount must be a whole number of dinars");
  }
  if (weights.some((weight) => !Number.isInteger(weight) || weight < 0)) {
    throw new RangeError("weights must be whole numbers");
  }
  if (weights.length === 0 || amount === 0) return weights.map(() => 0);
  const sum = weights.reduce((total, weight) => total + weight, 0);
  if (sum === 0) return weights.map(() => 0);

  const sign = amount < 0 ? -1 : 1;
  const absolute = Math.abs(amount);
  const shares = weights.map((weight) => Number((BigInt(absolute) * BigInt(weight)) / BigInt(sum)));
  let remainder = absolute - shares.reduce((total, share) => total + share, 0);
  for (let index = shares.length - 1; index >= 0 && remainder > 0; index -= 1) {
    const weight = weights[index];
    const share = shares[index];
    if (weight === undefined || share === undefined || weight === 0) continue;
    shares[index] = share + remainder;
    remainder = 0;
  }
  return shares.map((share) => (share ?? 0) * sign);
}

/** Billed is the sum of plan totals. Paid is the net of the append-only ledger. */
export function patientBalance(input: {
  plans: readonly BalancePlanInput[];
  payments: readonly BalancePaymentInput[];
  today: string;
}): PatientBalance {
  const billed = input.plans.reduce((sum, plan) => sum + plan.total, 0);
  const paid = input.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const paidByInstallment = new Map<string, number>();
  for (const payment of input.payments) {
    const key = installmentKey(payment.treatmentPlanId, payment.installmentNo);
    paidByInstallment.set(key, (paidByInstallment.get(key) ?? 0) + payment.amount);
  }

  const overdueInstallments: OverdueInstallment[] = [];
  for (const plan of input.plans) {
    for (const installment of plan.installments) {
      if (installment.dueDate >= input.today) continue;
      const paidOn = paidByInstallment.get(installmentKey(plan.id, installment.number)) ?? 0;
      const outstanding = installment.amount - paidOn;
      if (outstanding <= 0) continue;
      overdueInstallments.push({
        treatmentPlanId: plan.id,
        number: installment.number,
        dueDate: installment.dueDate,
        amount: installment.amount,
        paid: paidOn,
        outstanding,
      });
    }
  }

  overdueInstallments.sort((left, right) => {
    if (left.dueDate !== right.dueDate) return left.dueDate < right.dueDate ? -1 : 1;
    if (left.treatmentPlanId !== right.treatmentPlanId) {
      return left.treatmentPlanId < right.treatmentPlanId ? -1 : 1;
    }
    return left.number - right.number;
  });

  return { billed, paid, outstanding: billed - paid, overdueInstallments };
}

function installmentKey(treatmentPlanId: string, number: number): string {
  return `${treatmentPlanId}:${number}`;
}
