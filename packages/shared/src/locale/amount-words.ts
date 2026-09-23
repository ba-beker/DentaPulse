import { toCardinal } from "n2words/fr";

/** Whole dinars in French words, for receipts. 12 500 → "douze mille cinq cents dinars algériens". */
export function amountInWords(amount: number): string {
  if (!Number.isSafeInteger(amount)) {
    throw new RangeError("amount must be a whole number of dinars");
  }
  const absolute = Math.abs(amount);
  const words = toCardinal(absolute);
  const unit = absolute === 1 ? "dinar algérien" : "dinars algériens";
  const phrase = `${words} ${unit}`;
  return amount < 0 ? `moins ${phrase}` : phrase;
}
