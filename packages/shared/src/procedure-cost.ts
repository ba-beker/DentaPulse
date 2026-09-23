/**
 * Procedure cost and stock feasibility.
 *
 * Money is whole dinars. Each recipe line is rounded to the nearest dinar
 * before the lines are summed, so the total matches the lines shown.
 * Feasibility is how many times the act can still be performed. The scarcest
 * consumable sets that number. An empty recipe is not limited by stock.
 */

const QUANTITY_SCALE = 1_000_000;
const FLOAT_TOLERANCE = 1e-9;

export interface ProcedureCostLineInput {
  consumableId: string;
  quantityUsed: number;
  costPerUnit: number;
  currentStock: number;
}

export interface ProcedureCostLine {
  consumableId: string;
  quantityUsed: number;
  costPerUnit: number;
  lineCost: number;
  currentStock: number;
  feasibleCount: number;
}

export interface ProcedureCostAnalysis {
  consumableCost: number;
  margin: number;
  /** Null when the recipe uses no consumable. Zero means stock blocks the act. */
  feasibleCount: number | null;
  limitingConsumableId: string | null;
  lines: ProcedureCostLine[];
}

export interface ProcedureDeductionLineInput {
  consumableId: string;
  quantityUsed: number;
  currentStock: number;
}

export interface ProcedureDeductionConsumed {
  consumableId: string;
  quantity: number;
}

export interface ProcedureDeductionShort {
  consumableId: string;
  required: number;
  currentStock: number;
  quantity: number;
}

export interface ProcedureDeductionPreview {
  quantity: number;
  canPerform: boolean;
  consumed: ProcedureDeductionConsumed[];
  short: ProcedureDeductionShort[];
}

export function analyzeProcedureCost(
  basePrice: number,
  lines: readonly ProcedureCostLineInput[],
): ProcedureCostAnalysis {
  if (!Number.isSafeInteger(basePrice) || basePrice < 0) {
    throw new RangeError("Base price must be a whole number of dinars");
  }

  const computed: ProcedureCostLine[] = lines.map((line) => {
    const feasibleCount = performancesPossible(line.currentStock, line.quantityUsed);
    return {
      consumableId: line.consumableId,
      quantityUsed: line.quantityUsed,
      costPerUnit: line.costPerUnit,
      lineCost: lineCostDinars(line.quantityUsed, line.costPerUnit),
      currentStock: line.currentStock,
      feasibleCount,
    };
  });

  const consumableCost = computed.reduce((sum, line) => sum + line.lineCost, 0);
  let feasibleCount: number | null = null;
  let limitingConsumableId: string | null = null;
  for (const line of computed) {
    if (feasibleCount === null || line.feasibleCount < feasibleCount) {
      feasibleCount = line.feasibleCount;
      limitingConsumableId = line.consumableId;
    }
  }

  return {
    consumableCost,
    margin: basePrice - consumableCost,
    feasibleCount,
    limitingConsumableId,
    lines: computed,
  };
}

export function previewProcedureDeduction(
  quantity: number,
  lines: readonly ProcedureDeductionLineInput[],
): ProcedureDeductionPreview {
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new RangeError("Quantity must be a positive whole number");
  }

  const consumed: ProcedureDeductionConsumed[] = [];
  const short: ProcedureDeductionShort[] = [];
  for (const line of lines) {
    if (!Number.isFinite(line.quantityUsed) || line.quantityUsed <= 0) {
      throw new RangeError("Quantity used must be greater than zero");
    }
    if (!Number.isFinite(line.currentStock)) {
      throw new RangeError("Stock quantities must be finite numbers");
    }
    const required = scaleQuantity(line.quantityUsed, quantity);
    const missing = shortageOf(line.currentStock, required);
    consumed.push({ consumableId: line.consumableId, quantity: required });
    if (missing > 0) {
      short.push({
        consumableId: line.consumableId,
        required,
        currentStock: line.currentStock,
        quantity: missing,
      });
    }
  }

  return { quantity, canPerform: short.length === 0, consumed, short };
}

function lineCostDinars(quantityUsed: number, costPerUnit: number): number {
  if (!Number.isFinite(quantityUsed) || quantityUsed <= 0) {
    throw new RangeError("Quantity used must be greater than zero");
  }
  if (!Number.isSafeInteger(costPerUnit) || costPerUnit < 0) {
    throw new RangeError("Unit cost must be a whole number of dinars");
  }
  const cost = Math.round(quantityUsed * costPerUnit);
  if (!Number.isSafeInteger(cost)) {
    throw new RangeError("Line cost is out of range");
  }
  return cost;
}

/** How many full uses fit in the current stock. The scarcest line limits the act. */
function performancesPossible(currentStock: number, quantityUsed: number): number {
  if (!Number.isFinite(currentStock) || !Number.isFinite(quantityUsed)) {
    throw new RangeError("Stock quantities must be finite numbers");
  }
  if (quantityUsed <= 0) {
    throw new RangeError("Quantity used must be greater than zero");
  }
  if (currentStock <= 0) return 0;
  return Math.floor(currentStock / quantityUsed + FLOAT_TOLERANCE);
}

function scaleQuantity(quantityUsed: number, times: number): number {
  return cleanQuantity(quantityUsed * times);
}

function shortageOf(currentStock: number, required: number): number {
  const gap = cleanQuantity(required - Math.max(0, currentStock));
  return gap > 0 ? gap : 0;
}

function cleanQuantity(value: number): number {
  if (!Number.isFinite(value)) {
    throw new RangeError("Quantity must be a finite number");
  }
  return Math.round(value * QUANTITY_SCALE) / QUANTITY_SCALE;
}
