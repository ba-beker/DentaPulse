import type { StockStatus } from "./enums.js";
import { algiersIsoDay } from "./locale/algiers.js";

/** Default days ahead, inclusive of today, that count as expiring soon. Configurable per clinic. */
export const DEFAULT_EXPIRY_ALERT_DAYS = 60;

/** @deprecated Use DEFAULT_EXPIRY_ALERT_DAYS. Kept as the default window. */
export const EXPIRING_SOON_DAYS = DEFAULT_EXPIRY_ALERT_DAYS;

/**
 * Shelf badge for a consumable.
 *
 * Precedence:
 * 1. expired — expiration day in Africa/Algiers is before today
 * 2. out — current quantity is 0 or less
 * 3. expiring_soon — expiration day is today or within `expiringSoonDays`
 * 4. low — quantity is above 0 and at or under the minimum
 * 5. in_stock
 *
 * A zero quantity with a future date is "out". A past date wins even when the quantity is 0.
 * A low item that is also inside the expiration window is "expiring_soon".
 * A missing expiration date skips the date checks. The expiration day itself is not yet expired.
 */
export function stockStatus(
  current: number,
  min: number,
  expirationDate: Date | null,
  expiringSoonDays: number = DEFAULT_EXPIRY_ALERT_DAYS,
): StockStatus {
  if (!Number.isFinite(current) || !Number.isFinite(min) || !Number.isFinite(expiringSoonDays)) {
    throw new RangeError("Stock quantities must be finite numbers");
  }
  if (expiringSoonDays < 0) {
    throw new RangeError("Expiry window must be zero or greater");
  }
  if (expirationDate !== null && Number.isNaN(expirationDate.getTime())) {
    throw new RangeError("Invalid expiration date");
  }

  const today = algiersIsoDay(new Date());
  const expires = expirationDate === null ? null : algiersIsoDay(expirationDate);

  if (expires !== null && expires < today) return "expired";
  if (current <= 0) return "out";
  if (expires !== null && expires <= addIsoDays(today, expiringSoonDays)) return "expiring_soon";
  if (current <= min) return "low";
  return "in_stock";
}

/** Remaining quantity as a percentage of the alert threshold, for progress bars. */
export function percentOfMin(current: number, min: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(min)) {
    throw new RangeError("Stock quantities must be finite numbers");
  }
  if (min <= 0) return current > 0 ? 100 : 0;
  return Math.round((current / min) * 100);
}

export function addIsoDays(isoDay: string, days: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDay);
  const yearText = match?.[1];
  const monthText = match?.[2];
  const dayText = match?.[3];
  if (yearText === undefined || monthText === undefined || dayText === undefined) {
    throw new RangeError(`Invalid calendar day: ${isoDay}`);
  }

  const utc = new Date(Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText) + days));
  const year = utc.getUTCFullYear();
  const month = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const day = String(utc.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
