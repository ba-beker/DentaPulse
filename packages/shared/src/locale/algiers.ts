import { DEFAULT_TIMEZONE } from "./constants.js";

type AlgiersParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

/** Calendar fields of an instant in Africa/Algiers. */
function algiersParts(date: Date): AlgiersParts {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new RangeError("Invalid date");
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: DEFAULT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const value = parts.find((part) => part.type === type)?.value;
    if (value === undefined) {
      throw new RangeError(`Missing ${type} in Algiers date parts`);
    }
    return Number(value);
  };

  let hour = read("hour");
  if (hour === 24) hour = 0;

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour,
    minute: read("minute"),
  };
}

export function algiersIsoDay(date: Date): string {
  const { year, month, day } = algiersParts(date);
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/** Hand-written dd/MM/yyyy in Africa/Algiers. */
export function algiersDateStamp(date: Date): string {
  const { day, month, year } = algiersParts(date);
  return `${pad2(day)}/${pad2(month)}/${year}`;
}

/** Hand-written 24-hour HH:mm in Africa/Algiers. */
export function algiersTimeStamp(date: Date): string {
  const { hour, minute } = algiersParts(date);
  return `${pad2(hour)}:${pad2(minute)}`;
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}
