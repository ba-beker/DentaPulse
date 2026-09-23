import { parsePhoneNumberFromString } from "libphonenumber-js";
import { DEFAULT_COUNTRY } from "./constants.js";

const DZ_MOBILE_NATIONAL = /^[567]\d{8}$/;

function parseDz(input: string) {
  const trimmed = input.trim();
  if (trimmed.length === 0) return null;

  const parsed = parsePhoneNumberFromString(trimmed, DEFAULT_COUNTRY);
  if (!parsed?.isValid() || parsed.country !== DEFAULT_COUNTRY) return null;
  return parsed;
}

/** E.164 for a valid Algerian number, or null. */
export function normalizeToE164(input: string): string | null {
  return parseDz(input)?.number ?? null;
}

/**
 * National display. Mobiles are grouped as "0555 12 34 56".
 * Other valid DZ numbers use the libphonenumber national format.
 */
export function formatNational(input: string): string | null {
  const parsed = parseDz(input);
  if (!parsed) return null;

  if (DZ_MOBILE_NATIONAL.test(parsed.nationalNumber)) {
    const digits = `0${parsed.nationalNumber}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
  }

  return parsed.formatNational();
}

/** True for mobiles 05, 06 or 07, including +213 and 00213 forms. */
export function isValidDzMobile(input: string): boolean {
  const parsed = parseDz(input);
  return parsed !== null && DZ_MOBILE_NATIONAL.test(parsed.nationalNumber);
}

/**
 * National significant digits used to match numbers typed in mixed formats.
 * "0555 12 34 56", "05 55 12 34 56", "+213 555 12 34 56" and "00213555123456"
 * all become "555123456".
 */
export function phoneSearchDigits(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("213")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}
