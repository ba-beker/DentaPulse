const HEX_WIDTH = 24;

let nextSeq = 1;

export function seededId(bucket: number, index: number): string {
  return (bucket * 100_000 + index).toString(16).padStart(HEX_WIDTH, "0");
}

export function createId(): string {
  const id = nextSeq.toString(16).padStart(HEX_WIDTH, "0");
  nextSeq += 1;
  return id;
}

export function rememberId(id: string): void {
  const parsed = Number.parseInt(id, 16);
  if (Number.isFinite(parsed) && parsed >= nextSeq) {
    nextSeq = parsed + 1;
  }
}

export function resetIdCounter(start = 1): void {
  nextSeq = start;
}

export const ID_BUCKET = {
  clinic: 1,
  user: 2,
  supplier: 3,
  consumable: 4,
  procedure: 5,
  patient: 6,
  chart: 7,
  record: 8,
  plan: 9,
  appointment: 10,
  payment: 11,
  movement: 12,
  drug: 13,
  prescription: 14,
} as const;
