import { algiersDateStamp, algiersTimeStamp } from "./algiers.js";
import { DEFAULT_CURRENCY, DEFAULT_LOCALE, DEFAULT_TIMEZONE } from "./constants.js";

const DATE_PROBES = [
  new Date("2026-09-21T12:00:00+01:00"),
  new Date("2026-01-05T08:00:00+01:00"),
  new Date("2026-09-20T23:00:00Z"),
];

const TIME_PROBES = [
  new Date("2026-09-21T14:30:00+01:00"),
  new Date("2026-09-21T08:05:00+01:00"),
  new Date("2026-09-20T23:00:00Z"),
];

const DA_PROBES = [0, 12_500, 1_000_000, -12_500] as const;

function formatDaContract(amount: number): string {
  const negative = amount < 0;
  const digits = Math.abs(amount).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${negative ? "-" : ""}${grouped} DA`;
}

function formatDaIntl(amount: number): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: "currency",
    currency: DEFAULT_CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    numberingSystem: "latn",
  }).format(amount);
}

function formatDateIntl(date: Date): string {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    timeZone: DEFAULT_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatTimeIntl(date: Date): string {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    timeZone: DEFAULT_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

/** True when fr-DZ ICU output matches the hand-written contract on the probe values. */
const daUsesIntl = DA_PROBES.every((amount) => formatDaIntl(amount) === formatDaContract(amount));
const dateUsesIntl = DATE_PROBES.every((date) => formatDateIntl(date) === algiersDateStamp(date));
const timeUsesIntl = TIME_PROBES.every((date) => formatTimeIntl(date) === algiersTimeStamp(date));

/** Whole dinars, grouped with a regular space: "12 500 DA". */
export function formatDA(amount: number): string {
  if (!Number.isSafeInteger(amount)) {
    throw new RangeError("amount must be a whole number of dinars");
  }

  const contract = formatDaContract(amount);
  if (daUsesIntl) {
    const intl = formatDaIntl(amount);
    if (intl === contract) return intl;
  }
  return contract;
}

/** Calendar date in Africa/Algiers, dd/MM/yyyy. */
export function formatDate(date: Date): string {
  const contract = algiersDateStamp(date);
  if (dateUsesIntl) {
    const intl = formatDateIntl(date);
    if (intl === contract) return intl;
  }
  return contract;
}

/** Clock time in Africa/Algiers, 24-hour HH:mm. */
export function formatTime(date: Date): string {
  const contract = algiersTimeStamp(date);
  if (timeUsesIntl) {
    const intl = formatTimeIntl(date);
    if (intl === contract) return intl;
  }
  return contract;
}
